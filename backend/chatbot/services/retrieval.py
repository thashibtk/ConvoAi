import os
import numpy as np
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

def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return np.dot(v1, v2) / (norm_v1 * norm_v2)

def retrieve_context(site, user_query, top_k=3):
    query_embedding = get_embedder().encode([user_query])[0]
    
    chunks = Chunk.objects.filter(document__site=site)
    if not chunks.exists():
        return ""
        
    scored_chunks = []
    for chunk in chunks:
        sim = cosine_similarity(query_embedding, chunk.embedding)
        scored_chunks.append((sim, chunk.text))
        
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_texts = [text for sim, text in scored_chunks[:top_k]]
    return "\n\n---\n\n".join(top_texts)
