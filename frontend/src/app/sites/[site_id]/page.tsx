'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function SiteDetail({ params }: { params: Promise<{ site_id: string }> }) {
  const paramsResult = use(params);
  const site_id = decodeURIComponent(paramsResult.site_id);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState(site_id);
  const [crawling, setCrawling] = useState(false);
  const [crawlSuccess, setCrawlSuccess] = useState('');
  const [expandedDocId, setExpandedDocId] = useState<number | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(false);
  
  const [currentSite, setCurrentSite] = useState<any>(null);
  const [botName, setBotName] = useState('AI Assistant');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [themeMode, setThemeMode] = useState('light');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchDocuments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/documents/?site_id=${encodeURIComponent(site_id)}`);
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Fetch Site details
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const siteRes = await fetch(`${apiUrl}/api/sites/`);
        const sites = await siteRes.json();
        const site = sites.find((s: any) => s.site_id === site_id);
        if (site) {
          setCurrentSite(site);
          setBotName(site.bot_name || 'AI Assistant');
          setThemeColor(site.theme_color || '#6366f1');
          setThemeMode(site.theme_mode || 'light');
        }
      } catch (e) {
        console.error("Failed to fetch site info", e);
      }
      fetchDocuments();
    };
    init();
  }, [site_id]);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;
    setSavingConfig(true);
    setConfigMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/sites/${currentSite.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSite,
          bot_name: botName,
          theme_color: themeColor,
          theme_mode: themeMode
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentSite(updated);
        setConfigMessage({ type: 'success', text: 'Configuration saved successfully!' });
        setTimeout(() => setConfigMessage(null), 3000);
      } else {
        setConfigMessage({ type: 'error', text: 'Failed to save config.' });
      }
    } catch (e) {
      console.error(e);
      setConfigMessage({ type: 'error', text: 'Failed to save config.' });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setUploading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const siteRes = await fetch(`${apiUrl}/api/sites/`);
      const sites = await siteRes.json();
      const site = sites.find((s: any) => s.site_id === site_id);
      
      if (!site) throw new Error("Site not found");

      const res = await fetch(`${apiUrl}/api/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: site.id, raw_text: rawText }),
      });
      
      if (res.ok) {
        setRawText('');
        fetchDocuments();
      }
    } catch (error) {
      console.error(error);
      alert("Make sure your Django server is running and GEMINI_API_KEY is set in your .env!");
    } finally {
      setUploading(false);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;
    setCrawling(true);
    setCrawlSuccess('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/crawl/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: site_id, url: crawlUrl, max_pages: 20 }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setCrawlSuccess(data.message || "Crawling completed successfully!");
        fetchDocuments(); 
      } else {
        alert("Failed to run crawler.");
      }
    } catch (error) {
      console.error(error);
      alert("Make sure your Django server is running!");
    } finally {
      setCrawling(false);
    }
  };

  const widgetCode = `<script src="http://localhost:5173/widget-v4.js" data-site-id="${site_id}"${currentSite?.widget_token ? ` data-token="${currentSite.widget_token}"` : ''}></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-row items-center justify-between gap-4 border-b-4 border-black pb-8">
        <div className="flex-1 overflow-hidden min-w-0 mr-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 truncate">
            {currentSite ? currentSite.name : 'Agent Settings'}
          </h1>
          <p className="text-sm md:text-xl font-bold bg-white border-2 border-black px-2 py-1 inline-block truncate max-w-full">URL: {site_id}</p>
        </div>
        <Link href="/sites" className="brutal-btn bg-white hover:bg-black hover:text-white px-4 shrink-0">
          ← BACK
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          <div className="brutal-card brutal-shadow p-8 bg-brutal-cyan">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center brutal-shadow-sm">
                <span className="text-2xl font-black">📚</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Add Knowledge</h2>
            </div>
            
            <form onSubmit={handleUpload}>
              <textarea 
                required
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste your FAQs, product list, or company info here..."
                className="w-full h-48 brutal-border p-4 text-lg focus:outline-none focus:bg-white mb-6 resize-none transition-all"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={uploading}
                  className="brutal-btn bg-brutal-yellow hover:bg-white disabled:opacity-50 text-xl"
                >
                  {uploading ? 'PROCESSING...' : 'UPLOAD & EMBED'}
                </button>
              </div>
            </form>
          </div>

          <div className="brutal-card brutal-shadow p-8 bg-brutal-pink">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center brutal-shadow-sm">
                <span className="text-2xl font-black">🕸️</span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Web Crawler</h2>
            </div>
            
            <form onSubmit={handleCrawl} className="flex flex-col sm:flex-row gap-6">
              <input 
                type="url"
                required
                value={crawlUrl}
                onChange={e => setCrawlUrl(e.target.value)}
                placeholder="HTTPS://EXAMPLE.COM"
                className="flex-1 brutal-border p-4 text-lg focus:outline-none focus:bg-white transition-all"
              />
              <button 
                type="submit"
                disabled={crawling}
                className="brutal-btn bg-white hover:bg-black hover:text-white disabled:opacity-50 text-xl whitespace-nowrap"
              >
                {crawling ? 'CRAWLING...' : 'CRAWL WEBSITE'}
              </button>
            </form>
            {crawlSuccess ? (
              <div className="mt-6 bg-brutal-green text-black p-4 font-bold brutal-border">
                ✅ {crawlSuccess}
              </div>
            ) : (
              <p className="text-lg font-bold mt-4 bg-white px-2 py-1 inline-block border-2 border-black">
                Automatically crawls and ingests up to 20 pages.
              </p>
            )}
          </div>

          <div className="brutal-card brutal-shadow p-8 bg-white">
            <h2 className="text-3xl font-black uppercase mb-8">Trained Documents</h2>
            {loading ? (
              <div className="text-2xl font-black uppercase animate-pulse">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="text-xl font-bold uppercase p-6 border-4 border-black border-dashed text-center">No documents trained yet.</div>
            ) : (
              <div className="space-y-6">
                {(showAllDocs ? documents : documents.slice(0, 3)).map((doc: any) => (
                  <div key={doc.id} className="brutal-border bg-[#f4f4f0]">
                    <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black">
                          {doc.id}
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase">Document #{doc.id}</p>
                          <p className="text-sm font-bold uppercase">{new Date(doc.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black uppercase bg-brutal-green border-2 border-black px-3 py-1">Vectorized</span>
                        <button 
                          onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                          className="brutal-btn bg-white hover:bg-black hover:text-white p-0 py-1 px-3 text-sm flex items-center gap-2"
                        >
                          {expandedDocId === doc.id ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                              HIDE
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              VIEW
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedDocId === doc.id && (
                      <div className="p-4 border-t-4 border-black bg-white">
                        <pre className="text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {doc.raw_text}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                
                {documents.length > 3 && (
                  <button 
                    onClick={() => setShowAllDocs(!showAllDocs)}
                    className="w-full brutal-btn bg-black text-white hover:bg-brutal-yellow hover:text-black mt-4"
                  >
                    {showAllDocs ? 'SHOW LESS' : `VIEW ALL ${documents.length} DOCUMENTS`}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="space-y-8">
          <div className="brutal-card brutal-shadow p-8 bg-brutal-yellow">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Widget Config</h2>
            <form onSubmit={saveConfig} className="space-y-4">
              <div>
                <label className="block font-bold uppercase mb-2">Bot Name</label>
                <input 
                  type="text" 
                  required
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  className="w-full brutal-border p-3 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold uppercase mb-2">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="w-12 h-12 brutal-border p-1 cursor-pointer bg-white"
                  />
                  <input 
                    type="text" 
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="flex-1 brutal-border p-3 focus:outline-none focus:bg-white font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold uppercase mb-2">Theme Mode</label>
                <select 
                  value={themeMode}
                  onChange={e => setThemeMode(e.target.value)}
                  className="w-full brutal-border p-3 focus:outline-none focus:bg-white bg-white appearance-none cursor-pointer"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={savingConfig || !currentSite}
                className="brutal-btn w-full bg-black text-white hover:bg-brutal-green hover:text-black mt-4 disabled:opacity-50"
              >
                {savingConfig ? 'SAVING...' : 'SAVE CONFIG'}
              </button>
            </form>
            {configMessage && (
              <div className={`mt-4 p-3 font-bold brutal-border text-center ${configMessage.type === 'success' ? 'bg-brutal-green text-black' : 'bg-brutal-red text-white'}`}>
                {configMessage.type === 'success' ? '✅ ' : '❌ '}{configMessage.text}
              </div>
            )}
          </div>

          <div className="brutal-card brutal-shadow p-8 bg-brutal-green relative">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Embed Code</h2>
            <p className="text-base font-bold mb-6">Paste this script right before the closing &lt;/body&gt; tag on your website.</p>
            
            <div className="bg-white brutal-border p-4 relative group">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap word-break">
                {widgetCode}
              </pre>
              <button 
                onClick={copyCode}
                className="absolute top-2 right-2 brutal-btn bg-brutal-yellow hover:bg-black hover:text-white p-1 text-xs flex items-center justify-center"
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
