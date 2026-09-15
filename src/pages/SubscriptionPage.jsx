import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaymentModal } from '../components/common/PaymentModal';

const SUBSCRIPTION_TIERS = [
  {
    id_fallback: 'trial',
    name: 'Découverte',
    price: 0,
    description: 'Pour découvrir Demandoo et proposer votre premier trajet.',
    features: [
      'Création de profil gratuite.',
      '1 trajet au total.',
      'Zéro commission Demandoo sur vos gains.'
    ],
    buttonText: 'Commencer gratuitement',
    cardStyle: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    buttonStyle: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    iconColor: 'text-demandoo-600 bg-demandoo-50'
  },
  {
    id_fallback: 'standard',
    name: 'Standard',
    price: 2400,
    description: 'Pour proposer quelques trajets chaque mois.',
    features: [
      'Jusqu’à 4 trajets par mois.',
      'Support client prioritaire.',
      'Zéro commission Demandoo sur vos gains.'
    ],
    buttonText: 'Choisir Standard',
    cardStyle: 'bg-white border-slate-200 text-slate-900 shadow-md',
    buttonStyle: 'bg-slate-900 text-white hover:bg-slate-800',
    iconColor: 'text-demandoo-600 bg-demandoo-50'
  },
  {
    id_fallback: 'pro',
    name: 'Pro',
    price: 4900,
    description: 'Pour les chauffeurs qui roulent régulièrement.',
    badge: 'Pour les chauffeurs réguliers',
    features: [
      'Trajets illimités chaque mois.',
      'Visibilité prioritaire dans les résultats.',
      'Badge « Chauffeur Pro ».',
      'Support client prioritaire.',
      'Zéro commission Demandoo sur vos gains.'
    ],
    buttonText: 'Devenir Pro',
    cardStyle: 'bg-demandoo-600 border-demandoo-500 text-white shadow-xl shadow-demandoo-600/20',
    buttonStyle: 'bg-orange-500 text-white hover:bg-orange-600 border-none shadow-md shadow-orange-500/20',
    iconColor: 'text-demandoo-600 bg-white'
  }
];

