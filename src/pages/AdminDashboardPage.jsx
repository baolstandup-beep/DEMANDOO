import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useNotifications } from '../context/NotificationContext';
import { VerifiedDriverBadge } from '../components/common/Badge';
import { 
  ShieldAlert, 
  Users, 
  Car, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Lock, 
  RefreshCw,
  Search,
  Building2,
  DollarSign
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { verifications, reviewDriverVerification, payments, bookings, trips, drivers, partners } = useTrips();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'payments', 'trips', 'partners'
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Security check: Only Admin role access!
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Accès Restreint</h2>
        <p className="text-xs text-slate-500 font-medium">
          Cette zone est exclusivement réservée à l'administration de Demandoo. Utilisez le sélecteur de rôle en haut pour passer en mode Administrateur.
        </p>
      </div>
    );
  }

  const handleApproveKyc = (verifId) => {
    reviewDriverVerification({
      verificationId: verifId,
      status: 'verified'
    });
    setSelectedVerif(null);
    addNotification({
      title: "Chauffeur Approuvé",
      message: "Le conducteur a reçu son badge de vérification.",
      type: "success"
    });
  };

  const handleRejectKyc = (verifId) => {
    if (!rejectionReason) return alert("Veuillez indiquer un motif de refus.");
    reviewDriverVerification({
      verificationId: verifId,
      status: 'rejected',
      rejectionReason: rejectionReason
    });
    setSelectedVerif(null);
    setRejectionReason('');
    addNotification({
      title: "Dossier KYC Refusé",
      message: "Le conducteur a été notifié du motif de rejet.",
      type: "warning"
    });
  };

  const totalPlatformVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ADMIN HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800 hover-lift">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black tracking-tight">Panneau d'Administration Demandoo</h1>
          </div>
          <p className="text-xs text-slate-300 font-medium">Supervision KYC, Paiements Wave/OM/LigdiCash, Sécurité & Audit</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-900/80 text-purple-200 border border-purple-700/60 shadow-sm">
            Session Sécurisée Admin
          </span>
        </div>
      </div>

      {/* METRICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-900">
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-md hover-lift space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Dossiers KYC en attente</span>
          <p className="text-2xl font-black text-amber-600">
            {verifications.filter(v => v.status === 'pending').length}
          </p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-md hover-lift space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Paiements Traités</span>
          <p className="text-2xl font-black text-demandoo-600">{payments.length}</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-md hover-lift space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Volume financier (FCFA)</span>
          <p className="text-2xl font-black text-demandoo-dark">{totalPlatformVolume.toLocaleString('fr-FR')} FCFA</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 shadow-md hover-lift space-y-1">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Trajets enregistrés</span>
          <p className="text-2xl font-black text-demandoo-dark">{trips.length}</p>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'verifications' ? 'bg-purple-700 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Vérifications KYC ({verifications.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'payments' ? 'bg-purple-700 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Transactions & Paiements ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'partners' ? 'bg-purple-700 text-white shadow-sm font-black' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Partenaires Officiels ({partners.length})
        </button>
      </div>

      {/* TAB 1: KYC VERIFICATIONS TABLE */}
      {activeTab === 'verifications' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-demandoo-dark text-base">Demandes de vérification chauffeur (KYC)</h3>

          {verifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Aucune demande KYC en attente pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-2">Conducteur</th>
                    <th className="py-3 px-2">CNI Doc</th>
                    <th className="py-3 px-2">Permis Doc</th>
                    <th className="py-3 px-2">Date Soumission</th>
                    <th className="py-3 px-2">Statut</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {verifications.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-2">
                        <img src={v.driver?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"} alt={v.driver?.full_name} className="w-8 h-8 rounded-full object-cover border border-demandoo-500" />
                        <div>
                          <span className="font-extrabold text-demandoo-dark block">{v.driver?.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{v.driver?.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-500">{v.cni_doc}</td>
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-500">{v.license_doc}</td>
                      <td className="py-3 px-2 text-slate-500">{new Date(v.submitted_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          v.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {v.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveKyc(v.id)}
                              className="px-3 py-1 rounded-lg text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => setSelectedVerif(v)}
                              className="px-3 py-1 rounded-lg text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRANSACTIONS & PAYMENTS TABLE */}
      {activeTab === 'payments' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-demandoo-dark text-base">Historique des transactions mobile money (Wave & OM)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-2">Fournisseur</th>
                  <th className="py-3 px-2">Montant</th>
                  <th className="py-3 px-2">Téléphone Client</th>
                  <th className="py-3 px-2">Référence Trans.</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 uppercase font-black text-demandoo-600">{p.provider}</td>
                    <td className="py-3 px-2 font-black text-demandoo-dark">{p.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td className="py-3 px-2 text-slate-500 font-mono">{p.provider_phone}</td>
                    <td className="py-3 px-2 font-mono text-[11px] text-indigo-600">{p.provider_reference}</td>
                    <td className="py-3 px-2 text-slate-500">{new Date(p.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {selectedVerif && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-900 text-base">Refuser le dossier KYC</h3>
            <p className="text-xs text-slate-500 font-medium">Veuillez indiquer le motif du rejet de la pièce d'identité :</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Document ilisible ou périmé..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedVerif(null)} className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 bg-slate-100">Annuler</button>
              <button onClick={() => handleRejectKyc(selectedVerif.id)} className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600">Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
