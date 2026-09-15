import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';



export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);

    // Convertir le numéro de téléphone en l'email caché si l'utilisateur a tapé son numéro
    let loginIdentifier = email.trim();
    if (!loginIdentifier.includes('@') && /^\d+$/.test(loginIdentifier.replace(/[\s\-\(\)]/g, ''))) {
      const phoneClean = loginIdentifier.replace(/[\s\-\(\)]/g, '');
      const fullPhone = phoneClean.length === 9 ? `221${phoneClean}` : phoneClean;
      loginIdentifier = `${fullPhone}@demandoo.com`;
    }

    const result = await login(loginIdentifier, password, 'driver');
    setIsLoading(false);

    if (result && result.user) {
      if (result.user.role === 'admin') navigate('/admin');
      else navigate('/espace-chauffeur');
    } else {
      setError(result?.error || "Email ou mot de passe incorrect.");
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



        {/* Bouton Google OAuth */}
        <button
          type="button"
          onClick={() => loginWithGoogle('driver')}
          className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm mb-6 cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ou par identifiant</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Adresse email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: ousmane@email.com"
                className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                Mot de passe oublié ?
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
