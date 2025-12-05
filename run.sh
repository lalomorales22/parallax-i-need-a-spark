#!/bin/bash
# Run Spark Voice Assistant

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate Python environment
if [ -d "parallax/venv" ]; then
    echo "Activating Python environment..."
    source parallax/venv/bin/activate
elif [ -d "venv" ]; then
    echo "Activating Python environment..."
    source venv/bin/activate
else
    echo "⚠ Warning: No Python virtual environment found!"
    echo "  Voice features may not work. Run ./install.sh first."
fi

# Verify key packages
python -c "import speech_recognition" 2>/dev/null || echo "⚠ SpeechRecognition not installed in venv"

# Start the app
npm run dev
