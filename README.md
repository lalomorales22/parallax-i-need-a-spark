# Parallax "I Need a Spark" Voice Assistant

## Overview
**"I Need a Spark"** is a distributed, voice-activated AI assistant built for the Parallax Hackathon. It leverages the power of [Parallax](https://github.com/GradientHQ/parallax) to share compute resources across multiple devices (Mac Mini, MacBook Pro, Linux, etc.), creating a unified, powerful intelligence accessible via a unique, futuristic interface on any node in the network.

## The Vision
Imagine a voice assistant that doesn't live in the cloud, but lives *on your network*, powered by the combined strength of your hardware. 

-   **The Interface**: A transparent, frameless Electron window featuring a mesmerizing, ASCII-style symmetrical rotating orb. It vibrates and reacts to your voice and the AI's responses.
-   **The Brain**: Powered by Parallax, distributing the inference load.
-   **The Experience**: Fully customizable personas. Each device runs a client with its own "Assistant" identity, but they all tap into the same shared brain.

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

## Development

-   **`electron/`**: Contains the main process code and Python bridge logic.
-   **`src/`**: React frontend code.
-   **`python_bridge/`**: Python scripts that interface with the Parallax SDK and handle voice processing.

