import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  ShieldCheck
} from 'lucide-react';

const MOCK_DRIVERS = [
  {
    id: 'drv-001',
    name: 'Modou Diop',
    phone: '+221 77 450 12 34',
    vehicle: 'Peugeot 508 (2021)',
    progress: '100%',
    status: 'VERIFIED',
    submittedAt: '2023-10-12',
    date: '10 Oct 2023'
  },
  {
    id: 'drv-002',
    name: 'Cheikh Ndiaye',
    phone: '+221 77 555 44 33',
    vehicle: 'Toyota Corolla (2018)',
    progress: '100%',
    status: 'ACTIVE',
    submittedAt: '2023-10-14',
    date: '14 Oct 2023'
  },
  {
    id: 'drv-003',
    name: 'Fatou Sow',
    phone: '+221 77 888 99 00',
    vehicle: '-',
    progress: '40%',
    status: 'INCOMPLETE',
    submittedAt: '-',
    date: '15 Oct 2023'
  },
  {
    id: 'drv-004',
    name: 'Ibrahima Fall',
    phone: '+221 70 123 45 67',
    vehicle: 'Hyundai Tucson (2019)',
    progress: '100%',
    status: 'REJECTED',
    submittedAt: '2023-10-10',
    date: '10 Oct 2023'
  }
];

export const AdminDriversPage = () => {
  const [filter, setFilter] = useState('ALL');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'VERIFIED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> VÉRIFIÉ (CONFIANCE)</span>;
      case 'ACTIVE': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> ACTIF (AUTO)</span>;
      case 'UNDER_REVIEW': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> EN VÉRIFICATION</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> REFUSÉ</span>;
      case 'INCOMPLETE': return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> INCOMPLET</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black tracking-wider w-fit">{status}</span>;
    }
  };

  const filteredDrivers = filter === 'ALL' ? MOCK_DRIVERS : MOCK_DRIVERS.filter(d => d.status === filter);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-demandoo-600 mb-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest">Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestion des Chauffeurs
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'INCOMPLETE', 'ACTIVE', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f === 'ALL' ? 'Tous' : f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher un chauffeur, téléphone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-demandoo-500/20 outline-none"
            />
          </div>
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filtres avancés
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Chauffeur</th>
                  <th className="px-6 py-4">Véhicule</th>
                  <th className="px-6 py-4">Progression</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date de soumission</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-demandoo-100 text-demandoo-700 flex items-center justify-center font-black">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{driver.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {driver.vehicle}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${driver.progress === '100%' ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{width: driver.progress}} />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{driver.progress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(driver.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {driver.submittedAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/drivers/${driver.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Examiner
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDrivers.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-medium">
                Aucun chauffeur trouvé pour ce filtre.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
