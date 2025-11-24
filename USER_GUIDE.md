# Parallax Spark - User Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [First Launch & Setup](#first-launch--setup)
4. [Using the Interface](#using-the-interface)
5. [Network Setup](#network-setup)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Quick Start

Get up and running with Spark in 5 minutes:

1. **Install Dependencies**: Node.js v18+, Python 3.10+
2. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd parallax-i-need-a-spark
   npm install
   pip install -r python_bridge/requirements-voice.txt
   pip install -r python_bridge/requirements-phase2.txt
   ```
3. **Launch**: `npm run dev`
4. **Complete Setup Wizard**: Follow the 6-step wizard to configure your AI assistant
5. **Start Using**: Click "Voice" to begin interacting with your AI!

---

## Installation

### Prerequisites

#### Required Software
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download](https://www.python.org/))
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

#### Platform-Specific Requirements

**macOS:**
```bash
brew install portaudio
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install portaudio19-dev python3-dev
```

**Windows:**
- Download and install PortAudio from the official website
- Install Visual Studio Build Tools if needed

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/parallax-i-need-a-spark.git
   cd parallax-i-need-a-spark
   ```

2. **Install Node Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Python Environment**
   ```bash
   # Create virtual environment (recommended)
   python -m venv venv

   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate

   # Install Python dependencies
   pip install -r python_bridge/requirements-voice.txt
   pip install -r python_bridge/requirements-phase2.txt
   ```

4. **Verify Installation**
   ```bash
   npm run dev
   ```

---

## First Launch & Setup

When you first launch Spark, you'll be greeted by a comprehensive setup wizard. Here's what to expect:

### Step 1: Welcome
- Introduction to Spark and its capabilities
- Overview of the setup process

### Step 2: Name Your AI
- Choose a unique name for your AI assistant (e.g., "Atlas", "Nova", "Echo")
- This name will be displayed in the interface and used for identification

### Step 3: Choose a Personality
Select from preset personalities or create your own:
- **Helpful**: Professional and informative
- **Sarcastic**: Witty with a sense of humor
- **Cyberpunk**: Edgy and tech-savvy
- **Zen**: Calm and philosophical
- **Custom**: Write your own personality description

### Step 4: Select Role
- **Host**: This device will coordinate distributed compute resources
- **Client**: This device will contribute compute power to a host

### Step 5: Network Configuration
- **Host Mode**: Your connection details will be displayed automatically
- **Client Mode**: Enter the host's IP address or use auto-discovery

### Step 6: Complete
- Review your settings
- Click "Initialize" to finish setup

---

## Using the Interface

### Main Interface Elements

#### The ASCII Orb
The mesmerizing centerpiece that visualizes your AI's state:
- **Cyan/Teal**: Idle, waiting for input
- **Green**: Listening to your voice
- **Yellow**: Processing/thinking
- **Magenta**: Speaking response

#### Control Buttons

**Main Controls (Bottom):**
- **🧠 Host**: Start hosting distributed compute
- **🔌 Client**: Connect as a compute client
- **🎤 Voice**: Enable voice interaction

**Dashboard Buttons (Left Side):**
- **🌐 Network**: View network topology and connected devices
- **✨ Personality**: Edit your AI's personality and traits
- **📊 Logs**: View detailed system logs

**Utility Buttons (Top Right):**
- **⚙️ Settings**: Open visualization and app settings
- **✕ Close**: Close the application

### Voice Interaction

1. **Click the Voice Button**: The orb will turn green
2. **Speak Clearly**: Talk to your AI assistant
3. **Wait for Response**: The orb will turn yellow (thinking) then magenta (speaking)
4. **Continue Conversation**: The AI remembers context from previous exchanges

---

## Network Setup

### Setting Up as Host

1. **Launch Spark** on your most powerful device
2. **Complete Setup** choosing "Host" role
3. **Start Host Mode**: Click the "🧠 Host" button
4. **Note Your IP**: Your connection details will be displayed in logs
5. **Share Connection Info**: Other devices will need your IP address

### Connecting as Client

1. **Launch Spark** on additional devices
2. **Complete Setup** choosing "Client" role
3. **Enter Host IP**: Input the host's IP address from Step 4 above
4. **Start Client Mode**: Click the "🔌 Client" button
5. **Verify Connection**: Check the Network Dashboard to confirm connection

### Network Dashboard

Access via the **🌐 Network** button to view:
- **Connected Devices**: All Spark instances on your network
- **Device Status**: Online/offline indicators
- **Resource Usage**: CPU, RAM, GPU stats for each device
- **Roles**: Which devices are hosts vs clients

---

## Customization

### Visualization Settings

Click the **⚙️ Settings** button to access visualization controls:

#### Wave Patterns
- **Type**: Sine, Sawtooth, Square, Triangle, Hybrid
- **Frequency**: 0.1 - 10 Hz (speed of wave oscillation)
- **Amplitude**: 0 - 100% (intensity of wave motion)

#### Symmetry Modes
- **None**: Asymmetric, organic patterns
- **Radial 2x/4x/6x/8x**: Radial symmetry with 2, 4, 6, or 8-fold repetition
- **Bilateral**: Left-right mirror symmetry
- **Kaleidoscope**: Complex multi-mirror patterns

#### Rotation
- **Speed**: 0 - 200% (rotation speed multiplier)
- **Axes**: Toggle X, Y, Z rotation independently

#### Visual Style
- **Character Set**: Classic, Blocks, Geometric, Cyber, Organic
- **Color Preset**: Neon Cyan, Matrix Green, Hot Pink, Sunset, Ocean, Fire, Rainbow

#### Audio Reactivity
- **Enabled**: Makes visualization respond to audio
- **Sensitivity**: 0 - 100% (how strongly it reacts)

#### Quick Randomize
Click **🎲 Randomize** to generate aesthetically pleasing random combinations!

### Personality Editor

Access via the **✨ Personality** button:

#### Basic Info
- **Name**: Change your AI's name
- **Backstory**: Write a narrative background

#### Traits
Choose from preset traits or create custom ones:
- Formality level
- Verbosity
- Humor style
- Expertise areas

#### Voice Settings
- **Rate**: Speaking speed
- **Pitch**: Voice pitch
- **Volume**: Output volume

#### System Prompt
Advanced users can customize the AI's base instructions

---

## Troubleshooting

### Common Issues

#### "ipcRenderer is not available"
**Cause**: Preload script failed to load
**Solution**:
1. Ensure you're running from the correct directory
2. Try `npm run dev` instead of manual commands
3. Check that all dependencies are installed

#### Voice button doesn't respond
**Cause**: Microphone permissions or PortAudio not installed
**Solution**:
1. Check system microphone permissions
2. Install PortAudio (see Installation section)
3. Try restarting the application

#### Can't connect to host
**Cause**: Network configuration or firewall
**Solution**:
1. Verify both devices are on the same network
2. Check firewall settings (allow port used by Parallax)
3. Try entering IP address manually instead of auto-discovery
4. Ensure host is running and in "ready" state

#### Models won't download
**Cause**: Network issues or insufficient disk space
**Solution**:
1. Check internet connection
2. Verify available disk space
3. Try a smaller model first
4. Check logs for specific error messages

#### Performance issues / Low FPS
**Cause**: Heavy visualization or system resources
**Solution**:
1. Lower visualization complexity in settings
2. Disable audio reactivity
3. Close other resource-intensive applications
4. Try a different character set (Classic is fastest)

---

## FAQ

### Q: How much disk space do I need?
**A:** Base app is ~100MB. AI models range from 2GB (small) to 100GB+ (large). Plan accordingly.

### Q: Can I use this without Parallax?
**A:** Spark is designed for Parallax distributed inference. Without it, you'll need to modify the code for local-only operation.

### Q: How many devices can I connect?
**A:** Theoretically unlimited. Practically, 3-10 devices is optimal depending on your network bandwidth.

### Q: Does this work over the internet or only local network?
**A:** Currently designed for local networks. Internet support would require additional configuration (port forwarding, VPN, etc.)

### Q: Can I create multiple AI personalities?
**A:** Yes! Each device can have its own unique personality. Use the Personality Editor to customize each one.

### Q: How do I update Spark?
**A:** The app includes auto-update functionality. You'll be notified when updates are available. You can also manually pull from the git repository and rebuild.

### Q: Is my data private?
**A:** Yes! Everything runs locally. No data is sent to cloud services. Your conversations stay on your devices.

### Q: Can I contribute to development?
**A:** Absolutely! This is an open-source project. Check the GitHub repository for contribution guidelines.

### Q: What AI models are supported?
**A:** Any model supported by Parallax, including Llama 3, Mistral, and other open-source LLMs from Hugging Face.

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Logs**: Click the 📊 Logs button for detailed error messages
2. **GitHub Issues**: Search or create an issue at [repository URL]
3. **Documentation**: Check the main README.md for developer information
4. **Community**: Join discussions on our community channels

---

**Happy AI Sparking! ⚡**
