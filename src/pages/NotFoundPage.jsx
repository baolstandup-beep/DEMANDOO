import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, MapPin, Navigation } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      
      {/* Fond décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        
        {/* Logo de retour */}
        <Link to="/" className="inline-block hover:scale-105 transition-transform">
          <img src="/logo.png" alt="Demandoo" className="h-10 w-auto object-contain mx-auto" />
        </Link>

        {/* Illustration */}
        <div className="relative flex items-center justify-center">
          {/* Cercles animés */}
          <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-demandoo-200 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute w-32 h-32 rounded-full border border-demandoo-blue-200 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          
          {/* Numéro 404 */}
          <div className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-demandoo-blue-500 to-demandoo-500 flex flex-col items-center justify-center shadow-2xl shadow-demandoo-500/30">
            <Navigation className="w-8 h-8 text-white mb-1 -rotate-45 opacity-80" />
            <span className="text-4xl font-black text-white leading-none">404</span>
          </div>

          {/* Points flottants décoratifs */}
          <div className="absolute top-0 right-8 w-4 h-4 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-2 left-6 w-3 h-3 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-6 left-0 w-2 h-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '0.6s' }} />
        </div>

        {/* Texte principal */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-extrabold text-[11px] uppercase tracking-widest">
            <MapPin className="w-3 h-3" />
            Page introuvable
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Trajet sans destination
          </h1>
          <p className="text-slate-500 text-base font-medium leading-relaxed">
            Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour trouver votre prochain trajet vers Dakar, Thiès ou Saint-Louis.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            to="/trajets"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
          >
            <Search className="w-4 h-4" />
            Rechercher un trajet
          </Link>
        </div>

        {/* Raccourcis */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Pages populaires</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Touba → Dakar', to: '/trajets?departure=Touba&destination=Dakar' },
              { label: 'Touba → Thiès', to: '/trajets?departure=Touba&destination=Thiès' },
              { label: 'Publier un trajet', to: '/publier' },
              { label: 'Mon espace', to: '/espace-chauffeur' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-semibold hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Page précédente
        </button>

      </div>
    </div>
  );
};

export default NotFoundPage;
