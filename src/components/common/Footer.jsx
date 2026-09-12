import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  CreditCard, 
  MessageCircle,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-600 font-sans border-t border-slate-200">
      
      {/* PRE-FOOTER: TRUST & SECURITY */}
      <div className="bg-slate-50 border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-slate-900 font-black text-lg">Voyagez avec plus de confiance</h3>
              <p className="text-xs text-slate-500 font-medium">L'exigence de la sécurité à chaque étape.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-700">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-demandoo-500" />
                <span>Profils vérifiés</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <CreditCard className="w-5 h-5 text-demandoo-500" />
                <span>Paiements sécurisés</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <MessageCircle className="w-5 h-5 text-demandoo-500" />
                <span>Avis de la communauté</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COLONNE 1 — DEMANDOO */}
          <div className="space-y-6">
            <Link to="/" className="inline-block hover:scale-[1.02] transition-transform">
              <img src="/logo.png" alt="Demandoo — Covoiturage Sénégal" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Le covoiturage de confiance entre Touba et tout le Sénégal. Demandoo facilite la mise en relation entre conducteurs et passagers pour voyager simplement, partager les frais et se déplacer en toute sécurité.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-demandoo-50 hover:text-demandoo-600 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-demandoo-50 hover:text-demandoo-600 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-demandoo-50 hover:text-demandoo-600 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* COLONNE 2 — DEMANDOO (Liens rapides) */}
          <div className="space-y-6 lg:ml-8">
            <h4 className="text-slate-900 font-black text-base uppercase tracking-widest">Demandoo</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Accueil</Link></li>
              <li><Link to="/trajets" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Rechercher un trajet</Link></li>
              <li><Link to="/publier" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Publier un trajet</Link></li>
              <li><Link to="/comment-ca-marche" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Comment ça marche ?</Link></li>
              <li><Link to="/securite" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Sécurité</Link></li>
              <li><Link to="/a-propos" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">À propos</Link></li>
            </ul>
          </div>

          {/* COLONNE 3 — CONDUCTEURS & PASSAGERS */}
          <div className="space-y-6">
            <h4 className="text-slate-900 font-black text-base uppercase tracking-widest">Espaces</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/mes-reservations" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Espace passager</Link></li>
              <li><Link to="/espace-chauffeur" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Espace conducteur</Link></li>
              <li><Link to="/trajets" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Mes trajets</Link></li>
              <li><Link to="/mes-reservations" className="text-slate-600 hover:text-demandoo-600 hover:translate-x-1 transition-all inline-block">Mes réservations</Link></li>
            </ul>
          </div>

          {/* COLONNE 4 — AIDE & CONTACT */}
          <div className="space-y-6">
            <h4 className="text-slate-900 font-black text-base uppercase tracking-widest">Aide & Légal</h4>
            
            {/* Contact Compact */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Besoin d'aide ?</p>
              <div className="space-y-3">
                <a href="tel:+221770000000" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-demandoo-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  +221 77 000 00 00
                </a>
                <a href="mailto:support@demandoo.sn" className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:text-demandoo-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  support@demandoo.sn
                </a>
              </div>
              <a 
                href="https://wa.me/221770000000" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-3 rounded-xl text-center text-xs font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-md shadow-demandoo-500/20 transition-all mt-2"
              >
                Contacter le support
              </a>
            </div>

            <ul className="space-y-3 text-xs font-bold pt-2">
              <li><Link to="/faq" className="text-slate-500 hover:text-demandoo-600 transition-colors">FAQ</Link></li>
              <li><Link to="/cgu" className="text-slate-500 hover:text-demandoo-600 transition-colors">Conditions générales d'utilisation</Link></li>
              <li><Link to="/confidentialite" className="text-slate-500 hover:text-demandoo-600 transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/mentions-legales" className="text-slate-500 hover:text-demandoo-600 transition-colors">Mentions légales</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500">
            © {currentYear} Demandoo. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <Link to="/cgu" className="hover:text-demandoo-600 transition-colors">Conditions</Link>
            <Link to="/confidentialite" className="hover:text-demandoo-600 transition-colors">Confidentialité</Link>
            <Link to="/cookies" className="hover:text-demandoo-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};
