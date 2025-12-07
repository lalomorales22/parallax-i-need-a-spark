import asyncio
import speech_recognition as sr
import requests
import edge_tts
import os
import sys
import tempfile
import argparse
import subprocess
import time

# Constants
# Parallax scheduler runs on port 3001, nodes on port 3000
# Use environment variable for host address, default to localhost
PARALLAX_HOST = os.environ.get("PARALLAX_HOST")

# If not in env, try to read from .parallax_host file
if not PARALLAX_HOST:
    try:
        # Check multiple locations
        possible_paths = [
            ".parallax_host",
            os.path.join(os.path.dirname(os.path.dirname(__file__)), ".parallax_host"),
            os.path.join(os.path.expanduser("~"), ".parallax_host")
        ]
        for path in possible_paths:
            if os.path.exists(path):
                with open(path, "r") as f:
                    content = f.read().strip()
                    if content:
                        PARALLAX_HOST = content
                        print(f"LOG: Read host from {path}: {PARALLAX_HOST}")
                        break
    except Exception as e:
        print(f"LOG: Error reading .parallax_host: {e}")

# Fallback to localhost
if not PARALLAX_HOST:
    PARALLAX_HOST = "localhost"

PARALLAX_API_URL = f"http://{PARALLAX_HOST}:3001/v1/chat/completions"
TEMP_AUDIO_FILE = os.path.join(tempfile.gettempdir(), "spark_response.mp3")

def log(msg):
    print(f"LOG:{msg}")
    sys.stdout.flush()

def set_state(state):
    print(f"STATE:{state}")
    sys.stdout.flush()

def get_platform():
    """Detect the operating system"""
    import platform
    system = platform.system().lower()
    return system

def play_audio(file_path):
    """Cross-platform audio playback"""
    try:
        # Wait for file to be fully written and closed
        time.sleep(0.2)
        
        if not os.path.exists(file_path):
            log(f"Audio file not found: {file_path}")
            return False
        
        # Check file size to ensure it's complete
        file_size = os.path.getsize(file_path)
        if file_size < 100:
            log(f"Audio file too small ({file_size} bytes), may be corrupted")
            return False
        
        system = get_platform()
        
        if system == "darwin":
            # macOS - use afplay
            return play_with_afplay(file_path)
        elif system == "linux":
            # Linux - try multiple players
            return play_on_linux(file_path)
        else:
            log(f"Unsupported platform: {system}")
            return False
            
    except Exception as e:
        log(f"Audio playback error: {e}")
        return False

