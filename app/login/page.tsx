'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfa, setMfa] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'credentials') {
      if (!username.trim() || !password.trim()) return;
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('mfa');
      }, 600);
    } else {
      if (mfa === '123456') {
        setLoading(true);
        // Simple client-side auth flag
        localStorage.setItem('chase_auth', '1');
        if (remember) {
          localStorage.setItem('chase_remember', '1');
        }
        setTimeout(() => {
          router.push('/');
        }, 400);
      } else {
        alert('Demo MFA code is: 123456');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
      {/* Utility bar */}
      <div className="bg-[#0a2540] text-[11px] font-medium text-blue-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            <span>Customer service</span>
            <span className="hidden sm:inline text-blue-400">|</span>
            <span className="hidden sm:inline">ATMs &amp; branches</span>
          </div>
          <span>Español</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/login" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#117ACA]">
              <div className="h-4 w-4 rotate-45 border-2 border-white" />
            </div>
            <span className="text-xl font-bold tracking-[0.12em] text-[#117ACA]">
              CHASE
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-[400px]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {step === 'credentials' ? 'Sign in' : "Verify it's you"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 'credentials'
                ? 'Sign in to manage your accounts'
                : 'Enter the 6-digit code we sent to your phone'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {step === 'credentials' ? (
                <>
                  <div>
                    <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                      placeholder="Username"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-slate-300 px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#117ACA] hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#117ACA] focus:ring-[#117ACA]"
                      />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <button type="button" className="font-medium text-[#117ACA] hover:underline">
                      Forgot username/password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0e6bb5] disabled:opacity-70"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="mfa" className="block text-xs font-semibold text-slate-700">
                      Authentication code
                    </label>
                    <input
                      id="mfa"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={mfa}
                      onChange={(e) => setMfa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1.5 w-full rounded-md border border-slate-300 px-3.5 py-3 text-center text-2xl font-semibold tracking-[0.4em] outline-none focus:border-[#117ACA] focus:ring-2 focus:ring-[#117ACA]/20"
                      placeholder="••••••"
                      autoFocus
                    />
                    <p className="mt-2 text-center text-xs text-slate-500">
                      Demo code: <span className="font-mono font-semibold">123456</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || mfa.length < 6}
                    className="w-full rounded-md bg-[#117ACA] py-3 text-sm font-semibold text-white transition hover:bg-[#0e6bb5] disabled:opacity-70"
                  >
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setMfa('');
                    }}
                    className="w-full text-center text-sm font-medium text-[#117ACA] hover:underline"
                  >
                    ← Back to sign in
                  </button>
                </>
              )}
            </form>

            {step === 'credentials' && (
              <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                <p>
                  New to Chase?{' '}
                  <button type="button" className="font-semibold text-[#117ACA] hover:underline">
                    Enroll now
                  </button>
                </p>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-700">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure connection
                </p>
              </div>
            )}
          </div>

          {/* Promo */}
          <div className="mt-5 rounded-lg bg-[#117ACA] p-5 sm:p-6 text-white">
            <h2 className="text-base sm:text-lg font-semibold">
              Chase Total Checking<sup>®</sup>
            </h2>
            <p className="mt-1 text-2xl sm:text-3xl font-bold">$400</p>
            <p className="mt-2 text-sm text-blue-100 leading-relaxed">
              New Chase checking customers can get a $400 bonus when you open an account and set up direct deposit.
            </p>
            <button
              type="button"
              className="mt-4 rounded border border-white/60 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open an account
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between">
          <p>© 2026 JPMorgan Chase &amp; Co.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" className="hover:underline">Privacy</button>
            <button type="button" className="hover:underline">Security</button>
            <button type="button" className="hover:underline">Terms of use</button>
            <span>Member FDIC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
