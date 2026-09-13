import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, Shield, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/common/PaymentModal';

export const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('monthly_price', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setPlans(data);
      } else {
        setPlans([
          { id: 'trial', name: 'Essai Chauffeur', monthly_price: 0, features: ['Accès à l\'espace chauffeur', 'Maximum 1 trajet test'] },
          { id: 'standard', name: 'Chauffeur Standard', monthly_price: 2500, features: ['4 trajets par mois', 'Publication de trajets', 'Gestion des réservations'] },
          { id: 'pro', name: 'Chauffeur Pro', monthly_price: 5000, features: ['Trajets illimités', 'Support prioritaire', 'Badge Pro'] }
        ]);
      }
    } catch (err) {
      console.warn("Error fetching plans:", err);
      setPlans([
        { id: 'trial', name: 'Essai Chauffeur', monthly_price: 0, features: ['Accès à l\'espace chauffeur', 'Maximum 1 trajet test'] },
        { id: 'standard', name: 'Chauffeur Standard', monthly_price: 2500, features: ['4 trajets par mois', 'Publication de trajets', 'Gestion des réservations'] },
        { id: 'pro', name: 'Chauffeur Pro', monthly_price: 5000, features: ['Trajets illimités', 'Support prioritaire', 'Badge Pro'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeClick = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (plan.monthly_price === 0) {
      handlePaymentSuccess(plan, 'free');
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentSuccess = async (plan, provider) => {
    setSubscribingTo(plan.id);
    setSelectedPlan(null);
    setError('');
    
    try {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      if (plan.id.length === 36) { // If it's a real UUID from DB
        await supabase
          .from('driver_subscriptions')
          .insert([{
            driver_id: user.id,
            plan_id: plan.id,
            billing_cycle: 'monthly',
            status: 'active',
            period_end: periodEnd.toISOString()
          }]);
      }
      
      // Update profile subscription info locally & in DB
      await supabase.from('profiles').update({ 
        subscription_status: plan.monthly_price === 0 ? 'trial' : 'active'
      }).eq('id', user.id);
      
      // Force localStorage update for AuthContext
      const stored = localStorage.getItem('demandoo_user_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.subscription_status = plan.monthly_price === 0 ? 'trial' : 'active';
        localStorage.setItem('demandoo_user_v2', JSON.stringify(parsed));
      }
      
      // Just a quick alert to give feedback before navigating
      alert(`Félicitations, vous êtes maintenant abonné au forfait ${plan.name} !`);
      
      // Ensure user state is refreshed by forcing a reload to the dashboard
      window.location.href = '/espace-chauffeur';
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'abonnement. Veuillez réessayer.");
    } finally {
      setSubscribingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-demandoo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden bg-slate-50">
      <div className="absolute top-0 inset-x-0 h-[400px] bg-mesh-pattern pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-demandoo-700 text-xs font-black uppercase tracking-wider mb-4 border border-emerald-200">
            <Sparkles className="w-4 h-4" />
            Demandoo Chauffeurs
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
            Choisissez votre forfait
          </h1>
          <p className="text-white/90 text-lg font-medium drop-shadow">
            Publiez vos trajets et trouvez des passagers fiables. Sans engagement, annulez à tout moment.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => {
            const isPopular = idx === 1; // Standard is popular
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 border ${
                  isPopular 
                    ? 'border-demandoo-500 shadow-2xl shadow-demandoo-500/20 md:-mt-4' 
                    : 'border-slate-200 shadow-xl shadow-slate-200/50'
                } hover-lift`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-md">
                    Le plus choisi
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-demandoo-600">
                      {plan.monthly_price === 0 ? 'Gratuit' : plan.monthly_price.toLocaleString('fr-FR')}
                    </span>
                    {plan.monthly_price > 0 && <span className="text-slate-500 font-bold">FCFA / mois</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                      <div className="mt-0.5 shrink-0 bg-emerald-100 p-1 rounded-full text-demandoo-600">
                        <Check className="w-3 h-3" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribeClick(plan)}
                  disabled={subscribingTo !== null}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'btn-premium text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {subscribingTo === plan.id ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
                  ) : (
                    <>S'abonner maintenant</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 text-center text-slate-500 text-xs font-medium max-w-2xl mx-auto">
          <Shield className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          Paiements sécurisés par Wave et Orange Money. En vous abonnant, vous acceptez nos conditions générales de service.
        </div>
      </div>
      
      <PaymentModal 
        isOpen={selectedPlan !== null} 
        onClose={() => setSelectedPlan(null)} 
        plan={selectedPlan} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
};
