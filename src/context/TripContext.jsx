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
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      
      const driverIds = [...new Set((tripsData || []).map(t => t.driver_id).filter(Boolean))];
      let profilesById = new Map();
      
      if (driverIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, avatar_url, role, driver_status, is_driver_verified')
          .in('id', driverIds);
          
        if (!profilesError && profiles) {
          profilesById = new Map(profiles.map(p => [p.id, p]));
        }
      }
      
      const tripsDataMapped = tripsData ? tripsData.map(t => ({
        ...t,
        driver: profilesById.get(t.driver_id) || null,
        estimated_duration: t.rules?.estimated_duration || '2h 30m',
        rules_luggage: t.rules?.rules_luggage,
        rules_pets: t.rules?.rules_pets,
        rules_smoking: t.rules?.rules_smoking,
        waypoints: t.rules?.waypoints || [],
      })) : [];
      
      setTrips(tripsDataMapped.length > 0 ? tripsDataMapped : INITIAL_TRIPS);

      // Si l'utilisateur est connecté, charger ses réservations
      if (user) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });
        
        const bookingsMapped = (bookingsData || []).map(b => ({
          ...b,
          trip: tripsDataMapped.find(t => t.id === b.trip_id) || null
        }));
        setBookings(bookingsMapped);
      }
      
    } catch (err) {
      console.warn('Supabase not available, using fallback data:', err?.message || err);
      setTrips(INITIAL_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeTripUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      // Needs driver info, we might need to fetch it or ignore if we don't have it
      loadAllData(); 
    } else if (payload.eventType === 'UPDATE') {
      setTrips(current => current.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
    } else if (payload.eventType === 'DELETE') {
      setTrips(current => current.filter(t => t.id !== payload.old.id));
    }
  };

  const handleRealtimeBookingUpdate = (payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      loadAllData(); // Recharge avec les relations
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
        (Array.isArray(t.waypoints) && t.waypoints.some(wp => wp.toLowerCase().includes(destination.toLowerCase())));
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

  const publishTrip = async (tripData, driverUser) => {
    const isAllowed = driverUser?.role === 'admin' || driverUser?.role === 'driver';
    if (!isAllowed) {
      throw new Error("403 FORBIDDEN: Seuls les chauffeurs peuvent publier un trajet.");
    }
    
    // Pour l'interface (état local)
    const newTrip = {
      driver_id: driverUser.id,
      departure_city: tripData.departure_city,
      departure_address: tripData.departure_address,
      arrival_city: tripData.arrival_city,
      arrival_address: tripData.arrival_address,
      departure_datetime: tripData.departure_datetime,
      estimated_duration: tripData.estimated_duration || '2h 30m',
      seats_total: parseInt(tripData.seats_total, 10),
      seats_available: parseInt(tripData.seats_total, 10),
      price_per_seat: parseInt(tripData.price_per_seat, 10),
      rules_luggage: tripData.rules_luggage || 'Sacs ordinaires',
      rules_pets: !!tripData.rules_pets,
      rules_smoking: !!tripData.rules_smoking,
      waypoints: Array.isArray(tripData.waypoints) ? tripData.waypoints : [],
      cancellation_policy: tripData.cancellation_policy || 'Annulation gratuite jusqu\'à 24h avant le départ',
      status: 'scheduled'
    };

    // Pour Supabase (colonnes valides uniquement)
    const dbTrip = {
      driver_id: driverUser.id,
      departure_city: tripData.departure_city,
      departure_address: tripData.departure_address,
      arrival_city: tripData.arrival_city,
      arrival_address: tripData.arrival_address,
      departure_datetime: tripData.departure_datetime,
      seats_total: parseInt(tripData.seats_total, 10),
      seats_available: parseInt(tripData.seats_total, 10),
      price_per_seat: parseInt(tripData.price_per_seat, 10),
      cancellation_policy: tripData.cancellation_policy || 'Annulation gratuite jusqu\'à 24h avant le départ',
      status: 'scheduled',
      rules: {
        estimated_duration: tripData.estimated_duration || '2h 30m',
        rules_luggage: tripData.rules_luggage || 'Sacs ordinaires',
        rules_pets: !!tripData.rules_pets,
        rules_smoking: !!tripData.rules_smoking,
        waypoints: Array.isArray(tripData.waypoints) ? tripData.waypoints : []
      }
    };

    const isMockUser = !driverUser.id || typeof driverUser.id !== 'string' || driverUser.id.startsWith('usr-') || driverUser.id.startsWith('driver-') || driverUser.id.startsWith('demo-');

    if (!isSupabaseConfigured || isMockUser) {
      const mockNewTrip = {
        id: `trip-mock-${Date.now()}`,
        ...newTrip,
        driver: driverUser,
        created_at: new Date().toISOString()
      };
      setTrips([mockNewTrip, ...trips]);
      return mockNewTrip;
    }

    try {
      const { data, error } = await supabase.from('trips').insert([dbTrip]).select('*').single();
      if (error) {
        console.error("Supabase insert trip error:", error);
        alert(`Erreur de publication du trajet dans la base de données: ${error.message || JSON.stringify(error)}`);
        throw error;
      }
      
      const formattedData = {
        ...data,
        driver: driverUser,
        estimated_duration: data.rules?.estimated_duration || '2h 30m',
        rules_luggage: data.rules?.rules_luggage,
        rules_pets: data.rules?.rules_pets,
        rules_smoking: data.rules?.rules_smoking,
        waypoints: data.rules?.waypoints || [],
      };
      
      setTrips([formattedData, ...trips]);
      return formattedData;
    } catch (err) {
      console.warn("Supabase insert trip fallback failed:", err?.message || err);
      throw err;
    }
  };

  const updateTrip = async (tripId, tripData, user) => {
    try {
      const { data, error } = await supabase.from('trips').update(tripData).eq('id', tripId).eq('driver_id', user.id).select('*').single();
      if (error) throw error;
      const existingDriver = trips.find(t => t.id === tripId)?.driver;
      const formattedData = { ...data, driver: existingDriver };
      setTrips(trips.map(t => t.id === tripId ? formattedData : t));
      return formattedData;
    } catch (err) {
      console.warn("Supabase update trip fallback:", err?.message || err);
      const updatedTrip = { ...trips.find(t => t.id === tripId), ...tripData };
      setTrips(trips.map(t => t.id === tripId ? updatedTrip : t));
      return updatedTrip;
    }
  };

  const deleteTrip = async (tripId, user) => {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId).eq('driver_id', user.id);
      if (error) throw error;
      setTrips(trips.filter(t => t.id !== tripId));
      return true;
    } catch (err) {
      console.warn("Supabase delete trip fallback:", err?.message || err);
      setTrips(trips.filter(t => t.id !== tripId));
      return true;
    }
  };

  const cancelTrip = async (tripId, user) => {
    try {
      const { data, error } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', tripId).eq('driver_id', user.id).select('*').single();
      if (error) throw error;
      
      // Annulation des réservations en cascade (idéalement via trigger DB)
      await supabase.from('bookings').update({ status: 'rejected', rejection_reason: 'trip_cancelled' }).eq('trip_id', tripId).in('status', ['pending', 'accepted']);
      
      loadAllData(); // Refresh everything
      
      const existingDriver = trips.find(t => t.id === tripId)?.driver;
      return { ...data, driver: existingDriver };
    } catch (err) {
      console.warn("Supabase cancel trip fallback:", err?.message || err);
      const updatedTrip = { ...trips.find(t => t.id === tripId), status: 'cancelled' };
      setTrips(trips.map(t => t.id === tripId ? updatedTrip : t));
      return updatedTrip;
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
      setBookings(prev => [newBooking, ...prev]);
      // Envoi du SMS de confirmation au passager via Afrotools
      sendSmsNotification({
        to: passengerPhone,
        message: `DEMANDOO: Votre demande de réservation pour le trajet ${trip.departure_city} - ${trip.arrival_city} a été reçue.`
      });
      return newBooking;
    }

    try {
      const { data, error } = await supabase.from('bookings').insert([supabasePayload]).select('*').single();
      if (error) throw error;
      setBookings(prev => [{ ...data, trip: trips.find(t => t.id === tripId) }, ...prev]);
      sendSmsNotification({
        to: passengerPhone,
        message: `DEMANDOO: Votre demande de réservation pour le trajet ${trip.departure_city} - ${trip.arrival_city} a été reçue.`
      });
      return data;
    } catch (err) {
      console.warn("Supabase booking insert fallback:", err.message);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    }
  };

  const acceptBooking = async (bookingId, driverUser) => {
    if (!isSupabaseConfigured) {
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: 'accepted' };
        }
        return b;
      }));
      const bk = bookings.find(b => b.id === bookingId);
      if (bk) {
        sendSmsNotification({
          to: bk.passenger_phone,
          message: `DEMANDOO: Votre réservation pour ${bk.trip?.arrival_city || 'votre trajet'} a été confirmée par le chauffeur !`
        });
      }
      return { id: bookingId, status: 'accepted' };
    }

    try {
      const { data: booking, error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', bookingId).select('*').single();
      if (error) throw error;
      
      const trip = trips.find(t => t.id === booking.trip_id);
      if (trip && trip.driver_id === driverUser.id) {
         await supabase.from('trips').update({ seats_available: Math.max(0, trip.seats_available - booking.seats_booked) }).eq('id', trip.id);
         loadAllData();
      }
      return booking;
    } catch (err) {
      console.warn("Supabase accept booking fallback:", err?.message || err);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'accepted' } : b));
      return { id: bookingId, status: 'accepted' };
    }
  };

  const rejectBooking = async (bookingId, driverUser) => {
    if (!isSupabaseConfigured) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
      return { id: bookingId, status: 'rejected' };
    }

    try {
      const { data: booking, error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId).select('*').single();
      if (error) throw error;
      loadAllData();
      return booking;
    } catch (err) {
      console.warn("Supabase reject booking fallback:", err?.message || err);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
      return { id: bookingId, status: 'rejected' };
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
