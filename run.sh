#!/bin/bash
# Run Spark Voice Assistant

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate Python environment
source parallax/venv/bin/activate

# Start the app
npm run dev
