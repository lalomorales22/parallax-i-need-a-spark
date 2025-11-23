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

2.  **Install Python Voice Dependencies**:
    ```bash
    python -m venv venv
    source venv/bin/activate
    pip install -r python_bridge/requirements-voice.txt
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

### 🔵 Phase 1: Foundation & Visual Excellence (In Progress)
- ✅ Basic Electron + React + TypeScript setup
- ✅ Initial ASCII orb visualization
- ✅ SQLite database for settings
- 🚧 **Setup wizard overhaul** (fixing Initialize button, multi-step flow)
- 🚧 **Advanced visualization** (sine/sawtooth waves, symmetry, rotation)
- 🚧 **Settings panel** with gear icon and randomization

### 🟢 Phase 2: Network Intelligence & Parallax Power (Planned)
- Network auto-discovery with mDNS
- Model download and synchronization
- Enhanced Parallax integration
- Personality management system
- Multi-device testing and optimization

### 🟣 Phase 3: Polish, Testing & Deployment (Planned)
- Cross-platform packaging (macOS, Linux, Windows)
- Performance optimization (60 FPS @ <5% CPU)
- Comprehensive testing suite
- Demo video and documentation
- Competition submission

**📋 See [tasks.md](tasks.md) for the complete development plan with detailed tasks and success metrics.**

## Project Structure

-   **`electron/`**: Main process code, IPC handlers, Python bridge, and database logic
-   **`src/`**: React frontend components (App, AsciiOrb, Onboarding, Dashboard)
-   **`python_bridge/`**: Python scripts for Parallax integration and voice processing
-   **`tasks.md`**: Comprehensive 3-phase development plan

