import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

text = "Hello world"
result = genai.embed_content(
    model="models/gemini-embedding-001",
    content=text,
    task_type="retrieval_query"
)
emb = result['embedding']
print(f"Dimension: {len(emb)}")
