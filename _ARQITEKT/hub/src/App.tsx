import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/features/shared/Header';
import { HubDashboard } from '@/features/hub/HubDashboard';
import { ProjectLayout } from '@/features/project/ProjectLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { ChatFab } from '@/features/chat/ChatFab';
import { ChatPanel } from '@/features/chat/ChatPanel';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Toast } from '@/components/ui/Toast';
import OfflineBanner from '@/components/ui/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotFound } from '@/components/NotFound';
import { Spinner } from '@/components/ui/Spinner';
import { useAppSelector } from '@/store/hooks';

const PlanTab = lazy(() => import('@/features/plan/PlanTab').then(m => ({ default: m.PlanTab })));
const DevelopTab = lazy(() => import('@/features/develop/DevelopTab').then(m => ({ default: m.DevelopTab })));
const DeployTab = lazy(() => import('@/features/deploy/DeployTab').then(m => ({ default: m.DeployTab })));
const MonitorTab = lazy(() => import('@/features/monitor/MonitorTab').then(m => ({ default: m.MonitorTab })));
const OnboardingWizard = lazy(() => import('@/features/shared/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));

function TabFallback() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>;
}

export default function App() {
  const { t } = useTranslation();
  const theme = useAppSelector((s) => s.ui.theme);

  // Sync theme attribute to <html> for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <Toast>
        <RequireAuth>
          <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
          <Header />
          <main id="main-content">
            <Routes>
              <Route path="/" element={<HubDashboard />} />
              <Route path="/wizard" element={<Suspense fallback={<TabFallback />}><OnboardingWizard /></Suspense>} />
              <Route path="/projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<Navigate to="plan" replace />} />
                <Route path="plan" element={<Suspense fallback={<TabFallback />}><PlanTab /></Suspense>} />
                <Route path="develop" element={<Suspense fallback={<TabFallback />}><DevelopTab /></Suspense>} />
                <Route path="deploy" element={<Suspense fallback={<TabFallback />}><DeployTab /></Suspense>} />
                <Route path="monitor" element={<Suspense fallback={<TabFallback />}><MonitorTab /></Suspense>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ChatFab />
          <ChatPanel />
          <CommandPalette />
          <OfflineBanner />
        </RequireAuth>
      </Toast>
    </ErrorBoundary>
  );
}
