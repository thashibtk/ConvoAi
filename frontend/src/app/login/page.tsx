'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/sites');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/sites`
      }
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative">
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 font-black uppercase hover:underline bg-white px-4 py-2 border-[3px] border-black brutal-shadow-sm z-50 transition-transform hover:-translate-y-1">
        ← BACK TO HOME
      </Link>
      <div className="w-full max-w-md mt-12">
        <div className="brutal-card brutal-shadow w-full p-8 sm:p-10 bg-brutal-yellow relative mt-8">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 border-[4px] border-black brutal-shadow-sm bg-white p-3 flex items-center justify-center">
            <img src="/logo.png" alt="ConvoAi Logo" className="w-full h-full object-contain" />
          </div>
        
        <h1 className="text-4xl sm:text-5xl font-black mb-2 uppercase tracking-tight text-center pt-6">Login</h1>
        <p className="font-bold mb-8 text-lg text-center">Welcome back to ConvoAi</p>
        
        {error && (
          <div className="bg-brutal-red text-white p-4 font-bold brutal-border mb-6">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full brutal-border p-3 text-lg focus:outline-none focus:bg-brutal-cyan transition-colors"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutal-border p-3 text-lg focus:outline-none focus:bg-brutal-cyan transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="brutal-btn w-full bg-brutal-green text-black hover:bg-white text-xl py-4"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN NOW'}
          </button>
        </form>

        <div className="mt-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="brutal-btn w-full bg-white text-black hover:bg-brutal-cyan text-lg py-3 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            LOGIN WITH GOOGLE
          </button>
        </div>
        
        <p className="mt-8 text-center font-bold">
          NO ACCOUNT? <Link href="/signup" className="text-brutal-blue hover:underline bg-white px-2">SIGN UP HERE</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
