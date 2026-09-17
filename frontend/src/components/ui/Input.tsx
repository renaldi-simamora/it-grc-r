'use client';
import { cn } from '@/utils/helpers';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner',
            'transition-all duration-200 backdrop-blur-md',
            'focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none focus:bg-[#080E1A]',
            error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
