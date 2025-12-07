# Parallax "I Need a Spark" Voice Assistant
## 🎯 NVIDIA DGX Spark Competition Entry
<img width="655" height="661" alt="Screenshot 2025-12-05 at 10 18 31 AM" src="https://github.com/user-attachments/assets/fc7d1f10-233a-4eb9-872e-ce340a7d89cb" />

> **Transform your home network into a distributed network of AI voice assistants. Each device gets its own personality, but they all share the same brain.**

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

**"I Need a Spark"** is a distributed AI voice assistant built on [Parallax](https://github.com/GradientHQ/parallax). It turns your home devices into a collective intelligence network - where your Mac Mini, MacBook Pro, Linux machines, and more combine their compute power to run sophisticated AI models locally, privately, and beautifully.

## ✨ What's New (Latest Update)

- 🚀 **Universal Installer** - Single `install.sh` for macOS, Linux, Raspberry Pi with auto-dependency detection
- 🌐 **Host/Client Scripts** - Easy `run-host.sh` and `run-client.sh` for distributed setup
- 🤖 **Host Auto-Joins** - Host now automatically joins as a compute node (no separate client needed!)
- 🐳 **Docker Support** - Run client nodes in Docker containers for consistent cross-OS deployment
- 🔄 **Cluster Readiness Check** - Host waits for cluster to reach "available" status before launching
- 🔌 **Smart Client Connection** - Clients fetch scheduler address from host API for reliable P2P joining
- 🧹 **Port Cleanup** - Automatically kills zombie processes on port 3001 before starting
- 🖥️ **Mode Detection** - Dashboard now shows whether you're running as HOST or CLIENT
- 💾 **Per-Device Database** - Each device maintains its own personality and settings
- 🔊 **Audio Fix** - Native `afplay` on macOS with FFmpeg fallback for reliable audio playback
- 🛠️ **Native Module Support** - Automatic electron-rebuild for better-sqlite3 compatibility
- 🌍 **Network Discovery** - mDNS/Bonjour auto-discovery now properly detects local network IP
- 🔗 **Client Connectivity** - Clients now correctly connect to host IP (saves to `.parallax_host` file)
- 🐍 **Venv Integration** - All Python scripts use the virtual environment automatically
- 📦 **Multi-Platform Install** - Improved package fallbacks for Debian 13, Omarchy, and edge cases

## The Vision: A Network of Minds

Imagine installing an AI assistant on every device in your home. Each one has a unique personality and name - "Atlas" on your desk, "Nova" on your laptop, "Echo" in the living room - but they all share the computational power of your entire network through Parallax. No cloud. No subscriptions. Just pure, distributed AI running on hardware you own.

## Screenshots

The main interface features a cute lil ASCII orb that responds to audio and status changes:

```
                    ░░░░░░░░░░░░░░░
                ░░░░▒▒▒▒▒▒▒▒▒▒▒▒░░░░
              ░░▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░
            ░░▒▒▓▓▓▓████████████▓▓▓▒▒░░
          ░░▒▒▓▓████╔══════════╗███▓▓▒▒░
         ░▒▒▓▓███╔══╝ ∿∿∿∿∿∿∿∿ ╚══╗██▓▓▒░
        ░▒▓▓███║   ∿∿∿      ∿∿∿   ║███▓▒░
       ░▒▓███║   ∿∿  ◉    ◉  ∿∿   ║███▓▒
       ░▒▓██║   ∿∿            ∿∿   ║██▓▒░
      ░▒▓███║   ∿   ▂▂▂▂▂▂▂   ∿   ║███▓▒
      ░▒▓███║    ∿  ▀▀▀▀▀▀▀  ∿    ║███▓▒
      ░▒▓███║      ∿∿∿∿∿∿∿∿      ║███▓▒
       ░▒▓██║                     ║██▓▒░
       ░▒▓███╚═══════════════════╝███▓▒
        ░▒▓▓███████████████████████▓▓▒░
         ░▒▒▓▓████████████████████▓▓▒░
          ░░▒▒▓▓▓▓████████████▓▓▓▓▒▒░
            ░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░
              ░░░▒▒▒▒▒▒▒▒▒▒▒▒▒░░░
                  ░░░░░░░░░░░

                 ▓▓▓▓▓▓▓▓▓▓▓▓▓
                ▓   S P A R K   ▓
                 ▓▓▓▓▓▓▓▓▓▓▓▓▓
                                
              ┌─────────────────┐
              │  STATUS: IDLE   │
              │  🎤 LISTENING   │
              └─────────────────┘
```

## Features

### 🖥️ Distributed Intelligence
- **Host Mode**: Acts as the central hub, coordinating compute resources via Parallax
- **Client Mode**: Connects to the host to offload inference, allowing lightweight devices to run powerful models
- **Network Auto-Discovery**: Devices find each other automatically via mDNS/Bonjour (uses `_spark._tcp.local.` service)
- **Persistent Host Connection**: Clients remember host IP in `.parallax_host` file

### 🎨 Beautiful UI/UX
- **Transparent Overlay**: Frameless Electron window that floats on your desktop
- **Reactive ASCII Orb**: Visual feedback with multiple wave patterns and symmetry modes
- **Unified Dashboard**: All settings in one tabbed interface (⚙️ gear icon)
- **7 Color Themes**: Neon Cyan, Matrix Green, Hot Pink, Sunset, Ocean, Fire, Rainbow
- **5 Character Sets**: Classic, Blocks, Geometric, Cyber, Organic

### 🗣️ Voice Interaction (In Progress)
- **Speech-to-Text**: Local transcription using Whisper
- **Text-to-Speech**: Natural voice synthesis via Edge TTS
- **Auto Listen Mode**: Continuous listening with visual feedback

### 💾 Persistence & Customization
- **SQLite Database**: Stores preferences, personalities, and conversation history
- **Custom Personas**: Define your AI's name, backstory, and traits
- **Model Selection**: Choose from various LLMs during setup

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Electron, React 18, TypeScript |
| Visualization | Custom ASCII renderer with WebGL effects |
| Backend | Node.js (Electron main), Python (Parallax) |
| Database | SQLite via better-sqlite3 |
| AI/ML | Parallax SDK, Open Source LLMs |
| Voice | SpeechRecognition (STT), Edge TTS |

## Quick Start (One-Line Install)

```bash
git clone https://github.com/lalomorales22/parallax-i-need-a-spark.git
cd parallax-i-need-a-spark
chmod +x install.sh 
./install.sh
```

The installer automatically:
- ✅ Detects your OS and package manager
- ✅ Installs Node.js, Python 3.12, and system dependencies
- ✅ Clones Parallax SDK from [GradientHQ/parallax](https://github.com/GradientHQ/parallax)
- ✅ Creates a Python virtual environment at `parallax/venv/`
- ✅ Runs `electron-rebuild` for native module compatibility

**Supported Platforms:**
- ✅ **macOS** (Intel & Apple Silicon M1/M2/M3/M4)
- ✅ **Debian 13** (Trixie) - with package fallbacks for newer naming conventions
- ✅ **Ubuntu/Xubuntu** - automatically detected
- ✅ **Arch Linux** (including Omarchy, EndeavourOS, Manjaro)
- ✅ **Raspberry Pi OS** (Pi Zero 2 W, Pi 4, Pi 5)
- ✅ **Fedora**

## Prerequisites

- **Node.js**: v18 or higher
- **Python**: v3.11-3.13 (Parallax SDK requirement)
- **Git**: For cloning the repo

The install script will handle the rest!

## Running as HOST (Main Machine)

Your most powerful machine should be the host (e.g., Mac Mini 24GB, IP 192.168.0.99):

```bash
# Recommended - host auto-joins as a compute node
./run-host.sh              # Just works! No separate client needed

# With additional client nodes
./run-host.sh -n 2         # Expects 2 additional client nodes  
./run-host.sh -n 4         # Expects 4 additional client nodes

# Manual setup mode - opens Parallax web UI at http://192.168.0.99:3001
./run-host.sh -n 0

# Use a different model
./run-host.sh -m Qwen/Qwen2.5-3B

# What it does:
# 1. Cleans up any zombie processes on port 3001
# 2. Activates parallax/venv
# 3. Starts Parallax scheduler on port 3001 (bound to 0.0.0.0)
# 4. HOST JOINS AS A COMPUTE NODE (new!)
# 5. Waits for cluster to reach "available" status
# 6. Starts Electron app with SPARK_MODE=host
```

**🤖 Host Auto-Joins as Compute Node (NEW)**
- Host machine contributes compute power to the cluster
- No separate client needed on the host machine
- Just run `./run-host.sh` and the voice assistant is ready!

**💡 Auto-Configure Mode (Default)**
- Skips the Parallax web UI setup page
- Cluster auto-configures with sensible defaults
- **Waits for cluster to be ready** before launching Electron
- Shows real-time status: `[5/120] Status: waiting (nodes: 0)`
- Additional clients can join with `./run-client.sh <HOST_IP>`

**🌐 Manual Setup Mode (`-n 0`)**
- Opens Parallax web UI at `http://<HOST_IP>:3001`
- Configure cluster topology manually
- Useful for advanced configurations
- Access the UI to see cluster visualization

The host runs the Parallax scheduler on port 3001 and accepts node connections.

## Running as CLIENT (Other Machines)

On your other devices (laptops, Raspberry Pis, etc.):

```bash
# Connect to host at 192.168.0.99 (replace with your host's IP)
./run-client.sh 192.168.0.99

# Or run without argument - it will prompt for host IP and save it
./run-client.sh
```

**What happens when you run the client:**

1. ✅ Saves the host IP to `.parallax_host` for future sessions
2. ✅ **Checks host reachability** before attempting to join
3. ✅ **Fetches scheduler address** from host API (`/node/join/command`)
4. ✅ **Joins the Parallax cluster** using `parallax join -s <scheduler_addr>`
5. ✅ **Verifies connection** by polling cluster status
6. ✅ Starts the Electron app with `SPARK_MODE=client`
7. ✅ The local node processes inference requests from the host

**Smart Connection Logic:**
- **Local host**: Uses auto-discovery (`parallax join`)
- **Remote with scheduler address**: Uses direct connection (`parallax join -s <addr>`)
- **Fallback**: Uses relay servers (`parallax join -r`)

**Important**: The client script now actually **joins the Parallax cluster** as a worker node. This is separate from just running the Electron UI - it makes your device contribute compute power to the distributed AI cluster.

**Note**: The improved client script prevents duplicate node registrations by verifying connections.

**Tip:** The dashboard shows your current mode (🟢 = HOST, 🟣 = CLIENT)

## Multi-Device Setup Guide

Here's an example home network setup:

| Device | Role | IP | Command |
|--------|------|-----|---------|
| Mac Mini (24GB) | **HOST** | 192.168.0.99 | `./run-host.sh` |
| MacBook Pro M1 | Client Node | DHCP | `./run-client.sh 192.168.0.99` |
| Raspberry Pi 5 | Client Node | DHCP | Docker (see below) |
| Asus T100 (Debian) | Client Node | DHCP | `./run-client.sh 192.168.0.99` |
| Dell Inspiron (Omarchy) | Client Node | DHCP | `./run-client.sh 192.168.0.99` |

**Note**: The host now **automatically joins as a compute node**, so you don't need a separate client to start. With just `./run-host.sh`, the Mac Mini runs the scheduler AND contributes compute power.

### Per-Device Database

Each device maintains its **own SQLite database** (`spark.db`). This means:
- Each device can have a unique AI personality (name, backstory, traits)
- Settings and preferences are stored locally
- Databases are NOT synced - this is intentional for privacy and personalization

### Docker Nodes (Recommended for Linux)

For consistent cross-OS deployment, use Docker on client machines:

```bash
# On client machine with Docker installed:
export PARALLAX_HOST=192.168.0.99  # Your host's IP
docker-compose up --build

# Or run directly:
docker build -t spark-node .
docker run --network host -e PARALLAX_HOST=192.168.0.99 spark-node
```

**Benefits of Docker:**
- Consistent environment across Debian, Ubuntu, Raspberry Pi, Arch
- No dependency conflicts
- Easy to update: just `docker-compose pull && docker-compose up`

### Adding Compute Nodes (Native)

Want more power without Docker? Add machines as Parallax nodes:

```bash
# On any machine after installing:
source parallax/venv/bin/activate
parallax join  # Auto-discovers host on local network
```

## Manual Installation

<details>
<summary>Click to expand manual steps</summary>

### macOS
```bash
brew install python@3.12 node portaudio ffmpeg
```

### Debian/Ubuntu/Raspberry Pi
```bash
sudo apt install python3 python3-pip python3-venv nodejs npm portaudio19-dev ffmpeg
```

### Arch Linux
```bash
sudo pacman -S python python-pip nodejs npm portaudio ffmpeg
```

### Then:
```bash
# Create Python environment
python3 -m venv parallax/venv
source parallax/venv/bin/activate

# Install Python packages
pip install parallax-sdk SpeechRecognition edge-tts pyaudio requests

# Install Node packages
npm install
```

</details>

## Using the App

### Main Interface

The main screen shows:
- **ASCII Orb**: Animated visualization that responds to status
- **Assistant Name**: Your AI's name (set during onboarding)
- **Status**: Current state (IDLE, LISTENING, THINKING, SPEAKING)
- **Tap to Speak Button**: Click to start voice interaction

### Unified Dashboard (⚙️)

Click the gear icon to access all settings in a tabbed interface:

| Tab | Description |
|-----|-------------|
| 🎨 **Visuals** | Customize orb appearance - wave type, colors, symmetry, rotation |
| 🎮 **Controls** | Voice Assistant toggle, Auto Listen mode |
| 🌐 **Network** | View connected devices, current mode (HOST/CLIENT indicator) |
| ✨ **Personality** | Edit AI name, backstory, traits, voice style |
| 📊 **Logs** | View system logs and debug information |

**Mode Indicator:** The Network tab shows your current mode:
- 🟢 **Running as HOST** - You're the main coordinator
- 🟣 **Running as CLIENT** - Connected to a host at [IP]
- ⚪ **Standalone** - Not connected to Parallax cluster

### Window Controls

- **Close (✕)**: Exit the application
- **Settings (⚙️)**: Open the unified dashboard
- **Drag**: Click and drag the top area to move the window

## Project Structure

\`\`\`
parallax-i-need-a-spark/
├── electron/                 # Electron main process
│   ├── main.ts              # Main entry, window creation, IPC
│   ├── preload.ts           # Preload script for IPC bridge
│   └── db.ts                # SQLite database operations
├── src/                     # React frontend
│   ├── App.tsx              # Main app component
│   ├── components/
│   │   ├── AsciiOrb.tsx     # The animated ASCII visualization
│   │   ├── UnifiedDashboard.tsx  # Tabbed settings dashboard
│   │   ├── Onboarding.tsx   # 6-step setup wizard
│   │   └── ...
│   └── types/               # TypeScript definitions
├── python_bridge/           # Python backend
│   ├── host.py              # Parallax host server (auto-finds parallax CLI in venv)
│   ├── client.py            # Parallax client worker
│   ├── voice_assistant.py   # Voice processing (uses PARALLAX_HOST env var)
│   ├── network_discovery.py # mDNS device discovery (outputs JSON for Electron)
│   └── model_manager.py     # Model management
├── Dockerfile               # Docker image for client compute nodes
├── docker-compose.yml       # Easy Docker orchestration
├── docker-entrypoint.sh     # Docker container startup script
├── .parallax_host           # Stores host IP for client reconnection
├── package.json
├── vite.config.ts
└── README.md
\`\`\`

## Development

### Scripts

```bash
# Installation & Setup
./install.sh              # Install everything (deps, Parallax, npm, electron-rebuild)

# Running (Native)
./run-host.sh             # Start as HOST (scheduler + node + voice assistant)
./run-client.sh <IP>      # Start as CLIENT, connect to host at <IP>
./run.sh                  # Standalone mode (no Parallax)

# Running (Docker - for client nodes)
export PARALLAX_HOST=192.168.0.99  # Your host's IP
docker-compose up --build          # Build and run as Docker client

# Development
npm run dev               # Start in development mode
npm run build             # Build for production
npm run rebuild           # Rebuild native modules for Electron
npm test                  # Run tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage
```

### Testing

\`\`\`bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
\`\`\`

## Known Issues & Solutions

### 🔴 Critical Issues

| Issue | Description | Solution |
|-------|-------------|----------|
| **Parallax not running** | Voice says "I can't reach the server" | Run `./run-host.sh` on your main machine first |
| **Connection refused on port 3001** | API not accessible | Ensure Parallax scheduler is running on the host |
| **Port 3000 already in use** | Another service using the port | Use `./run-client.sh IP --port 3005` |
| **better-sqlite3 module error** | NODE_MODULE_VERSION mismatch | Run `npm run rebuild` or reinstall with `./install.sh` |
| **Python version error** | Parallax requires >=3.11,<3.14 | Install Python 3.12: `brew install python@3.12` (macOS) |

### 🟡 Audio Issues (macOS)

| Issue | Description | Solution |
|-------|-------------|----------|
| **CoreAudio conflicts** | pygame.mixer fails | We use native `afplay` with FFmpeg fallback for format conversion |
| **AudioQueueStart failed** | afplay can't play certain formats | FFmpeg auto-converts audio to compatible WAV format |
| **No audio output** | TTS not playing | Check System Preferences → Sound → Output |
| **Microphone permission** | STT not working | Allow Terminal/Electron in Security & Privacy → Microphone |

### 🟢 Database Issues

| Issue | Description | Solution |
|-------|-------------|----------|
| **Foreign key constraint** | Error saving personality | Fixed - personality save now creates device entry first |
| **spark.db synced across devices** | Wrong database on git pull | Fixed - `spark.db` is now in `.gitignore` |

### Quick Fix Commands

```bash
# 1. Full reinstall (if things are broken)
rm -rf node_modules parallax/venv
./install.sh

# 2. Just rebuild native modules
npm run rebuild

# 3. Start fresh with Parallax
source parallax/venv/bin/activate
parallax run --model Qwen/Qwen3-0.6B --host 0.0.0.0

# 4. Test voice assistant standalone
source parallax/venv/bin/activate
PARALLAX_HOST=192.168.0.99 python python_bridge/voice_assistant.py

# 5. Check if Parallax is running
curl http://localhost:3001/health

# 6. Test network discovery
source parallax/venv/bin/activate
python python_bridge/network_discovery.py "MyDevice" "host"

# 7. Reset client host IP
rm .parallax_host
./run-client.sh   # Will prompt for new IP
```

## Parallax API Reference

The voice assistant connects to Parallax at these endpoints:

| Endpoint | Port | Description |
|----------|------|-------------|
| Scheduler API | 3001 | Main chat completions API |
| Node API | 3000 | Individual node API |
| Setup UI | 3001 | Web UI for cluster config |
| Chat UI | 3002 | Web chat interface |

## Roadmap

### Completed ✅
- [x] Electron + React + TypeScript foundation
- [x] ASCII orb visualization with multiple effects
- [x] 6-step onboarding wizard
- [x] SQLite persistence with better-sqlite3
- [x] Unified settings dashboard with tabs
- [x] Network discovery UI with mDNS/Bonjour
- [x] Personality editor
- [x] Cross-platform build setup
- [x] Universal install script (macOS, Linux, Debian 13, Pi Zero/4/5, Omarchy)
- [x] Host/client mode scripts with persistent host IP storage
- [x] Port conflict resolution
- [x] Mode detection in dashboard (HOST/CLIENT/Standalone)
- [x] Per-device database separation
- [x] Native audio playback (afplay + FFmpeg fallback)
- [x] Proper venv Python integration for all scripts
- [x] Auto-detection of local network IP for mDNS broadcast

### In Progress 🔄
- [x] Voice input/output pipeline (working!)
- [x] Parallax model integration (connected to scheduler)
- [ ] Multi-device testing at scale
- [ ] Competition demo video

### Planned 📋
- [ ] Wake word detection
- [ ] Conversation memory
- [ ] System tray support
- [ ] Keyboard shortcuts

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Documentation

- [User Guide](USER_GUIDE.md) - Detailed usage instructions
- [Contributing](CONTRIBUTING.md) - Developer guidelines
- [Tasks](tasks.md) - Development roadmap

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- **Parallax Team** - For the distributed inference framework
- **NVIDIA** - For the DGX Spark competition
- The open-source community for the amazing tools that make this possible

---

**Built with ❤️ for the NVIDIA DGX Spark Competition**

*"I Need a Spark"* - Because every AI deserves a personality, and every home deserves distributed intelligence.
