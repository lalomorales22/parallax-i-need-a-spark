# Parallax "I Need a Spark" Voice Assistant
## 🎯 NVIDIA DGX Spark Competition Entry

> **Transform your home network into a distributed AI powerhouse. Each device gets its own personality, but they all share the same brain.**

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

**"I Need a Spark"** is a revolutionary distributed AI voice assistant built on [Parallax](https://github.com/GradientHQ/parallax). It turns your home devices into a collective intelligence network - where your Mac Mini, MacBook Pro, Linux machines, and more combine their compute power to run sophisticated AI models locally, privately, and beautifully.

## ✨ What's New (Latest Update)

- 🎨 **Unified Dashboard** - All settings consolidated into one beautiful tabbed interface
- 🎤 **Auto Listen Mode** - Continuous voice listening with pulsing visual feedback
- 🖥️ **Clean Main Interface** - Just the orb, name, status, and a single "Tap to Speak" button
- ⚙️ **Tabbed Settings** - Visuals, Controls, Network, Personality, and Logs all in one place
- 🎯 **Improved UX** - Better click handling, themed scrollbars, and smoother interactions

## The Vision: A Network of Minds

Imagine installing an AI assistant on every device in your home. Each one has a unique personality and name - "Atlas" on your desk, "Nova" on your laptop, "Echo" in the living room - but they all share the computational power of your entire network through Parallax. No cloud. No subscriptions. Just pure, distributed AI running on hardware you own.

## Screenshots

The main interface features a mesmerizing ASCII orb that responds to audio and status changes:

\`\`\`
     ╔════════════════════════════════════╗
     ║           ✕     ⚙️                 ║
     ║                                    ║
     ║         ∿∿∿∿∿∿∿∿∿∿∿∿∿              ║
     ║       ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿             ║
     ║      ∿∿∿∿∿   ∿∿∿   ∿∿∿∿∿           ║
     ║       ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿             ║
     ║         ∿∿∿∿∿∿∿∿∿∿∿∿∿              ║
     ║                                    ║
     ║              SPARK                 ║
     ║          STATUS: IDLE              ║
     ║                                    ║
     ║       [ 🎤 TAP TO SPEAK ]          ║
     ║                                    ║
     ╚════════════════════════════════════╝
\`\`\`

## Features

### 🖥️ Distributed Intelligence
- **Host Mode**: Acts as the central hub, coordinating compute resources via Parallax
- **Client Mode**: Connects to the host to offload inference, allowing lightweight devices to run powerful models
- **Network Auto-Discovery**: Devices find each other automatically via mDNS/Bonjour

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
| Voice | Google STT, Edge TTS |

## Quick Start (One-Line Install)

```bash
git clone https://github.com/lalomorales22/parallax-i-need-a-spark.git
cd parallax-i-need-a-spark
./install.sh
```

That's it! The installer works on:
- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Debian/Ubuntu** (including Xubuntu)
- ✅ **Arch Linux** (including OmarChy)
- ✅ **Raspberry Pi OS** (Pi 4/5)
- ✅ **Fedora**

## Prerequisites

- **Node.js**: v18 or higher
- **Python**: v3.11-3.13 (Parallax SDK requirement)
- **Git**: For cloning the repo

The install script will handle the rest!

## Running as HOST (Main Machine)

Your most powerful machine should be the host (e.g., Mac Mini 24GB):

```bash
# 1. Start Parallax with a model
source parallax/venv/bin/activate
parallax run --model Qwen/Qwen3-0.6B --host 0.0.0.0

# 2. In another terminal, start Spark
./run.sh
```

## Running as CLIENT (Other Machines)

On your other devices (laptops, Raspberry Pis, etc.):

```bash
./run-client.sh
```

The client will auto-discover and connect to your host!

## Multi-Device Setup Guide

Here's how to set up your home network:

| Device | Role | Recommended Model |
|--------|------|-------------------|
| Mac Mini (24GB) | **HOST** | Qwen3-4B or Qwen3-1.7B |
| MacBook Pro M1 | Client or Backup Host | Qwen3-1.7B |
| Raspberry Pi 5 | Client | (offloads to host) |
| Linux Laptops | Client or Node | (joins Parallax network) |

### Adding Compute Nodes

Want more power? Add machines as Parallax nodes:

```bash
# On any machine after installing:
source parallax/venv/bin/activate
parallax join  # Auto-discovers and joins the host
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
| 🎮 **Controls** | Start Host/Client, Voice Assistant, Auto Listen toggle |
| 🌐 **Network** | View connected devices and their status |
| ✨ **Personality** | Edit AI name, backstory, traits, voice style |
| 📊 **Logs** | View system logs and debug information |

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
│   ├── host.py              # Parallax host server
│   ├── client.py            # Parallax client worker
│   ├── voice_assistant.py   # Voice processing
│   ├── network_discovery.py # mDNS device discovery
│   └── model_manager.py     # Model management
├── package.json
├── vite.config.ts
└── README.md
\`\`\`

## Development

### Scripts

\`\`\`bash
npm run dev          # Start in development mode
npm run build        # Build for production
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
\`\`\`

### Testing

\`\`\`bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
\`\`\`

## Known Issues & TODOs

### 🔴 Critical (Must Fix for Voice to Work)

| Issue | Description | Solution |
|-------|-------------|----------|
| **Parallax not running** | Voice says "I can't reach the server" | Start Parallax first: `parallax run -m Qwen/Qwen3-0.6B -n 1` |
| **pygame.mixer error** | TTS audio playback fails on macOS | Run `brew install sdl2 sdl2_mixer && pip install pygame --no-cache-dir` |
| **Connection refused on port 3001** | API not accessible | Ensure Parallax scheduler is running and model is loaded |
| **Missing Python modules** | ImportError on startup | Run `pip install SpeechRecognition pyaudio edge-tts pygame` |

### 🟡 Medium Priority

| Issue | Description | Status |
|-------|-------------|--------|
| **Window dragging difficult** | Hard to find drag area on transparent window | Need to add a visible drag handle at top |
| **Model download unclear** | No progress indicator during model download | Parallax downloads models on first run |
| **No "Allow Microphone" prompt** | Browser permission not requested | Need to implement permission request |
| **Host mode via UI** | "Start Host" button needs Parallax installed | Run Parallax manually in terminal for now |

### 🟢 Low Priority / Enhancements

| Issue | Description |
|-------|-------------|
| Window size persistence | Window doesn't remember size/position |
| Keyboard shortcuts | No hotkeys for common actions |
| System tray | No minimize to tray option |
| Wake word | "Hey Spark" activation not implemented |

### Quick Fix Commands

\`\`\`bash
# 1. Install Parallax (one-time setup)
git clone https://github.com/GradientHQ/parallax.git ~/parallax
cd ~/parallax
python3 -m venv venv
source venv/bin/activate
pip install -e '.[mac]'  # For macOS

# 2. Fix pygame audio on macOS
brew install sdl2 sdl2_mixer
pip install pygame --no-cache-dir

# 3. Install voice dependencies
pip install SpeechRecognition pyaudio edge-tts

# 4. Start Parallax (run this BEFORE the Spark app)
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0

# 5. In a new terminal, start Spark
cd /path/to/parallax-i-need-a-spark
npm run dev
\`\`\`

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
- [x] SQLite persistence
- [x] Unified settings dashboard
- [x] Network discovery UI
- [x] Personality editor
- [x] Cross-platform build setup

### In Progress 🔄
- [ ] Voice input/output pipeline
- [ ] Parallax model integration
- [ ] Multi-device testing
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
