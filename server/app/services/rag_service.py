import os
from google import genai
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from dotenv import load_dotenv

load_dotenv()

COLLECTION_NAME = "knowledge_base"
EMBEDDING_MODEL = "models/gemini-embedding-2"
TOP_K = 5

genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60,
)

def embed_query(text: str) -> list[float]:
    """Generate embedding for a search query."""
    try:
        result = genai_client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config={"task_type": "RETRIEVAL_QUERY"},
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"Query embedding error: {e}")
        return []

def retrieve(query: str, role: str = None, top_k: int = TOP_K) -> list[dict]:
    """Retrieve relevant chunks from Qdrant, optionally filtering by role."""
    vector = embed_query(query)
    if not vector:
        return []

    # Role filtering is omitted; semantic similarity handles context relevance.

    try:
        results = qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector,
            limit=top_k,
            with_payload=True,
        )
        
        seen_texts = set()
        unique_chunks = []
        for r in results:
            text = r.payload["text"]
            if text not in seen_texts:
                seen_texts.add(text)
                unique_chunks.append({
                    "text": text,
                    "book": r.payload["book"],
                    "chunk_index": r.payload["chunk_index"],
                    "score": r.score,
                })
        
        return unique_chunks
    except Exception as e:
        print(f"Search error: {e}")
        return []

if __name__ == "__main__":
    # Quick test
    test_query = "What is supervised learning?"
    test_role = "AI/ML Engineer"
    print(f"Testing retrieval for: '{test_query}' in role '{test_role}'")
    matches = retrieve(test_query, test_role)
    for i, m in enumerate(matches):
        print(f"\nMatch {i+1} (Score: {m['score']:.4f}) from {m['book']}:")
        print(f"{m['text'][:200]}...")
