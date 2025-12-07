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

# Start Parallax node worker in background
echo "Starting Parallax compute node..."
echo "Attempting to join scheduler at $HOST_IP..."

# Use relay servers for more reliable connection across networks
# This avoids the "No peers found" error from mDNS auto-discovery
if [ "$HOST_IP" == "localhost" ] || [ "$HOST_IP" == "127.0.0.1" ]; then
    # Local connection - just join
    parallax join &
else
    # Remote connection - use relay servers for reliable P2P connection
    echo "Using relay servers for P2P connection..."
    parallax join -r &
fi

PARALLAX_NODE_PID=$!

# Wait for node to connect
echo "Waiting for node to join cluster (this may take 10-15 seconds)..."
sleep 10

# Check if parallax join process is still running
if ! ps -p $PARALLAX_NODE_PID > /dev/null 2>&1; then
    echo "⚠ Warning: Parallax node process exited"
    echo "  The node may have successfully joined and then exited."
    echo "  Check the host logs to see if this node appears in the cluster."
    echo ""
    echo "  Continuing with Electron app..."
    PARALLAX_NODE_PID=""
fi

if [ -n "$PARALLAX_NODE_PID" ]; then
    echo "✓ Parallax node process running (PID $PARALLAX_NODE_PID)"
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
