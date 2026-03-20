import { type ReactNode } from 'react';
import { useGetAuthStatusQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui/Spinner';
import { LoginPage } from './LoginPage';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { data: authStatus, isLoading } = useGetAuthStatusQuery();
  const sessionMode = useAppSelector((s) => s.auth.sessionMode);

  // Still checking auth status
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // No session mode chosen yet — always show start page
  if (!sessionMode) {
    return <LoginPage />;
  }

  // Auth enabled + GitHub mode but not authenticated — show start page
  if (authStatus?.authEnabled && sessionMode === 'github' && !authStatus.authenticated) {
    return <LoginPage />;
  }

  // All other modes (explore, developer, anthropic) proceed
  return <>{children}</>;
}
