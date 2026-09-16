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
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assets', label: 'IT Assets', icon: Server },
  { href: '/risks', label: 'Risk Register', icon: AlertTriangle },
  { href: '/controls', label: 'Controls', icon: Shield },
  { href: '/control-assessments', label: 'Control Assessment', icon: ClipboardCheck },
  { href: '/evidence', label: 'Evidence', icon: FileText },
  { href: '/findings', label: 'Findings', icon: Search },
  { href: '/remediations', label: 'Remediation', icon: Wrench },
  { href: '/compliance', label: 'Compliance', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

const adminItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <div className={cn(
        'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
        collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )} onClick={() => setCollapsed(true)} />

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
        'lg:relative'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-600" />
              <span className="font-bold text-lg text-gray-900">GRCTrack</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {user?.role === 'admin' && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-gray-200 p-3">
          {!collapsed && user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
