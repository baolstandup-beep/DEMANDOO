import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Crown, CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { createWaveCheckout } from '../services/afrotoolsService';

export const SubscriptionPage = () => {
  const { user, subscribeDriver } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Note: The trial plan is only shown if the user has never had a trial before, but for simplicity here we assume it's always an option if status is inactive.
  const plans = [
    {
      id: 'trial',
      name: 'ESSAI CHAUFFEUR',
      priceMonthly: 0,
      priceAnnual: 0,
      durationDays: 7,
      isTrial: true,
      popular: false,
      badge: '',
      features: [
        'Accès à l’espace chauffeur',
        'Configuration du profil',
        'Découverte de Demandoo',
        'Maximum 1 trajet test'
      ],
      cta: 'COMMENCER L’ESSAI'
    },
    {
      id: 'standard',
      name: 'CHAUFFEUR STANDARD',
      priceMonthly: 2500,
      priceAnnual: 25000,
      tripLimit: 4,
      isTrial: false,
      popular: true,
      badge: 'LE PLUS CHOISI • RECOMMANDÉ',
      savings: '2 mois offerts',
      features: [
        '4 trajets par mois',
        'Publication de trajets',
        'Gestion des réservations',
        'Réception des demandes passagers',
        'Suivi des revenus',
        'Profil chauffeur vérifié',
        'Support Demandoo'
      ],
      cta: 'CHOISIR STANDARD'
    },
    {
      id: 'pro',
      name: 'CHAUFFEUR PRO',
      priceMonthly: 5000,
      priceAnnual: 50000,
      tripLimit: null, // unlimited
      isTrial: false,
      popular: false,
      badge: 'POUR LES CHAUFFEURS ACTIFS',
      savings: '2 mois offerts',
      features: [
        'Trajets illimités',
        'Toutes les fonctionnalités Standard',
        'Badge Chauffeur Pro',
        'Priorité dans les résultats de recherche',
        'Statistiques avancées',
        'Historique complet',
        'Support prioritaire'
      ],
      cta: 'PASSER À PRO'
    }
  ];

  const handleSubscribe = async () => {
    if (user?.driver_status !== 'VERIFIED') {
      addNotification({
        title: "Vérification requise",
        message: "Votre profil chauffeur doit être vérifié avant de pouvoir souscrire à un abonnement.",
        type: "error"
      });
      navigate('/verification-chauffeur');
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    setIsProcessing(true);

    try {
      const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

      // Si le plan n'est pas gratuit/essai, passer par le checkout Wave Afrotools
      if (price > 0) {
        await createWaveCheckout({
          amount: price,
          clientReference: `demandoo_sub_${plan.id}_${user.id}_${Date.now()}`,
          clientPhone: user.phone
        });
      }

      const result = await subscribeDriver(plan.id, billingCycle, plan.tripLimit);
      
      if (result.success) {
        addNotification({
          title: "Abonnement activé !",
          message: plan.isTrial ? "Votre période d'essai de 7 jours a démarré." : `Votre abonnement ${plan.name} a été réglé avec succès via Wave et est actif.`,
          type: "success"
        });
        navigate('/espace-chauffeur');
      } else {
        throw new Error("Erreur lors de la souscription");
      }
    } catch (e) {
      addNotification({
        title: "Erreur d'abonnement",
        message: "Une erreur est survenue lors de l'activation de votre abonnement.",
        type: "error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Publiez vos trajets en toute liberté
          </h1>
          <p className="text-lg text-slate-500 font-medium mb-8">
            Choisissez la formule qui correspond le mieux à votre activité sur Demandoo.
          </p>

          {/* Sélecteur Mensuel / Annuel */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Paiement Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Paiement Annuel
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest bg-amber-600 text-white">
                -20% (2 mois offerts)
              </span>
            </button>
          </div>
        </div>

        {/* Cartes Tarifaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isHighlighted = plan.popular;
            const price = plan.isTrial ? 0 : (billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly);
            const period = plan.isTrial ? '7 jours' : (billingCycle === 'annual' ? 'an' : 'mois');

            return (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-300 flex flex-col ${
                  isHighlighted 
                    ? 'border-2 border-amber-600 shadow-2xl shadow-amber-600/10 scale-105 z-10' 
                    : 'border border-slate-200 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                {/* Badge Recommandé Flottant */}
                {isHighlighted && plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white shadow-md whitespace-nowrap flex flex-col items-center leading-tight">
                    <Sparkles className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2" />
                    <span>{plan.badge.split('•')[0].trim()}</span>
                    <span>• {plan.badge.split('•')[1].trim()}</span>
                  </div>
                )}

                {/* Petite étiquette en haut à gauche (style screenshot) */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    plan.isTrial ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {plan.isTrial ? 'Gratuit à vie' : (plan.id === 'pro' ? 'Grand Atelier' : 'Essentiel')}
                  </span>
                </div>

                {/* En-tête de carte */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-black mb-2 ${
                    isHighlighted ? 'text-slate-900' : 'text-slate-800'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 min-h-[32px]">
                    {plan.id === 'pro' ? "Pour les chauffeurs très actifs et les pros" : (plan.isTrial ? "Pour découvrir la plateforme" : "Pour les chauffeurs réguliers")}
                  </p>
                  
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {price.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mb-1">FCFA / {period}</span>
                  </div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase">
                    Sans engagement
                  </p>
                </div>

                <div className="h-px w-full bg-slate-100 my-6" />

                {/* Fonctionnalités */}
                <div className="space-y-4 mb-8 flex-1 text-sm">
                  {plan.features.map((feature, idx) => {
                    const isHighlight = feature.includes('ILLIMITÉS') || feature.includes('illimités');
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span className={`${
                          isHighlight ? 'font-black text-slate-900' : 'font-medium text-slate-600'
                        }`}>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                  {/* Faux attributs non inclus pour les plans inférieurs (optionnel, pour l'esthétique du screenshot) */}
                  {plan.isTrial && (
                    <div className="flex items-start gap-3 opacity-50">
                      <span className="w-4 h-4 shrink-0 text-slate-400 flex items-center justify-center font-bold mt-0.5">✕</span>
                      <span className="font-medium text-slate-500">Publication illimitée</span>
                    </div>
                  )}
                </div>

                {/* Bouton Sélection (Visuel seulement, le vrai paiement est en bas) */}
                <div className={`w-full py-4 rounded-full font-black text-sm text-center transition-all ${
                  isHighlighted 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                    : 'bg-transparent text-slate-900 border-2 border-slate-900 hover:bg-slate-50'
                }`}>
                  {plan.cta}
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone de Paiement Sécurisé */}
        <div className="mt-16 max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
          <h4 className="font-black text-slate-900 mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Paiement 100% Sécurisé
          </h4>
          <p className="text-sm text-slate-500 mb-8">
            Le paiement sera effectué via Wave ou Orange Money. Votre abonnement sera activé instantanément.
          </p>
          
          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full sm:w-auto px-12 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mx-auto text-lg"
          >
            {isProcessing ? 'Traitement en cours...' : (plans.find(p => p.id === selectedPlan)?.cta || 'S\'abonner')}
            {!isProcessing && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
