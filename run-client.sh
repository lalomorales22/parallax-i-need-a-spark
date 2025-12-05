#!/bin/bash
# Run Spark as a Client (connects to host on the network)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ⚡ Spark Voice Assistant - CLIENT ⚡              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Activate Python environment
if [ -d "parallax/venv" ]; then
    source parallax/venv/bin/activate
    echo "✓ Python environment activated"
else
    echo "⚠ No Python virtual environment found!"
    echo "  Run ./install.sh first"
    exit 1
fi

# Check for saved host or use argument
HOST_FILE="$SCRIPT_DIR/.parallax_host"

# Get host IP from argument or saved file
if [ -n "$1" ]; then
    PARALLAX_HOST="$1"
    echo "$PARALLAX_HOST" > "$HOST_FILE"
    echo "✓ Saved host: $PARALLAX_HOST"
elif [ -f "$HOST_FILE" ]; then
    PARALLAX_HOST=$(cat "$HOST_FILE")
    echo "Using saved host: $PARALLAX_HOST"
else
    echo "Enter the IP address of the HOST machine (e.g., 192.168.0.99):"
    read -p "> " PARALLAX_HOST
    echo "$PARALLAX_HOST" > "$HOST_FILE"
fi

echo ""
echo "Connecting to host: $PARALLAX_HOST:3001"
echo ""

# Test connection to host
if curl -s --connect-timeout 3 "http://$PARALLAX_HOST:3001/health" > /dev/null 2>&1; then
    echo "✓ Host is reachable at $PARALLAX_HOST:3001"
else
    echo "⚠ Warning: Cannot reach host at $PARALLAX_HOST:3001"
    echo "  Make sure the host is running: ./run-host.sh"
    echo ""
    read -p "Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Starting Spark Client..."
echo "(Ctrl+C to stop)"
echo ""

# Set environment variables for client to find the host
export SPARK_MODE=client
export PARALLAX_HOST="$PARALLAX_HOST"

npm run dev
