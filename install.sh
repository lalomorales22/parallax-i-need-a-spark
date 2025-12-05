#!/bin/bash
#
# Spark Voice Assistant - Universal Installer
# Works on: macOS, Debian, Ubuntu, Xubuntu, Arch, Raspberry Pi OS
#

set -e

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
    elif [ -f /etc/debian_version ]; then
        OS="debian"
        PKG_MANAGER="apt"
    elif [ -f /etc/arch-release ]; then
        OS="arch"
        PKG_MANAGER="pacman"
    elif [ -f /etc/fedora-release ]; then
        OS="fedora"
        PKG_MANAGER="dnf"
    else
        OS="unknown"
        PKG_MANAGER="unknown"
    fi
    
    # Detect Raspberry Pi
    if [ -f /proc/device-tree/model ]; then
        if grep -q "Raspberry Pi" /proc/device-tree/model 2>/dev/null; then
            IS_RPI=true
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
            brew install python@3.12 node portaudio ffmpeg
            ;;
        apt)
            # Debian/Ubuntu/Raspberry Pi OS
            sudo apt update
            sudo apt install -y \
                python3 python3-pip python3-venv \
                nodejs npm \
                portaudio19-dev python3-pyaudio \
                ffmpeg libespeak-dev \
                libasound2-dev
            ;;
        pacman)
            # Arch Linux / OmarChy
            sudo pacman -Syu --noconfirm \
                python python-pip \
                nodejs npm \
                portaudio \
                ffmpeg espeak-ng
            ;;
        dnf)
            # Fedora
            sudo dnf install -y \
                python3 python3-pip python3-virtualenv \
                nodejs npm \
                portaudio-devel \
                ffmpeg espeak-ng
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
    
    # Create venv
    if [ ! -d "$VENV_DIR" ]; then
        mkdir -p parallax
        $PYTHON_CMD -m venv "$VENV_DIR"
    fi
    
    # Activate and install
    source "$VENV_DIR/bin/activate"
    
    pip install --upgrade pip
    
    # Install Parallax SDK
    print_status "Installing Parallax SDK..."
    pip install parallax-sdk
    
    # Install voice assistant dependencies
    print_status "Installing voice assistant dependencies..."
    pip install \
        SpeechRecognition \
        edge-tts \
        pyaudio \
        requests
    
    deactivate
    
    print_success "Python environment ready"
}

# Install Node.js dependencies
setup_node() {
    print_status "Installing Node.js dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js"
        exit 1
    fi
    
    npm install
    
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
    
    if [ "$CLIENT_MODE" = true ]; then
        echo "To join an existing Spark network:"
        echo "  ./run-client.sh"
    else
        echo "To start as HOST (runs the AI model):"
        echo "  1. Start Parallax scheduler: parallax run --model Qwen/Qwen3-0.6B"
        echo "  2. Run the app: ./run.sh"
        echo ""
        echo "To start as CLIENT (joins host):"
        echo "  ./run-client.sh"
    fi
    echo ""
    
    if [ "$IS_RPI" = true ]; then
        print_warning "Raspberry Pi detected!"
        print_warning "For best performance, use smaller models (0.6B-1B)"
        print_warning "Consider running as client and offloading to a more powerful host"
    fi
}

main "$@"
