'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import type { UserProfile, ApiResponse } from '@/types';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<ApiResponse<UserProfile[]>>('/auth/users');
      setUsers(res.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      key: 'full_name',
      title: 'Full Name',
      render: (u: UserProfile) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            {u.full_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{u.full_name}</p>
            <p className="text-[11px] text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'System Role',
      render: (u: UserProfile) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
            u.role === 'ADMIN'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          {u.role === 'ADMIN' ? 'ADMIN (Lead Auditor)' : 'GRC_OFFICER (Analyst)'}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Member Since',
      render: (u: UserProfile) => <span className="text-xs text-slate-500">{formatDate(u.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Access &amp; Roles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative privileges and GRC officer accounts for PT Nusantara Digital
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        <Card padding={false}>
          <Table<UserProfile> columns={columns} data={users} keyExtractor={(u) => u.id} />
        </Card>
      )}
    </div>
  );
}
