'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
      if (!session && !isPublicPage) {
        router.push('/login');
      } else if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
        router.push('/sites');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
      if (!session && !isPublicPage) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

  if (loading) {
    return (
      <div className="bg-brutal-yellow min-h-screen flex items-center justify-center font-bold text-2xl">
        LOADING...
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && (
        <>
          <nav className="sticky top-0 z-50 bg-white border-b-[6px] border-black py-4">
            <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 flex items-center justify-between">
              {/* Logo */}
              <Link href="/sites" className="h-10 md:h-12 flex items-center">
                <div className="h-full border-[2px] border-black brutal-shadow-sm overflow-hidden bg-white px-2 flex items-center">
                  <img src="/logo.png" alt="Convoi logo" className="h-full object-contain" />
                </div>
              </Link>

              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="/sites" className="flex items-center gap-2 px-4 py-2 font-black uppercase tracking-wider bg-white border-[4px] border-black hover:bg-black hover:text-white transition-colors group">
                  <svg className="w-5 h-5 group-hover:text-brutal-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Agents
                </Link>
                <a href="https://www.buymeacoffee.com/thashib" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 font-black uppercase tracking-wider bg-brutal-yellow border-[4px] border-black hover:bg-black hover:text-brutal-yellow transition-colors group">
                  <img src="/bmc.svg" alt="BMC" className="w-5 h-5" />
                  Buy me a Coffee
                </a>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-2 font-black uppercase bg-white border-[4px] border-black hover:bg-brutal-red hover:text-white transition-colors group">
                  <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="md:hidden p-2 border-2 border-black bg-brutal-yellow brutal-shadow-sm"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden sticky top-[82px] z-40 bg-white border-b-[6px] border-black flex flex-col p-6 gap-4 brutal-shadow-sm">
              <Link href="/sites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 px-4 py-3 font-black uppercase tracking-wider bg-white border-[4px] border-black hover:bg-black hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:text-brutal-yellow transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Agents
              </Link>
              <a href="https://www.buymeacoffee.com/thashib" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 px-4 py-3 font-black uppercase tracking-wider bg-brutal-yellow border-[4px] border-black hover:bg-black hover:text-brutal-yellow transition-colors group">
                <img src="/bmc.svg" alt="BMC" className="w-6 h-6" />
                Buy me a coffee
              </a>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-3 px-4 py-3 font-black uppercase bg-white border-[4px] border-black hover:bg-brutal-red hover:text-white transition-colors group">
                <svg className="w-6 h-6 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </>
      )}

      <main className="flex-1 overflow-auto relative min-h-screen flex flex-col w-full max-w-[100vw]">
        <div className={`${!isAuthPage ? 'px-6 sm:px-12 md:px-16 lg:px-24 py-8 md:py-10' : ''} flex-1 w-full relative z-10`}>
          {children}
        </div>
        
        <footer className="border-t-[4px] border-black bg-white py-6 mt-auto">
          <div className="w-full px-6 sm:px-12 md:px-16 lg:px-24 flex flex-col sm:flex-row items-center justify-between gap-4 font-black uppercase text-sm">
            <p>&copy; {new Date().getFullYear()} ConvoAi.</p>
            <p>
              Created by <a href="https://linkedin.com/in/thashibtk" target="_blank" rel="noopener noreferrer" className="hover:text-brutal-yellow transition-colors underline decoration-4 underline-offset-4">Thashib TK</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
