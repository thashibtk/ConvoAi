'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Site {
  id: number;
  name: string;
  site_id: string;
  created_at: string;
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteId, setNewSiteId] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchSites(user.id);
      }
    });
  }, []);

  const fetchSites = async (uid: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/sites/?user_id=${uid}`);
      const data = await res.json();
      setSites(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/sites/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSiteName, site_id: newSiteId, user_id: userId }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewSiteName('');
        setNewSiteId('');
        fetchSites(userId);
      }
    } catch (error) {
      console.error('Error creating site:', error);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-[6px] border-black pb-8">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2">Dashboard</h1>
          <p className="text-xl font-bold text-gray-700">Your AI workspace at a glance</p>
        </div>
        <button 
          onClick={() => {
            if (sites.length >= 1) {
              setShowLimitModal(true);
            } else {
              setShowModal(true);
            }
          }}
          className="brutal-btn bg-brutal-yellow brutal-shadow hover:bg-black hover:text-white text-lg px-8 py-4 transition-all"
        >
          + NEW AGENT
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="text-4xl font-black uppercase animate-pulse border-4 border-black p-6 bg-white brutal-shadow">Loading Agents...</div>
        </div>
      ) : sites.length === 0 ? (
        <div className="brutal-card brutal-shadow p-16 text-center bg-white border-[6px]">
          <div className="w-24 h-24 bg-brutal-yellow border-4 border-black flex items-center justify-center mx-auto mb-8 brutal-shadow-sm rotate-3">
            <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-4xl font-black uppercase mb-4">No agents yet</h3>
          <p className="text-xl font-bold text-gray-600 max-w-md mx-auto">Create your first AI agent to start answering visitor questions on your website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sites.map((site) => (
            <Link href={`/sites/${encodeURIComponent(site.site_id)}`} key={site.id} className="group block outline-none">
              <div className="brutal-card brutal-shadow p-8 bg-white border-[4px] h-full flex flex-col group-hover:bg-[#f4f4f0] transition-colors">
                
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-brutal-cyan border-4 border-black flex items-center justify-center brutal-shadow-sm group-hover:rotate-6 transition-transform">
                    <span className="text-3xl font-black">🤖</span>
                  </div>
                  <span className="text-sm font-black uppercase bg-brutal-green text-black border-2 border-black px-4 py-1 brutal-shadow-sm">Active</span>
                </div>
                
                <div className="mb-8 flex-grow">
                  <h3 className="text-3xl font-black uppercase mb-3 truncate" title={site.name}>{site.name}</h3>
                  <div className="inline-block bg-black text-white text-sm font-bold font-mono px-3 py-1 truncate max-w-full" title={site.site_id}>
                    {site.site_id}
                  </div>
                </div>
                
                <div className="text-sm font-bold pt-6 border-t-4 border-black flex items-center justify-between uppercase text-gray-600">
                  <span>Created {new Date(site.created_at).toLocaleDateString()}</span>
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center group-hover:bg-brutal-yellow group-hover:text-black transition-colors">
                    <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="brutal-card brutal-shadow w-full max-w-xl p-6 sm:p-10 bg-white border-[6px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">Create New Agent</h2>
              <button onClick={() => setShowModal(false)} className="text-3xl font-black hover:text-brutal-red transition-colors">×</button>
            </div>
            
            <form onSubmit={createSite} className="space-y-8">
              <div>
                <label className="block text-xl font-black uppercase mb-3">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newSiteName}
                  onChange={e => setNewSiteName(e.target.value)}
                  className="w-full brutal-border p-4 text-xl focus:outline-none focus:bg-brutal-cyan transition-colors"
                  placeholder="E.G. Boomspace"
                />
              </div>
              <div>
                <label className="block text-xl font-black uppercase mb-3">Site ID (URL Slug)</label>
                <input 
                  type="text" 
                  required
                  value={newSiteId}
                  onChange={e => setNewSiteId(e.target.value)}
                  className="w-full brutal-border p-4 text-xl font-mono focus:outline-none focus:bg-brutal-cyan transition-colors"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="brutal-btn w-full sm:flex-1 bg-gray-200 hover:bg-black hover:text-white text-xl py-4"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="brutal-btn w-full sm:flex-1 bg-brutal-green hover:bg-white text-xl py-4"
                >
                  CREATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="brutal-card brutal-shadow w-full max-w-xl p-6 sm:p-10 bg-white border-[6px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-brutal-red">Limit Reached!</h2>
              <button onClick={() => setShowLimitModal(false)} className="text-3xl font-black hover:text-brutal-red transition-colors">×</button>
            </div>
            
            <div className="space-y-6 text-xl font-bold">
              <p>You can only create 1 agent on this tier.</p>
              <p>AI server costs are very high! Please support me so I can develop more features and increase limits.</p>
              <p>I would really appreciate it! ❤️</p>
            </div>

            <div className="mt-10 flex justify-center">
              <a href="https://www.buymeacoffee.com/thashib" target="_blank" rel="noopener noreferrer" className="inline-block transform hover:scale-105 transition-transform">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=thashib&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" />
              </a>
            </div>

            <div className="flex justify-center sm:justify-end pt-8">
              <button 
                onClick={() => setShowLimitModal(false)}
                className="brutal-btn w-full sm:w-auto bg-black text-white hover:bg-brutal-yellow hover:text-black text-xl py-3 px-8"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
