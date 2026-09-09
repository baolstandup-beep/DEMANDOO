import React from 'react';
import { ShieldCheck, CheckCircle2, Phone, Car } from 'lucide-react';

export const VerifiedDriverBadge = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-demandoo-700 border border-emerald-200 shadow-sm ${className}`}>
    <ShieldCheck className="w-3.5 h-3.5 text-demandoo-600" />
    Conducteur vérifié
  </span>
);

export const PhoneVerifiedBadge = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
    <Phone className="w-3 h-3 text-emerald-600" />
    Tél. vérifié
  </span>
);

export const IdentityVerifiedBadge = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
    <CheckCircle2 className="w-3 h-3 text-blue-600" />
    ID vérifié
  </span>
);

export const VehicleVerifiedBadge = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
    <Car className="w-3 h-3 text-amber-600" />
    Véhicule vérifié
  </span>
);
