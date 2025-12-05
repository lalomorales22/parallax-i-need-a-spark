#!/bin/bash
#
# Spark Voice Assistant - Universal Installer
# Works on: macOS, Debian, Ubuntu, Xubuntu, Arch, Raspberry Pi OS
#

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}[*]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Detect OS and package manager
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PKG_MANAGER="brew"
        # Detect Apple Silicon vs Intel
        if [[ $(uname -m) == "arm64" ]]; then
            ARCH="arm64"
            print_status "Detected Apple Silicon Mac"
        else
            ARCH="x64"
            print_status "Detected Intel Mac"
        fi
    elif [ -f /etc/debian_version ]; then
        OS="debian"
        PKG_MANAGER="apt"
        # Check for specific Debian/Ubuntu variants
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            if [[ "$ID" == "ubuntu" ]] || [[ "$ID_LIKE" == *"ubuntu"* ]]; then
                print_status "Detected Ubuntu/Xubuntu variant"
            elif [[ "$VERSION_ID" == "13"* ]]; then
                print_status "Detected Debian 13 (Trixie)"
            fi
        fi
    elif [ -f /etc/arch-release ]; then
        OS="arch"
        PKG_MANAGER="pacman"
        # Detect Omarchy (Arch-based)
        if [ -f /etc/omarchy-release ] || grep -qi "omarchy" /etc/os-release 2>/dev/null; then
            print_status "Detected Omarchy (Arch-based)"
        else
            print_status "Detected Arch Linux"
        fi
    elif [ -f /etc/fedora-release ]; then
        OS="fedora"
        PKG_MANAGER="dnf"
    else
        OS="unknown"
        PKG_MANAGER="unknown"
    fi
    
    # Detect Raspberry Pi
    IS_RPI=false
    if [ -f /proc/device-tree/model ]; then
        if grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
            IS_RPI=true
            RPI_MODEL=$(cat /proc/device-tree/model | tr -d '\0')
            print_status "Detected: $RPI_MODEL"
        fi
    fi
    
    print_status "Detected OS: $OS (Package manager: $PKG_MANAGER)"
}

# Install system dependencies
install_system_deps() {
    print_status "Installing system dependencies..."
    
    case $PKG_MANAGER in
        brew)
            # macOS with Homebrew
            if ! command -v brew &> /dev/null; then
                print_error "Homebrew not found. Install it first: https://brew.sh"
                exit 1
            fi
            
            # Install packages one by one to handle already-installed packages gracefully
            for pkg in python@3.12 node portaudio ffmpeg; do
                if brew list "$pkg" &>/dev/null; then
                    print_status "$pkg is already installed, checking for updates..."
                    brew upgrade "$pkg" 2>/dev/null || true
                else
                    print_status "Installing $pkg..."
                    brew install "$pkg" 2>/dev/null || true
                fi
            done
            
            # Fix any linking issues
            for pkg in python@3.12 node; do
                if brew list "$pkg" &>/dev/null; then
                    brew link --overwrite "$pkg" 2>/dev/null || true
                fi
            done
            ;;
        apt)
            # Debian/Ubuntu/Raspberry Pi OS/Xubuntu
            sudo apt update
            sudo apt install -y \
                python3 python3-pip python3-venv python3-dev \
                nodejs npm \
                portaudio19-dev python3-pyaudio \
                ffmpeg libespeak-dev \
                libasound2-dev \
                build-essential \
                git curl
            ;;
        pacman)
            # Arch Linux / OmarChy / Omarchy
            sudo pacman -Syu --noconfirm \
                python python-pip python-virtualenv \
                nodejs npm \
                portaudio \
                ffmpeg espeak-ng \
                base-devel git curl
            ;;
        dnf)
            # Fedora / Debian 13+ style
            sudo dnf install -y \
                python3 python3-pip python3-virtualenv python3-devel \
                nodejs npm \
                portaudio-devel \
                ffmpeg espeak-ng \
                gcc gcc-c++ make git curl
            ;;
        *)
            print_warning "Unknown package manager. Please install manually:"
            print_warning "  - Python 3.11-3.13"
            print_warning "  - Node.js 18+"
            print_warning "  - PortAudio"
            print_warning "  - FFmpeg"
            ;;
    esac
    
    print_success "System dependencies installed"
}

