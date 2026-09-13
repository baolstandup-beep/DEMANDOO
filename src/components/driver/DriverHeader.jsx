import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Lock } from 'lucide-react';
import { VerifiedDriverBadge, PendingVerificationBadge, IncompleteVerificationBadge } from '../common/Badge';

export const DriverHeader = ({ user, isVerified, canPublish }) => {
  return (
    <div className="bg-slate-900 text-white pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
              alt={user?.full_name} 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-[3px] border-slate-900 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-black text-demandoo-400 uppercase tracking-widest block">
                Espace Chauffeur
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Bonjour, {user?.full_name?.split(' ')[0] || 'Ousmane'} 👋
                </h1>
                {user?.driver_status === 'VERIFIED' && <VerifiedDriverBadge />}
                {user?.driver_status === 'PENDING' && <PendingVerificationBadge />}
                {(user?.driver_status === 'INCOMPLETE' || user?.driver_status === 'profile_incomplete') && <IncompleteVerificationBadge />}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Gérez vos trajets et vos demandes
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            {canPublish ? (
              <Link 
                to="/publier" 
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl text-sm font-black text-slate-900 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                Publier un trajet
              </Link>
            ) : (
              <Link 
                to="/abonnement" 
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl text-sm font-black text-white/70 bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                title="Abonnement requis"
              >
                <Lock className="w-5 h-5" />
                Publier un trajet
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
