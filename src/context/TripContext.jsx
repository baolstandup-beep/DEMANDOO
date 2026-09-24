import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_TRIPS, INITIAL_DRIVERS } from '../lib/mockData';
import { useAuth } from './AuthContext';
import { sendSmsNotification } from '../services/afrotoolsService';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [reviews, setReviews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [searchAlerts, setSearchAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
    
    if (!isSupabaseConfigured) return;

    // Subscribe to realtime changes
    const channel = supabase.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, payload => {
        handleRealtimeTripUpdate(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        handleRealtimeBookingUpdate(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAllData = async () => {
    if (!isSupabaseConfigured) {
      setTrips(INITIAL_TRIPS);
      setDrivers(INITIAL_DRIVERS);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Récupération des trajets réels
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error("[DEMANDOO] Erreur chargement trips:", tripsError);
        throw tripsError;
      }

      let hydratedTrips = tripsData || [];

      // 2. Hydratation séparée des profils conducteurs (Stratégie robuste SANS jointure PostgREST)
      if (hydratedTrips.length > 0) {
        const driverIds = [...new Set(hydratedTrips.map(t => t.driver_id).filter(Boolean))];
        if (driverIds.length > 0) {
          try {
            const { data: profilesData, error: profError } = await supabase
              .from('profiles')
              .select('*')
              .in('id', driverIds);

            if (!profError && profilesData) {
              const profileMap = new Map(profilesData.map(p => [p.id, p]));
              hydratedTrips = hydratedTrips.map(t => ({
                ...t,
                driver: profileMap.get(t.driver_id) || {
                  id: t.driver_id,
                  full_name: 'Chauffeur Demandoo',
                  role: 'driver',
                  driver_status: 'VERIFIED',
                  rating: 5.0,
                  total_trips: 1
                }
              }));
            }
          } catch (pErr) {
            console.warn("[DEMANDOO] Chargement profils conducteurs non-bloquant:", pErr);
          }
        }
      }

      setTrips(hydratedTrips);

      // 3. Charger les réservations si connecté
      if (user) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });
        
        setBookings(bookingsData || []);
      }
      
    } catch (err) {
      console.error('[DEMANDOO] Erreur lors du chargement des données Supabase:', err?.message || err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeTripUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      loadAllData(); 
    } else if (payload.eventType === 'UPDATE') {
      setTrips(current => current.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
    } else if (payload.eventType === 'DELETE') {
      setTrips(current => current.filter(t => t.id !== payload.old.id));
    }
  };

  const handleRealtimeBookingUpdate = (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      loadAllData();
    }
  };

  const getPlatformStats = () => {
    return {
      totalTrips: trips.length,
      verifiedDrivers: 0,
      totalBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length,
      avgRating: "5.0",
      hasData: trips.length > 0
    };
  };

  const searchTrips = ({ departure = '', destination = '', date = '', passengers = 1, verifiedOnly = false, maxPrice = null }) => {
    return trips.filter(t => {
      if (t.status !== 'scheduled') return false;
      if (t.seats_available < passengers) return false;
      
      const depMatch = !departure || (t.departure_city || '').toLowerCase().includes(departure.toLowerCase());
      if (!depMatch) return false;

      // Correspondance arrivée OU étape intermédiaire
      const arrMatch = !destination || 
        (t.arrival_city || '').toLowerCase().includes(destination.toLowerCase()) ||
        (Array.isArray(t.waypoints) && t.waypoints.some(wp => typeof wp === 'string' && wp.toLowerCase().includes(destination.toLowerCase())));
      if (!arrMatch) return false;

      if (date) {
        const tripDate = (t.departure_datetime || '').split('T')[0];
        if (tripDate !== date) return false;
      }
      if (maxPrice && t.price_per_seat > maxPrice) return false;
      return true;
    });
  };

  const getTripById = (id) => trips.find(t => t.id === id) || null;

  const publishTrip = async (tripData, fallbackUser = null) => {
    console.log("[DEMANDOO] 🚀 Début du processus de publication...");

    // 1. SOURCE DE VÉRITÉ : SUPABASE AUTH SESSION
    let authUser = null;
    let session = null;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      session = sessionData?.session;
      console.log("[DEMANDOO] SESSION:", session, sessionError);
      if (session?.user) {
        authUser = session.user;
      }
    } catch (sErr) {
      console.warn("[DEMANDOO] Session check warning:", sErr);
    }

    if (!authUser) {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log("[DEMANDOO] USER:", userData?.user, userError);
        if (userData?.user) {
          authUser = userData.user;
        }
      } catch (uErr) {
        console.warn("[DEMANDOO] User check warning:", uErr);
      }
    }

    // Fallback contextuel uniquement si user authentifié valide avec un id UUID
    if (!authUser && fallbackUser?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fallbackUser.id)) {
      authUser = fallbackUser;
    }

    // Traitement séparé : AUTH_USER_MISSING
    if (!authUser) {
      console.error("[DEMANDOO] AUTH_USER_MISSING — Aucun utilisateur connecté dans Supabase Auth");
      throw new Error("Utilisateur non connecté. Veuillez vous connecter pour publier.");
    }

    console.log("[DEMANDOO] Chauffeur authentifié validé:", authUser.id);

    // 2. RÉCUPÉRATION / AUTO-GUÉRISON DU PROFIL CONDUCTEUR (profiles.id = auth.users.id)
    let driverProfile = null;
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log("[DEMANDOO] DRIVER Profile récupéré:", existingProfile, profileError);
      driverProfile = existingProfile;
    } catch (profFetchErr) {
      console.error("[DEMANDOO] Erreur requête profil:", profFetchErr);
    }

    // Si le profil n'existe pas encore dans public.profiles (ex: inscription récente), on le crée
    if (!driverProfile) {
      console.warn("[DEMANDOO] Profil inexistant dans public.profiles pour l'id:", authUser.id, "— création automatique...");
      const profileToCreate = {
        id: authUser.id,
        email: authUser.email || null,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Chauffeur Demandoo',
        phone: authUser.user_metadata?.phone || null,
        role: 'driver',
        driver_status: 'VERIFIED'
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileToCreate)
        .select()
        .single();

      if (createError) {
        console.error("[DEMANDOO] DRIVER_PROFILE_MISSING — Échec création profil:", createError);
        throw new Error("Profil chauffeur introuvable.");
      }
      driverProfile = createdProfile;
    }

    console.log("[DEMANDOO] DRIVER:", driverProfile);

    // 3. VALIDATION PRÉCISE DU FORMULAIRE
    const depCity = typeof tripData.departureCity === 'string' ? tripData.departureCity.trim() : (tripData.departure_city || '').trim();
    const arrCity = typeof tripData.arrivalCity === 'string' ? tripData.arrivalCity.trim() : (tripData.arrival_city || '').trim();
    const depAddress = (tripData.departureAddress || tripData.departure_address || '').trim();
    const arrAddress = (tripData.arrivalAddress || tripData.arrival_address || arrCity || 'Centre-ville').trim();
    const tripDate = tripData.date || (tripData.departure_datetime ? tripData.departure_datetime.split('T')[0] : '');
    const tripTime = tripData.time || (tripData.departure_datetime ? tripData.departure_datetime.split('T')[1]?.substring(0, 5) : '08:00') || '08:00';

    if (!depCity) throw new Error("La ville de départ est obligatoire.");
    if (!arrCity) throw new Error("La ville d'arrivée est obligatoire.");
    if (!depAddress) throw new Error("Le point de départ est obligatoire (ex: Gare Routière de " + depCity + ").");
    if (!tripDate) throw new Error("La date du trajet est obligatoire.");

    const departureDatetime = new Date(`${tripDate}T${tripTime}`).toISOString();

    // 4. CONSTRUCTION DU PAYLOAD (Strictement conforme au schéma confirmé public.trips)
    const payload = {
      driver_id: driverProfile.id,
      departure_city: depCity,
      departure_address: depAddress,
      arrival_city: arrCity,
      arrival_address: arrAddress,
      departure_datetime: departureDatetime,
      estimated_duration: tripData.estimatedDuration || tripData.estimated_duration || '2h 30m',
      seats_total: parseInt(tripData.seatsTotal || tripData.seats_total, 10) || 4,
      seats_available: parseInt(tripData.seatsTotal || tripData.seats_total, 10) || 4,
      price_per_seat: parseInt(tripData.pricePerSeat || tripData.price_per_seat, 10) || 3500,
      rules_luggage: tripData.rulesLuggage || tripData.rules_luggage || 'Bagages standards acceptés',
      rules_pets: Boolean(tripData.rulesPets ?? tripData.rules_pets),
      rules_smoking: Boolean(tripData.rulesSmoking ?? tripData.rules_smoking),
      cancellation_policy: tripData.cancellationPolicy || tripData.cancellation_policy || 'Annulation gratuite jusqu\'à 24h avant le départ',
      waypoints: Array.isArray(tripData.waypoints) ? tripData.waypoints.filter(Boolean) : [],
      status: 'scheduled' // Conforme à CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled'))
    };

    console.log("[DEMANDOO] FORM:", tripData);
    console.log("[DEMANDOO] PAYLOAD:", payload);

    if (!isSupabaseConfigured) {
      throw new Error("Configuration Supabase manquante.");
    }

    // 5. INSERT SUPABASE MINIMAL SANS AUCUNE JOINTURE
    const { data: insertedData, error: insertError } = await supabase
      .from('trips')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error("[DEMANDOO] INSERT ERROR:", insertError);
      throw insertError;
    }

    console.log("[DEMANDOO] INSERT DATA:", insertedData);

    // 6. ENRICHISSEMENT IMMÉDIAT EN MÉMOIRE
    const enrichedTrip = {
      ...insertedData,
      driver: driverProfile
    };

    // 7. RAFRAÎCHISSEMENT IMMÉDIAT SANS DÉCONNEXION
    setTrips(prev => [enrichedTrip, ...prev.filter(t => t.id !== insertedData.id)]);

    // Rafraîchir l'arrière-plan de manière asynchrone
    loadAllData().catch(e => console.warn("[DEMANDOO] Refresh background non-bloquant:", e));

    return enrichedTrip;
  };

  const updateTrip = async (tripId, tripData, user) => {
    try {
      const { data: updateData, error } = await supabase.from('trips').update(tripData).eq('id', tripId).eq('driver_id', user.id).select().single();
      if (error) throw error;

      let finalTrip = updateData;
      try {
        const { data: joinedTrip } = await supabase.from('trips').select('*, driver:profiles(*)').eq('id', tripId).single();
        if (joinedTrip) finalTrip = joinedTrip;
      } catch (joinErr) {
        console.warn("Impossible de joindre le profil chauffeur (non-bloquant):", joinErr);
      }

      setTrips(trips.map(t => t.id === tripId ? finalTrip : t));
      return finalTrip;
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err?.message || err);
      throw err;
    }
  };

  const deleteTrip = async (tripId, user) => {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId).eq('driver_id', user.id);
      if (error) throw error;
      setTrips(trips.filter(t => t.id !== tripId));
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression :", err?.message || err);
      throw err;
    }
  };

  const cancelTrip = async (tripId, user) => {
    try {
      const { data: updateData, error } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', tripId).eq('driver_id', user.id).select().single();
      if (error) throw error;
      
      let finalTrip = updateData;
      try {
        const { data: joinedTrip } = await supabase.from('trips').select('*, driver:profiles(*)').eq('id', tripId).single();
        if (joinedTrip) finalTrip = joinedTrip;
      } catch (joinErr) {
        console.warn("Impossible de joindre le profil chauffeur (non-bloquant):", joinErr);
      }
      
      // Annulation des réservations en cascade (idéalement via trigger DB)
      await supabase.from('bookings').update({ status: 'rejected', rejection_reason: 'trip_cancelled' }).eq('trip_id', tripId).in('status', ['pending', 'accepted']);
      
      loadAllData(); // Refresh everything
      return finalTrip;
    } catch (err) {
      console.error("Erreur lors de l'annulation :", err?.message || err);
      throw err;
    }
  };

  const createBooking = async ({ tripId, passengerUser, passengerInfo, seatsCount, pickupPoint }) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trajet non trouvé");

    const passengerName = passengerInfo ? `${passengerInfo.firstName} ${passengerInfo.lastName}` : (passengerUser?.full_name || 'Passager');
    const passengerPhone = passengerInfo ? passengerInfo.phone : (passengerUser?.phone || '+221 77 000 00 00');
    const passengerAddress = passengerInfo ? passengerInfo.address : '';

    const localId = `bk_${Date.now()}`;
    const newBooking = {
      id: localId,
      trip_id: tripId,
      trip: trip,
      passenger_id: passengerUser ? passengerUser.id : 'guest',
      passenger_name: passengerName,
      passenger_phone: passengerPhone, 
      passenger_address: passengerAddress,
      seats_booked: seatsCount,
      total_price: trip.price_per_seat * seatsCount,
      pickup_point: pickupPoint || passengerAddress || trip.departure_address,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Données à insérer dans Supabase (sans id local ni objet trip imbriqué)
    const supabasePayload = {
      trip_id: tripId,
      passenger_id: passengerUser ? passengerUser.id : null,
      passenger_name: passengerName,
      passenger_phone: passengerPhone,
      passenger_address: passengerAddress,
      seats_booked: seatsCount,
      total_price: trip.price_per_seat * seatsCount,
      pickup_point: pickupPoint || passengerAddress || trip.departure_address,
      status: 'pending'
    };

    if (!isSupabaseConfigured) {
      throw new Error("Erreur de configuration Supabase.");
    }

    try {
      const { data: insertData, error: insertError } = await supabase.from('bookings').insert([supabasePayload]).select().single();
      if (insertError) {
        console.error('[DEMANDOO SUPABASE]', insertError);
        throw insertError;
      }
      
      let finalBooking = insertData;
      try {
        const { data: joinedBooking } = await supabase.from('bookings').select('*, trip:trips(*)').eq('id', insertData.id).single();
        if (joinedBooking) finalBooking = joinedBooking;
      } catch (joinErr) {
        console.warn("Impossible de joindre le trajet (non-bloquant):", joinErr);
      }
      
      setBookings(prev => [finalBooking, ...prev]);
      sendSmsNotification({
        to: passengerPhone,
        message: `DEMANDOO: Votre demande de réservation pour le trajet ${trip.departure_city} - ${trip.arrival_city} a été reçue.`
      });
      return finalBooking;
    } catch (err) {
      console.error('[DEMANDOO SUPABASE]', err);
      throw err;
    }
  };

  const acceptBooking = async (bookingId, driverUser) => {
    if (!isSupabaseConfigured) {
      throw new Error("Erreur de configuration Supabase.");
    }

    try {
      const { data: updateData, error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', bookingId).select().single();
      if (error) {
        console.error('[DEMANDOO SUPABASE]', error);
        throw error;
      }
      
      let finalBooking = updateData;
      try {
        const { data: joinedBooking } = await supabase.from('bookings').select('*, trip:trips(*)').eq('id', bookingId).single();
        if (joinedBooking) finalBooking = joinedBooking;
      } catch (joinErr) {
        console.warn("Impossible de joindre le trajet (non-bloquant):", joinErr);
      }
      
      const trip = finalBooking.trip || trips.find(t => t.id === finalBooking.trip_id);
      if (trip && trip.driver_id === driverUser.id) {
         await supabase.from('trips').update({ seats_available: Math.max(0, trip.seats_available - finalBooking.seats_booked) }).eq('id', trip.id);
         loadAllData();
      }
      return finalBooking;
    } catch (err) {
      console.error('[DEMANDOO SUPABASE]', err);
      throw err;
    }
  };

  const rejectBooking = async (bookingId, driverUser) => {
    if (!isSupabaseConfigured) {
      throw new Error("Erreur de configuration Supabase.");
    }

    try {
      const { data: updateData, error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId).select().single();
      if (error) {
        console.error('[DEMANDOO SUPABASE]', error);
        throw error;
      }
      
      let finalBooking = updateData;
      try {
        const { data: joinedBooking } = await supabase.from('bookings').select('*, trip:trips(*)').eq('id', bookingId).single();
        if (joinedBooking) finalBooking = joinedBooking;
      } catch (joinErr) {
        console.warn("Impossible de joindre le trajet (non-bloquant):", joinErr);
      }
      
      loadAllData();
      return finalBooking;
    } catch (err) {
      console.error('[DEMANDOO SUPABASE]', err);
      throw err;
    }
  };

  // Remaining stubs for now
  const submitDriverVerification = async (userId, data) => {
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', userId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn("Failed submitDriverVerification:", err);
      return { success: false, error: err };
    }
  };

  const reviewDriverVerification = async (driverId, status) => {
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.from('profiles').update({ driver_status: status, kyc_status: status === 'VERIFIED' ? 'verified' : 'rejected' }).eq('id', driverId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn("Failed reviewDriverVerification:", err);
      return { success: false, error: err };
    }
  };

  const addReview = async (reviewData) => {
    if (!isSupabaseConfigured) {
      const newReview = { id: Date.now().toString(), ...reviewData, created_at: new Date().toISOString() };
      setReviews(prev => [newReview, ...prev]);
      return { success: true, data: newReview };
    }
    try {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select().single();
      if (error) throw error;
      setReviews(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      console.warn("Failed addReview:", err);
      return { success: false, error: err };
    }
  };

  const createSearchAlert = (alertData) => {
    const newAlert = { id: Date.now().toString(), ...alertData, created_at: new Date().toISOString() };
    setSearchAlerts(prev => {
      const updated = [newAlert, ...prev];
      localStorage.setItem('demandoo_search_alerts', JSON.stringify(updated));
      return updated;
    });
    return { success: true, alert: newAlert };
  };

  return (
    <TripContext.Provider value={{
      trips,
      bookings,
      payments,
      verifications,
      drivers,
      reviews,
      partners,
      searchAlerts,
      loading,
      getPlatformStats,
      searchTrips,
      getTripById,
      publishTrip,
      updateTrip,
      deleteTrip,
      cancelTrip,
      createBooking,
      acceptBooking,
      rejectBooking,
      submitDriverVerification,
      reviewDriverVerification,
      addReview,
      createSearchAlert
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => useContext(TripContext);
