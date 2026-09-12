'use client';

import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: 'How does the crawler work?',
    a: 'Paste your website URL and ConvoAi automatically visits and reads up to 20 pages, turning your existing content into a knowledge base your agent can answer from — no manual copy-pasting required.',
  },
  {
    q: 'Do I need to write any code?',
    a: 'No. Once your agent is trained, you get a single script tag to paste before the closing </body> tag on your site. The chat widget handles the rest.',
  },
  {
    q: 'Can I match the widget to my brand?',
    a: 'Yes — set your bot\'s name, pick a theme color, and choose light or dark mode from your dashboard. Changes apply instantly to the live widget.',
  },
  {
    q: 'How many agents can I create?',
    a: 'The free tier includes 1 agent, which covers most single-site use cases. If you need more, supporting development helps fund higher limits.',
  },
  {
    q: 'Is my content secure?',
    a: 'Your crawled pages and pasted text are stored against your account only and used solely to answer questions on your own widget — nothing is shared across accounts.',
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden relative bg-transparent">
      {/* Background shape (Blue Slant) */}
      <div className="absolute top-[65%] lg:top-[55%] left-0 w-full h-[150vh] bg-[#3B82F6] transform -skew-y-6 origin-top-left -z-10 border-t-[8px] border-black"></div>

      {/* NAVBAR */}
      <nav className="py-6 px-6 sm:px-12 md:px-16 lg:px-24 flex items-center justify-between z-50 bg-transparent relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-14 sm:h-15 border-[2px] border-black bg-white px-2 flex items-center rounded-lg shadow-[4px_4px_0px_0px_#000]">
            <img src="/logow.png" alt="Convoi logo" className="h-full object-contain" />
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-base">
          <a href="#features" className="hover:underline underline-offset-4 decoration-2">Features</a>
          <a href="#how-it-works" className="hover:underline underline-offset-4 decoration-2">How it works</a>
          <a href="#pricing" className="hover:underline underline-offset-4 decoration-2">Pricing</a>
          <a href="#faq" className="hover:underline underline-offset-4 decoration-2">FAQ</a>
        </div>

        <div className="hidden sm:flex items-center gap-4 md:gap-6 font-bold text-lg">
          <Link href="/login" className="hover:underline">Login</Link>
          <Link href="/signup" className="bg-[#FFE600] border-[3px] border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] font-black transition-all">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="sm:hidden border-[3px] border-black bg-[#FFE600] rounded-lg p-2 shadow-[3px_3px_0px_0px_#000]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-4 right-4 mt-2 bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] p-6 flex flex-col gap-4 z-50">
            <a href="#features" onClick={() => setMenuOpen(false)} className="font-black uppercase text-lg">Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="font-black uppercase text-lg">How it works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="font-black uppercase text-lg">Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="font-black uppercase text-lg">FAQ</a>
            <div className="border-t-2 border-black pt-4 flex flex-col gap-3">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-black uppercase text-lg">Login</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="bg-[#FFE600] border-[3px] border-black px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_#000] font-black text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="px-6 sm:px-12 md:px-16 lg:px-24 pt-12 pb-32 relative z-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          <div className="col-span-1 lg:col-span-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8 relative">
              Turn Website <br />
              Visitors into <br />
              <span className="relative inline-block mt-2 lg:mt-4">
                <span className="absolute inset-0 bg-[#FFE600] border-[4px] border-black rounded-lg transform -rotate-2 scale-105 shadow-[6px_6px_0px_0px_#000]"></span>
                <span className="relative z-10 px-2 py-1 inline-block">Conversations</span>
              </span>
              <div className="absolute -top-8 -left-4 w-4 h-1 bg-black transform rotate-45"></div>
              <div className="absolute -top-4 -left-8 w-4 h-1 bg-black transform rotate-45"></div>
              <div className="absolute bottom-4 -right-12 w-4 h-1 bg-black transform -rotate-45 hidden md:block"></div>
              <div className="absolute bottom-0 -right-6 w-4 h-1 bg-black transform -rotate-45 hidden md:block"></div>
            </h1>

            <p className="text-xl md:text-[1.35rem] font-medium mb-10 max-w-lg leading-snug">
              ConvoAI is an AI-powered chatbot you can embed on your website with a single line of code. Answer questions, capture leads, and grow your business.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/signup" className="bg-[#FF00E6] border-[4px] border-black text-black font-black text-xl px-8 py-4 rounded-2xl shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all flex items-center gap-2">
                Get Started Free <span className="text-2xl leading-none">→</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold mb-14">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs text-black">✓</div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs text-black">✓</div>
                Setup in minutes
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs text-black">✓</div>
                Works on any website
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-8 sm:gap-12">
              <div className="text-center w-24">
                <div className="w-16 h-16 mx-auto bg-[#FF00E6] border-[3px] border-black rounded-[1.25rem] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className="font-black leading-tight block text-[15px]">Answer<br/>Questions</span>
              </div>
              <div className="text-center w-24">
                <div className="w-16 h-16 mx-auto bg-[#FFE600] border-[3px] border-black rounded-[1.25rem] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span className="font-black leading-tight block text-[15px]">Capture<br/>Leads</span>
              </div>
              <div className="text-center w-28">
                <div className="w-16 h-16 mx-auto bg-[#3B82F6] border-[3px] border-black rounded-[1.25rem] shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <span className="font-black leading-tight block text-[15px]">Grow Your<br/>Business</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-6 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="relative w-full max-w-[650px]">
              <img src="banner.png" alt="Hero Graphic" className="w-full h-auto border-[6px] border-black rounded-3xl shadow-[12px_12px_0px_0px_#000]" />
              <div className="absolute -top-6 -right-4 md:-right-8 bg-[#00F0FF] border-[4px] border-black rounded-xl p-3 md:p-4 transform rotate-6 shadow-[6px_6px_0px_0px_#000] z-20">
                <span className="font-black text-sm md:text-lg uppercase leading-tight block text-center">Just Add<br/>A Script Tag</span>
              </div>
              <div className="absolute -bottom-12 md:-bottom-20 right-0 md:right-12 bg-[#FFE600] border-[4px] border-black rounded-xl p-4 md:p-6 transform -rotate-3 shadow-[8px_8px_0px_0px_#000] z-20 max-w-[280px]">
                <span className="font-black text-lg md:text-xl uppercase leading-tight block text-center">Smarter Conversations.<br/>Bigger Opportunities.</span>
                <svg className="absolute -left-20 -top-8 w-24 h-24 text-black hidden md:block" fill="none" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 20,20 Q 20,80 80,80 M 65,65 L 80,80 L 65,95" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 sm:px-12 md:px-16 lg:px-24 py-24 bg-white brutal-grid border-t-[6px] border-black relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20 relative">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight inline-block relative">
              <span className="relative z-10">Why ConvoAi?</span>
              <div className="absolute -bottom-4 left-0 w-full h-6 bg-[#00FF55] transform -rotate-1 -z-0 border-[3px] border-black"></div>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div className="bg-[#FFE600] border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-[4px] border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-4xl font-black">1</span>
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Instant Crawling</h3>
              <p className="font-bold text-xl leading-relaxed">Just paste your website URL. ConvoAi automatically maps and scrapes all your pages to build a vast knowledge base in seconds.</p>
            </div>
            <div className="bg-[#FF00E6] text-black border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-[4px] border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-4xl font-black">2</span>
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Smart Vectoring</h3>
              <p className="font-bold text-xl leading-relaxed">We split and vectorize your content using advanced embeddings, making it instantly searchable by our AI models.</p>
            </div>
            <div className="bg-[#00F0FF] border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#000] hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-[4px] border-black rounded-2xl flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_#000]">
                <span className="text-4xl font-black">3</span>
              </div>
              <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Drop-in Widget</h3>
              <p className="font-bold text-xl leading-relaxed">Copy a single line of JavaScript and paste it into your site. Your custom AI widget is live and answering visitors instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 sm:px-12 md:px-16 lg:px-24 py-24 bg-[#f8f9fa] brutal-grid border-t-[6px] border-black relative">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 border-[4px] border-black rounded-3xl transform -rotate-3 shadow-[8px_8px_0px_0px_#000]"></div>
            <img src="why.png" alt="Dashboard Placeholder" className="relative w-full h-auto border-[4px] border-black rounded-2xl z-10" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase mb-12 leading-[1.1] tracking-tighter">Everything you need in one dashboard</h2>
            <ul className="space-y-8">
              <li className="flex items-start gap-6 bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
                <div className="w-12 h-12 shrink-0 bg-[#00FF55] border-[3px] border-black rounded-xl flex items-center justify-center font-black text-2xl text-black">✓</div>
                <div>
                  <h4 className="text-2xl font-black uppercase mb-2">Manage Multiple Sites</h4>
                  <p className="font-bold text-lg text-gray-800">Create unique AI agents for different domains from a single account effortlessly.</p>
                </div>
              </li>
              <li className="flex items-start gap-6 bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
                <div className="w-12 h-12 shrink-0 bg-[#FFE600] border-[3px] border-black rounded-xl flex items-center justify-center font-black text-2xl text-black">✓</div>
                <div>
                  <h4 className="text-2xl font-black uppercase mb-2">Customizable UI</h4>
                  <p className="font-bold text-lg text-gray-800">Change colors, titles, and welcome messages to match your brand identity perfectly.</p>
                </div>
              </li>
              <li className="flex items-start gap-6 bg-white border-[4px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000]">
                <div className="w-12 h-12 shrink-0 bg-[#3B82F6] border-[3px] border-black rounded-xl flex items-center justify-center font-black text-2xl text-black">✓</div>
                <div>
                  <h4 className="text-2xl font-black uppercase mb-2">Secure & Fast</h4>
                  <p className="font-bold text-lg text-gray-800">Built with robust authentication and blazing fast vector retrieval infrastructure.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* NEW — PRICING */}
      <section id="pricing" className="px-6 sm:px-12 md:px-16 lg:px-24 py-24 bg-white brutal-grid border-t-[6px] border-black relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 relative">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight inline-block relative">
              <span className="relative z-10">Simple Pricing</span>
              <div className="absolute -bottom-4 left-0 w-full h-6 bg-[#FFE600] transform rotate-1 -z-0 border-[3px] border-black"></div>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Free tier */}
            <div className="bg-[#f8f9fa] border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col">
              <p className="text-sm font-black uppercase tracking-wide text-gray-500 mb-2">Free</p>
              <p className="text-5xl font-black mb-6">₹0</p>
              <ul className="space-y-3 font-bold text-lg mb-10 flex-grow">
                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs shrink-0">✓</span>1 AI agent</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs shrink-0">✓</span>Crawl up to 20 pages</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs shrink-0">✓</span>Embeddable script-tag widget</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 bg-[#00FF55] border-2 border-black rounded-full flex items-center justify-center text-xs shrink-0">✓</span>Custom bot name & theme color</li>
              </ul>
              <Link href="/signup" className="w-full text-center bg-white border-[3px] border-black font-black text-lg px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all">
                Get Started Free
              </Link>
            </div>

            {/* Support tier */}
            <div className="bg-[#FFE600] border-[4px] border-black rounded-3xl p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col relative">
              <div className="absolute -top-4 -right-4 bg-[#FF00E6] border-[3px] border-black rounded-full px-4 py-1 font-black text-sm uppercase rotate-6 shadow-[3px_3px_0px_0px_#000]">
                Helps a ton
              </div>
              <p className="text-sm font-black uppercase tracking-wide text-black/60 mb-2">Support Development</p>
              <p className="text-5xl font-black mb-6">Any amount</p>
              <p className="font-bold text-lg mb-10 flex-grow leading-relaxed">
                ConvoAi is a solo-built project, AI server costs add up fast. Chip in what you can and it goes straight into raising agent limits and shipping new features.
              </p>
              <a
                href="https://www.buymeacoffee.com/thashib"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#FF00E6] border-[3px] border-black font-black text-lg px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                Buy me a Coffee
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NEW — FAQ */}
      <section id="faq" className="px-6 sm:px-12 md:px-16 lg:px-24 py-24 bg-[#f8f9fa] brutal-grid border-t-[6px] border-black relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 relative">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight inline-block relative">
              <span className="relative z-10">Questions?</span>
              <div className="absolute -bottom-4 left-0 w-full h-6 bg-[#00F0FF] transform -rotate-1 -z-0 border-[3px] border-black"></div>
            </h2>
          </div>

          <div className="space-y-5">
            {FAQS.map((item, i) => (
              <div key={item.q} className="bg-white border-[4px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-black text-lg sm:text-xl uppercase"
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className={`shrink-0 w-8 h-8 border-[3px] border-black rounded-lg flex items-center justify-center text-xl transition-transform ${openFaq === i ? 'rotate-45 bg-[#FF00E6]' : 'bg-[#FFE600]'}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 font-bold text-base sm:text-lg text-gray-700 leading-relaxed border-t-[3px] border-black pt-5">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 sm:px-12 md:px-16 lg:px-24 py-20 bg-[#FFE600] brutal-grid border-t-[6px] border-black text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 20px)' }}></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 tracking-tighter">Ready to automate?</h2>
          <p className="text-xl md:text-2xl font-bold mb-10 max-w-2xl mx-auto leading-snug bg-white inline-block px-6 py-2 border-[4px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000]">
            Join ConvoAi today and give your website visitors the instant answers they deserve.
          </p>
          <div className="flex justify-center">
            <Link href="/signup" className="bg-[#FF00E6] border-[4px] border-black text-black text-xl md:text-2xl font-black px-12 py-5 rounded-2xl shadow-[8px_8px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all inline-block">
              CREATE YOUR AGENT
            </Link>
          </div>
        </div>
      </section>

      {/* NEW — FOOTER (page previously had none) */}
      <footer className="px-6 sm:px-12 md:px-16 lg:px-24 py-16 bg-white border-t-[6px] border-black relative z-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="h-12 border-[2px] border-black bg-white px-2 flex items-center rounded-lg shadow-[3px_3px_0px_0px_#000] w-fit mb-4">
              <img src="/logow.png" alt="Convoi logo" className="h-full object-contain" />
            </div>
            <p className="font-bold text-gray-600 max-w-xs">Train an AI agent on your own content and embed it on your website with one script tag.</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-gray-500 mb-4">Navigate</p>
            <div className="flex flex-col gap-3 font-bold">
              <a href="#features" className="w-fit hover:underline underline-offset-4 decoration-2">Features</a>
              <a href="#how-it-works" className="w-fit hover:underline underline-offset-4 decoration-2">How it works</a>
              <a href="#pricing" className="w-fit hover:underline underline-offset-4 decoration-2">Pricing</a>
              <a href="#faq" className="w-fit hover:underline underline-offset-4 decoration-2">FAQ</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-gray-500 mb-4">Get Started</p>
            <div className="flex flex-col gap-3 font-bold">
              <Link href="/login" className="w-fit hover:underline underline-offset-4 decoration-2">Login</Link>
              <Link href="/signup" className="w-fit hover:underline underline-offset-4 decoration-2">Create an account</Link>
              <a href="https://www.buymeacoffee.com/thashib" target="_blank" rel="noopener noreferrer" className="w-fit hover:underline underline-offset-4 decoration-2">Buy me a Coffee</a>
            </div>
          </div>
        </div>
        
      </footer>
    </div>
  );
}