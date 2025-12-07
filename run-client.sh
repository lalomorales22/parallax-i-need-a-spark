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

# Check for custom port
CLIENT_PORT=3000
if [ "$2" == "--port" ] && [ -n "$3" ]; then
   CLIENT_PORT="$3"
fi

echo ""
echo "Connecting to Parallax Host: $HOST_IP:3001"
echo "Client will listen on port: $CLIENT_PORT"
echo ""

# Start Parallax node worker in background
echo "Starting Parallax compute node..."
parallax join --host "$HOST_IP" --port 3001 --node-port "$CLIENT_PORT" &
PARALLAX_NODE_PID=$!

# Wait for node to connect
echo "Waiting for node to join cluster..."
sleep 3

# Check if parallax join process is still running
if ! ps -p $PARALLAX_NODE_PID > /dev/null 2>&1; then
    echo "⚠ Warning: Parallax node process exited unexpectedly"
    echo "  Check if the host is running at $HOST_IP:3001"
    echo "  Try: curl http://$HOST_IP:3001/health"
    exit 1
fi

echo "✓ Parallax node started (PID $PARALLAX_NODE_PID)"
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
    exit
}

# Trap to kill Parallax node when script exits
trap cleanup INT TERM EXIT

# Set client mode and run Electron app
export PARALLAX_HOST="$HOST_IP"
export SPARK_MODE=client
export PORT="$CLIENT_PORT"

echo "Starting Electron app in CLIENT mode..."
echo "(Press Ctrl+C to stop both Parallax node and Electron)"
echo ""

npm run dev
