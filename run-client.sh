#!/bin/bash
# Run Spark as a Client (joins host network)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

source parallax/venv/bin/activate

echo "Starting Spark Client..."
echo "Make sure the host is running first!"
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
    echo "Host IP saved to .parallax_host"
else
    echo "Error: No Host IP provided."
    exit 1
fi

export PARALLAX_HOST="$HOST_IP"
echo "Connecting to Host: $PARALLAX_HOST"

# Check for custom port
if [ "$2" == "--port" ] && [ -n "$3" ]; then
   export PORT="$3"
   echo "Using custom port: $PORT"
fi

echo ""

# Start app in client mode
SPARK_MODE=client npm run dev
