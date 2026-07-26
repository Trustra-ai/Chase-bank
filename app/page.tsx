'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const isAuthed = localStorage.getItem('chase_auth') === '1';
    if (isAuthed) {
      router.replace('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('chase_auth', '1');
    router.replace('/dashboard');
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="flex items-center gap-2 text-slate-500">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-[#117ACA]" />
          <p className="text-sm font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#012169] text-white font-sans antialiased">
      <header className="border-b border-white/10 bg-[#0a2540] px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-white">
              <div className="h-3.5 w-3.5 rotate-45 border-[2px] border-[#117ACA]" />
            </div>
            <span className="text-base font-bold tracking-[0.14em] text-white">CHASE</span>
          </div>
          <p className="text-xs text-blue-200">Secure Online Banking</p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#117ACA]">
              <LockClosedIcon className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome to Chase Online</h1>
            <p className="mt-1 text-xs text-slate-500">Sign in to access your accounts</p>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                defaultValue="frank_r"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                defaultValue="••••••••••••"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-[#117ACA] focus:ring-[#117ACA]"
                />
                Remember me
              </label>
              <a href="#" className="font-semibold text-[#117ACA] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-[#117ACA] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0d5f9e]"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/dashboard"
              onClick={() => localStorage.setItem('chase_auth', '1')}
              className="text-xs font-medium text-slate-500 hover:text-[#117ACA] hover:underline"
            >
              Skip sign-in &amp; enter dashboard directly →
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-blue-200/80">
        <p>© 2026 JPMorgan Chase &amp; Co. Member FDIC.</p>
      </footer>
    </div>
  );
}

