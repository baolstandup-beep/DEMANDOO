import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useNotifications } from '../context/NotificationContext';
import { VerifiedDriverBadge } from '../components/common/Badge';
import { 
  LayoutDashboard, 
  Car, 
  PlusCircle, 
  Wallet, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  User, 
  Bell,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  MoreVertical
} from 'lucide-react';

export const DriverSpacePage = () => {
  const { user } = useAuth();
  const { trips, bookings, reviews } = useTrips();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'passenger') {
      navigate('/');
    } else if (user.driver_status !== 'VERIFIED' && user.role !== 'admin') {
      navigate('/verification-chauffeur');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [selectedTripState, setSelectedTripState] = useState({}); 
  const [payoutAmount, setPayoutAmount] = useState(15000);
  const [payoutProvider, setPayoutProvider] = useState('wave');
  const [payoutPhone, setPayoutPhone] = useState(user?.phone || '');
  const [payoutSuccess, setPayoutSuccess] = useState('');

  // Filter Driver Specific Data
  const driverTrips = trips.filter(t => t.driver_id === user?.id || t.driver?.id === user?.id);
  const driverTripIds = driverTrips.map(t => t.id);
  const driverBookings = bookings.filter(b => driverTripIds.includes(b.trip_id));
  const driverReviews = reviews.filter(r => r.reviewee_id === user?.id);

  // Next upcoming trip
  const nextTrip = driverTrips.find(t => t.status === 'scheduled') || driverTrips[0];
  const nextTripBookings = nextTrip ? driverBookings.filter(b => b.trip_id === nextTrip.id) : [];
  const confirmedPassengersCount = nextTripBookings.reduce((sum, b) => sum + (b.seats_booked || 1), 0);

  // Metrics
  const totalCompletedTrips = driverTrips.filter(t => (selectedTripState[t.id] || t.status) === 'completed').length;
  const totalSeatsSold = driverBookings.reduce((sum, b) => sum + (b.seats_booked || 1), 0);
  const totalGrossEarnings = driverBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const platformCommission = Math.round(totalGrossEarnings * 0.05); 
  const netAvailableEarnings = totalGrossEarnings - platformCommission;
  const avgRating = user?.rating || 5.0;
  const acceptanceRate = "98%";

  const handleTransitionTripState = (tripId, newState) => {
    setSelectedTripState(prev => ({ ...prev, [tripId]: newState }));
    
    let label = newState;
    if (newState === 'arrived') label = 'Vous êtes arrivé au point de rendez-vous';
    if (newState === 'in_progress') label = 'Le trajet a démarré';
    if (newState === 'completed') label = 'Trajet terminé avec succès';

    addNotification({
      title: `Trajet mis à jour`,
      message: label,
      type: "success"
    });
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    if (payoutAmount < 5000) {
      alert("Le montant minimum de retrait est de 5 000 FCFA.");
      return;
    }
    if (payoutAmount > netAvailableEarnings) {
      alert("Fonds insuffisants.");
      return;
    }

    setPayoutSuccess(`Retrait de ${payoutAmount.toLocaleString('fr-FR')} FCFA vers ${payoutProvider.toUpperCase()} initié.`);
    addNotification({
      title: "Demande de retrait initiée",
      message: `Vos fonds seront transférés sur votre compte sous peu.`,
      type: "success"
    });
  };

  const workflowSteps = [
    { id: 'scheduled', label: 'Programmé' },
    { id: 'arrived', label: 'Arrivé au RDV' },
    { id: 'in_progress', label: 'En cours' },
    { id: 'completed', label: 'Terminé' }
  ];

  const currentWorkflowIndex = nextTrip ? workflowSteps.findIndex(s => s.id === (selectedTripState[nextTrip.id] || nextTrip.status)) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-demandoo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-demandoo-500 to-emerald-400 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
                  alt={user?.full_name} 
                  className="w-20 h-20 rounded-full object-cover border-[3px] border-slate-900 relative z-10"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black text-demandoo-400 uppercase tracking-widest block">Espace Chauffeur</span>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bonjour, {user?.full_name?.split(' ')[0] || 'Ousmane'} 👋
                  </h1>
                  <VerifiedDriverBadge />
                </div>
                <p className="text-sm text-slate-400 font-medium">Prêt pour votre prochain voyage ?</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to={user?.subscription_status === 'active' || user?.subscription_status === 'trial' ? "/publier" : "/abonnement"} className="px-6 py-3.5 rounded-2xl text-sm font-black text-slate-900 bg-white hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Publier un trajet
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-8">
        
        {/* SUBSCRIPTION WIDGET */}
        {user?.subscription_status !== 'active' && user?.subscription_status !== 'trial' ? (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 shadow-lg text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">Abonnement Requis</h3>
                <p className="text-sm text-white/80 font-medium">Vous devez souscrire à un abonnement pour pouvoir publier des trajets.</p>
              </div>
            </div>
            <Link to="/abonnement" className="px-6 py-3 bg-white text-amber-600 rounded-2xl font-black text-sm whitespace-nowrap hover:bg-amber-50 transition-colors shadow-sm">
              Voir les plans
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${user.subscription_plan === 'pro' ? 'bg-slate-900 text-white' : 'bg-demandoo-100 text-demandoo-600'}`}>
                {user.subscription_plan === 'pro' ? <Star className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">
                    {user.subscription_plan === 'pro' ? 'CHAUFFEUR PRO' : user.subscription_plan === 'standard' ? 'CHAUFFEUR STANDARD' : 'ESSAI CHAUFFEUR'}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Actif</span>
                  {user.subscription_plan === 'pro' && (
                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">PRO</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {user.subscription_plan === 'pro' ? 'Trajets illimités' : user.subscription_plan === 'standard' ? '2 500 FCFA / mois' : '0 FCFA / 7 jours'}
                  {' • '}Renouvellement : {new Date(user.subscription_period_end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-1/3 flex flex-col gap-2">
              {user.subscription_trip_limit ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-600">Trajets utilisés</span>
                    <span className="font-black text-slate-900">{user.subscription_trips_used || 0} / {user.subscription_trip_limit}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${((user.subscription_trips_used || 0) / user.subscription_trip_limit) >= 1 ? 'bg-rose-500' : 'bg-demandoo-500'}`}
                      style={{ width: `${Math.min(100, ((user.subscription_trips_used || 0) / user.subscription_trip_limit) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-600">Trajets utilisés</span>
                  <span className="font-black text-slate-900 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Illimités</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              {user.subscription_plan !== 'pro' && (
                <Link to="/abonnement" className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-colors text-center">
                  Passer à Pro
                </Link>
              )}
              <Link to="/abonnement" className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-colors text-center">
                Gérer
              </Link>
            </div>
          </div>
        )}

        {/* 2. FLOATING KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Gains Disponibles</span>
            <div className="text-2xl font-black text-slate-900">{netAvailableEarnings.toLocaleString('fr-FR')} <span className="text-base text-slate-500">FCFA</span></div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Trajets Effectués</span>
            <div className="text-2xl font-black text-slate-900">{totalCompletedTrips}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{totalSeatsSold} places vendues</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Note Moyenne</span>
            <div className="text-2xl font-black text-slate-900">{avgRating}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{driverReviews.length} avis passagers</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">VÉRIFIÉ</span>
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Statut KYC</span>
            <div className="text-lg font-black text-slate-900 leading-tight">Identité<br/>Confirmée</div>
          </div>
        </div>

        {/* 3. MAIN DASHBOARD AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: NEXT TRIP & WORKFLOW (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Prochain Trajet</h2>
              <Link to="/mes-trajets" className="text-sm font-bold text-demandoo-600 hover:text-demandoo-700 flex items-center gap-1">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {nextTrip ? (
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Trip Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-1.5 bg-demandoo-50 text-demandoo-700 rounded-full text-xs font-black uppercase tracking-wider">
                      {selectedTripState[nextTrip.id] || nextTrip.status}
                    </span>
                    <button className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4 text-slate-400">
                        <MapPin className="w-5 h-5" />
                        <span className="text-xl sm:text-2xl font-black text-slate-900">{nextTrip.departure_city}</span>
                      </div>
                      <div className="pl-2 border-l-2 border-dashed border-slate-200 h-6 ml-2" />
                      <div className="flex items-center gap-4 text-demandoo-500">
                        <MapPin className="w-5 h-5 fill-current" />
                        <span className="text-xl sm:text-2xl font-black text-slate-900">{nextTrip.arrival_city}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-400 block mb-1">Départ prévu</span>
                      <div className="text-xl font-black text-slate-900 flex items-center justify-end gap-2">
                        <Clock className="w-5 h-5 text-slate-400" />
                        {new Date(nextTrip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-sm font-medium text-slate-500">
                        {new Date(nextTrip.departure_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Tracker */}
                <div className="p-6 sm:p-8 bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-900 mb-6">Suivi du trajet</h3>
                  <div className="relative flex justify-between">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
                    {/* Active Line */}
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-demandoo-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500" 
                      style={{ width: `${(currentWorkflowIndex / (workflowSteps.length - 1)) * 100}%` }}
                    />
                    
                    {workflowSteps.map((step, idx) => {
                      const isActive = idx <= currentWorkflowIndex;
                      const isCurrent = idx === currentWorkflowIndex;
                      
                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                          <button
                            onClick={() => handleTransitionTripState(nextTrip.id, step.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all shadow-sm
                              ${isActive 
                                ? 'bg-demandoo-500 border-white text-white' 
                                : 'bg-white border-slate-200 text-slate-300 hover:border-demandoo-300'
                              }
                              ${isCurrent ? 'ring-4 ring-demandoo-500/20 scale-110' : ''}
                            `}
                          >
                            {isActive ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />}
                          </button>
                          <span className={`text-xs font-bold hidden sm:block ${isActive ? 'text-demandoo-700' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Passengers */}
                <div className="p-6 sm:p-8 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900">Passagers confirmés</h3>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                      {confirmedPassengersCount} / {nextTrip.seats_total} places
                    </span>
                  </div>

                  <div className="space-y-3">
                    {nextTripBookings.length === 0 ? (
                      <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-sm font-medium text-slate-500">
                        Aucun passager n'a encore réservé.
                      </div>
                    ) : (
                      nextTripBookings.map(b => (
                        <div key={b.id} className="p-4 rounded-2xl border border-slate-100 hover:border-demandoo-200 transition-colors flex items-center justify-between bg-white group">
                          <div className="flex items-center gap-4">
                            <img src={b.passenger?.avatar_url || "https://i.pravatar.cc/150"} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                            <div>
                              <h5 className="font-black text-slate-900 text-sm">{b.passenger?.full_name || 'Passager'}</h5>
                              <p className="text-xs text-slate-500 font-medium">📍 {b.pickup_point || 'Point de RDV'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-demandoo-600 block">{b.seats_booked} place(s)</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{b.payment_status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Car className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Aucun trajet en vue</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm mx-auto">Publiez un trajet pour commencer à rentabiliser vos déplacements.</p>
                <Link to="/publier" className="inline-flex px-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-95 transition-all items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Publier maintenant
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT: CASHOUT WIDGET (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Portefeuille</h2>
            
            <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-demandoo-500/20 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Solde actuel</span>
                  <div className="text-3xl font-black tracking-tight">{netAvailableEarnings.toLocaleString('fr-FR')} <span className="text-xl text-slate-400">CFA</span></div>
                </div>

                {payoutSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-50">{payoutSuccess}</p>
                    <button onClick={() => setPayoutSuccess('')} className="text-xs font-bold text-emerald-300 hover:text-emerald-200">Nouveau retrait</button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestPayout} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Montant à retirer</label>
                      <input
                        type="number"
                        min={5000}
                        max={netAvailableEarnings}
                        step={1000}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg focus:outline-none focus:border-demandoo-500 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Méthode</label>
                      <select
                        value={payoutProvider}
                        onChange={(e) => setPayoutProvider(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-demandoo-500 focus:bg-white/10 transition-all appearance-none"
                      >
                        <option value="wave" className="text-slate-900">Wave Mobile Money</option>
                        <option value="orange_money" className="text-slate-900">Orange Money</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Numéro associé</label>
                      <input
                        type="tel"
                        value={payoutPhone}
                        onChange={(e) => setPayoutPhone(e.target.value)}
                        placeholder="+221 7X XXX XX XX"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-demandoo-500 focus:bg-white/10 transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl text-sm font-black text-slate-900 bg-white hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-5 h-5" />
                      Retirer les fonds
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Besoin d'aide ?</h4>
                <p className="text-xs text-slate-500 font-medium">Assistance 24/7 au <span className="font-bold text-slate-700">+221 33 800 00 00</span></p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
