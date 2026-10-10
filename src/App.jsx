import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/common/Header';
import { MobileNavbar } from './components/common/MobileNavbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { LocationTracker } from './components/common/LocationTracker';

import { DriverRouteGuard } from './components/common/DriverRouteGuard';
import { AdminRouteGuard } from './components/common/AdminRouteGuard';
import { PushNotificationsSetup } from './capacitor/PushNotifications';
import { registerAndroidBackButton } from './capacitor/index';
import { useNotifications } from './context/NotificationContext';
import { Loader2 } from 'lucide-react';

// Découpage par route : seule la page d'accueil est dans le bundle initial
const lazyPage = (name) => lazy(() => import(`./pages/${name}.jsx`).then((m) => ({ default: m[name] })));
const SearchPage = lazyPage('SearchPage');
const TripDetailsPage = lazyPage('TripDetailsPage');
const DriverProfilePage = lazyPage('DriverProfilePage');
const DriverSpacePage = lazyPage('DriverSpacePage');
const PublishTripPage = lazyPage('PublishTripPage');
const DriverVerificationPage = lazyPage('DriverVerificationPage');
const AdminDashboardPage = lazyPage('AdminDashboardPage');
const AdminDriversPage = lazyPage('AdminDriversPage');
const AdminDriverReviewPage = lazyPage('AdminDriverReviewPage');
const MyBookingsPage = lazyPage('MyBookingsPage');
const LoginPage = lazyPage('LoginPage');
const RegisterPage = lazyPage('RegisterPage');
const SubscriptionPage = lazyPage('SubscriptionPage');
const NotFoundPage = lazyPage('NotFoundPage');
const AuthCallbackPage = lazyPage('AuthCallbackPage');

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Chargement de la page">
    <Loader2 className="w-8 h-8 animate-spin text-demandoo-600" />
  </div>
);

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // SEO dynamique
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'Demandoo — Covoiturage de confiance au Sénégal (Touba, Dakar, Thiès…)';
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
    } else if (path === '/abonnement') {
      document.title = 'Formules chauffeur | Demandoo';
    }
  }, [location]);

  // Bouton retour Android — enregistrer/désenregistrer à chaque changement de route
  useEffect(() => {
    const cleanup = registerAndroidBackButton(navigate, location);
    return cleanup;
  }, [location, navigate]);

  return (
    <div className={`min-h-screen ${isAdminRoute ? 'bg-slate-50' : 'bg-slate-50/50'} flex flex-col font-sans relative selection:bg-demandoo-500 selection:text-white`}>
      <LocationTracker />
      <PushNotificationsSetup />
      {/* Initialisation silencieuse des push notifications (mobile uniquement) */}
      {/* <PushNotificationsSetup onNotificationReceived={addNotification} /> */}

      <Header />
      
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:font-bold focus:shadow-lg">
        Aller au contenu
      </a>
      <main id="contenu" tabIndex={-1} className="flex-1 w-full pb-20 md:pb-0 overflow-x-hidden focus:outline-none">
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trajets" element={<SearchPage />} />
          <Route path="/trajet/:id" element={<TripDetailsPage />} />
          <Route path="/chauffeur/:driverId" element={<DriverProfilePage />} />
          <Route path="/inscription-chauffeur" element={<RegisterPage />} />

          <Route path="/abonnement" element={<SubscriptionPage />} />

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

          
          <Route path="/admin" element={
            <AdminRouteGuard>
              <AdminDashboardPage />
            </AdminRouteGuard>
          } />
          <Route path="/admin/drivers" element={
            <AdminRouteGuard>
              <AdminDriversPage />
            </AdminRouteGuard>
          } />
          <Route path="/admin/drivers/:id" element={
            <AdminRouteGuard>
              <AdminDriverReviewPage />
            </AdminRouteGuard>
          } />
          
          <Route path="/mes-reservations" element={<MyBookingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </main>

      <Footer />
      <MobileNavbar />
    </div>
  );
}
