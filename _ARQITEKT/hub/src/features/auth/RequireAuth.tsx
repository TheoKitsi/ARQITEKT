import { type ReactNode } from 'react';
import { useGetAuthStatusQuery } from '@/store/api/authApi';
import { Spinner } from '@/components/ui/Spinner';
import { LoginPage } from './LoginPage';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { data: authStatus, isLoading } = useGetAuthStatusQuery();

  // Still checking auth status
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Auth is disabled — pass through (local dev mode)
  if (!authStatus?.authEnabled) {
    return <>{children}</>;
  }

  // Auth enabled but not authenticated — show login page
  if (!authStatus.authenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
