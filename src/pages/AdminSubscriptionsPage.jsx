import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, RefreshCcw, DollarSign, Users, AlertCircle } from 'lucide-react';

export const AdminSubscriptionsPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const stats = {
    total: drivers.length,
    activePro: drivers.filter(d => d.subscription_status === 'active' && d.subscription_plan === 'pro').length,
    activeStandard: drivers.filter(d => d.subscription_status === 'active' && d.subscription_plan === 'standard').length,
    trial: drivers.filter(d => d.subscription_plan === 'trial').length,
    expired: drivers.filter(d => d.subscription_status === 'expired').length,
  };

  const mrr = (stats.activePro * 5000) + (stats.activeStandard * 2500);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase">MRR Estimé</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{mrr.toLocaleString('fr-FR')} FCFA</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-demandoo-600 mb-1">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase">Actifs Pro</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.activePro}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-600 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase">Actifs Standard</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.activeStandard}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase">Expirés</h3>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.expired}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900 text-lg">Suivi des Abonnements</h3>
          <button onClick={fetchSubscriptions} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <RefreshCcw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="pb-3 px-4">Chauffeur</th>
                <th className="pb-3 px-4">Téléphone</th>
                <th className="pb-3 px-4">Formule</th>
                <th className="pb-3 px-4">Statut</th>
                <th className="pb-3 px-4">Trajets Utilisés</th>
                <th className="pb-3 px-4">Expiration</th>
                <th className="pb-3 px-4">Transaction (Réf)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{driver.full_name}</div>
                    <div className="text-xs text-slate-500">{driver.email}</div>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-700">{driver.phone || '-'}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold uppercase">
                      {driver.subscription_plan || 'Découverte'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {driver.subscription_status === 'active' ? (
                      <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">Actif</span>
                    ) : driver.subscription_status === 'expired' ? (
                      <span className="text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-lg">Expiré</span>
                    ) : (
                      <span className="text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg">Essai / Inactif</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900">{driver.subscription_trips_used || 0}</span>
                    <span className="text-xs text-slate-500"> / {driver.subscription_trip_limit || (driver.subscription_plan === 'pro' ? '∞' : 1)}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-600">
                    {driver.next_renewal_at ? new Date(driver.next_renewal_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-slate-500">
                    {driver.payment_reference || '-'}
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">
                    Aucun chauffeur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
