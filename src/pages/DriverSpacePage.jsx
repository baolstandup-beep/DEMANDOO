import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { useNotifications } from '../context/NotificationContext';

// Import New Modular Components
import { DriverHeader } from '../components/driver/DriverHeader';
import { DriverNavigation } from '../components/driver/DriverNavigation';
import { SubscriptionCard } from '../components/driver/SubscriptionCard';
import { TripQuotaProgress } from '../components/driver/TripQuotaProgress';
import { DriverStats } from '../components/driver/DriverStats';
import { NextTripCard } from '../components/driver/NextTripCard';
import { RecentRequests } from '../components/driver/RecentRequests';

// We import some icons for tabs that might need it if we put them inline, but navigation is extracted.
import { Car, Ticket, AlertCircle } from 'lucide-react';
import { RequestCard } from '../components/driver/RequestCard';

export const DriverSpacePage = () => {
  const { user } = useAuth();
  const { trips, bookings, acceptBooking, rejectBooking, cancelTrip } = useTrips();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'passenger') {
      navigate('/');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard'); 

  // Derived State
  const driverTrips = trips.filter(t => t.driver_id === user?.id || t.driver?.id === user?.id);
  const driverTripIds = driverTrips.map(t => t.id);
  const driverBookings = bookings.filter(b => driverTripIds.includes(b.trip_id));
  
  // Pending Requests count
  const pendingRequestsCount = driverBookings.filter(b => b.status === 'pending').length;

  // Stats
  const publishedTripsThisMonth = user?.subscription_trips_used || 0;
  const offeredSeats = driverTrips.reduce((sum, t) => sum + (t.seats_total || 0), 0);
  const receivedBookings = driverBookings.length;
  
  // Confirmed bookings count
  const acceptedBookings = driverBookings.filter(b => ['accepted', 'completed'].includes(b.status));
  const acceptedBookingsCount = acceptedBookings.length;

  // Next Trip
  const nextTrip = driverTrips.find(t => t.status === 'scheduled') || driverTrips[0];
  
  // Access & Security Logic
  const isPending = user?.driver_status === 'PENDING' || user?.driver_status === 'INCOMPLETE';
  const isRejected = user?.driver_status === 'REJECTED';
  const isVerified = user?.driver_status === 'VERIFIED';
  
  const hasActiveSub = user?.subscription_status === 'active' || user?.subscription_status === 'trial';
  const limitReached = user?.subscription_trip_limit !== null && (user?.subscription_trips_used || 0) >= user?.subscription_trip_limit;

  const canPublish = isVerified && hasActiveSub && !limitReached;

  // Handlers
  const handleAccept = (bookingId) => {
    try {
      acceptBooking(bookingId, user);
      addNotification({ title: "Réservation acceptée", message: "Le passager a été notifié.", type: "success" });
    } catch (err) {
      addNotification({ title: "Erreur", message: err.message, type: "error" });
    }
  };

  const handleReject = (bookingId) => {
    try {
      rejectBooking(bookingId, user);
      addNotification({ title: "Réservation refusée", message: "Le passager a été notifié.", type: "info" });
    } catch (err) {
      addNotification({ title: "Erreur", message: err.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">
      
      {/* 1. HEADER */}
      <DriverHeader 
        user={user} 
        isVerified={isVerified} 
        canPublish={canPublish} 
      />

      {/* 2. NAVIGATION */}
      <DriverNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingRequestsCount={pendingRequestsCount} 
      />

      {/* 3. MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* =========================================
            TAB: DASHBOARD 
            ========================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Warning block if not verified */}
            {!isVerified && (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-rose-900">
                    Votre profil chauffeur doit être vérifié avant de pouvoir publier.
                  </h4>
                  <p className="text-xs text-rose-700 font-medium mt-1">
                    Même avec un abonnement actif, la vérification KYC est obligatoire pour la sécurité des passagers.
                  </p>
                </div>
              </div>
            )}

            {/* Subscription & Quota Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubscriptionCard user={user} hasActiveSub={hasActiveSub} />
              {hasActiveSub && (
                <TripQuotaProgress 
                  limit={user.subscription_trip_limit} 
                  used={publishedTripsThisMonth} 
                  limitReached={limitReached} 
                />
              )}
            </div>

            {/* Stats */}
            <DriverStats 
              publishedTripsThisMonth={publishedTripsThisMonth}
              limit={user?.subscription_trip_limit}
              receivedBookings={receivedBookings}
              offeredSeats={offeredSeats}
              acceptedBookingsCount={acceptedBookingsCount}
            />

            {/* Next Trip & Recent Requests Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              <div className="lg:col-span-7 space-y-6">
                <NextTripCard nextTrip={nextTrip} canPublish={canPublish} cancelTrip={cancelTrip} />
              </div>
              
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-lg font-black text-slate-900">Demandes récentes</h3>
                <RecentRequests 
                  bookings={driverBookings} 
                  onAccept={handleAccept} 
                  onReject={handleReject} 
                  driverName={user?.full_name} 
                  tripId={nextTrip?.id} 
                />
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            TAB: MES DEMANDES
            ========================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 font-medium flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p>
                <strong>Le paiement du trajet s'effectue directement avec le chauffeur.</strong> Demandoo facilite uniquement la mise en relation. Vous êtes responsable du recouvrement du montant.
              </p>
            </div>

            {driverBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900">Aucune demande reçue</h3>
                <p className="text-sm text-slate-500 mt-2">Vous n'avez pas encore de demandes de réservation pour vos trajets.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {driverBookings.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(b => (
                  <RequestCard 
                    key={b.id} 
                    booking={b} 
                    onAccept={handleAccept} 
                    onReject={handleReject} 
                    driverName={user?.full_name} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            TAB: MES TRAJETS
            ========================================= */}
        {activeTab === 'trips' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {driverTrips.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900">Aucun trajet publié</h3>
                <p className="text-sm text-slate-500 mt-2">Vous n'avez pas encore publié de trajet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {driverTrips.sort((a,b) => new Date(b.departure_datetime) - new Date(a.departure_datetime)).map(t => {
                  const tBookings = driverBookings.filter(b => b.trip_id === t.id && b.status === 'accepted');
                  const seatsReserved = tBookings.reduce((acc, curr) => acc + curr.seats_booked, 0);

                  return (
                    <div key={t.id} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-100 hover:border-demandoo-200 transition-colors">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <h3 className="text-base font-black text-slate-900">
                          {t.departure_city} → {t.arrival_city}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                          ${t.status === 'scheduled' ? 'bg-demandoo-100 text-demandoo-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {t.status === 'scheduled' ? 'Programmé' : 'Terminé'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Date & Heure</span>
                          <span className="font-bold text-slate-700">
                            {new Date(t.departure_datetime).toLocaleDateString('fr-FR')} {new Date(t.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Prix / place</span>
                          <span className="font-bold text-slate-700">{t.price_per_seat.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Dispo</span>
                          <span className="font-bold text-emerald-600">{t.seats_available} / {t.seats_total}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Réservées</span>
                          <span className="font-bold text-slate-700">{seatsReserved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* =========================================
            TAB: ABONNEMENT
            ========================================= */}
        {activeTab === 'subscription' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <SubscriptionCard user={user} hasActiveSub={hasActiveSub} />
            {hasActiveSub && (
              <TripQuotaProgress 
                limit={user.subscription_trip_limit} 
                used={publishedTripsThisMonth} 
                limitReached={limitReached} 
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
};
