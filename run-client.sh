#!/bin/bash
# Run Spark as a Client (connects to host + contributes compute via parallax join)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

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

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ⚡ Spark Voice Assistant - CLIENT ⚡              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check for saved host or ask for it
HOST_FILE="$SCRIPT_DIR/.parallax_host"
PORT_FILE="$SCRIPT_DIR/.parallax_node_port"

# Parse arguments
PARALLAX_HOST=""
NODE_PORT="3000"

while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            NODE_PORT="$2"
            echo "$NODE_PORT" > "$PORT_FILE"
            shift 2
            ;;
        *)
            PARALLAX_HOST="$1"
            echo "$PARALLAX_HOST" > "$HOST_FILE"
            shift
            ;;
    esac
done

# Load saved values if not provided
if [ -z "$PARALLAX_HOST" ] && [ -f "$HOST_FILE" ]; then
    PARALLAX_HOST=$(cat "$HOST_FILE")
    echo "Using saved host: $PARALLAX_HOST"
fi

if [ -f "$PORT_FILE" ]; then
    NODE_PORT=$(cat "$PORT_FILE")
fi

# If still no host, ask for it
if [ -z "$PARALLAX_HOST" ]; then
    echo "Enter the IP address of the HOST machine (e.g., 192.168.0.99):"
    read -p "> " PARALLAX_HOST
    echo "$PARALLAX_HOST" > "$HOST_FILE"
fi

echo ""
echo "Host: $PARALLAX_HOST:3001"
echo "Local node port: $NODE_PORT"
echo ""

# Test connection to host
if curl -s --connect-timeout 3 "http://$PARALLAX_HOST:3001/health" > /dev/null 2>&1; then
    echo "✓ Host is reachable!"
else
    echo "⚠ Warning: Cannot reach host at $PARALLAX_HOST:3001"
    echo "  Make sure Parallax is running on the host with: parallax run --host 0.0.0.0"
fi
echo ""

# Check if the local node port is in use
if lsof -i ":$NODE_PORT" > /dev/null 2>&1; then
    echo "⚠ Port $NODE_PORT is in use!"
    echo "  Run with a different port: ./run-client.sh $PARALLAX_HOST --port 3005"
    echo ""
    read -p "Try port 3005 instead? [Y/n] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        NODE_PORT=3005
        echo "$NODE_PORT" > "$PORT_FILE"
    fi
fi

# Start Parallax node to join the cluster
echo "Starting Parallax node (joining cluster)..."
parallax join -- --port "$NODE_PORT" &
PARALLAX_PID=$!

# Wait for node to start
sleep 3

# Trap to kill Parallax when script exits
trap "echo 'Shutting down...'; kill $PARALLAX_PID 2>/dev/null; exit" INT TERM

echo ""
echo "Starting Electron app..."

# Set environment for voice assistant to connect to host
export SPARK_MODE=client
export PARALLAX_HOST
npm run dev

# Cleanup
kill $PARALLAX_PID 2>/dev/null
