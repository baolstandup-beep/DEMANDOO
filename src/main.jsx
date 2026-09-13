import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { TripProvider } from './context/TripContext';
import { initCapacitor } from './capacitor/index.js';
import './index.css';

// Initialiser Capacitor dès le démarrage (StatusBar, SplashScreen, etc.)
// Non-bloquant : le rendu React commence immédiatement
initCapacitor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <TripProvider>
              <App />
            </TripProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
