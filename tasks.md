# Project Plan: Parallax "I Need a Spark"

## Phase 1: Foundation & Architecture
- [x] **Initialize Electron Project**: Set up a TypeScript + Vite + Electron boilerplate.
- [x] **Python Integration Strategy**: Create a mechanism for the Electron app to spawn and communicate with Python scripts (using `python-shell` or a local REST API).
- [x] **Database Setup**: Initialize SQLite schema for storing:
    -   Device Role (Host/Client)
    -   Assistant Settings (Name, System Prompt/Persona)
    -   Network Config (Host IP, Ports)
- [x] **Basic UI Shell**: Create a transparent, frameless Electron window that stays on top.

## Phase 2: Parallax Core Integration
- [x] **Host Script**: Develop a Python script using Parallax SDK to initialize the Model Orchestrator/Server.
- [x] **Client Script**: Develop a Python script to connect to the Parallax Host as a worker/client.
- [x] **Electron Control**: Implement UI buttons to "Start Host" and "Start Client" which trigger the respective Python scripts.
- [x] **Status Monitoring**: Pipe logs from Parallax (Python) back to the Electron UI to show connection status and compute usage.

## Phase 3: The Voice Pipeline
- [x] **Audio Capture**: Implement microphone access in Electron.
- [x] **Speech-to-Text (STT)**: Integrate a fast STT solution (e.g., `distil-whisper` locally or a fast free API).
- [x] **Text-to-Speech (TTS)**: Integrate a TTS engine (e.g., `Piper` or `Coqui TTS`) for the assistant's voice.
- [x] **Conversation Loop**: Connect STT Output -> Parallax LLM Inference -> TTS Input.
- [x] **Latency Optimization**: Ensure the pipeline is fast enough for real-time conversation.

## Phase 4: The "SICK" Interface (ASCII Orb)
- [x] **Visualizer Engine**: Create a React component that renders ASCII characters.
- [x] **Audio Reactivity**: Analyze audio frequency data (Web Audio API) to modulate the ASCII orb's shape, rotation, and "vibration".
- [x] **States**: Design distinct visual states for:
    -   *Idle* (Slow breathing animation)
    -   *Listening* (Reacts to mic input)
    -   *Thinking* (Fast spinning/processing animation)
    -   *Speaking* (Reacts to TTS output)

## Phase 5: Persistence, Polish & Analytics
- [x] **Onboarding Flow**: Create the "Wizard" for first-time setup (Choose Name, Define Persona, Host/Client selection).
- [x] **Dashboard**: A slide-out or separate window to view logs, connected devices, and past conversations stored in SQLite.
- [x] **Packaging**: Configure `electron-builder` to package the app for macOS (DMG) and Linux (AppImage/Deb).
- [x] **Hackathon Prep**: Create a demo video script and ensure the "Spark" (GTX prize goal) is highlighted in the submission!
