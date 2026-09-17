'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { Loader2, AlertCircle, Bell, ChevronRight, ShieldCheck } from 'lucide-react';

const publicPaths = ['/', '/login', '/register'];

const pathTitles: Record<string, string> = {
  '/dashboard': 'Executive Dashboard',
  '/assets': 'IT Asset Inventory',
  '/risks': 'Risk Register & 5×5 Matrix',
  '/controls': 'Internal Control Framework',
  '/control-assessments': 'Control Audit Assessment',
  '/evidence': 'Evidence Vault',
  '/findings': 'Audit Findings & Gaps',
  '/remediation': 'Remediation Action Plans',
  '/compliance': 'Framework Compliance Monitor',
  '/reports': 'Executive Assessment Reports',
  '/users': 'User Management & Roles',
  '/settings': 'System Settings',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#04070B] text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(74,222,128,0.3)]">
          <Loader2 className="w-6 h-6 animate-spin text-[#4ADE80]" />
        </div>
        <p className="text-sm font-semibold text-slate-200">Initializing GRCTrack...</p>
        <p className="text-xs text-slate-500 font-mono mt-1">Connecting to simulated ledger</p>
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentTitle = pathTitles[pathname] || pathname.replace('/', '').toUpperCase();

  return (
    <div className="flex h-screen bg-[#04070B] text-slate-100 overflow-hidden font-sans selection:bg-[#4ADE80] selection:text-black">
      {/* Dark Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#04070B]">
        {/* Universal Simulation Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300 backdrop-blur-md">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[11.5px]">
              <strong className="text-amber-200">PORTFOLIO SIMULATION ENVIRONMENT:</strong> All telemetry &amp; audit evidence are synthetic for fictional entity &ldquo;PT Nusantara Digital&rdquo;.
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-[9.5px] tracking-wider uppercase">
            Synthetic Sandbox
          </span>
        </div>

        {/* Dedicated Modern Topbar */}
        <header className="h-14 border-b border-white/[0.08] bg-[#070B12]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          {/* Dynamic Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-200 transition-colors">
              GRCTrack
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-100">{currentTitle}</span>
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Organization Tag */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
              <span>PT Nusantara Digital</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4ADE80] shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            </button>

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <span className="block text-[9.5px] font-mono text-emerald-400 font-semibold uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#04070B] relative">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
