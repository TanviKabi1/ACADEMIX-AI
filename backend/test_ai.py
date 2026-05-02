import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

# Load env
load_dotenv()

from rag_service import index_document, retrieve
from llm_service import grounded_answer

async def test_ai():
    print("Testing AI Pipeline...")
    
    # 1. Test Indexing
    test_text = "The Markov process is a stochastic process that satisfies the Markov property. It means that the future state depends only on the current state."
    doc_id = "test-doc-1"
    user_id = "test-user-1"
    filename = "markov_test.txt"
    
    print(f"Indexing test text...")
    chunks_indexed = index_document(user_id, doc_id, filename, test_text)
    print(f"Chunks indexed: {chunks_indexed}")
    
    if chunks_indexed == 0:
        print("FAILED: Indexing returned 0 chunks.")
        return

    # 2. Test Retrieval
    print("Testing Retrieval...")
    question = "What is a Markov process?"
    chunks = retrieve(user_id, question, [doc_id])
    print(f"Chunks retrieved: {len(chunks)}")
    for c in chunks:
        print(f" - [{c['score']:.2f}] {c['text'][:50]}...")

    if not chunks:
        print("FAILED: No chunks retrieved.")
        return

    # 3. Test Grounded Answer
    print("Testing Grounded Answer...")
    answer_res = await grounded_answer(question, chunks)
    print(f"AI Answer: {answer_res['answer']}")
    print(f"Confidence: {answer_res['confidence']}")

if __name__ == "__main__":
    asyncio.run(test_ai())
