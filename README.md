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
| Voice | Whisper (STT), Edge TTS |

## Getting Started

### Prerequisites

1. **Node.js**: v18 or higher
2. **Python**: v3.10 or higher
3. **Parallax SDK**: Required for distributed AI inference
4. **PortAudio**: Required for microphone access
   \`\`\`bash
   # macOS
   brew install portaudio sdl2 sdl2_mixer
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install portaudio19-dev python3-dev libsdl2-dev libsdl2-mixer-dev
   \`\`\`

### Installation

1. **Clone the Repository**:
   \`\`\`bash
   git clone https://github.com/lalomorales22/parallax-i-need-a-spark.git
   cd parallax-i-need-a-spark
   \`\`\`

2. **Install Parallax SDK** (required for AI inference):
   \`\`\`bash
   # Clone Parallax to a separate directory
   git clone https://github.com/GradientHQ/parallax.git ~/parallax
   cd ~/parallax
   
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install Parallax for macOS
   pip install -e '.[mac]'
   
   # For Linux with GPU:
   # pip install -e '.[gpu]'
   \`\`\`

3. **Install Frontend Dependencies**:
   \`\`\`bash
   cd /path/to/parallax-i-need-a-spark
   npm install
   \`\`\`

4. **Set Up Python Environment for Voice**:
   \`\`\`bash
   # Make sure you're in the Parallax venv (or create a new one)
   source ~/parallax/venv/bin/activate
   
   # Install voice dependencies
   pip install -r python_bridge/requirements-voice.txt
   
   # Install network/model dependencies  
   pip install -r python_bridge/requirements-phase2.txt
   \`\`\`

### Running the App

**Step 1: Start Parallax Scheduler (Host Machine)**

On your main/host machine (e.g., Mac Mini with 24GB RAM):
\`\`\`bash
# Activate Parallax environment
source ~/parallax/venv/bin/activate

# Start the scheduler with a model
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
\`\`\`

This will:
- Open the Parallax setup UI at http://localhost:3001
- Download the model on first run
- Start the chat API at http://localhost:3001/v1/chat/completions

**Step 2: (Optional) Join Additional Nodes**

On other machines in your network:
\`\`\`bash
source ~/parallax/venv/bin/activate
parallax join  # Auto-discovers local scheduler
# Or for remote: parallax join -s <scheduler-peer-id>
\`\`\`

**Step 3: Launch the Spark UI**
\`\`\`bash
cd /path/to/parallax-i-need-a-spark
npm run dev
\`\`\`

This launches the Spark interface on your desktop. On first launch, you'll go through a 6-step setup wizard.

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
