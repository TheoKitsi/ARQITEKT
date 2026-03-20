import { render, screen, fireEvent } from '@testing-library/react';

/* ------------------------------------------------------------------ */
/*  Mocks — must be before component import (vitest hoisting)         */
/* ------------------------------------------------------------------ */

const mockUseGetProjectsQuery = vi.fn();

vi.mock('@/store/api/projectsApi', () => ({
  useGetProjectsQuery: (...args: unknown[]) => mockUseGetProjectsQuery(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('lucide-react', () => ({
  FolderPlus: (props: Record<string, unknown>) => <svg data-testid="icon-folder-plus" {...props} />,
  Download: (props: Record<string, unknown>) => <svg data-testid="icon-download" {...props} />,
  Sparkles: (props: Record<string, unknown>) => <svg data-testid="icon-sparkles" {...props} />,
  Search: (props: Record<string, unknown>) => <svg data-testid="icon-search" {...props} />,
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...rest }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} data-variant={rest.variant}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/Spinner', () => ({
  Spinner: ({ size }: { size?: string }) => (
    <div data-testid="spinner" data-size={size} role="status">
      Loading...
    </div>
  ),
}));

vi.mock('./ProjectCard', () => ({
  ProjectCard: ({ project }: { project: { id: string; config: { name: string } } }) => (
    <div data-testid={`project-card-${project.id}`}>{project.config.name}</div>
  ),
}));

vi.mock('./DashboardSummary', () => ({
  DashboardSummary: () => <div data-testid="dashboard-summary" />,
}));

vi.mock('@/features/shared/CreateProjectModal', () => ({
  CreateProjectModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button onClick={onClose}>close-create</button>
      </div>
    ) : null,
}));

vi.mock('@/features/shared/ImportProjectModal', () => ({
  ImportProjectModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="import-modal">
        <button onClick={onClose}>close-import</button>
      </div>
    ) : null,
}));

/* ------------------------------------------------------------------ */
/*  Component import (after mocks)                                     */
/* ------------------------------------------------------------------ */

import { HubDashboard } from './HubDashboard';

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const mockProjects = [
  {
    id: '001_SOCIAL',
    path: '001_SOCIAL',
    config: {
      name: 'SOCIAL',
      codename: 'SOCIAL',
      description: 'Social network',
      lifecycle: 'planning',
      tags: [],
    },
    stats: { bc: 1, sol: 2, us: 5, cmp: 3, fn: 10, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 },
    readiness: { authored: 10, approved: 3 },
  },
  {
    id: '002_RELAY',
    path: '002_RELAY',
    config: {
      name: 'Relay',
      codename: 'RELAY',
      description: 'Messaging relay',
      lifecycle: 'planning',
      tags: [],
    },
    stats: { bc: 1, sol: 1, us: 3, cmp: 2, fn: 6, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 },
    readiness: { authored: 6, approved: 1 },
  },
];

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('HubDashboard', () => {
  beforeEach(() => {
    mockUseGetProjectsQuery.mockReset();
  });

  it('shows loading spinner when query is loading', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getAllByText('Loading...')).toHaveLength(2); // Spinner + loading text paragraph
  });

  it('shows error state with refresh button when query fails', () => {
    const mockRefetch = vi.fn();
    mockUseGetProjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<HubDashboard />);
    expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    expect(screen.getByText('refresh')).toBeInTheDocument();
  });

  it('renders project cards when data is loaded', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.getByTestId('project-card-001_SOCIAL')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-002_RELAY')).toBeInTheDocument();
    expect(screen.getByText('SOCIAL')).toBeInTheDocument();
    expect(screen.getByText('Relay')).toBeInTheDocument();
  });

  it('shows empty state when projects array is empty', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.getByText('noEmpty')).toBeInTheDocument();
    expect(screen.getByText('onboardHint')).toBeInTheDocument();
  });

  it('renders the projects section title', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.getByText('projects')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.getByPlaceholderText('searchProjects')).toBeInTheDocument();
  });

  it('does not show spinner when not loading', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('does not show error when not errored', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);
    expect(screen.queryByText('Failed to load data.')).not.toBeInTheDocument();
  });

  it('opens create project modal when new project button is clicked', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);

    // There should be no modal initially
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();

    // Click the "newProject" button (hero action)
    const newProjectButtons = screen.getAllByText('newProject');
    fireEvent.click(newProjectButtons[0]);

    // Modal should now appear
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('opens import project modal when import button is clicked', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);

    expect(screen.queryByTestId('import-modal')).not.toBeInTheDocument();

    const importButton = screen.getByText('Import');
    fireEvent.click(importButton);

    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
  });

  it('closes create modal via onClose callback', () => {
    mockUseGetProjectsQuery.mockReturnValue({
      data: mockProjects,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<HubDashboard />);

    // Open modal
    const newProjectButtons = screen.getAllByText('newProject');
    fireEvent.click(newProjectButtons[0]);
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByText('close-create'));
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
  });

  it('calls refetch when refresh button is clicked in error state', () => {
    const mockRefetch = vi.fn();
    mockUseGetProjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<HubDashboard />);
    fireEvent.click(screen.getByText('refresh'));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
