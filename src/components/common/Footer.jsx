import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-white font-sans">
      
      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* COLONNE 1 — LOGO */}
          <div className="flex items-center justify-center lg:justify-start lg:items-start">
            <Link to="/" className="inline-block hover:scale-[1.02] transition-transform">
              {/* Le filtre invert rend le logo blanc pour qu'il soit visible sur fond sombre */}
              <img src="/logo.png" alt="Demandoo" className="h-20 w-auto object-contain brightness-0 invert" />
            </Link>
          </div>

          {/* COLONNE 2 — A PROPOS */}
          <div className="space-y-4">
            <h4 className="font-black text-lg text-white">À propos</h4>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Chez Demandoo, notre mission est claire et ambitieuse : <strong className="text-white">offrir un covoiturage de qualité</strong> qui forme des voyageurs non seulement satisfaits sur le plan économique, mais aussi dotés d'une perspective humaine et solidaire.
            </p>
          </div>

          {/* COLONNE 3 — LIENS RAPIDES */}
          <div className="space-y-4">
            <h4 className="font-black text-lg text-white">Liens Rapides</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              <li><Link to="/" className="hover:text-white transition-colors inline-block">Accueil</Link></li>
              <li><Link to="/trajets" className="hover:text-white transition-colors inline-block">Rechercher un trajet</Link></li>
              <li><Link to="/publier" className="hover:text-white transition-colors inline-block">Publier un trajet</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-white transition-colors inline-block">Comment ça marche</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors inline-block">Nos contacts</Link></li>
            </ul>
          </div>

          {/* COLONNE 4 — INFOS DE CONTACTS */}
          <div className="space-y-4">
            <h4 className="font-black text-lg text-white">Infos de contacts</h4>
            <div className="space-y-4 text-sm font-medium text-slate-300">
              <p className="leading-relaxed">
                <strong className="text-white">Siège social :</strong> Dakar, Sénégal face à l'aéroport<br/>
                <strong className="text-white">Annexe :</strong> Touba, à côté de la grande Mosquée
              </p>
              <a href="mailto:info@demandoo.sn" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-[#8b5cf6]" />
                info@demandoo.sn
              </a>
              <a href="tel:+221770000000" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-[#8b5cf6]" />
                +221 77 000 00 00
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="bg-[#6f569b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-medium text-white/90 text-center md:text-left">
            Copyright © {currentYear}. Tous droits réservés - DEMANDOO | Conception pour la mobilité
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-white text-[#6f569b] flex items-center justify-center hover:scale-110 transition-transform">
              <Facebook className="w-4 h-4 fill-current" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white text-[#6f569b] flex items-center justify-center hover:scale-110 transition-transform">
              <Twitter className="w-4 h-4 fill-current" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white text-[#6f569b] flex items-center justify-center hover:scale-110 transition-transform">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
};
