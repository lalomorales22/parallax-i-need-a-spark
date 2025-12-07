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

# Check if Parallax is already running
if curl -s --connect-timeout 2 "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "✓ Parallax is already running on port 3001"
    echo ""
    echo "Starting Electron app..."
    npm run dev
else
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
    
    # Start Parallax in background (Explicitly set port 3001)
    if [ -n "$NUM_NODES" ]; then
        parallax run --model "$MODEL" --host 0.0.0.0 --port 3001 -n "$NUM_NODES" &
    else
        parallax run --model "$MODEL" --host 0.0.0.0 --port 3001 &
    fi
    PARALLAX_PID=$!
    
    # Wait for Parallax to start
    echo "Waiting for Parallax to start..."
    for i in {1..30}; do
        if curl -s --connect-timeout 1 "http://localhost:3001/health" > /dev/null 2>&1; then
            echo "✓ Parallax is ready!"
            break
        fi
        sleep 1
    done
    
    echo ""
    echo "Starting Electron app..."
    echo "(Press Ctrl+C to stop both Parallax and Electron)"
    echo ""
    
    # Cleanup function
    cleanup() {
        echo ""
        echo "Shutting down..."
        if [ -n "$PARALLAX_PID" ]; then
            echo "Stopping Parallax (PID $PARALLAX_PID)..."
            kill $PARALLAX_PID 2>/dev/null
            # Wait a moment for graceful shutdown
            sleep 2
            # Force kill if still running to ensure port is freed
            kill -9 $PARALLAX_PID 2>/dev/null
        fi
        exit
    }

    # Trap to kill Parallax when script exits
    trap cleanup INT TERM EXIT
    
    # Set host mode and run
    export SPARK_MODE=host
    export PARALLAX_HOST=localhost
    npm run dev
fi