export const SubscriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbPlans, setDbPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState('');

  const location = useLocation();

  useEffect(() => {
    fetchPlans();
  }, []);



  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true);
        
      if (!error && data) {
        setDbPlans(data);
      }
    } catch (err) {
      console.warn("Error fetching plans from DB, using fallbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanId = (tier) => {
    // Try to match the hardcoded tier with a real DB UUID based on price or name if needed.
    // For now, if there is a DB plan with matching price, use its ID.
    const dbPlan = dbPlans.find(p => p.monthly_price === tier.price);
    return dbPlan ? dbPlan.id : tier.id_fallback;
  };

  const handleSubscribeClick = (tier) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const planToProcess = {
      id: getPlanId(tier),
      name: tier.name,
      monthly_price: tier.price
    };

    if (tier.price === 0) {
      handlePaymentSuccess(planToProcess, 'free');
    } else {
      setSelectedPlan(planToProcess);
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
        subscription_status: plan.monthly_price === 0 ? 'trial' : 'active',
        driver_status: 'VERIFIED',
        is_driver_active: true,
        kyc_status: 'verified'
      }).eq('id', user.id);
      
      // Force localStorage update for AuthContext
      const stored = localStorage.getItem('demandoo_user_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.subscription_status = plan.monthly_price === 0 ? 'trial' : 'active';
        parsed.driver_status = 'VERIFIED';
        parsed.is_driver_active = true;
        parsed.kyc_status = 'verified';
        localStorage.setItem('demandoo_user_v2', JSON.stringify(parsed));
      }
      
      alert(`Félicitations, vous êtes maintenant abonné à la formule ${plan.name} !`);
      window.location.href = '/espace-chauffeur';
    } catch (err) {
      console.error('Error recording subscription:', err);
      setError("Une erreur est survenue lors de l'activation de votre abonnement.");
    } finally {
      setSubscribingTo(null);
    }
  };

  // Intercepter le retour de paiement depuis Afrotools
  useEffect(() => {
    if (!loading && dbPlans.length > 0 && user) {
      const params = new URLSearchParams(location.search);
      const paymentStatus = params.get('payment');
      const planId = params.get('plan_id');
      
      if (paymentStatus === 'success' && planId) {
        // Retrouver les infos du plan depuis dbPlans ou le fallback
        let matchedPlan = dbPlans.find(p => p.id === planId);
        if (!matchedPlan) {
          // Chercher dans les fallbacks si ce n'est pas un plan DB
          const fallbackTier = SUBSCRIPTION_TIERS.find(t => t.id_fallback === planId);
          if (fallbackTier) {
            matchedPlan = {
              id: fallbackTier.id_fallback,
              name: fallbackTier.name,
              monthly_price: fallbackTier.price
            };
          }
        }
        
        if (matchedPlan) {
          handlePaymentSuccess(matchedPlan, 'afrotools');
          
          // Nettoyer l'URL pour ne pas réexécuter si l'utilisateur rafraîchit
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [location.search, loading, dbPlans, user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-demandoo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 font-sans">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16 space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Choisissez votre formule chauffeur
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Un premier trajet ou des déplacements réguliers : trouvez l'offre adaptée à votre rythme, avec zéro commission Demandoo sur vos trajets.
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-700 border border-red-200 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Grille des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isPro = tier.name === 'Pro';
            
            return (
              <div 
                key={tier.name}
                className={`relative flex flex-col rounded-2xl sm:rounded-3xl p-6 sm:p-8 border transition-transform duration-300 hover:-translate-y-1 ${tier.cardStyle} ${isPro ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {/* Badge Pro */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wide rounded-full whitespace-nowrap shadow-sm">
                    {tier.badge}
                  </div>
                )}
                
                {/* En-tête de la carte */}
                <div className={`mb-6 ${tier.badge ? 'pt-2' : ''}`}>
                  <h3 className={`text-xl font-bold mb-2 sm:mb-3 ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className={`text-3xl sm:text-4xl font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-900'}`}>
                      {tier.price.toLocaleString('fr-FR')}
                    </span>
                    <span className={`text-base sm:text-lg font-bold pb-1 ${isPro ? 'text-white' : 'text-slate-900'}`}>
                      FCFA
                    </span>
                  </div>
                  {tier.price > 0 && (
                    <div className={`text-xs sm:text-sm font-medium ${isPro ? 'text-demandoo-100' : 'text-slate-500'}`}>
                      / mois
                    </div>
                  )}
                  {tier.price === 0 && (
                    <div className="text-xs sm:text-sm font-medium text-slate-500">
                      Gratuit, sans engagement
                    </div>
                  )}
                </div>

                <div className={`text-xs sm:text-sm font-medium mb-6 sm:mb-8 ${isPro ? 'text-demandoo-50' : 'text-slate-600'}`}>
                  {tier.description}
                </div>

                <div className="w-full h-px bg-current opacity-10 mb-6 sm:mb-8" />

                {/* Avantages */}
                <ul className="space-y-3.5 sm:space-y-4 mb-8 sm:mb-10 flex-grow">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-medium leading-snug">
                      <div className={`mt-0.5 shrink-0 p-1 rounded-full ${tier.iconColor}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={isPro ? 'text-white' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Bouton d'action */}
                <button
                  onClick={() => handleSubscribeClick(tier)}
                  disabled={subscribingTo !== null}
                  className={`w-full min-h-[48px] py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mt-auto ${tier.buttonStyle}`}
                >
                  {subscribingTo === tier.id_fallback || (subscribingTo && subscribingTo === getPlanId(tier)) ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
                  ) : (
                    tier.buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Note informative */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-3">
            <Shield className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Paiements sécurisés par Wave et Orange Money. 
            <br className="hidden sm:block" />
            Le nombre de trajets inclut les trajets publiés et réalisés.
          </p>
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

