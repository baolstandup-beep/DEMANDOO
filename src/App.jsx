import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header';
import { MobileNavbar } from './components/common/MobileNavbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { DriverProfilePage } from './pages/DriverProfilePage';
import { DriverSpacePage } from './pages/DriverSpacePage';
import { PublishTripPage } from './pages/PublishTripPage';
import { DriverVerificationPage } from './pages/DriverVerificationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminDriversPage } from './pages/AdminDriversPage';
import { AdminDriverReviewPage } from './pages/AdminDriverReviewPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SubscriptionPage } from './pages/SubscriptionPage';

import { DriverRouteGuard } from './components/common/DriverRouteGuard';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

export function App() {
  const location = useLocation();

  // Dynamic SEO Title updates
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'Demandoo — Covoiturage de confiance au Sénégal';
    } else if (path.startsWith('/trajets')) {
      document.title = 'Trouver un trajet | Demandoo';
    } else if (path.startsWith('/trajet/')) {
      document.title = 'Détails du trajet | Demandoo';
    } else if (path.startsWith('/chauffeur/')) {
      document.title = 'Profil Chauffeur | Demandoo';
    } else if (path === '/publier') {
      document.title = 'Publier un trajet | Demandoo';
    } else if (path === '/espace-chauffeur') {
      document.title = 'Espace Conducteur | Demandoo';
    } else if (path === '/verification-chauffeur') {
      document.title = 'Vérification KYC Chauffeur | Demandoo';
    } else if (path.startsWith('/admin')) {
      document.title = 'Administration & Sécurité | Demandoo';
    } else if (path === '/mes-reservations') {
      document.title = 'Mes Réservations | Demandoo';
    } else if (path === '/login') {
      document.title = 'Connexion | Demandoo';
    } else if (path === '/inscription-chauffeur') {
      document.title = 'Inscription | Demandoo';
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-demandoo-500 selection:text-white">
      <Header />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trajets" element={<SearchPage />} />
          <Route path="/trajet/:id" element={<TripDetailsPage />} />
          <Route path="/chauffeur/:driverId" element={<DriverProfilePage />} />
          <Route path="/inscription-chauffeur" element={<RegisterPage />} />

          <Route path="/abonnement" element={
            <DriverRouteGuard allowedStatuses={['VERIFIED']}>
              <SubscriptionPage />
            </DriverRouteGuard>
          } />

          <Route path="/publier" element={
            <DriverRouteGuard allowedStatuses={['VERIFIED']}>
              <PublishTripPage />
            </DriverRouteGuard>
          } />
          <Route path="/espace-chauffeur" element={
            <DriverRouteGuard allowedStatuses={['VERIFIED']}>
              <DriverSpacePage />
            </DriverRouteGuard>
          } />
          <Route path="/verification-chauffeur" element={
            <DriverRouteGuard>
              <DriverVerificationPage />
            </DriverRouteGuard>
          } />

          
          <Route path="/admin/paiements" element={<AdminDashboardPage />} />
          <Route path="/admin/drivers" element={<AdminDriversPage />} />
          <Route path="/admin/drivers/:id" element={<AdminDriverReviewPage />} />
          
          <Route path="/mes-reservations" element={<MyBookingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
      <MobileNavbar />
    </div>
  );
}
