import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Une erreur s'est produite (App Crash)</h1>
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.875rem', background: 'white', padding: '1rem', borderRadius: '8px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
