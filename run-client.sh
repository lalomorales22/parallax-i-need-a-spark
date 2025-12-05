#!/bin/bash
# Run Spark as a Client (connects to host for AI inference)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate Python environment
if [ -d "parallax/venv" ]; then
    source parallax/venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ⚡ Spark Voice Assistant - CLIENT ⚡              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check for saved host or ask for it
HOST_FILE="$SCRIPT_DIR/.parallax_host"

if [ -n "$1" ]; then
    # Host IP provided as argument
    PARALLAX_HOST="$1"
    echo "$PARALLAX_HOST" > "$HOST_FILE"
elif [ -f "$HOST_FILE" ]; then
    # Use saved host
    PARALLAX_HOST=$(cat "$HOST_FILE")
    echo "Using saved host: $PARALLAX_HOST"
    echo "(Run './run-client.sh <new-ip>' to change)"
else
    # Ask for host IP
    echo "Enter the IP address of the HOST machine (e.g., 192.168.1.100):"
    read -p "> " PARALLAX_HOST
    echo "$PARALLAX_HOST" > "$HOST_FILE"
fi

echo ""
echo "Connecting to Parallax host at: $PARALLAX_HOST:3001"
echo "Make sure the HOST is running 'parallax run' first!"
echo ""

# Test connection
if curl -s --connect-timeout 3 "http://$PARALLAX_HOST:3001/health" > /dev/null 2>&1; then
    echo "✓ Host is reachable!"
else
    echo "⚠ Warning: Cannot reach host at $PARALLAX_HOST:3001"
    echo "  Make sure Parallax is running on the host with: parallax run --host 0.0.0.0"
fi
echo ""

# Start app in client mode
export SPARK_MODE=client
export PARALLAX_HOST
npm run dev
