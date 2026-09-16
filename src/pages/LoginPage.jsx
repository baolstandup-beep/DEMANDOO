import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkLockout();
  }, []);

  const checkLockout = () => {
    const attemptsData = localStorage.getItem('demandoo_login_attempts');
    if (attemptsData) {
      try {
        const { lockedUntil } = JSON.parse(attemptsData);
        if (lockedUntil && lockedUntil > Date.now()) {
          setError("Identifiants invalides ou compte temporairement bloqué suite à de multiples tentatives.");
          return true;
        } else if (lockedUntil && lockedUntil <= Date.now()) {
          // Lockout expired
          localStorage.removeItem('demandoo_login_attempts');
        }
      } catch (e) {
        localStorage.removeItem('demandoo_login_attempts');
      }
    }
    return false;
  };

  const handleFailedAttempt = () => {
    let count = 1;
    const attemptsData = localStorage.getItem('demandoo_login_attempts');
    if (attemptsData) {
      try {
        const parsed = JSON.parse(attemptsData);
        count = (parsed.count || 0) + 1;
      } catch (e) {}
    }

    if (count >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem('demandoo_login_attempts', JSON.stringify({ count, lockedUntil }));
      setError("Identifiants invalides ou compte temporairement bloqué suite à de multiples tentatives.");
    } else {
      localStorage.setItem('demandoo_login_attempts', JSON.stringify({ count }));
      setError("Identifiants invalides ou compte temporairement bloqué suite à de multiples tentatives.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (checkLockout()) return;

    if (password.length !== 4) {
      setError("Le code secret doit contenir exactement 4 chiffres.");
      return;
    }

    setError('');
    setIsLoading(true);

    const result = await login(phone.trim(), password, 'driver');
    setIsLoading(false);

    if (result && result.user) {
      // Success, clear attempts
      localStorage.removeItem('demandoo_login_attempts');
      const userRole = (result.user?.app_metadata?.role || result.user?.role || '').toLowerCase();
      if (userRole === 'admin') navigate('/admin');
      else navigate('/espace-chauffeur');
    } else {
      handleFailedAttempt();
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden bg-[#0A0A0A]">
      
      {/* Fond SaaS : Halos lumineux dynamiques */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-[400px] w-full border border-white/10 shadow-2xl shadow-black/50">
        
        <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <Link to="/" className="inline-block p-2.5 sm:p-3 rounded-2xl bg-white shadow-xl shadow-black/25 hover:scale-105 transition-transform mx-auto mb-2 sm:mb-3">
            <img src="/logo.png" alt="Demandoo — Covoiturage Sénégal" className="h-9 sm:h-10 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">Espace Chauffeur</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">Connectez-vous pour gérer vos trajets et votre profil.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3.5 rounded-xl text-xs sm:text-sm font-bold border border-red-500/20 text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Numéro de téléphone</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 77 123 45 67"
                className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Code secret (4 chiffres)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full min-h-[48px] pl-11 pr-12 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex justify-end pt-1">
              <Link to="#" className="text-xs font-bold text-slate-400 hover:text-white transition-colors py-1">
                Code secret oublié ?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3.5 rounded-2xl font-black text-sm text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-lg shadow-demandoo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Connexion…</>
              ) : (
                <>Se connecter <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Vous êtes chauffeur et vous n'avez pas encore de compte ?
          </p>
          <Link 
            to="/inscription-chauffeur" 
            className="inline-block px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 font-black text-demandoo-400 hover:text-demandoo-300 transition-all active:scale-95"
          >
            Créer mon compte chauffeur
          </Link>
        </div>

      </div>
    </div>
  );
};
