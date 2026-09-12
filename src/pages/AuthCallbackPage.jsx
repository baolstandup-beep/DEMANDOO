import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * AuthCallbackPage
 * Gère le retour après OAuth Google.
 * - Récupère la session
 * - Crée/vérifie le profil
 * - Redirige selon le rôle
 */
export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Finalisation de votre connexion…');

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // Supabase extrait automatiquement les tokens depuis l'URL
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          if (!cancelled) {
            setStatus('error');
            setMessage("Impossible de finaliser la connexion. Veuillez réessayer.");
          }
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session?.user) {
          if (!cancelled) {
            setStatus('error');
            setMessage("Session introuvable. Veuillez vous reconnecter.");
          }
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!cancelled) setMessage('Création de votre profil…');

        const profile = await fetchUserProfile(session.user);

        if (!cancelled) {
          setStatus('success');
          setMessage('Connexion réussie ! Redirection…');
        }

        // Redirection selon le rôle
        setTimeout(() => {
          if (!cancelled) {
            if (profile?.role === 'driver') {
              if (profile.driver_status === 'VERIFIED') {
                navigate('/espace-chauffeur');
              } else {
                navigate('/verification-chauffeur');
              }
            } else if (profile?.role === 'admin') {
              navigate('/admin/paiements');
            } else {
              navigate('/trajets');
            }
          }
        }, 1200);

      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        if (!cancelled) {
          setStatus('error');
          setMessage("Une erreur inattendue s'est produite.");
        }
        setTimeout(() => navigate('/login'), 3000);
      }
    }

    handleCallback();

    return () => { cancelled = true; };
  }, [navigate, fetchUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0A] relative overflow-hidden font-sans">
      {/* Halos */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-demandoo-400 animate-spin" />
            </div>
            <p className="text-white font-bold text-lg">{message}</p>
            <p className="text-slate-400 text-sm">Veuillez patienter…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-lg">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-white font-bold text-lg">{message}</p>
            <p className="text-slate-400 text-sm">Redirection en cours…</p>
          </div>
        )}
      </div>
    </div>
  );
};
