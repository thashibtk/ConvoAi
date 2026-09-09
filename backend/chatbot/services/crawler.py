import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from chatbot.models import Document
from chatbot.services.ingestion import ingest_document

def crawl_and_ingest(site, start_url, max_pages=20):
    visited = set()
    queue = [start_url]
    base_domain = urlparse(start_url).netloc
    
    pages_crawled = 0
    
    while queue and pages_crawled < max_pages:
        url = queue.pop(0)
        
        if url in visited:
            continue
            
        visited.add(url)
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts and styles
            for script in soup(["script", "style"]):
                script.extract()
                
            text = soup.get_text(separator='\n', strip=True)
            
            if text:
                # Save as a Document and ingest it
                doc = Document.objects.create(
                    site=site,
                    raw_text=f"Source URL: {url}\n\n{text}"
                )
                ingest_document(doc)
                pages_crawled += 1
                
            # Find all internal links
            for link in soup.find_all('a'):
                href = link.get('href')
                if not href:
                    continue
                
                full_url = urljoin(url, href)
                parsed_url = urlparse(full_url)
                
                # Only crawl the exact same domain
                if parsed_url.netloc == base_domain:
                    # Remove fragments (#) to avoid crawling the same page multiple times
                    clean_url = full_url.split('#')[0]
                    if clean_url not in visited and clean_url not in queue:
                        # Ignore common non-HTML files
                        if not any(clean_url.lower().endswith(ext) for ext in ['.pdf', '.jpg', '.png', '.gif', '.zip', '.mp4', '.mp3']):
                            queue.append(clean_url)
                        
        except Exception as e:
            print(f"Failed to crawl {url}: {e}")
            
    return pages_crawled
