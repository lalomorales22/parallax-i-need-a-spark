#!/bin/bash
# Run Spark Voice Assistant

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate Python environment
if [ -d "parallax/venv" ]; then
    source parallax/venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start the app
npm run dev
