import { render, screen, fireEvent } from '@testing-library/react';
import { ConfidenceBadge } from './ConfidenceBadge';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) =>
      key === 'confidenceLabel' ? `Confidence: ${params?.score}` : key,
  }),
}));

describe('ConfidenceBadge', () => {
  it('renders "--" when score is null', () => {
    render(<ConfidenceBadge score={null} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders "--" when score is undefined', () => {
    render(<ConfidenceBadge score={undefined} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders the rounded score with percent sign', () => {
    render(<ConfidenceBadge score={75.6} />);
    expect(screen.getByText('76%')).toBeInTheDocument();
  });

  it('sets aria-label with the score', () => {
    render(<ConfidenceBadge score={82} />);
    expect(screen.getByLabelText('Confidence: 82%')).toBeInTheDocument();
  });

  it('becomes clickable when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<ConfidenceBadge score={50} onClick={handleClick} />);
    const badge = screen.getByRole('button');
    fireEvent.click(badge);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not have button role without onClick', () => {
    render(<ConfidenceBadge score={70} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows tooltip on hover when breakdown is provided', () => {
    const breakdown = { structural: 80, semantic: 70, consistency: 75, boundary: 60 };
    render(<ConfidenceBadge score={72} breakdown={breakdown} />);
    const wrapper = screen.getByText('72%').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // structural
  });

  it('hides tooltip on mouse leave', () => {
    const breakdown = { structural: 80, semantic: 70, consistency: 75, boundary: 60 };
    render(<ConfidenceBadge score={72} breakdown={breakdown} />);
    const wrapper = screen.getByText('72%').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
