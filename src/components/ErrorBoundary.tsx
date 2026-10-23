import React, { Component, ErrorInfo, ReactNode } from 'react';
import { resetAllStorageToDemo } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OmniSync CRM Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      resetAllStorageToDemo();
      localStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          color: '#f8fafc',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            OmniSync CRM Encountered an Issue
          </h1>

          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '460px', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            A client-side runtime error occurred. You can reset your local cache or reload the CRM application to restore normal operation.
          </p>

          {this.state.error && (
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px 16px',
              maxWidth: '520px',
              width: '100%',
              marginBottom: '24px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#f87171',
              textAlign: 'left',
              overflowX: 'auto',
              wordBreak: 'break-all',
            }}>
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              Reset CRM Cache & Reload
            </button>

            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
