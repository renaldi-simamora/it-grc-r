import { cn } from '@/utils/helpers';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="text-slate-500 mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
        {icon || <InboxIcon className="w-10 h-10 text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-white mb-1 tracking-tight">{title}</h3>
      {description && <p className="text-xs text-slate-400 mb-4 max-w-sm leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}
