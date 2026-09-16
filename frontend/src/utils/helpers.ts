import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': case 'effective': case 'compliant': case 'completed': case 'closed': case 'approved':
      return 'bg-green-100 text-green-800';
    case 'inactive': case 'ineffective': case 'non_compliant': case 'overdue': case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'under_review': case 'partially_effective': case 'partially_compliant': case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'planned': case 'identified': case 'pending': case 'not_assessed': case 'open':
      return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function calculateRiskScore(likelihood: number, impact: number): { score: number; level: string } {
  const score = likelihood * impact;
  let level: string;
  if (score >= 16) level = 'critical';
  else if (score >= 10) level = 'high';
  else if (score >= 5) level = 'medium';
  else level = 'low';
  return { score, level };
}

export function truncate(str: string, maxLen: number = 100): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
