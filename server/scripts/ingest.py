import sys
import os
import uuid
import pdfplumber
from google import genai
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Add parent directory to sys.path to allow imports from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.knowledge_map import ROLE_BOOK_MAP
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

COLLECTION_NAME = "knowledge_base"
CHUNK_SIZE = 800       # characters
CHUNK_OVERLAP = 100     # overlap for context continuity
EMBEDDING_MODEL = "models/gemini-embedding-2"
EMBEDDING_DIM = 3072    # gemini-embedding-2 output dim is 3072

genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
# Increased timeout to handle large vectors (3072 dim)
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    timeout=60, # 60 seconds
)

def setup_collection(force_recreate=False):
    """Create collection if it doesn't exist, or recreate if forced."""
    if force_recreate and qdrant.collection_exists(COLLECTION_NAME):
        print(f"Deleting existing collection '{COLLECTION_NAME}' for dimension alignment...")
        qdrant.delete_collection(COLLECTION_NAME)

    if not qdrant.collection_exists(COLLECTION_NAME):
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )
        print(f"Collection '{COLLECTION_NAME}' created with {EMBEDDING_DIM} dimensions.")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")

def extract_text_from_pdf(path: str) -> str:
    """Extract all text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading {path}: {e}")
    return text

def chunk_text(text: str) -> list[str]:
    """Recursive character chunking with overlap."""
    chunks = []
    start = 0
    if not text:
        return []
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

def embed(text: str) -> list[float]:
    """Generate embedding for a single chunk."""
    try:
        result = genai_client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config={"task_type": "RETRIEVAL_DOCUMENT"},
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def ingest_book(pdf_path: str, roles: list[str], book_title: str):
    """Process a single book and upsert to Qdrant."""
    if not os.path.exists(pdf_path):
        print(f"Skipping {book_title}: File not found at {pdf_path}")
        return

    print(f"Ingesting: {book_title} (Roles: {', '.join(roles)})")
    raw_text = extract_text_from_pdf(pdf_path)
    chunks = chunk_text(raw_text)
    
    if not chunks:
        print(f"No text extracted from {book_title}")
        return

    points = []
    # Reduced batch size to 10 for more reliable uploads of large vectors
    for i, chunk in enumerate(chunks):
        vector = embed(chunk)
        if not vector:
            continue
            
        points.append(PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={
                "text": chunk,
                "roles": roles,
                "book": book_title,
                "chunk_index": i,
            },
        ))
        
        if len(points) >= 10:
            qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
            points = []
            
    if points:
        qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"  Done: {len(chunks)} chunks ingested for {book_title}.")

if __name__ == "__main__":
    # keeping it True for a fresh start.
    setup_collection(force_recreate=True)
    
    book_to_roles = {}
    for role, books in ROLE_BOOK_MAP.items():
        for path in books:
            if path not in book_to_roles:
                book_to_roles[path] = []
            book_to_roles[path].append(role)
            
    for path, roles in book_to_roles.items():
        book_title = os.path.basename(path).replace("_", " ").replace(".pdf", "")
        ingest_book(path, roles, book_title)
        
    print("✅ Ingestion process finished.")
