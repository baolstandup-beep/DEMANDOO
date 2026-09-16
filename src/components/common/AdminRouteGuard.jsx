import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRouteGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-demandoo-200 border-t-demandoo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  // Vérification de sécurité stricte
  const userRole = (user?.app_metadata?.role || user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
