import os
from sentence_transformers import SentenceTransformer
from chatbot.models import Chunk

# Lazy load the embedder so it doesn't block Django server startup
embedder = None

def get_embedder():
    global embedder
    if embedder is None:
        os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return embedder

def chunk_text(text, max_length=1000):
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = ""
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        if len(current_chunk) + len(p) > max_length and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = p
        else:
            current_chunk += "\n\n" + p if current_chunk else p
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks

def ingest_document(document):
    document.chunks.all().delete()
    text_chunks = chunk_text(document.raw_text)
    if not text_chunks:
        return 0
    
    # Generate embeddings using sentence-transformers
    embeddings = get_embedder().encode(text_chunks)
    
    for i, (text, emb) in enumerate(zip(text_chunks, embeddings)):
        Chunk.objects.create(
            document=document,
            text=text,
            embedding=emb.tolist(),  # Convert numpy array to list for JSON serialization
            index=i
        )
    return len(text_chunks)
