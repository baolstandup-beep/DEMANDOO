import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CompleteDriverProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, retour à l'inscription
    if (!user) {
      navigate('/inscription-chauffeur');
      return;
    }
    
    // Si le profil est déjà complet, on l'envoie à la suite (vérification ou dashboard)
    if (user.driver_status !== 'profile_incomplete' && user.role === 'driver') {
      if (user.driver_status === 'documents_required') {
        navigate('/verification-chauffeur');
      } else {
        navigate('/chauffeur/dashboard');
      }
    }

    // Pré-remplir avec les données Google si disponibles
    if (user.full_name) {
      const parts = user.full_name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !phone || !address) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Validation du numéro de téléphone sénégalais (doit contenir au moins 9 chiffres après nettoyage)
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    if (cleanPhone.length < 9) {
      setError("Le numéro de téléphone n'est pas valide (ex: 77 123 45 67).");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = cleanPhone.startsWith('+221') ? cleanPhone : `+221 ${phone.replace(/^\+221/, '').trim()}`;
      
      // Update the user profile locally
      await updateProfile({
        full_name: `${firstName} ${lastName}`.trim(),
        phone: formattedPhone,
        address: address,
        driver_status: 'documents_required' // Le profil est complet, on passe à l'étape des documents
      });

      // Redirection vers la vérification des documents
      navigate('/verification-chauffeur');
    } catch (err) {
      setError("Erreur lors de l'enregistrement de votre profil.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans relative overflow-hidden bg-[#0A0A0A]">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 max-w-[550px] w-full border border-white/10 shadow-2xl shadow-black/50">
        
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-6">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-demandoo-400 font-bold tracking-widest text-xs uppercase mb-2">ÉTAPE 1/2</h2>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Finalisez votre profil</h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Pour publier des trajets en toute sécurité, nous avons besoin de quelques informations supplémentaires.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/20 text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Prénom *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nom *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Téléphone *</label>
            <div className="relative flex">
              <div className="shrink-0 pl-4 pr-3 py-3.5 rounded-l-2xl bg-white/5 border-y border-l border-white/10 flex items-center justify-center">
                <span className="text-sm font-bold text-slate-400">+221</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77 123 45 67"
                className="w-full pl-3 pr-4 py-3.5 rounded-r-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Adresse / Ville *</label>
            <div className="relative flex">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Parcelles Assainies, Dakar"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-black text-sm text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-lg shadow-demandoo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? "Enregistrement..." : "Continuer vers la vérification"} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
