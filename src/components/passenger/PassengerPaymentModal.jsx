import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { createWaveCheckout, createBictorysCharge } from '../../services/afrotoolsService';
import { useAuth } from '../../context/AuthContext';

export const PassengerPaymentModal = ({ isOpen, onClose, trip, passengers, onSuccess }) => {
  const { user } = useAuth();
  const [method, setMethod] = useState(null); // 'wave', 'om'
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !trip) return null;

  const amount = trip.price_per_seat * passengers;

  const handlePayment = async () => {
    if (!method) {
      setError("Veuillez sélectionner un moyen de paiement.");
      return;
    }
    if (method === 'om' && (!phone || phone.length < 9)) {
      setError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (method === 'wave') {
        const response = await createWaveCheckout(amount, 'XOF', `${window.location.origin}/trajet/${trip.id}?payment=success`, `${window.location.origin}/trajet/${trip.id}?payment=cancel`);
        if (response?.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          throw new Error("L'URL de paiement Wave n'a pas pu être générée.");
        }
      } else if (method === 'om') {
        const response = await createBictorysCharge(amount, 'XOF', phone, `${window.location.origin}/trajet/${trip.id}?payment=success`, `${window.location.origin}/trajet/${trip.id}?payment=cancel`);
        if (response?.url) {
          window.location.href = response.url;
        } else {
          throw new Error("Erreur avec l'opérateur Orange Money.");
        }
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du paiement.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800">Payer votre place</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 font-medium">Montant total à payer</p>
            <p className="text-3xl font-black text-demandoo-600">{amount.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-xs text-slate-400 mt-1">Pour {passengers} passager(s)</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              onClick={() => setMethod('wave')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                method === 'wave' ? 'border-[#1DC6F8] bg-[#1DC6F8]/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1DC6F8] flex items-center justify-center text-white font-black text-xl">W</div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800">Wave Mobile Money</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Instantané</p>
                </div>
              </div>
              {method === 'wave' && <CheckCircle className="w-6 h-6 text-[#1DC6F8]" />}
            </button>

            <button
              onClick={() => setMethod('om')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                method === 'om' ? 'border-[#FF7900] bg-[#FF7900]/5' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF7900] flex items-center justify-center text-white font-black text-xl">OM</div>
                <div className="text-left">
                  <h4 className="font-bold text-slate-800">Orange Money</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Sécurisé</p>
                </div>
              </div>
              {method === 'om' && <CheckCircle className="w-6 h-6 text-[#FF7900]" />}
            </button>
          </div>

          {method === 'om' && (
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 mb-2 block">Numéro de téléphone OM</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 77 123 45 67"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20"
              />
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3.5 bg-demandoo-500 hover:bg-demandoo-600 text-white rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2 shadow-lg shadow-demandoo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Payer {amount.toLocaleString('fr-FR')} FCFA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
