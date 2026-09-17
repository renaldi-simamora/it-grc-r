'use client';
import { cn } from '@/utils/helpers';
import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-xl bg-[#060A12]/90 border border-white/12 px-3.5 py-2.5 text-sm text-slate-100 shadow-inner',
            'transition-all duration-200 backdrop-blur-md',
            'focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/30 focus:outline-none focus:bg-[#080E1A]',
            error && 'border-rose-500/80',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="bg-[#080D18] text-slate-400">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#080D18] text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
