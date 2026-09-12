'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

type ToastState = { type: 'success' | 'error'; text: string } | null;

export default function SiteDetail({ params }: { params: Promise<{ site_id: string }> }) {
  const paramsResult = use(params);
  const site_id = decodeURIComponent(paramsResult.site_id);
  const router = useRouter();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawText, setRawText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState(site_id);
  const [crawling, setCrawling] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<number | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [trainTab, setTrainTab] = useState<'crawl' | 'text'>('crawl');

  const [currentSite, setCurrentSite] = useState<any>(null);
  const [botName, setBotName] = useState('AI Assistant');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [themeMode, setThemeMode] = useState('light');
  const [savingConfig, setSavingConfig] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'agent' | 'document'; id?: number; isDeleting: boolean }>({ isOpen: false, type: 'agent', isDeleting: false });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; newName: string; isSaving: boolean }>({ isOpen: false, newName: '', isSaving: false });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 3500);
  };

  const fetchDocuments = async () => {
    try {
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
      try {
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
        console.error('Failed to fetch site info', e);
      }
      fetchDocuments();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site_id]);

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;
    setSavingConfig(true);
    try {
      const res = await fetch(`${apiUrl}/api/sites/${currentSite.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentSite, bot_name: botName, theme_color: themeColor, theme_mode: themeMode }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentSite(updated);
        showToast('success', 'Configuration saved.');
      } else {
        showToast('error', 'Could not save configuration.');
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Could not save configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    setUploading(true);
    try {
      const siteRes = await fetch(`${apiUrl}/api/sites/`);
      const sites = await siteRes.json();
      const site = sites.find((s: any) => s.site_id === site_id);
      if (!site) throw new Error('Site not found');

      const res = await fetch(`${apiUrl}/api/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: site.id, raw_text: rawText }),
      });

      if (res.ok) {
        setRawText('');
        fetchDocuments();
        showToast('success', 'Text embedded and added to training data.');
      } else {
        showToast('error', 'Upload failed. Check your Django server.');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not reach the server. Is Django running?');
    } finally {
      setUploading(false);
    }
  };

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;
    setCrawling(true);
    try {
      const res = await fetch(`${apiUrl}/api/crawl/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: site_id, url: crawlUrl, max_pages: 20 }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', data.message || 'Crawl completed.');
        fetchDocuments();
      } else {
        showToast('error', 'Crawl failed. Check the URL and try again.');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Could not reach the server. Is Django running?');
    } finally {
      setCrawling(false);
    }
  };

  const handleDeleteAgent = () => {
    if (!currentSite) return;
    setDeleteModal({ isOpen: true, type: 'agent', isDeleting: false });
  };

  const handleDeleteDocument = (docId: number) => {
    setDeleteModal({ isOpen: true, type: 'document', id: docId, isDeleting: false });
  };

  const executeDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (deleteModal.type === 'agent') {
        const res = await fetch(`${apiUrl}/api/sites/${currentSite.id}/`, { method: 'DELETE' });
        if (res.ok) {
          router.push('/sites');
        } else {
          showToast('error', 'Could not delete this agent.');
        }
      } else if (deleteModal.type === 'document' && deleteModal.id) {
        const res = await fetch(`${apiUrl}/api/documents/${deleteModal.id}/`, { method: 'DELETE' });
        if (res.ok) {
          fetchDocuments();
          setDeleteModal({ isOpen: false, type: 'agent', isDeleting: false });
          showToast('success', 'Document deleted.');
        } else {
          showToast('error', 'Could not delete this document.');
        }
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error connecting to server.');
    } finally {
      if (deleteModal.type === 'agent') {
        setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
      }
    }
  };

  const openEditModal = () => {
    if (currentSite) setEditModal({ isOpen: true, newName: currentSite.name, isSaving: false });
  };

  const executeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite || !editModal.newName.trim()) return;
    setEditModal((prev) => ({ ...prev, isSaving: true }));
    try {
      const res = await fetch(`${apiUrl}/api/sites/${currentSite.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editModal.newName }),
      });
      if (res.ok) {
        const updatedSite = await res.json();
        setCurrentSite(updatedSite);
        setEditModal((prev) => ({ ...prev, isOpen: false }));
        showToast('success', 'Agent renamed.');
      } else {
        showToast('error', 'Could not update the agent name.');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Error connecting to server.');
    } finally {
      setEditModal((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || (typeof window !== 'undefined' ? `${window.location.origin}/widget-v4.js` : 'http://localhost:5173/widget-v4.js');
  const widgetCode = `<script src="${widgetUrl}" data-site-id="${site_id}"${currentSite?.widget_token ? ` data-token="${currentSite.widget_token}"` : ''} data-api-url="${apiUrl}"></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleDocs = showAllDocs ? documents : documents.slice(0, 3);

  return (
    <div
      className="space-y-10 pb-20 relative"
      style={{
        backgroundImage: 'radial-gradient(#00000014 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
      }}
    >
      {/* TOAST */}
      {toast && (
        <div
          role="status"
          className={`fixed top-6 right-6 left-6 sm:left-auto z-[100] sm:max-w-sm brutal-border brutal-shadow px-5 py-4 font-bold text-sm sm:text-base flex items-start gap-3 rotate-1 ${
            toast.type === 'success' ? 'bg-brutal-green text-black' : 'bg-brutal-red text-white'
          }`}
        >
          <span className="text-lg leading-none">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="flex-1">{toast.text}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss notification" className="font-black leading-none text-lg">
            ×
          </button>
        </div>
      )}

      {/* 1 — HEADER (identity + destructive/edit actions) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-[6px] border-black pb-8">
        <div className="min-w-0 w-full md:w-auto">
          <a href="/sites" className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1 mb-3 hover:underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            All agents
          </a>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2 text-brutal-blue break-words">{currentSite?.name || 'Agent'}</h1>
          <p className="text-base sm:text-xl font-bold text-gray-700 font-mono truncate">ID: {site_id}</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button
            onClick={openEditModal}
            className="flex-1 md:flex-none brutal-btn bg-brutal-yellow hover:bg-black hover:text-white px-4 py-4 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            <span>RENAME</span>
          </button>
          <button
            onClick={handleDeleteAgent}
            className="flex-1 md:flex-none brutal-btn bg-brutal-red hover:bg-black hover:text-white px-4 py-4 flex items-center justify-center gap-2 text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            <span>DELETE</span>
          </button>
        </div>
      </div>

      {/* 2 — EMBED CODE: top priority, this is the payoff of the whole dashboard */}
      <div className="brutal-card brutal-shadow p-6 sm:p-8 bg-brutal-green relative -rotate-[0.3deg]">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center brutal-shadow-sm shrink-0 rotate-3">
            <span className="text-3xl font-black">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Embed Code</h2>
            <p className="text-sm sm:text-base font-bold">Paste this script right before the closing &lt;/body&gt; tag on your website.</p>
          </div>
        </div>

        <div className="bg-white brutal-border p-4 relative group mt-4">
          <pre className="text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all pr-12">{widgetCode}</pre>
          <button
            onClick={copyCode}
            className="absolute top-2 right-2 brutal-btn bg-brutal-yellow hover:bg-black hover:text-white p-2 text-xs flex items-center justify-center"
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* 3 — STAT STRIP: quick-glance status before diving into detail */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <div className="brutal-card brutal-shadow-sm p-4 sm:p-6 bg-white rotate-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Documents</p>
          <p className="text-3xl sm:text-4xl font-black">{loading ? '–' : documents.length}</p>
        </div>
        <div className="brutal-card brutal-shadow-sm p-4 sm:p-6 bg-white -rotate-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Theme</p>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-black shrink-0" style={{ backgroundColor: themeColor }} />
            <p className="text-sm sm:text-lg font-black capitalize truncate">{themeMode}</p>
          </div>
        </div>
        <div className="brutal-card brutal-shadow-sm p-4 sm:p-6 bg-white rotate-1">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Status</p>
          <p className="text-sm sm:text-lg font-black text-brutal-green">● LIVE</p>
        </div>
      </div>

      {/* 4 — PRIMARY WORK AREA: training + docs (left, bigger) with config as a sticky sidebar (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* MAIN: training + documents */}
        <div className="lg:col-span-2 space-y-10">
          <div className="brutal-card brutal-shadow p-6 sm:p-8 bg-brutal-pink">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center brutal-shadow-sm shrink-0">
                <span className="text-2xl font-black">📚</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Train This Agent</h2>
            </div>

            <div className="flex brutal-border bg-white w-fit mb-6">
              <button
                onClick={() => setTrainTab('crawl')}
                className={`px-5 py-3 font-black uppercase text-sm sm:text-base transition-colors ${trainTab === 'crawl' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                🕸️ Crawl Site
              </button>
              <button
                onClick={() => setTrainTab('text')}
                className={`px-5 py-3 font-black uppercase text-sm sm:text-base border-l-4 border-black transition-colors ${trainTab === 'text' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                ✍️ Paste Text
              </button>
            </div>

            {trainTab === 'crawl' ? (
              <form onSubmit={handleCrawl} className="flex flex-col gap-4">
                <input
                  type="url"
                  required
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  placeholder="HTTPS://EXAMPLE.COM"
                  className="w-full brutal-border p-4 text-lg focus:outline-none focus:bg-white transition-all"
                />
                <button type="submit" disabled={crawling} className="w-full sm:w-auto self-start brutal-btn bg-white hover:bg-black hover:text-white disabled:opacity-50 text-lg px-8 py-4">
                  {crawling ? 'CRAWLING...' : 'CRAWL WEBSITE'}
                </button>
                <p className="text-sm font-bold bg-white p-2 inline-block border-2 border-black w-fit">Automatically crawls and ingests up to 20 pages.</p>
              </form>
            ) : (
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <textarea
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your FAQs, product list, or company info here..."
                  className="w-full h-40 sm:h-48 brutal-border p-4 text-base sm:text-lg focus:outline-none focus:bg-white resize-y transition-all"
                />
                <button type="submit" disabled={uploading} className="w-full sm:w-auto self-start brutal-btn bg-white hover:bg-black hover:text-white disabled:opacity-50 text-lg px-8 py-4">
                  {uploading ? 'PROCESSING...' : 'UPLOAD & EMBED'}
                </button>
              </form>
            )}
          </div>

          <div className="brutal-card brutal-shadow p-6 sm:p-8 bg-white">
            <div className="flex items-center justify-between mb-6 gap-3">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Trained Docs</h2>
              {!loading && documents.length > 0 && (
                <span className="text-xs sm:text-sm font-black bg-brutal-cyan border-2 border-black px-3 py-1.5 shrink-0">{documents.length} TOTAL</span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="brutal-border bg-gray-100 h-[72px] animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-lg font-bold uppercase p-6 border-4 border-black border-dashed text-center bg-gray-50">No documents trained yet.</div>
            ) : (
              <div className="space-y-4">
                {visibleDocs.map((doc: any) => (
                  <div key={doc.id} className="brutal-border bg-[#f4f4f0]">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black shrink-0">{doc.id}</div>
                        <div className="min-w-0">
                          <p className="text-base font-black uppercase truncate">Doc #{doc.id}</p>
                          <p className="text-xs font-bold uppercase text-gray-600 truncate">{new Date(doc.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="text-xs font-black uppercase bg-brutal-green border-2 border-black px-2 py-1">Vectorized</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                            className="brutal-btn bg-white hover:bg-black hover:text-white p-1 px-3 flex items-center justify-center"
                            title="View Content"
                          >
                            {expandedDocId === doc.id ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="brutal-btn bg-brutal-red hover:bg-black hover:text-white p-1 px-3 flex items-center justify-center text-white"
                            title="Delete Document"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    {expandedDocId === doc.id && (
                      <div className="p-4 border-t-4 border-black bg-white">
                        <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">{doc.raw_text}</pre>
                      </div>
                    )}
                  </div>
                ))}

                {documents.length > 3 && (
                  <button onClick={() => setShowAllDocs(!showAllDocs)} className="w-full brutal-btn bg-black text-white hover:bg-brutal-yellow hover:text-black mt-4 py-3">
                    {showAllDocs ? 'SHOW LESS' : `VIEW ALL ${documents.length} DOCUMENTS`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR: config — secondary, set once and revisit occasionally */}
        <div className="lg:col-span-1">
          <div className="brutal-card brutal-shadow p-6 sm:p-8 bg-brutal-yellow lg:sticky lg:top-6">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-6">Widget Config</h2>
            <form onSubmit={saveConfig} className="space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-bold uppercase mb-2">Bot Name</label>
                <input type="text" required value={botName} onChange={(e) => setBotName(e.target.value)} className="w-full brutal-border p-4 focus:outline-none focus:bg-white text-lg" />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-bold uppercase mb-2">Theme Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="w-16 h-16 brutal-border p-1 cursor-pointer bg-white shrink-0" />
                  <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="flex-1 min-w-0 brutal-border p-4 focus:outline-none focus:bg-white font-mono uppercase text-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm sm:text-base font-bold uppercase mb-2">Theme Mode</label>
                <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} className="w-full brutal-border p-4 focus:outline-none focus:bg-white bg-white appearance-none cursor-pointer text-lg">
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
              <button type="submit" disabled={savingConfig || !currentSite} className="brutal-btn w-full bg-black text-white hover:bg-brutal-green hover:text-black mt-4 disabled:opacity-50 text-xl py-4">
                {savingConfig ? 'SAVING...' : 'SAVE CONFIG'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white brutal-border brutal-shadow p-8 max-w-md w-full relative">
            <h3 className="text-3xl font-black uppercase mb-4 text-brutal-red">{deleteModal.type === 'agent' ? 'Delete Agent?' : 'Delete Document?'}</h3>
            <p className="text-lg font-bold mb-8">
              {deleteModal.type === 'agent'
                ? 'Are you absolutely sure you want to delete this AI Agent? All trained documents and configurations will be permanently lost. This action cannot be undone.'
                : 'Are you sure you want to delete this trained document? The agent will no longer be able to use it for context.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setDeleteModal({ isOpen: false, type: 'agent', isDeleting: false })} disabled={deleteModal.isDeleting} className="brutal-btn bg-white hover:bg-gray-100 flex-1 px-4 py-3">
                CANCEL
              </button>
              <button onClick={executeDelete} disabled={deleteModal.isDeleting} className="brutal-btn bg-brutal-red hover:bg-black hover:text-white flex-1 px-4 py-3 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                {deleteModal.isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    DELETING...
                  </>
                ) : (
                  'YES, DELETE IT'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white brutal-border brutal-shadow p-8 max-w-md w-full relative">
            <h3 className="text-3xl font-black uppercase mb-4 text-brutal-blue">Edit Agent</h3>
            <form onSubmit={executeEdit}>
              <div className="mb-8">
                <label className="block text-sm font-bold uppercase mb-2">Agent Name</label>
                <input type="text" required autoFocus value={editModal.newName} onChange={(e) => setEditModal((prev) => ({ ...prev, newName: e.target.value }))} className="w-full brutal-border p-3 text-lg focus:outline-none focus:bg-gray-50" placeholder="Enter new agent name" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setEditModal({ isOpen: false, newName: '', isSaving: false })} disabled={editModal.isSaving} className="brutal-btn bg-white hover:bg-gray-100 flex-1 px-4 py-3">
                  CANCEL
                </button>
                <button type="submit" disabled={editModal.isSaving} className="brutal-btn bg-brutal-blue hover:bg-black hover:text-white flex-1 px-4 py-3 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                  {editModal.isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      SAVING...
                    </>
                  ) : (
                    'SAVE CHANGES'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}