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
PARALLAX_HOST = os.environ.get("PARALLAX_HOST", "localhost")
PARALLAX_API_URL = f"http://{PARALLAX_HOST}:3001/v1/chat/completions"
TEMP_AUDIO_FILE = os.path.join(tempfile.gettempdir(), "spark_response.mp3")

def log(msg):
    print(f"LOG:{msg}")
    sys.stdout.flush()

def set_state(state):
    print(f"STATE:{state}")
    sys.stdout.flush()

def play_audio_with_afplay(file_path):
    """Use macOS afplay to play audio - avoids pygame/pyaudio conflicts"""
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
            
        # afplay is a built-in macOS command that plays audio files
        # Use -q 1 for slightly lower quality but more reliable playback
        result = subprocess.run(
            ["afplay", file_path], 
            capture_output=True, 
            text=True,
            timeout=60  # 60 second timeout for long responses
        )
        if result.returncode != 0:
            log(f"afplay error (code {result.returncode}): {result.stderr.strip()}")
            # Fallback: try converting with ffmpeg then playing
            return try_ffmpeg_fallback(file_path)
        return True
    except subprocess.TimeoutExpired:
        log("Audio playback timed out")
        return False
    except Exception as e:
        log(f"Audio playback error: {e}")
        return False

def try_ffmpeg_fallback(file_path):
    """Convert audio with ffmpeg and try playing again"""
    try:
        wav_path = file_path.replace('.mp3', '_converted.wav')
        # Convert to WAV which is more reliable on macOS
        convert_result = subprocess.run(
            ["ffmpeg", "-y", "-i", file_path, "-ar", "44100", "-ac", "2", wav_path],
            capture_output=True,
            timeout=30
        )
        if convert_result.returncode == 0 and os.path.exists(wav_path):
            result = subprocess.run(["afplay", wav_path], capture_output=True, timeout=60)
            os.remove(wav_path)  # Clean up
            return result.returncode == 0
    except Exception as e:
        log(f"FFmpeg fallback failed: {e}")
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
        success = play_audio_with_afplay(TEMP_AUDIO_FILE)
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
    args = parser.parse_args()

    recognizer = sr.Recognizer()
    
    # Initialize microphone once and reuse
    try:
        microphone = sr.Microphone()
    except Exception as e:
        log(f"Microphone initialization error: {e}")
        log("Make sure a microphone is connected and permissions are granted")
        return
    
    history = [
        {"role": "system", "content": "You are Spark, a helpful and witty AI assistant. Keep your answers concise and conversational."}
    ]

    log("Voice Assistant Initialized")
    
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
