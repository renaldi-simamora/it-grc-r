import { clsx, type ClassValue } from 'clsx';
import { RiskLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getRiskLevelColor(level: string | undefined): string {
  const normalized = (level || '').toUpperCase();
  switch (normalized) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusColor(status: string | undefined): string {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
    case 'EFFECTIVE':
    case 'COMPLIANT':
    case 'COMPLETED':
    case 'APPROVED':
    case 'VERIFIED':
    case 'IMPLEMENTED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';

    case 'INACTIVE':
    case 'RETIRED':
    case 'INEFFECTIVE':
    case 'NON_COMPLIANT':
    case 'OVERDUE':
    case 'REJECTED':
    case 'NOT_IMPLEMENTED':
      return 'bg-rose-100 text-rose-800 border-rose-200';

    case 'PARTIALLY_EFFECTIVE':
    case 'PARTIALLY_COMPLIANT':
    case 'PARTIALLY_IMPLEMENTED':
    case 'IN_PROGRESS':
    case 'MITIGATED':
      return 'bg-amber-100 text-amber-800 border-amber-200';

    case 'OPEN':
    case 'PENDING':
    case 'NOT_ASSESSED':
    case 'NOT_APPLICABLE':
    case 'ACCEPTED':
    case 'CLOSED':
      return 'bg-blue-100 text-blue-800 border-blue-200';

    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function calculateRiskScore(
  likelihood: number,
  impact: number
): { score: number; level: RiskLevel } {
  const l = Math.min(5, Math.max(1, Math.round(likelihood)));
  const i = Math.min(5, Math.max(1, Math.round(impact)));
  const score = l * i;

  let level: RiskLevel = 'LOW';
  if (score >= 17) {
    level = 'CRITICAL';
  } else if (score >= 10) {
    level = 'HIGH';
  } else if (score >= 5) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { score, level };
}

export function truncate(str: string | null | undefined, maxLen: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}