# Find suitable Python (3.11-3.13 for Parallax compatibility)
find_python() {
    for py in python3.12 python3.11 python3.13 python3; do
        if command -v $py &> /dev/null; then
            PY_VERSION=$($py -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
            PY_MAJOR=$(echo $PY_VERSION | cut -d. -f1)
            PY_MINOR=$(echo $PY_VERSION | cut -d. -f2)
            
            if [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -ge 11 ] && [ "$PY_MINOR" -lt 14 ]; then
                PYTHON_CMD=$py
                print_success "Found compatible Python: $py ($PY_VERSION)"
                return 0
            fi
        fi
    done
    
    print_error "No compatible Python found (need 3.11-3.13)"
    print_warning "Parallax SDK requires Python >=3.11,<3.14"
    return 1
}

# Setup Python virtual environment and install packages
setup_python() {
    print_status "Setting up Python environment..."
    
    VENV_DIR="parallax/venv"
    PARALLAX_SRC="parallax/src"
    
    # Create directories first
    mkdir -p parallax
    
    # CRITICAL: Create venv FIRST before any pip operations
    if [ ! -d "$VENV_DIR" ]; then
        print_status "Creating Python virtual environment at $VENV_DIR..."
        $PYTHON_CMD -m venv "$VENV_DIR"
        if [ $? -ne 0 ]; then
            print_error "Failed to create virtual environment!"
            print_warning "Try: $PYTHON_CMD -m pip install --user virtualenv"
            exit 1
        fi
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists at $VENV_DIR"
    fi
    
    # Activate venv - ALL pip operations happen inside venv from here
    print_status "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
    
    # Verify we're in the venv
    CURRENT_PYTHON=$(which python)
    if [[ "$CURRENT_PYTHON" != *"$VENV_DIR"* ]]; then
        print_error "Failed to activate virtual environment!"
        print_warning "Expected python in $VENV_DIR but got $CURRENT_PYTHON"
        exit 1
    fi
    print_success "Virtual environment activated: $CURRENT_PYTHON"
    
    # Upgrade pip inside venv
    pip install --upgrade pip
    
    # Clone Parallax SDK from source if not already present
    if [ ! -d "$PARALLAX_SRC" ]; then
        print_status "Cloning Parallax SDK from GitHub..."
        git clone https://github.com/GradientHQ/parallax.git "$PARALLAX_SRC"
    else
        print_status "Parallax source already exists, updating..."
        (cd "$PARALLAX_SRC" && git pull) || print_warning "Could not update Parallax source"
    fi
    
    # Install Parallax SDK from source
    print_status "Installing Parallax SDK from source..."
    cd "$PARALLAX_SRC"
    
    # Install based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        pip install -e '.[mac]' || print_warning "Parallax install had issues, continuing..."
    elif command -v nvidia-smi &> /dev/null; then
        print_status "NVIDIA GPU detected, installing with GPU support..."
        pip install -e '.[gpu]' || print_warning "Parallax install had issues, continuing..."
    else
        pip install -e '.[cpu]' || print_warning "Parallax install had issues, continuing..."
    fi
    
    cd "$SCRIPT_DIR"
    
    # Install voice assistant dependencies from requirements files
    print_status "Installing voice assistant dependencies..."
    
    if [ -f "python_bridge/requirements-voice.txt" ]; then
        print_status "Installing from requirements-voice.txt..."
        pip install -r python_bridge/requirements-voice.txt || print_warning "Some voice packages failed"
    fi
    
    if [ -f "python_bridge/requirements-phase2.txt" ]; then
        print_status "Installing from requirements-phase2.txt..."
        pip install -r python_bridge/requirements-phase2.txt || print_warning "Some phase2 packages failed"
    fi
    
    # Fallback: Install essential packages directly if requirements files missing
    pip install SpeechRecognition edge-tts pyaudio requests zeroconf psutil huggingface-hub 2>/dev/null || true
    
    # Verify installation
    print_status "Verifying installation..."
    python -c "import speech_recognition; print('✓ SpeechRecognition OK')" || print_warning "SpeechRecognition not available"
    python -c "import edge_tts; print('✓ edge-tts OK')" || print_warning "edge-tts not available"
    python -c "import requests; print('✓ requests OK')" || print_warning "requests not available"
    python -c "import zeroconf; print('✓ zeroconf OK')" || print_warning "zeroconf not available (network discovery)"
    python -c "import psutil; print('✓ psutil OK')" || print_warning "psutil not available (system stats)"
    
    # Show venv path for user reference
    print_success "Python environment ready at: $SCRIPT_DIR/$VENV_DIR"
    print_status "To activate manually: source $VENV_DIR/bin/activate"
    
    deactivate
}

# Install Node.js dependencies
setup_node() {
    print_status "Installing Node.js dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js"
        exit 1
    fi
    
    # Check node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version is $NODE_VERSION, recommend v18 or higher"
    else
        print_success "Node.js version: $(node -v)"
    fi
    
    npm install
    
    # Rebuild native modules for Electron
    print_status "Rebuilding native modules for Electron..."
    npm run postinstall || npx @electron/rebuild -f -w better-sqlite3
    
    print_success "Node.js dependencies installed"
}

# Create run script
create_run_script() {
    print_status "Creating run scripts..."
    
    cat > run.sh << 'EOF'
#!/bin/bash
# Run Spark Voice Assistant

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate Python environment
source parallax/venv/bin/activate

# Start the app
npm run dev
EOF
    chmod +x run.sh
    
    # Create client-only script (joins existing network)
    cat > run-client.sh << 'EOF'
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
EOF
    chmod +x run-client.sh
    
    print_success "Run scripts created: ./run.sh and ./run-client.sh"
}

# Main installation
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║       ⚡ Spark Voice Assistant - Installer ⚡              ║"
    echo "║                                                           ║"
    echo "║  Distributed AI Voice Assistant powered by Parallax SDK  ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    
    detect_os
    
    # Check if running as client or full install
    if [ "$1" == "--client" ] || [ "$1" == "-c" ]; then
        print_status "Installing in CLIENT mode (minimal install)"
        CLIENT_MODE=true
    else
        print_status "Installing in FULL mode (host + client)"
        CLIENT_MODE=false
    fi
    
    # Install dependencies
    install_system_deps
    
    # Find Python
    if ! find_python; then
        exit 1
    fi
    
    # Setup environments
    setup_python
    setup_node
    
    # Create run scripts
    create_run_script
    
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                  ✅ Installation Complete!                 ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    
    # Get local IP for reference
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "unknown")
    else
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "unknown")
    fi
    
    if [ "$CLIENT_MODE" = true ]; then
        echo "To join an existing Spark network:"
        echo "  ./run-client.sh <HOST_IP>"
        echo ""
        echo "Example: ./run-client.sh 192.168.0.99"
    else
        echo "┌─────────────────────────────────────────────────────────────┐"
        echo "│  To start as HOST (this machine runs the AI model):        │"
        echo "│                                                             │"
        echo "│    ./run-host.sh                                            │"
        echo "│                                                             │"
        echo "│  Your IP: $LOCAL_IP                                         │"
        echo "│  Other devices connect with: ./run-client.sh $LOCAL_IP      │"
        echo "└─────────────────────────────────────────────────────────────┘"
        echo ""
        echo "┌─────────────────────────────────────────────────────────────┐"
        echo "│  To start as CLIENT (joins another host):                   │"
        echo "│                                                             │"
        echo "│    ./run-client.sh <HOST_IP>                                │"
        echo "│                                                             │"
        echo "│  Example: ./run-client.sh 192.168.0.99                      │"
        echo "└─────────────────────────────────────────────────────────────┘"
    fi
    echo ""
    
    if [ "$IS_RPI" = true ]; then
        echo "┌─────────────────────────────────────────────────────────────┐"
        echo "│  🍓 Raspberry Pi Detected!                                  │"
        echo "│                                                             │"
        echo "│  • For best performance, run as CLIENT                      │"
        echo "│  • Connect to a Mac Mini or powerful host                   │"
        echo "│  • If running as host, use smaller models (0.6B-1B)         │"
        echo "└─────────────────────────────────────────────────────────────┘"
    fi
    
    echo ""
    print_success "Python venv: parallax/venv/"
    print_success "Activate with: source parallax/venv/bin/activate"
    echo ""
}

main "$@"
