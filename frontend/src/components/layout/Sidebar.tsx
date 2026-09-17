'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Server,
  AlertTriangle,
  Shield,
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
import { useState } from 'react';

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
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-slate-900 text-slate-200 border-r border-slate-800 z-50 flex flex-col transition-all duration-200',
          collapsed ? 'w-16' : 'w-64',
          'lg:relative'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">GRCTrack</span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  PT Nusantara Digital
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 text-xs">
          {/* OVERVIEW */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Overview</p>
            )}
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
              title={collapsed ? 'Dashboard' : undefined}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* GRC MANAGEMENT */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">GRC Management</p>
            )}
            <div className="space-y-1">
              {grcManagementItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* COMPLIANCE */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Compliance</p>
            )}
            <div className="space-y-1">
              {complianceItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SYSTEM */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">System</p>
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
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="border-t border-slate-800 p-3">
          {!collapsed && user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="mt-1">
                <span
                  className={cn(
                    'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold',
                    user.role === 'ADMIN'
                      ? 'bg-purple-900 text-purple-200 border border-purple-700'
                      : 'bg-blue-900 text-blue-200 border border-blue-700'
                  )}
                >
                  {user.role}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
