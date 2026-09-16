'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, X } from 'lucide-react';

function BrandIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="brand-intro-shell fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 text-white" role="status" aria-label="Loading Sweet Home Multan ERP">
      <div className="brand-intro-grid absolute inset-0" />
      <div className="brand-scan absolute left-0 right-0 top-1/2 h-px bg-emerald-300/60" />
      <div className="absolute left-6 top-6 text-[9px] font-bold tracking-[0.35em] text-emerald-300/70">PBM // SHM // 2026</div>
      <div className="absolute bottom-6 right-6 text-right text-[9px] font-bold tracking-[0.25em] text-slate-500">SECURE OPERATIONS<br /><span className="text-emerald-400">SYSTEM READY</span></div>
      <div className="relative flex flex-col items-center">
        <div className="brand-mark-reveal relative flex h-36 w-36 items-center justify-center rounded-full bg-white/10 shadow-[0_0_80px_rgba(16,185,129,0.25)]">
          <div className="brand-mark-ring absolute inset-[-16px] rounded-full border border-amber-300/60" />
          <div className="brand-mark-glow absolute inset-2 rounded-full border border-emerald-300/30" />
          <img src="/pbm-sweet-home-logo.svg" alt="PBM Sweet Home logo" className="relative h-32 w-32 rounded-full" />
        </div>
        <div className="brand-copy-reveal mt-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.28em] text-emerald-300">PAKISTAN BAIT-UL-MAAL</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Sweet Home Multan</h1>
          <p className="mt-2 text-xs text-slate-400">Institutional Operations ERP</p>
        </div>
        <div className="brand-status-reveal mt-8 flex items-center gap-3 text-[9px] font-bold tracking-[0.22em] text-slate-500"><span className="h-px w-8 bg-emerald-400/60" />AUTHENTICATING<span className="h-px w-8 bg-emerald-400/60" /></div>
        <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/10"><div className="brand-progress h-full rounded-full bg-amber-300" /></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrandIntro, setShowBrandIntro] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBrandIntro(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please verify your credentials.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('A network or server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {showBrandIntro && <BrandIntro onComplete={() => setShowBrandIntro(false)} />}
      <div className="login-stage relative min-h-screen bg-[#0d091d] flex items-center justify-center overflow-hidden p-4 selection:bg-blue-500 selection:text-white">
      <div className="login-particle-field absolute inset-0 pointer-events-none" />
      <div className="login-scanline absolute left-0 right-0 top-1/2 h-px pointer-events-none" />
      <div className="login-card relative w-full max-w-md bg-[#191331] rounded-[1.5rem] shadow-2xl overflow-hidden border border-violet-900/60 animate-scale-in">
        
        {/* Left Form Area */}
        <div className="w-full p-8 sm:p-10 flex flex-col justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 transition-transform duration-200 hover:scale-105"><Shield className="w-7 h-7" /></div>
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
                  PAKISTAN BAIT-UL-MAAL
                </h1>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-1">
                  Sweet Home Multan · ERP Portal
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Secure Sign-In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your individual staff credentials to access your institutional dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address / Staff Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                    }}
                    placeholder="Enter your registered email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#27203f] border border-violet-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#30264d] outline-hidden input-focus-smooth text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                    <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#27203f] border border-violet-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#30264d] outline-hidden input-focus-smooth text-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">Protected staff access</span>
                <button type="button" onClick={() => setShowForgot(true)} className="text-blue-400 font-medium text-[11px] hover:underline cursor-pointer">Forgot Password?</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 btn-interactive cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate & Access ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-violet-900 text-[11px] text-slate-500 text-center">
            Official System of Pakistan Bait-ul-Maal (Government of Pakistan)
          </div>
        </div>

      </div>
      {showForgot && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setShowForgot(false)}><div className="w-full max-w-sm rounded-2xl border border-violet-800 bg-[#191331] p-6 text-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-blue-400" /><h3 className="font-bold">Password Recovery</h3></div><button onClick={() => setShowForgot(false)} aria-label="Close recovery dialog"><X className="h-4 w-4 text-slate-400" /></button></div><p className="mt-4 text-xs leading-relaxed text-slate-400">For security, password resets are handled by the Incharge or system administrator. Contact them with your registered staff email to reset your ERP password.</p><button onClick={() => setShowForgot(false)} className="mt-5 w-full rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white">Close</button></div></div>}
    </div>
    </>
  );
}
