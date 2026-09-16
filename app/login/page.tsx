'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

function BrandIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="brand-intro-shell fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 text-white" role="status" aria-label="Loading Sweet Home Multan ERP">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.16),transparent_42%)]" />
      <div className="relative flex flex-col items-center">
        <div className="brand-mark-reveal relative flex h-36 w-36 items-center justify-center rounded-full bg-white/10 shadow-[0_0_80px_rgba(16,185,129,0.25)]">
          <div className="brand-mark-ring absolute inset-[-16px] rounded-full border border-amber-300/60" />
          <div className="brand-mark-glow absolute inset-2 rounded-full border border-emerald-300/30" />
          <img src="/pbm-sweet-home-logo.svg" alt="PBM Sweet Home logo" className="relative h-32 w-32 rounded-full" />
        </div>
        <div className="mt-8 text-center animate-fade-in-up stagger-2">
          <p className="text-[11px] font-bold tracking-[0.28em] text-emerald-300">PAKISTAN BAIT-UL-MAAL</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Sweet Home Multan</h1>
          <p className="mt-2 text-xs text-slate-400">Institutional Operations ERP</p>
        </div>
        <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-white/10"><div className="brand-progress h-full rounded-full bg-amber-300" /></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/30 flex flex-col md:flex-row animate-scale-in">
        
        {/* Left Form Area */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-between animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 transition-transform duration-200 hover:scale-105">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  PAKISTAN BAIT-UL-MAAL
                </h1>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-1">
                  Sweet Home Multan • ERP Portal
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Staff Secure Sign-In</h2>
              <p className="text-xs text-slate-500 mt-1">
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
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-hidden input-focus-smooth text-slate-900"
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-hidden input-focus-smooth text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">Protected by End-to-End Encryption</span>
                <span className="text-emerald-700 font-medium text-[11px] hover:underline cursor-pointer">
                  Need Help?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-800/30 flex items-center justify-center gap-2 btn-interactive cursor-pointer disabled:opacity-60"
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

          <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Official System of Pakistan Bait-ul-Maal (Government of Pakistan)
          </div>
        </div>

        {/* Right Info */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 animate-fade-in-up stagger-1">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Authorized ERP Access</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Use your assigned email address and password to access the ERP panel.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Authorized staff accounts with discrete RBAC permissions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-knowledge password hashing with bcrypt</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
