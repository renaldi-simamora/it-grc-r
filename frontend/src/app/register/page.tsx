'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
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
        <div className="relative z-10 max-w-lg my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Portfolio Simulation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15]">
            Start Your Enterprise IT GRC Simulation.
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed">
            Akses dashboard simulasi lengkap: kelola 21 skenario risiko, matriks ancaman 5x5, dan otomasi bukti audit untuk PT Nusantara Digital.
          </p>

          <div className="mt-6 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span>Full Role-Based Access Control (Admin &amp; GRC Officer)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span>Frameworks: ISO/IEC 27001, NIST CSF, &amp; CIS Controls</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              <span>One-click PDF Executive Assessment Report Generator</span>
            </div>
          </div>
        </div>

        {/* Bottom: Synthetic Status */}
        <div className="relative z-10 p-4 rounded-xl bg-[#090F1A]/80 border border-white/10 backdrop-blur-xl flex items-center justify-between text-xs text-slate-400">
          <span>Organization: PT Nusantara Digital</span>
          <span className="text-emerald-400 font-mono">100% Synthetic Data</span>
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
            <span className="text-xs text-emerald-400 font-mono">Simulation</span>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Account
            </h1>
            <p className="text-sm text-slate-400">
              Set up your simulation credentials to explore GRCTrack.
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ahmad Pratama"
                  required
                  className="w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none transition-all duration-200"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none transition-all duration-200"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#4ADE80] hover:bg-[#22C55E] text-black font-semibold text-sm shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:shadow-[0_0_28px_rgba(74,222,128,0.6)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Simulation Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Switcher Link */}
          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4ADE80] hover:underline font-semibold">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
