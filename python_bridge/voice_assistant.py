import asyncio
import speech_recognition as sr
import requests
import edge_tts
import pygame
import os
import sys
import tempfile
import argparse

# Constants
PARALLAX_API_URL = "http://localhost:8888/v1/chat/completions"
TEMP_AUDIO_FILE = os.path.join(tempfile.gettempdir(), "spark_response.mp3")

def log(msg):
    print(f"LOG:{msg}")
    sys.stdout.flush()

def set_state(state):
    print(f"STATE:{state}")
    sys.stdout.flush()

async def play_audio(file_path):
    pygame.mixer.init()
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
    pygame.mixer.quit()

async def text_to_speech(text, voice="en-US-AriaNeural"):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(TEMP_AUDIO_FILE)
    await play_audio(TEMP_AUDIO_FILE)

def get_llm_response(prompt, history):
    headers = {"Content-Type": "application/json"}
    messages = history + [{"role": "user", "content": prompt}]
    
    data = {
        "model": "Qwen/Qwen2.5-0.5B-Instruct", # Should match what was started
        "messages": messages,
        "max_tokens": 200,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(PARALLAX_API_URL, json=data, headers=headers)
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            log(f"LLM Error: {response.text}")
            return "I'm having trouble connecting to my brain."
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
