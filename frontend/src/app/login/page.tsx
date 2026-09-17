'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleQuickLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'Password123!');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          {/* Branding */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-3 shadow-md shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GRCTrack</h1>
            <p className="text-sm font-medium text-slate-500">
              IT Governance, Risk &amp; Compliance Management
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-800 uppercase tracking-wide">
              Simulation: PT Nusantara Digital
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Portfolio Demo Access</span>
            </div>
            <p className="text-xs text-slate-500">
              Click either role below to test the live application immediately:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@nusantara.digital')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-purple-500 hover:bg-purple-50 text-xs font-semibold text-slate-800 transition-all shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin (Lead Auditor)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('analyst@nusantara.digital')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-800 transition-all shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>GRC Officer (Analyst)</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="analyst@nusantara.digital"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-3 top-[34px] w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute right-3 top-[34px] w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign In to GRCTrack
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Need a test account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Create simulation account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
