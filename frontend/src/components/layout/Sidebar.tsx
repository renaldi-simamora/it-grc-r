'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  Search,
  Wrench,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';

const grcManagementItems = [
  { href: '/assets', label: 'Assets', icon: Server },
  { href: '/risks', label: 'Risks', icon: AlertTriangle },
  { href: '/controls', label: 'Controls', icon: Shield },
  { href: '/control-assessments', label: 'Control Assessment', icon: ClipboardCheck },
  { href: '/evidence', label: 'Evidence', icon: FileText },
  { href: '/findings', label: 'Findings', icon: Search },
  { href: '/remediation', label: 'Remediation', icon: Wrench },
];

const complianceItems = [
  { href: '/compliance', label: 'Compliance', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const systemItems = [
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#070B12]/95 backdrop-blur-2xl text-slate-200 border-r border-white/10 z-50 flex flex-col transition-all duration-300 shadow-2xl',
          collapsed ? 'w-18' : 'w-64',
          'lg:relative'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-18 border-b border-white/[0.08]">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)] group-hover:border-emerald-500/70 transition-colors">
                <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-base text-white tracking-tight block">GRCTrack</span>
                <span className="block text-[9.5px] uppercase tracking-wider text-emerald-400 font-semibold truncate">
                  IT GRC Intelligence
                </span>
              </div>
            </Link>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 text-xs">
          {/* OVERVIEW */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Overview</p>
            )}
            <Link
              href="/dashboard"
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                pathname === '/dashboard'
                  ? 'bg-emerald-500/15 text-white font-semibold border border-emerald-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              )}
              title={collapsed ? 'Dashboard' : undefined}
            >
              <LayoutDashboard
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  pathname === '/dashboard' ? 'text-[#4ADE80]' : 'text-slate-400'
                )}
              />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* GRC MANAGEMENT */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">GRC Management</p>
            )}
            <div className="space-y-1">
              {grcManagementItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-emerald-500/15 text-white font-semibold border border-emerald-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-[#4ADE80]' : 'text-slate-400'
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* COMPLIANCE */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Compliance</p>
            )}
            <div className="space-y-1">
              {complianceItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-emerald-500/15 text-white font-semibold border border-emerald-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-[#4ADE80]' : 'text-slate-400'
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">System</p>
            )}
            <div className="space-y-1">
              {systemItems
                .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-emerald-500/15 text-white font-semibold border border-emerald-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          'w-4 h-4 flex-shrink-0 transition-colors',
                          isActive ? 'text-[#4ADE80]' : 'text-slate-400'
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="border-t border-white/[0.08] p-3 bg-[#05080E]/70">
          {!collapsed && user && (
            <div className="mb-2 px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase',
                    user.role === 'ADMIN'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  )}
                >
                  {user.role}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">Demo Mode</span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-rose-500/15 hover:text-rose-300 hover:border hover:border-rose-500/30 transition-all cursor-pointer"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
