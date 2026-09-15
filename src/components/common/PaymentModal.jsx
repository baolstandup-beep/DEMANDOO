import React, { useState } from 'react';
import { X, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const PaymentModal = ({ isOpen, onClose, plan, onSuccess }) => {
  const { user } = useAuth();
  const [provider, setProvider] = useState('wave');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !plan) return null;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setStatus('processing');
    setErrorMsg('');
    
    try {
      const clientReference = `sub_${user?.id}_${Date.now()}`;
      const successUrl = `${window.location.origin}/espace-chauffeur/abonnement?payment=success&plan_id=${plan.id}`;
      const errorUrl = `${window.location.origin}/espace-chauffeur/abonnement?payment=cancelled`;

      // 1. Appel dynamique à la passerelle Afrotools
      let redirectUrl = null;

      if (provider === 'wave') {
        const { createWaveCheckout } = await import('../../services/afrotoolsService');
        const response = await createWaveCheckout({
          amount: plan.monthly_price,
          clientReference,
          clientPhone: phoneNumber,
          successUrl,
          errorUrl
        });
        
        // Mode Simulation Sandbox de Afrotools: L'URL retournée est une fausse URL (pay.wave.com/m/...). 
        // Si c'est le cas, on contourne et on redirige directement vers le succès pour la démo.
        if (response.wave_launch_url && response.wave_launch_url.includes('wave_')) {
            redirectUrl = successUrl;
        } else {
            redirectUrl = response.wave_launch_url;
        }
      } else {
        const { createBictorysCharge } = await import('../../services/afrotoolsService');
        const response = await createBictorysCharge({
          amount: plan.monthly_price,
          clientReference,
          customerName: user?.full_name || 'Chauffeur',
          customerPhone: phoneNumber,
          customerEmail: user?.email,
          paymentType: provider === 'orange_money' ? 'orange_money' : undefined,
          successUrl,
          errorUrl
        });

        // Mode Simulation Sandbox Bictorys
        if (response.link && response.link.includes('bictorys_chg_')) {
            redirectUrl = successUrl;
        } else {
            redirectUrl = response.link;
        }
      }

      // 2. Redirection vers la plateforme de paiement ou l'URL de succès
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error("L'URL de paiement n'a pas pu être générée.");
      }
      
    } catch (err) {
      console.error("Erreur de paiement Afrotools:", err);
      setStatus('error');
      setErrorMsg("La transaction a échoué. Veuillez vérifier votre solde et réessayer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={status === 'processing' ? undefined : onClose} />
      
      <div className="relative bg-white rounded-2xl sm:rounded-3xl w-[calc(100%-24px)] max-w-md max-h-[92vh] overflow-y-auto shadow-2xl animate-fade-in">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Paiement Sécurisé</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Forfait {plan.name}</p>
          </div>
          <button 
            onClick={onClose}
            disabled={status === 'processing'}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {status === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Paiement validé !</h4>
            <p className="text-sm text-slate-500 font-medium">Votre abonnement est en cours d'activation...</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="p-6 space-y-6">
            
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
              <span className="text-sm font-bold text-slate-700">Montant à payer :</span>
              <span className="text-xl font-black text-demandoo-600">{plan.monthly_price.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Moyen de paiement</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider('wave')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    provider === 'wave' 
                      ? 'border-[#1DCBFA] bg-[#1DCBFA]/5 shadow-sm scale-105' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img src="/images/wave-logo.jpg" alt="Wave" className="h-10 object-contain rounded-lg mix-blend-multiply" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setProvider('orange_money')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    provider === 'orange_money' 
                      ? 'border-[#FF7900] bg-[#FF7900]/5 shadow-sm scale-105' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img src="/images/om-logo.png" alt="Orange Money" className="h-10 object-contain mix-blend-multiply" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">Numéro de téléphone</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full min-h-[48px] pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'processing' || !phoneNumber}
              className="w-full min-h-[48px] py-3.5 sm:py-4 rounded-xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {status === 'processing' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Traitement sécurisé...</>
              ) : (
                <>Payer {plan.monthly_price.toLocaleString('fr-FR')} FCFA</>
              )}
            </button>
            
            <p className="text-[10px] text-center text-slate-400 font-medium">
              Simulation sécurisée. Aucune somme réelle ne sera débitée de votre compte.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
