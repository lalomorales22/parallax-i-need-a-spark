#!/bin/bash
# Run Spark as a Client (joins host network as compute node)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ⚡ Spark Voice Assistant - CLIENT ⚡            ║"
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

echo ""

# Handle Host IP
HOST_IP="$1"

# If no IP provided, try to read from .parallax_host
if [ -z "$HOST_IP" ]; then
    if [ -f ".parallax_host" ]; then
        HOST_IP=$(cat .parallax_host)
        echo "Loaded Host IP from .parallax_host: $HOST_IP"
    else
        echo "Enter the Host IP address (e.g., 192.168.0.99):"
        read -r HOST_IP
    fi
fi

# Save to .parallax_host if we have an IP
if [ -n "$HOST_IP" ]; then
    echo "$HOST_IP" > .parallax_host
    echo "✓ Host IP saved to .parallax_host"
else
    echo "Error: No Host IP provided."
    exit 1
fi

echo ""
echo "Connecting to Parallax Host: $HOST_IP:3001"
echo ""

# Check if host is reachable
echo "Checking if host is reachable..."
if ! curl -s --connect-timeout 5 "http://$HOST_IP:3001/health" > /dev/null 2>&1; then
    echo "⚠ Warning: Cannot reach host at $HOST_IP:3001"
    echo "  Make sure the host is running './run-host.sh'"
    echo ""
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        exit 1
    fi
else
    echo "✓ Host is reachable!"
fi

echo ""

# Get scheduler address from host for reliable P2P connection
echo "Getting scheduler address from host..."
JOIN_CMD_JSON=$(curl -s --connect-timeout 5 "http://$HOST_IP:3001/node/join/command" 2>/dev/null)

if [ -n "$JOIN_CMD_JSON" ]; then
    # Extract the join command or scheduler address
    JOIN_CMD=$(echo "$JOIN_CMD_JSON" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('data',{}).get('command',''))" 2>/dev/null)
    
    # Try to extract scheduler address (12D3KooW...)
    SCHEDULER_ADDR=$(echo "$JOIN_CMD" | grep -oE '12D3KooW[a-zA-Z0-9]+' 2>/dev/null || echo "")
    
    if [ -n "$SCHEDULER_ADDR" ]; then
        echo "✓ Scheduler address: $SCHEDULER_ADDR"
    else
        echo "  Join command: $JOIN_CMD"
    fi
fi

echo ""

# Start Parallax node worker in background
echo "Starting Parallax compute node..."

# Determine connection method
if [ "$HOST_IP" == "localhost" ] || [ "$HOST_IP" == "127.0.0.1" ]; then
    # Local connection - just join with auto-discovery
    echo "Using local auto-discovery..."
    parallax join &
elif [ -n "$SCHEDULER_ADDR" ]; then
    # Use scheduler address for reliable connection
    echo "Joining scheduler at $SCHEDULER_ADDR..."
    parallax join -s "$SCHEDULER_ADDR" &
else
    # Fallback to relay servers
    echo "Using relay servers for P2P connection..."
    parallax join -r &
fi

PARALLAX_NODE_PID=$!

# Wait for node to connect and verify
echo ""
echo "Waiting for node to join cluster (this may take 10-20 seconds)..."

JOIN_SUCCESS=false
for i in {1..20}; do
    sleep 1
    
    # Check if parallax join process is still running
    if ! ps -p $PARALLAX_NODE_PID > /dev/null 2>&1; then
        echo ""
        echo "⚠ Parallax node process exited"
        echo "  The node may have finished joining. Checking cluster status..."
        PARALLAX_NODE_PID=""
        break
    fi
    
    # Try to verify connection by checking cluster status from host
    if [ $((i % 5)) -eq 0 ]; then
        STATUS_JSON=$(timeout 2 curl -s "http://$HOST_IP:3001/cluster/status" 2>/dev/null | head -1)
        if [ -n "$STATUS_JSON" ]; then
            NODE_COUNT=$(echo "$STATUS_JSON" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(len(d.get('data',{}).get('node_list',[])))" 2>/dev/null)
            STATUS=$(echo "$STATUS_JSON" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('data',{}).get('status',''))" 2>/dev/null)
            echo "  [$i/20] Cluster status: $STATUS, nodes: $NODE_COUNT"
            
            if [ "$STATUS" == "available" ]; then
                JOIN_SUCCESS=true
                echo "✓ Cluster is ready with $NODE_COUNT node(s)!"
                break
            fi
        fi
    fi
done

if [ -n "$PARALLAX_NODE_PID" ]; then
    echo ""
    echo "✓ Parallax node process running (PID $PARALLAX_NODE_PID)"
fi

if [ "$JOIN_SUCCESS" = true ]; then
    echo "✓ Successfully joined the cluster!"
else
    echo ""
    echo "⚠ Could not verify cluster join status"
    echo "  The node may still be connecting. Check host logs for confirmation."
fi

echo ""

# Cleanup function
cleanup() {
    echo ""
    echo "Shutting down..."
    
    if [ -n "$PARALLAX_NODE_PID" ]; then
        echo "Stopping Parallax node (PID $PARALLAX_NODE_PID)..."
        kill $PARALLAX_NODE_PID 2>/dev/null
        sleep 2
        kill -9 $PARALLAX_NODE_PID 2>/dev/null
    fi
    
    # Kill any child processes
    pkill -P $$ 2>/dev/null
    
    exit
}

# Trap to kill Parallax node when script exits
trap cleanup INT TERM EXIT

# Set client mode and run Electron app
export PARALLAX_HOST="$HOST_IP"
export SPARK_MODE=client

echo "Starting Electron app in CLIENT mode..."
echo "(Press Ctrl+C to stop both Parallax node and Electron)"
echo ""

npm run dev
