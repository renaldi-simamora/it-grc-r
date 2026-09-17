'use client';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary: 'bg-[#4ADE80] text-black font-semibold hover:bg-[#22C55E] shadow-[0_0_15px_rgba(74,222,128,0.35)] border-transparent hover:shadow-[0_0_25px_rgba(74,222,128,0.5)]',
  neon: 'bg-[#4ADE80] text-black font-semibold hover:bg-[#22C55E] shadow-[0_0_20px_rgba(74,222,128,0.45)] border-transparent',
  secondary: 'bg-white/[0.06] text-slate-200 hover:bg-white/10 border border-white/10 hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-[0_0_15px_rgba(225,29,72,0.3)] border-transparent',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white border-transparent',
  outline: 'bg-transparent text-slate-200 hover:bg-white/5 border border-white/20 hover:border-white/40',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ADE80]/50 focus:ring-offset-2 focus:ring-offset-[#04070B] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
}
