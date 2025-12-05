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
        # Small delay to ensure file is fully written
        time.sleep(0.1)
        
        if not os.path.exists(file_path):
            log(f"Audio file not found: {file_path}")
            return
            
        # afplay is a built-in macOS command that plays audio files
        result = subprocess.run(["afplay", file_path], capture_output=True, text=True)
        if result.returncode != 0:
            log(f"afplay stderr: {result.stderr}")
    except Exception as e:
        log(f"Audio playback error: {e}")

async def text_to_speech(text, voice="en-US-AriaNeural"):
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(TEMP_AUDIO_FILE)
        # Use sync audio player (afplay blocks until done)
        play_audio_with_afplay(TEMP_AUDIO_FILE)
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
    microphone = sr.Microphone()
    
    history = [
        {"role": "system", "content": "You are Spark, a helpful and witty AI assistant. Keep your answers concise and conversational."}
    ]

    log("Voice Assistant Initialized")
    
    # Adjust for ambient noise
    with microphone as source:
        log("Adjusting for ambient noise...")
        recognizer.adjust_for_ambient_noise(source)

    while True:
        try:
            set_state("LISTENING")
            with microphone as source:
                # log("Listening...")
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
            
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
                
                # Speak Response
                set_state("SPEAKING")
                await text_to_speech(response_text, args.voice)
                
            except sr.UnknownValueError:
                log("Could not understand audio")
            except sr.RequestError as e:
                log(f"STT Error: {e}")
                
        except sr.WaitTimeoutError:
            pass # Just loop back
        except KeyboardInterrupt:
            break
        except Exception as e:
            log(f"Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
