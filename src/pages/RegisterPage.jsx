import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';



export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('passenger');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Anti-double-submit
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!phone || phone.replace(/\s/g, '').length < 8) {
      setError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    setIsLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();

    const result = await register({
      firstName,
      lastName,
      full_name: fullName,
      phone: phone,
      address: address,
      password: password,
      role: role
    });

    setIsLoading(false);
    
    if (result.success) {
      if (result.needsEmailConfirmation) {
        setSuccessMessage("Un email de confirmation a été envoyé. Vérifiez votre boîte mail.");
        return;
      }
      if (role === 'driver') {
        navigate('/verification-chauffeur');
      } else {
        navigate('/trajets');
      }
    } else {
      setError(result.error || "Erreur lors de l'inscription.");
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden bg-[#0A0A0A]">
      
      {/* Fond SaaS : Halos lumineux dynamiques */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 max-w-[550px] w-full border border-white/10 shadow-2xl shadow-black/50">
        
        <div className="text-center space-y-4 mb-8">
          <Link to="/" className="inline-block p-3 rounded-2xl bg-white shadow-xl shadow-black/25 hover:scale-105 transition-transform mx-auto mb-3">
            <img src="/logo.png" alt="Demandoo — Covoiturage Sénégal" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Créer un compte</h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium">Rejoignez Demandoo, le covoiturage de confiance de Touba vers tout le Sénégal.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/20 text-center mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-sm font-bold border border-emerald-500/20 text-center mb-6">
            {successMessage}
          </div>
        )}


        {/* Sélection du rôle */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('passenger')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              role === 'passenger'
                ? 'bg-demandoo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Je suis Passager
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              role === 'driver'
                ? 'bg-demandoo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Je suis Chauffeur
          </button>
        </div>

        {/* Bouton Google OAuth */}
        <button
          type="button"
          onClick={() => loginWithGoogle(role)}
          className="w-full py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm mb-6 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ou avec votre numéro de téléphone</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Prénom</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Ousmane"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nom</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Fall"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Numéro de téléphone</label>
            <div className="relative flex">
              <div className="shrink-0 pl-4 pr-3 py-3.5 rounded-l-2xl bg-white/5 border-y border-l border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-400">+221</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77 123 45 67"
                className="w-full pl-3 pr-4 py-3.5 rounded-r-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Adresse ou quartier</label>
            <div className="relative flex">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Parcelles Assainies"
                className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
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
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Confirmation</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 transition-all outline-none"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-black text-sm text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-lg shadow-demandoo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Création en cours…</>
              ) : (
                <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-slate-400 font-medium mt-8">
          Déjà chauffeur ?{' '}
          <Link to="/login" className="font-black text-demandoo-400 hover:text-demandoo-300 transition-colors">
            Se connecter
          </Link>
        </p>

        <div className="text-center mt-6">
          <Link to="/trajets" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
            ← Chercher un trajet sans compte
          </Link>
        </div>

      </div>
    </div>
  );
};

