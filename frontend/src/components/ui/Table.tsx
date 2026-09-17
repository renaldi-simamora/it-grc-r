import { cn } from '@/utils/helpers';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, keyExtractor, className, onRowClick }: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-white/10 bg-[#080D18]/80 backdrop-blur-xl', className)}>
      <table className="min-w-full divide-y divide-white/[0.08]">
        <thead className="bg-[#050810]/95 border-b border-white/[0.08]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider',
                  col.className
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05] bg-transparent">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                'transition-colors duration-150',
                onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-5 py-3.5 whitespace-nowrap text-sm text-slate-200', col.className)}>
                  {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
