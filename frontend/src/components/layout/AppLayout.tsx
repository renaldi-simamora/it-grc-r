'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Loader2 } from 'lucide-react';

const publicPaths = ['/login', '/register'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && isPublicPath) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isPublicPath, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
