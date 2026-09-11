import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const DriverRouteGuard = ({ children, allowedStatuses = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  if (!isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-demandoo-600" />
      </div>
    );
  }

  // 1. NON CONNECTÉ -> /inscription-chauffeur
  if (!user || user.role !== 'driver') {
    // Si l'utilisateur n'est pas un chauffeur, il ne peut pas accéder aux pages chauffeurs
    return <Navigate to="/inscription-chauffeur" state={{ from: location }} replace />;
  }

  // 2. CONNECTÉ + PROFIL INCOMPLET -> /completer-profil-chauffeur
  if (user.driver_status === 'profile_incomplete' && location.pathname !== '/completer-profil-chauffeur') {
    return <Navigate to="/completer-profil-chauffeur" replace />;
  }

  // 3. PROFIL COMPLET + DOCUMENTS MANQUANTS -> /verification-chauffeur
  if (user.driver_status === 'documents_required' && location.pathname !== '/verification-chauffeur') {
    return <Navigate to="/verification-chauffeur" replace />;
  }

  // Si on est sur une route protégée par un statut spécifique (ex: VERIFIED)
  if (allowedStatuses.length > 0 && !allowedStatuses.includes(user.driver_status)) {
    // S'il est PENDING, on le redirige vers verification pour voir l'état d'attente
    if (user.driver_status === 'PENDING') {
      return <Navigate to="/verification-chauffeur" replace />;
    }
    // Sinon retour accueil
    return <Navigate to="/espace-chauffeur" replace />;
  }

  // 4. CHAUFFEUR AUTORISÉ -> On laisse passer le rendu du composant
  return children;
};
