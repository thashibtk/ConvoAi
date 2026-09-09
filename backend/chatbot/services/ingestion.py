import os
from google import genai
from chatbot.models import Chunk

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
    
    client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY', ''))
    
    embeddings = []
    for chunk in text_chunks:
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=chunk,
        )
        # In the new SDK, the vector is in response.embeddings[0].values
        embeddings.append(response.embeddings[0].values)
    
    for i, (text, emb) in enumerate(zip(text_chunks, embeddings)):
        Chunk.objects.create(
            document=document,
            text=text,
            embedding=emb,
            index=i
        )
    return len(text_chunks)
