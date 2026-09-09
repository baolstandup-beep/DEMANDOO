import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Car, 
  Search, 
  PlusCircle, 
  Bell, 
  User, 
  LogOut, 
  Shield, 
  CheckCheck, 
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const Header = () => {
  const { user, logout, viewMode, toggleViewMode } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (role) => {
    switchRole(role);
    setShowRoleSwitcher(false);
    if (role === 'admin') navigate('/admin/paiements');
    else if (role === 'driver') navigate('/espace-chauffeur');
    else navigate('/trajets');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-demandoo-500 to-demandoo-600 flex items-center justify-center text-white shadow-md shadow-demandoo-500/25 group-hover:scale-105 transition-all">
            <Car className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">
              Demandoo<span className="text-demandoo-500">.</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 -mt-1 tracking-wider uppercase">
              Covoiturage Sénégal
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/50">
          <Link 
            to="/" 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              location.pathname === '/' 
                ? 'bg-white text-demandoo-600 shadow-sm' 
                : 'text-slate-600 hover:text-demandoo-600 hover:bg-white/50'
            }`}
          >
            Accueil
          </Link>
          <Link 
            to="/trajets" 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname.startsWith('/trajets') 
                ? 'bg-white text-demandoo-600 shadow-sm' 
                : 'text-slate-600 hover:text-demandoo-600 hover:bg-white/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Trouver un trajet
          </Link>
          <Link 
            to="/espace-chauffeur" 
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname.startsWith('/espace-chauffeur') 
                ? 'bg-white text-demandoo-600 shadow-sm' 
                : 'text-slate-600 hover:text-demandoo-600 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Espace Chauffeur
          </Link>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2.5">

          {/* CTA: PUBLIER UN TRAJET */}
          {user && user.role === 'driver' && user.driver_status === 'VERIFIED' && viewMode === 'driver' && (
            <Link 
              to={user.subscription_status === 'active' || user.subscription_status === 'trial' ? "/publier" : "/abonnement"}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Publier un trajet
            </Link>
          )}


          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-slate-100 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-demandoo-600 font-bold hover:underline">
                      Tout marquer comme lu
                    </button>
                  )}
                </div>

                <div className="max-h-[22rem] overflow-y-auto divide-y divide-slate-50 space-y-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Aucune notification pour le moment.</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            navigate(n.link);
                            setShowNotifs(false);
                          }
                        }}
                        className={`group p-3 rounded-2xl text-left cursor-pointer transition-all border ${n.read ? 'bg-white border-slate-100 opacity-80' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className={`text-sm ${n.read ? 'font-bold text-slate-700' : 'font-black text-slate-900'}`}>{n.title}</h5>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100/50">
                          {/* WhatsApp Simulation Button */}
                          <a 
                            href={`https://wa.me/?text=${encodeURIComponent(`*Demandoo - ${n.title}*\n${n.message}`)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering the card's onClick
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                            </svg>
                            Ouvrir dans WhatsApp
                          </a>
                          
                          {n.link && (
                            <span className="text-[10px] font-bold text-demandoo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                              Voir les détails →
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER MENU */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-demandoo-400/50 transition-all"
              >
                <img 
                  src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} 
                  alt={user.full_name} 
                  className="w-9 h-9 rounded-full object-cover border-2 border-demandoo-500 shadow-sm"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-demandoo-700 uppercase">
                      {user.role === 'admin' ? 'Administrateur' : user.role === 'driver' ? 'Conducteur ▼' : 'Passager ▼'}
                    </span>
                  </div>

                  {user.role === 'driver' && user.driver_status === 'VERIFIED' && (
                    <button
                      onClick={() => {
                        toggleViewMode();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-demandoo-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border-b border-slate-100"
                    >
                      <span className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-demandoo-600" />
                        {viewMode === 'passenger' ? 'Passer en Mode Conducteur' : 'Passer en Mode Passager'}
                      </span>
                    </button>
                  )}

                  {/* PASSENGER ITEMS (shown for everyone, or when in passenger mode) */}
                  {(user.role === 'passenger' || viewMode === 'passenger' || user.role === 'admin') && (
                    <>
                      <Link 
                        to="/mes-reservations" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50/60 transition-colors"
                      >
                        <Car className="w-4 h-4 text-demandoo-600" />
                        Mes Réservations
                      </Link>
                      
                      {user.role === 'passenger' && (
                        <Link 
                          to="/verification-chauffeur" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50/60 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-demandoo-600" />
                          Devenir conducteur
                        </Link>
                      )}
                    </>
                  )}

                  {/* DRIVER ITEMS (shown only in driver view mode) */}
                  {user.role === 'driver' && viewMode === 'driver' && (
                    <>
                      <Link 
                        to="/espace-chauffeur" 
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50/60 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-demandoo-600" />
                        Espace Conducteur
                      </Link>
                      
                      {user.driver_status !== 'VERIFIED' && (
                        <Link 
                          to="/verification-chauffeur" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-amber-50/60 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-500" />
                          Vérification KYC Chauffeur
                        </Link>
                      )}
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin/paiements" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors border-t border-slate-100"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-600" />
                      Administration
                    </Link>
                  )}

                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-demandoo-600 transition-colors"
              >
                Connexion
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-sm transition-all"
              >
                S'inscrire
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
