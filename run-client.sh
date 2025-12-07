#!/bin/bash
# Run Spark as a Client (joins host network)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

source parallax/venv/bin/activate

echo "Starting Spark Client..."
echo "Make sure the host is running first!"
echo ""

# Start app in client mode
SPARK_MODE=client npm run dev
