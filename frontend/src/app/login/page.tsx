'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-[#04070B] text-slate-100 flex flex-col lg:flex-row overflow-x-clip selection:bg-[#4ADE80] selection:text-black">
      
      {/* ======================================================== */}
      {/* LEFT 50%: Branding & Visual Showcase                      */}
      {/* ======================================================== */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-16 border-r border-white/[0.08] bg-[#060A13] overflow-hidden">
        {/* Ambient Grid & Glow */}
        <div className="absolute top-[20%] left-[-10%] w-[550px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[-10%] w-[450px] h-[300px] bg-[#4ADE80]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.25)]">
              <ShieldCheck className="w-6 h-6 text-[#4ADE80]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-white tracking-tight">GRCTrack</span>
                <span className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  PORTFOLIO
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider block uppercase">
                IT Governance, Risk &amp; Compliance Management
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Showcase Copy */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GRCTrack Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15]">
            Next-Gen IT Governance, Risk &amp; Compliance Intelligence.
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed">
            Simulasi alur tata kelola TI untuk PT Nusantara Digital: audit otomatis, kalkulasi risiko real-time, dan pemantauan kepatuhan terpadu.
          </p>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xl font-black text-emerald-400 font-mono">82.5%</span>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Framework Compliance Adherence</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <span className="text-xl font-black text-cyan-400 font-mono">5×5</span>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Threat Matrix Scoring (L × I)</p>
            </div>
          </div>
        </div>

        {/* Bottom: Synthetic Environment Pill */}
        <div className="relative z-10 p-4 rounded-xl bg-[#090F1A]/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs text-slate-300 italic">
            &ldquo;Automated Risk Engine L × I with Zero Lag — built for instant, enterprise-grade simulation.&rdquo;
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Organization: PT Nusantara Digital (Synthetic)</span>
            <span className="text-emerald-400 font-medium">ISO 27001 • NIST CSF</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT 50%: Interactive Glass Form                         */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              </div>
              <span className="font-bold text-lg text-white">GRCTrack</span>
            </Link>
            <span className="text-xs text-emerald-400 font-mono">PT Nusantara Digital</span>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-400">
              Sign in to access your IT governance &amp; risk simulation workspace.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@nusantara.digital"
                  required
                  className="w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none transition-all duration-200"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                  Demo Credentials Below
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none transition-all duration-200"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#22C55E] text-black font-semibold text-sm shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_28px_rgba(74,222,128,0.6)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to GRC Platform</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Shortcuts */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                Instant Demo Accounts
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Click to Auto-fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@nusantara.digital', 'DemoPass123!')}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Demo Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                  admin@nusantara.digital
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('analyst@nusantara.digital', 'DemoPass123!')}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Demo GRC Officer</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                  analyst@nusantara.digital
                </div>
              </button>
            </div>
          </div>

          {/* Switcher Link */}
          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#4ADE80] hover:underline font-semibold">
              Register new account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