def play_with_afplay(file_path):
    """Play audio with macOS afplay"""
    try:
        result = subprocess.run(
            ["afplay", file_path], 
            capture_output=True, 
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            log(f"afplay error: {result.stderr.strip()}")
            return try_ffplay_fallback(file_path)
        return True
    except subprocess.TimeoutExpired:
        log("Audio playback timed out")
        return False
    except FileNotFoundError:
        log("afplay not found")
        return try_ffplay_fallback(file_path)
    except Exception as e:
        log(f"afplay error: {e}")
        return False

def play_on_linux(file_path):
    """Play audio on Linux using various players"""
    # Try ffplay first (most reliable, comes with ffmpeg)
    try:
        result = subprocess.run(
            ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", file_path],
            capture_output=True,
            timeout=60
        )
        if result.returncode == 0:
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Try mpv (lightweight player)
    try:
        result = subprocess.run(
            ["mpv", "--no-video", "--really-quiet", file_path],
            capture_output=True,
            timeout=60
        )
        if result.returncode == 0:
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Try aplay with ffmpeg conversion (for systems with only ALSA)
    try:
        wav_path = file_path.replace('.mp3', '_converted.wav')
        convert_result = subprocess.run(
            ["ffmpeg", "-y", "-i", file_path, "-ar", "44100", "-ac", "2", wav_path],
            capture_output=True,
            timeout=30
        )
        if convert_result.returncode == 0 and os.path.exists(wav_path):
            result = subprocess.run(["aplay", wav_path], capture_output=True, timeout=60)
            os.remove(wav_path)
            if result.returncode == 0:
                return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Try paplay (PulseAudio)
    try:
        result = subprocess.run(
            ["paplay", file_path],
            capture_output=True,
            timeout=60
        )
        if result.returncode == 0:
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    log("No audio player available on Linux. Install ffmpeg, mpv, or pulseaudio-utils")
    return False

def try_ffplay_fallback(file_path):
    """Fallback to ffplay for audio playback"""
    try:
        result = subprocess.run(
            ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", file_path],
            capture_output=True,
            timeout=60
        )
        return result.returncode == 0
    except Exception as e:
        log(f"ffplay fallback failed: {e}")
        return False

async def text_to_speech(text, voice="en-US-AriaNeural"):
    try:
        # Remove the old file first to avoid any caching issues
        if os.path.exists(TEMP_AUDIO_FILE):
            try:
                os.remove(TEMP_AUDIO_FILE)
            except:
                pass
        
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(TEMP_AUDIO_FILE)
        
        # Verify file was created
        if not os.path.exists(TEMP_AUDIO_FILE):
            log("TTS failed to create audio file")
            return
            
        # Use sync audio player (afplay blocks until done)
        # Use cross-platform audio player
        success = play_audio(TEMP_AUDIO_FILE)
        if not success:
            log("Audio playback failed, response was: " + text[:50])
            
    except Exception as e:
        log(f"TTS error: {e}")

def get_llm_response(prompt, history):
    headers = {"Content-Type": "application/json"}
    messages = history + [{"role": "user", "content": prompt}]
    
    data = {
        # Model name should match what's running in Parallax
        # For Qwen3 models, disable thinking mode for faster responses
        "messages": messages,
        "max_tokens": 200,
        "temperature": 0.7,
        "stream": False,
        "chat_template_kwargs": {"enable_thinking": False}
    }
    
    try:
        log(f"Sending to Parallax: {prompt}")
        response = requests.post(PARALLAX_API_URL, json=data, headers=headers, timeout=30)
        log(f"Parallax status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            log(f"Parallax response: {content[:100]}...")
            return content
        else:
            log(f"LLM Error: {response.text}")
            return "I'm having trouble connecting to my brain."
    except requests.exceptions.Timeout:
        log("Connection Timeout - Parallax took too long")
        return "I'm thinking too hard, give me a moment."
    except Exception as e:
        log(f"Connection Error: {e}")
        return "I can't reach the server."

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="en-US-AriaNeural")
    parser.add_argument("--wake-word", default=None) # Future implementation
    parser.add_argument("--system-prompt", default=None, help="Custom system prompt for the AI")
    parser.add_argument("--name", default="Spark", help="Name of the AI assistant")
    args = parser.parse_args()

    recognizer = sr.Recognizer()
    
    # Initialize microphone once and reuse
    try:
        microphone = sr.Microphone()
    except Exception as e:
        log(f"Microphone initialization error: {e}")
        log("Make sure a microphone is connected and permissions are granted")
        return
    
    # Build system prompt from args or use default
    if args.system_prompt:
        system_prompt = args.system_prompt
        log(f"Using custom system prompt for {args.name}")
    else:
        system_prompt = f"You are {args.name}, a helpful and witty AI assistant. Keep your answers concise and conversational."
        log(f"Using default system prompt for {args.name}")
    
    history = [
        {"role": "system", "content": system_prompt}
    ]

    log(f"Voice Assistant '{args.name}' Initialized")
    
    # Adjust for ambient noise once at startup
    try:
        with microphone as source:
            log("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
        log("Ready to listen!")
    except Exception as e:
        log(f"Error adjusting for ambient noise: {e}")

    while True:
        try:
            set_state("LISTENING")
            
            # Use microphone with proper error handling
            try:
                with microphone as source:
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            except AttributeError as e:
                # Handle the 'NoneType' object has no attribute 'close' error
                log(f"Microphone stream error, reinitializing...")
                time.sleep(0.5)
                try:
                    microphone = sr.Microphone()
                except:
                    pass
                continue
            except sr.WaitTimeoutError:
                continue  # Just loop back for timeout
            
            set_state("THINKING")
            log("Transcribing...")
            try:
                # Using Google Speech Recognition for free/easy STT
                text = recognizer.recognize_google(audio)
                log(f"User said: {text}")
                
                # Get LLM Response
                response_text = get_llm_response(text, history)
                log(f"Spark says: {response_text}")
                
                # Update history
                history.append({"role": "user", "content": text})
                history.append({"role": "assistant", "content": response_text})
                
                # Keep history manageable (last 10 exchanges)
                if len(history) > 21:  # system + 10 user/assistant pairs
                    history = history[:1] + history[-20:]
                
                # Speak Response
                set_state("SPEAKING")
                await text_to_speech(response_text, args.voice)
                
            except sr.UnknownValueError:
                # Silence or unclear audio - just continue
                pass
            except sr.RequestError as e:
                log(f"STT Error: {e}")
                
        except KeyboardInterrupt:
            log("Shutting down...")
            break
        except Exception as e:
            log(f"Error: {e}")
            time.sleep(0.5)  # Brief pause before retrying

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
