import os
import numpy as np
from google import genai
from chatbot.models import Chunk

def cosine_similarity(vec1, vec2):
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return np.dot(v1, v2) / (norm_v1 * norm_v2)

def retrieve_context(site, user_query, top_k=3):
    client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY', ''))
    
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=user_query,
    )
    query_embedding = response.embeddings[0].values
    
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
