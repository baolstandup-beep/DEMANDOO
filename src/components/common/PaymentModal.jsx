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
      // 1. Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 2. Insert payment record into Supabase
      if (user && user.id && plan.id.length === 36) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            driver_id: user.id,
            provider: provider,
            provider_transaction_id: `txn_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            amount: plan.monthly_price,
            currency: 'XOF',
            status: 'paid',
            confirmed_at: new Date().toISOString()
          }]);
          
        if (paymentError) throw paymentError;
      }
      
      setStatus('success');
      setTimeout(() => {
        onSuccess(plan, provider);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg("La transaction a échoué. Veuillez vérifier votre solde et réessayer.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={status === 'processing' ? undefined : onClose} />
      
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Paiement Sécurisé</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Forfait {plan.name}</p>
          </div>
          <button 
            onClick={onClose}
            disabled={status === 'processing'}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
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
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    provider === 'wave' 
                      ? 'border-[#1DCBFA] bg-[#1DCBFA]/5 shadow-sm scale-105' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-black text-[#1DCBFA] tracking-tighter">wave</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setProvider('orange_money')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    provider === 'orange_money' 
                      ? 'border-[#FF7900] bg-[#FF7900]/5 shadow-sm scale-105' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-black text-[#FF7900] tracking-tighter">Orange<span className="text-black text-sm block -mt-1">Money</span></div>
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
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
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
              className="w-full py-4 rounded-xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
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
