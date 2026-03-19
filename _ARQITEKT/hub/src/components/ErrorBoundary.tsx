import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const t = i18n.t.bind(i18n);
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'var(--color-text, #e0e0e0)',
          backgroundColor: 'var(--color-bg-primary, #1f1f1f)',
        }}>
          <h1 style={{ color: 'var(--color-accent, #FFD700)', fontSize: '1.5rem', marginBottom: '1rem' }}>
            {t('somethingWentWrong')}
          </h1>
          <p style={{ marginBottom: '1.5rem', maxWidth: '480px', textAlign: 'center', lineHeight: 1.6 }}>
            {this.state.error?.message || t('unexpectedError')}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'var(--color-accent, #FFD700)',
              color: 'var(--color-bg-primary, #1f1f1f)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {t('tryAgain')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
