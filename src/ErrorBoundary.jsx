import React from 'react';

// Après un nouveau déploiement, un ancien onglet peut réclamer un fichier JS qui n'existe plus
const isChunkLoadError = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i
    .test(error?.message || '');

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

    // Un seul rechargement automatique pour récupérer la nouvelle version du site
    if (isChunkLoadError(error) && !sessionStorage.getItem('demandoo_chunk_reload')) {
      try { sessionStorage.setItem('demandoo_chunk_reload', '1'); } catch { /* navigation privée */ }
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '2rem', minHeight: '100vh', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#f8fafc', color: '#0f172a' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Oups, un problème est survenu</h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '28rem', color: '#475569' }}>
            Rechargez la page pour continuer. Si le problème persiste, contactez-nous sur WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: '#0f766e', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Recharger la page
          </button>

          {/* Détails techniques visibles uniquement en développement */}
          {import.meta.env.DEV && (
            <pre style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', textAlign: 'left', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', maxWidth: '100%' }}>
              {String(this.state.error)}
              {this.state.errorInfo?.componentStack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
