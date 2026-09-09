import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User,
  Car,
  FileText,
  Clock
} from 'lucide-react';

export const AdminDriverReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock Data for a single driver's dossier
  const [driver, setDriver] = useState({
    id: id,
    name: 'Modou Diop',
    phone: '+221 77 450 12 34',
    email: 'modou.diop@demandoo.sn',
    city: 'Dakar',
    dob: '1985-06-15',
    status: 'UNDER_REVIEW', // Global status
    vehicle: {
      make: 'Peugeot',
      model: '508',
      year: '2021',
      color: 'Gris',
      plate: 'DK-8492-BC'
    },
    documents: [
      { id: 'doc1', type: 'CNI Recto', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc2', type: 'CNI Verso', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc3', type: 'Permis de conduire', status: 'APPROVED', rejectionReason: '' },
      { id: 'doc4', type: 'Selfie', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc5', type: 'Carte Grise', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc6', type: 'Assurance', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc7', type: 'Photo Véhicule (Avant)', status: 'UNDER_REVIEW', rejectionReason: '' },
      { id: 'doc8', type: 'Photo Véhicule (Intérieur)', status: 'UNDER_REVIEW', rejectionReason: '' }
    ]
  });

  const [activeDoc, setActiveDoc] = useState(driver.documents[0]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApproveDoc = () => {
    const updatedDocs = driver.documents.map(d => 
      d.id === activeDoc.id ? { ...d, status: 'APPROVED', rejectionReason: '' } : d
    );
    setDriver({ ...driver, documents: updatedDocs });
    setActiveDoc({ ...activeDoc, status: 'APPROVED', rejectionReason: '' });
  };

  const handleRejectDoc = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    const updatedDocs = driver.documents.map(d => 
      d.id === activeDoc.id ? { ...d, status: 'REJECTED', rejectionReason: rejectReason } : d
    );
    setDriver({ ...driver, documents: updatedDocs });
    setActiveDoc({ ...activeDoc, status: 'REJECTED', rejectionReason: rejectReason });
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleGlobalDecision = (decision) => {
    if (decision === 'REJECTED') {
      const reason = prompt("Motif de refus du dossier complet :");
      if (!reason) return;
      alert(`Dossier refusé : ${reason}`);
    } else {
      alert("Dossier approuvé avec succès ! Le chauffeur est maintenant VÉRIFIÉ.");
    }
    setDriver({ ...driver, status: decision });
    navigate('/admin/drivers');
  };

  const getStatusColor = (status) => {
    if (status === 'APPROVED') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (status === 'REJECTED') return 'text-rose-600 bg-rose-50 border-rose-200';
    if (status === 'UNDER_REVIEW') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'REJECTED') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/drivers" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dossier Chauffeur : {driver.name}</h1>
              <p className="text-sm text-slate-500 font-medium">ID: {driver.id}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleGlobalDecision('REJECTED')}
              className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-black transition-colors"
            >
              REFUSER LE DOSSIER
            </button>
            <button 
              onClick={() => handleGlobalDecision('APPROVED')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> VALIDER LE CHAUFFEUR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Document List & Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <User className="w-4 h-4" /> Informations Personnelles
                </h3>
                <div className="space-y-2 text-sm font-bold text-slate-800">
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Téléphone:</span> {driver.phone}</p>
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Email:</span> {driver.email}</p>
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Ville:</span> {driver.city}</p>
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Naissance:</span> {driver.dob}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4" /> Véhicule Déclaré
                </h3>
                <div className="space-y-2 text-sm font-bold text-slate-800">
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Véhicule:</span> {driver.vehicle.make} {driver.vehicle.model}</p>
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Immatriculation:</span> {driver.vehicle.plate}</p>
                  <p className="flex justify-between"><span className="text-slate-500 font-medium">Couleur:</span> {driver.vehicle.color}</p>
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" /> Pièces jointes ({driver.documents.length})
              </h3>

              <div className="space-y-2">
                {driver.documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                      activeDoc.id === doc.id 
                        ? 'border-demandoo-500 bg-demandoo-50' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className={`text-sm font-bold ${activeDoc.id === doc.id ? 'text-demandoo-900' : 'text-slate-700'}`}>
                      {doc.type}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase flex items-center gap-1 border ${getStatusColor(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Document Viewer & Actions */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              
              {/* Toolbar */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{activeDoc.type}</h2>
                  <span className={`mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(activeDoc.status)}`}>
                    {getStatusIcon(activeDoc.status)} {activeDoc.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl text-sm font-black transition-colors"
                  >
                    REFUSER PIÈCE
                  </button>
                  <button 
                    onClick={handleApproveDoc}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-colors"
                  >
                    VALIDER PIÈCE
                  </button>
                </div>
              </div>

              {/* Viewer Area (Mock) */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-8 relative">
                <div className="text-center space-y-4">
                  <FileText className="w-16 h-16 text-slate-700 mx-auto" />
                  <p className="text-slate-500 font-medium">Prévisualisation sécurisée du document :</p>
                  <p className="text-xl font-black text-white">{activeDoc.type}</p>
                </div>

                {activeDoc.status === 'REJECTED' && (
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl backdrop-blur-md">
                    <p className="text-rose-400 font-bold text-sm mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Pièce rejetée
                    </p>
                    <p className="text-rose-200 text-sm">Motif : {activeDoc.rejectionReason}</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-2">Refuser le document</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Précisez le motif du refus. Ce motif sera affiché au chauffeur.</p>
            
            <form onSubmit={handleRejectDoc}>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ex: Document flou, date expirée..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none mb-6 min-h-[120px]"
                required
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Annuler</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20">Confirmer le refus</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
