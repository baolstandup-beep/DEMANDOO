import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, Ticket, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl px-3 py-2 pb-safe shadow-elevated">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-demandoo-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </NavLink>

        <NavLink 
          to="/trajets" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-demandoo-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Trajets</span>
        </NavLink>

        <NavLink 
          to="/publier" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-demandoo-600 font-extrabold' : 'text-demandoo-500 font-bold'
            }`
          }
        >
          <div className="w-11 h-11 -mt-6 rounded-2xl bg-gradient-to-tr from-demandoo-600 to-demandoo-400 text-white flex items-center justify-center shadow-lg shadow-demandoo-500/40 border-2 border-white transform hover:scale-105 transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-demandoo-700 mt-0.5">Publier</span>
        </NavLink>

        <NavLink 
          to="/mes-reservations" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-demandoo-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px]">Réservations</span>
        </NavLink>

        <NavLink 
          to="/espace-chauffeur" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-demandoo-600 font-extrabold scale-105' : 'text-slate-500 hover:text-slate-900 font-semibold'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">{user?.role === 'driver' ? 'Chauffeur' : 'Profil'}</span>
        </NavLink>
      </div>
    </nav>
  );
};
