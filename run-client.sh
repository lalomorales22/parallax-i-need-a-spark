#!/bin/bash
# Run Spark as a Client (joins host network)

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
echo "Starting in CLIENT mode..."
echo "Make sure the HOST is running first!"
echo ""

# Start app in client mode
export SPARK_MODE=client
npm run dev
