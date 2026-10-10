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

  // 1. NON CONNECTÉ OU NON CONDUCTEUR
  if (!user || (user.role !== 'driver' && user.role !== 'admin')) {
    return <Navigate to="/inscription-chauffeur" state={{ from: location }} replace />;
  }

  // 2. STATUT REQUIS (ex. VERIFIED pour publier) — les admins passent toujours
  if (user.role !== 'admin' && allowedStatuses.length > 0 && !allowedStatuses.includes(user.driver_status)) {
    return <Navigate to="/verification-chauffeur" state={{ from: location }} replace />;
  }

  // 3. CHAUFFEUR AUTORISÉ -> On laisse passer le rendu du composant
  return children;
};
