import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/features/shared/Header';
import { HubDashboard } from '@/features/hub/HubDashboard';
import { ProjectLayout } from '@/features/project/ProjectLayout';
import { PlanTab } from '@/features/plan/PlanTab';
import { DevelopTab } from '@/features/develop/DevelopTab';
import { DeployTab } from '@/features/deploy/DeployTab';
import { MonitorTab } from '@/features/monitor/MonitorTab';
import { OnboardingWizard } from '@/features/shared/OnboardingWizard';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { ChatFab } from '@/features/chat/ChatFab';
import { ChatPanel } from '@/features/chat/ChatPanel';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { Toast } from '@/components/ui/Toast';

export default function App() {
  return (
    <Toast>
      <RequireAuth>
        <Header />
        <Routes>
          <Route path="/" element={<HubDashboard />} />
          <Route path="/wizard" element={<OnboardingWizard />} />
          <Route path="/projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="plan" replace />} />
            <Route path="plan" element={<PlanTab />} />
            <Route path="develop" element={<DevelopTab />} />
            <Route path="deploy" element={<DeployTab />} />
            <Route path="monitor" element={<MonitorTab />} />
          </Route>
        </Routes>
        <ChatFab />
        <ChatPanel />
        <CommandPalette />
      </RequireAuth>
    </Toast>
  );
}
