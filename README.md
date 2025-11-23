# Parallax "I Need a Spark" Voice Assistant
## 🎯 NVIDIA DGX Spark Competition Entry

> **Transform your home network into a distributed AI powerhouse. Each device gets its own personality, but they all share the same brain.**

## Overview
**"I Need a Spark"** is a revolutionary distributed AI voice assistant built on [Parallax](https://github.com/GradientHQ/parallax). It turns your home devices into a collective intelligence network - where your Mac Mini, MacBook Pro, Linux machines, and more combine their compute power to run sophisticated AI models locally, privately, and beautifully.

## The Vision: A Network of Minds

Imagine installing an AI assistant on every device in your home. Each one has a unique personality and name - "Atlas" on your desk, "Nova" on your laptop, "Echo" in the living room - but they all share the computational power of your entire network through Parallax. No cloud. No subscriptions. Just pure, distributed AI running on hardware you own.

### The Magic Triangle

1. **The Interface**
   - Transparent, frameless Electron window that floats on your desktop
   - Hypnotic ASCII orb with sine waves, sawtooth patterns, and symmetrical rotation
   - Audio-reactive visualization that pulses with your voice and the AI's responses
   - Customizable with gear icon - change patterns, colors, and effects on the fly

2. **The Brain**
   - Powered by Parallax distributed inference
   - Seamlessly shares compute across all devices
   - Run models too large for a single machine
   - True peer-to-peer AI intelligence

3. **The Personality**
   - Each device has its own AI persona with unique name and backstory
   - Customizable traits, voice, and behavior
   - All personas tap into the same shared knowledge base
   - Create your own network of AI characters

## Features

### 🖥️ Distributed Intelligence
-   **Host Mode**: Acts as the central hub, coordinating the compute resources via Parallax.
-   **Client Mode**: Connects to the host to offload inference, allowing lightweight devices to run powerful models.

### 🎨 "SICK" UI/UX
-   **Electron-based**: Cross-platform desktop application.
-   **Transparent Overlay**: No traditional window borders. Just the assistant floating on your desktop.
-   **Reactive ASCII Orb**: Visual feedback for listening, thinking, and speaking states.

### 🗣️ Voice Interaction
-   **Speech-to-Text (STT)**: High-accuracy, local/free API transcription (e.g., Whisper).
-   **Text-to-Speech (TTS)**: Natural sounding voice synthesis.
-   **Wake Word**: (Planned) Hands-free activation.

### 💾 Persistence & Customization
-   **SQLite Database**: Stores user preferences, assistant names, personality settings, and conversation history.
-   **Dashboard**: View analytics and manage connected devices.
-   **Custom Personas**: Define who your assistant is (Name, Backstory, Role) during setup.

## Tech Stack
-   **Frontend**: Electron, React, TypeScript, Three.js (for ASCII rendering effects).
-   **Backend**: Node.js (Electron main process), Python (Parallax integration).
-   **Database**: SQLite.
-   **AI/ML**: Parallax SDK, Open Source LLMs (Llama 3, Mistral, etc.), Whisper (STT), Coqui/Piper (TTS).

## Getting Started

### Prerequisites
1.  **Node.js**: v18 or higher.
2.  **Python**: v3.10 or higher.
3.  **Parallax**: Ensure the parent `parallax` repository is set up and dependencies are installed in your environment.
4.  **PortAudio**: Required for microphone access (Mac: `brew install portaudio`, Linux: `sudo apt-get install portaudio19-dev`).

### Installation

1.  **Install Frontend Dependencies**:
    ```bash
    cd parallax-i-need-a-spark
    npm install
    ```

2.  **Install Python Dependencies**:
    ```bash
    python -m venv venv
    source venv/bin/activate
    # Install voice dependencies
    pip install -r python_bridge/requirements-voice.txt
    # Install Phase 2 dependencies (network discovery, model management)
    pip install -r python_bridge/requirements-phase2.txt
    ```

### Running the App

1.  **Start the Application**:
    ```bash
    npm run dev
    ```
    This will launch the transparent "Spark" interface on your desktop.

2.  **Start the Brain (Host)**:
    -   Click the **HOST** button in the UI.
    -   This initializes the Parallax server using the local Python environment.
    -   Wait for the logs to show "ServerState.READY".

3.  **Connect a Body (Client)**:
    -   On other devices, run the app and click **CLIENT**.
    -   (Note: Ensure they are configured to point to the Host's IP).

4.  **Activate Voice**:
    -   Click **VOICE** to enable the microphone and audio feedback.
    -   The ASCII Orb will turn **Green** when listening.
    -   Speak clearly. The Orb will turn **Yellow** while thinking (sending audio to Parallax) and **Magenta** when speaking back.

## Development Status & Roadmap

This project is currently under active development for the NVIDIA DGX Spark competition. We're following an ambitious **3-Phase Development Plan**:

### 🔵 Phase 1: Foundation & Visual Excellence ✅ COMPLETED
- ✅ Basic Electron + React + TypeScript setup
- ✅ Initial ASCII orb visualization
- ✅ SQLite database for settings
- ✅ **Setup wizard overhaul** - 6-step wizard with personality presets, role selection, and smooth animations
- ✅ **Advanced visualization** - Sine/sawtooth/square/triangle/hybrid waves with configurable frequency and amplitude
- ✅ **Symmetry modes** - Radial (2x, 4x, 6x, 8x), bilateral, and kaleidoscope transformations
- ✅ **Multi-axis rotation** - Independent X/Y/Z rotation with smooth easing
- ✅ **5 Character sets** - Classic, Blocks, Geometric, Cyber, and Organic ASCII styles
- ✅ **7 Color presets** - Neon Cyan, Matrix Green, Hot Pink, Sunset, Ocean, Fire, and animated Rainbow
- ✅ **Enhanced audio reactivity** - FFT analysis with bass/mid/high frequency band splitting
- ✅ **Settings panel** - Sliding panel with gear icon, full visualization controls, and randomization
- ✅ **Glassmorphism UI** - Polished interface with backdrop blur, gradients, and smooth transitions

### 🟢 Phase 2: Network Intelligence & Parallax Power ✅ COMPLETED
- ✅ **Network auto-discovery with mDNS/Bonjour** - Automatic discovery of Spark devices on local network
- ✅ **Network Dashboard** - Visual topology showing all connected devices with real-time stats
- ✅ **Model Library Interface** - Browse and download models from Hugging Face
- ✅ **Intelligent Model Download System** - Resume capability, progress tracking, and checksum verification
- ✅ **Model Management** - Hot-swap models, view local models, set active model
- ✅ **Enhanced Database Schema** - Support for devices, personalities, conversations, models, and network stats
- ✅ **Personality Management System** - Full personality editor with traits, backstory, and system prompts
- ✅ **Device Roster** - View all AI personalities on the network with status indicators
- ✅ **Conversation Memory** - SQLite storage for conversation history with context management
- ⏳ **Multi-device testing** - In progress

### 🟣 Phase 3: Polish, Testing & Deployment (Planned)
- Cross-platform packaging (macOS, Linux, Windows)
- Performance optimization (60 FPS @ <5% CPU)
- Comprehensive testing suite
- Demo video and documentation
- Competition submission

**📋 See [tasks.md](tasks.md) for the complete development plan with detailed tasks and success metrics.**

## Phase 2 Features in Detail

### 🌐 Network Discovery
The app now automatically discovers other Spark instances on your local network using mDNS/Bonjour. Simply start the app on multiple devices and they'll find each other automatically - no manual IP configuration needed!

### 📊 Network Dashboard
A comprehensive dashboard showing:
- **Device Topology**: Visual representation of all connected devices
- **Real-time Stats**: CPU, RAM, and GPU usage for each device
- **Status Indicators**: Online/offline status with color coding
- **Role Display**: Easily see which devices are hosts vs clients

### 🤖 Model Management
Browse and download AI models directly from Hugging Face:
- **Browse Models**: Search through thousands of models with filters
- **Smart Downloads**: Resume interrupted downloads, track progress
- **Local Library**: View all downloaded models and their sizes
- **Hot-Swap**: Switch between models without restarting the app

### ✨ Personality System
Create unique AI personalities for each device:
- **Custom Names**: Give each AI its own identity
- **Backstories**: Write rich narratives for your AIs
- **Trait System**: Select from presets or create custom personality traits
- **Voice Settings**: Configure voice parameters (rate, pitch, volume)
- **System Prompts**: Fine-tune how your AI responds

### 💾 Conversation Memory
All conversations are now stored in SQLite with:
- **Full History**: Access past conversations anytime
- **Context Management**: Control how much context the AI remembers
- **Export Capability**: Export conversation transcripts
- **Per-Device Memory**: Each AI maintains its own conversation history

## Project Structure

-   **`electron/`**: Main process code, IPC handlers, Python bridge, and database logic
-   **`src/`**: React frontend components (App, AsciiOrb, Onboarding, Dashboard, NetworkDashboard, PersonalityEditor)
-   **`python_bridge/`**: Python scripts for Parallax integration, voice processing, network discovery, and model management
-   **`tasks.md`**: Comprehensive 3-phase development plan

