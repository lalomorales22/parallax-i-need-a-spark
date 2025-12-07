#!/bin/bash
# Run Spark as HOST (runs Parallax scheduler + Electron app)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ⚡ Spark Voice Assistant - HOST ⚡              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Activate Python environment
if [ -d "parallax/venv" ]; then
    source parallax/venv/bin/activate
    echo "✓ Python environment activated"
elif [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Python environment activated"
else
    echo "⚠ No Python virtual environment found!"
    echo "  Run ./install.sh first"
    exit 1
fi

# Get local IP for clients to connect
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo ""
echo "Your local IP address: $LOCAL_IP"
echo "Clients should run: ./run-client.sh $LOCAL_IP"
echo ""

# Kill any existing Parallax processes on port 3001
cleanup_old_parallax() {
    local existing_pid=$(lsof -ti :3001 2>/dev/null)
    if [ -n "$existing_pid" ]; then
        echo "⚠ Found existing process on port 3001 (PID $existing_pid), cleaning up..."
        kill $existing_pid 2>/dev/null
        sleep 2
        kill -9 $existing_pid 2>/dev/null
    fi
}

# Function to wait for cluster to be ready
wait_for_cluster_ready() {
    echo "Waiting for Parallax scheduler to start..."
    for i in {1..30}; do
        # Check if scheduler is responding (use root path, /health returns 404)
        if curl -s --connect-timeout 1 "http://localhost:3001/" 2>/dev/null | grep -q "Parallax"; then
            echo "✓ Parallax scheduler is up!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "⚠ Scheduler did not start in time"
            return 1
        fi
        sleep 1
    done
    
    echo ""
    echo "Waiting for cluster to reach 'available' status..."
    echo "💡 Tip: If you have no clients, run with -n 0 to use web UI setup"
    echo ""
    
    for i in {1..120}; do
        # Get cluster status (streaming endpoint, so just get first line)
        local status_json=$(timeout 2 curl -s http://localhost:3001/cluster/status 2>/dev/null | head -1)
        if [ -n "$status_json" ]; then
            local status=$(echo "$status_json" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('data',{}).get('status',''))" 2>/dev/null)
            local nodes=$(echo "$status_json" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(len(d.get('data',{}).get('node_list',[])))" 2>/dev/null)
            local model=$(echo "$status_json" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('data',{}).get('model_name',''))" 2>/dev/null)
            
            if [ "$status" == "available" ]; then
                echo "✓ Cluster is ready!"
                echo "  Status: $status"
                echo "  Model: $model"
                echo "  Nodes: $nodes"
                return 0
            elif [ -n "$status" ]; then
                echo "  [$i/120] Status: $status (nodes: $nodes) - waiting..."
            fi
        fi
        sleep 2
    done
    
    echo "⚠ Cluster did not become available in time"
    echo "  Check if you need to run clients to join the cluster"
    return 1
}

# Check if Parallax is already running
if curl -s --connect-timeout 2 "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "✓ Parallax is already running on port 3001"
    echo ""
    echo "Starting Electron app..."
    export SPARK_MODE=host
    export PARALLAX_HOST=localhost
    npm run dev
else
    # Cleanup any zombie processes
    cleanup_old_parallax
    
    echo "Starting Parallax scheduler..."
    echo ""
    
    # Parse arguments
    MODEL="Qwen/Qwen3-0.6B"
    NUM_NODES="1"  # Default: expect at least 1 node (skips web UI setup)
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--model)
                MODEL="$2"
                shift 2
                ;;
            -n|--nodes)
                NUM_NODES="$2"
                shift 2
                ;;
            *)
                MODEL="$1"
                shift
                ;;
        esac
    done
    
    echo "Model: $MODEL"
    if [ -n "$NUM_NODES" ] && [ "$NUM_NODES" != "0" ]; then
        echo "Expected nodes: $NUM_NODES (auto-configure mode)"
        echo "This skips the Parallax web UI - cluster auto-configures!"
    else
        echo "Manual setup mode - open http://$LOCAL_IP:3001 to configure"
    fi
    echo "Scheduler will be available at: http://$LOCAL_IP:3001"
    echo ""
    echo "💡 Tip: Clients should run './run-client.sh $LOCAL_IP' to join"
    echo ""
    
    # Start Parallax in background (Explicitly bind to 0.0.0.0 for network access)
    if [ -n "$NUM_NODES" ]; then
        parallax run --model "$MODEL" --host 0.0.0.0 --port 3001 -n "$NUM_NODES" &
    else
        parallax run --model "$MODEL" --host 0.0.0.0 --port 3001 &
    fi
    PARALLAX_PID=$!
    
    # Wait briefly for scheduler to start before joining as node
    echo "Waiting for scheduler to initialize..."
    sleep 3
    
    # Host also joins as a compute node (so no separate client needed!)
    echo "Host joining cluster as compute node..."
    parallax join &
    HOST_NODE_PID=$!
    
    # Store all background PIDs for cleanup
    PIDS_TO_KILL="$PARALLAX_PID $HOST_NODE_PID"
    
    # Cleanup function
    cleanup() {
        echo ""
        echo "Shutting down..."
        
        # Kill Parallax
        if [ -n "$PARALLAX_PID" ]; then
            echo "Stopping Parallax (PID $PARALLAX_PID)..."
            kill $PARALLAX_PID 2>/dev/null
        fi
        
        # Kill any child processes
        pkill -P $$ 2>/dev/null
        
        # Wait a moment for graceful shutdown
        sleep 2
        
        # Force kill if still running
        if [ -n "$PARALLAX_PID" ]; then
            kill -9 $PARALLAX_PID 2>/dev/null
        fi
        
        # Ensure port is freed
        local remaining_pid=$(lsof -ti :3001 2>/dev/null)
        if [ -n "$remaining_pid" ]; then
            echo "Force killing remaining process on port 3001..."
            kill -9 $remaining_pid 2>/dev/null
        fi
        
        exit
    }

    # Trap to kill Parallax when script exits
    trap cleanup INT TERM EXIT
    
    # Wait for cluster to be ready
    if ! wait_for_cluster_ready; then
        echo ""
        echo "⚠ Cluster not fully ready, but continuing with Electron app..."
        echo "  You may need to wait for nodes to join or check Parallax logs."
    fi
    
    echo ""
    echo "Starting Electron app..."
    echo "(Press Ctrl+C to stop both Parallax and Electron)"
    echo ""
    
    # Set host mode and run
    export SPARK_MODE=host
    export PARALLAX_HOST=localhost
    npm run dev
fi
