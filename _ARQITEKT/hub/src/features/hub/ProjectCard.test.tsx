import { render, screen, fireEvent } from '@testing-library/react';

/* ------------------------------------------------------------------ */
/*  Mocks — must be before component import (vitest hoisting)         */
/* ------------------------------------------------------------------ */

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/store/api/deployApi', () => ({
  useAppStartMutation: () => [vi.fn(), { isLoading: false }],
  useAppStatusQuery: () => ({ data: undefined }),
}));

vi.mock('lucide-react', () => ({
  Play: (props: Record<string, unknown>) => <svg data-testid="icon-play" {...props} />,
  ExternalLink: (props: Record<string, unknown>) => <svg data-testid="icon-external" {...props} />,
  Globe: (props: Record<string, unknown>) => <svg data-testid="icon-globe" {...props} />,
}));

vi.mock('@/components/ui/Badge', () => ({
  Badge: ({ children, lifecycle }: { children: React.ReactNode; lifecycle?: string }) => (
    <span data-testid="badge" data-lifecycle={lifecycle}>
      {children}
    </span>
  ),
}));

/* ------------------------------------------------------------------ */
/*  Component import (after mocks)                                     */
/* ------------------------------------------------------------------ */

import { ProjectCard } from './ProjectCard';
import type { Project } from '@/store/api/projectsApi';

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: '001_SOCIAL',
    path: '001_SOCIAL',
    config: {
      name: 'SOCIAL',
      codename: 'SOCIAL',
      description: 'A social network platform',
      lifecycle: 'planning',
      tags: [],
    },
    stats: { bc: 1, sol: 2, us: 5, cmp: 3, fn: 10, inf: 0, adr: 0, ntf: 0, conv: 0, fbk: 0 },
    readiness: { authored: 10, approved: 3 },
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('ProjectCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders project name', () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByText('SOCIAL')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<ProjectCard project={makeProject({ config: { name: 'SOCIAL', codename: 'SOCIAL', description: 'My cool app', lifecycle: 'planning' } })} />);
    expect(screen.getByText('My cool app')).toBeInTheDocument();
  });

  it('shows noDescription translation key when description is empty', () => {
    render(<ProjectCard project={makeProject({ config: { name: 'SOCIAL', codename: 'SOCIAL', description: '', lifecycle: 'planning' } })} />);
    expect(screen.getByText('noDescription')).toBeInTheDocument();
  });

  it('navigates to project on click', () => {
    render(<ProjectCard project={makeProject({ id: '002_RELAY' })} />);
    const card = screen.getByRole('link', { name: 'SOCIAL' });
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/projects/002_RELAY');
  });

  it('navigates to project on Enter key', () => {
    render(<ProjectCard project={makeProject({ id: '003_TRUST' })} />);
    const card = screen.getByRole('link', { name: 'SOCIAL' });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/projects/003_TRUST');
  });

  it('navigates to project on Space key', () => {
    render(<ProjectCard project={makeProject({ id: '004_PROSPECT' })} />);
    const card = screen.getByRole('link', { name: 'SOCIAL' });
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/projects/004_PROSPECT');
  });

  it('does not navigate on arbitrary key', () => {
    render(<ProjectCard project={makeProject()} />);
    const card = screen.getByRole('link', { name: 'SOCIAL' });
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows lifecycle badge with default planning stage', () => {
    render(<ProjectCard project={makeProject()} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-lifecycle', 'planning');
    expect(badge).toHaveTextContent('planning');
  });

  it('derives lifecycle from config', () => {
    const project = makeProject({ config: { name: 'SOCIAL', codename: 'SOCIAL', lifecycle: 'deployed' } });
    render(<ProjectCard project={project} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-lifecycle', 'deployed');
    expect(badge).toHaveTextContent('deployed');
  });

  it('uses lifecycle from config directly', () => {
    const project = makeProject({ config: { name: 'SOCIAL', codename: 'SOCIAL', lifecycle: 'building' } });
    render(<ProjectCard project={project} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-lifecycle', 'building');
  });

  it('has correct aria-label from project config name', () => {
    render(<ProjectCard project={makeProject({ config: { name: 'WealthPilot', codename: 'WEALTHPILOT', lifecycle: 'planning' } })} />);
    expect(screen.getByRole('link', { name: 'WealthPilot' })).toBeInTheDocument();
  });

  it('renders stat items', () => {
    render(<ProjectCard project={makeProject()} />);
    expect(screen.getByText('statSOL')).toBeInTheDocument();
    expect(screen.getByText('statUS')).toBeInTheDocument();
    expect(screen.getByText('statCMP')).toBeInTheDocument();
    expect(screen.getByText('statFN')).toBeInTheDocument();
  });
});
