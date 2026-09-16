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
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  col.className
                )}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={cn(onRowClick && 'cursor-pointer hover:bg-gray-50')}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', col.className)}>
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
