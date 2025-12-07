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
    
    # Default model - can be overridden with argument
    MODEL="${1:-Qwen/Qwen3-0.6B}"
    
    echo "Model: $MODEL"
    echo "Scheduler will be available at: http://$LOCAL_IP:3001"
    echo ""
    
    # Start Parallax in background (Explicitly set port 3001)
    parallax run --model "$MODEL" --host 0.0.0.0 --port 3001 &
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
