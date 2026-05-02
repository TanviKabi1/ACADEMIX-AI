import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

print("Listing models...")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(f"Embedding Model: {m.name}")
    if 'generateContent' in m.supported_generation_methods:
        print(f"Generation Model: {m.name}")
