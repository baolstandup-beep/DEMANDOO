import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_TRIPS, INITIAL_DRIVERS } from '../lib/mockData';
import { useAuth } from './AuthContext';

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
        .select(`*, driver:driver_id(*)`)
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;
      setTrips(tripsData && tripsData.length > 0 ? tripsData : INITIAL_TRIPS);

      // Si l'utilisateur est connecté, charger ses réservations
      if (user) {
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`*, trip:trip_id(*)`)
          .or(`passenger_id.eq.${user.id},trip.driver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
        
        setBookings(bookingsData || []);
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
      if (departure && !t.departure_city.toLowerCase().includes(departure.toLowerCase())) return false;
      if (destination && !t.arrival_city.toLowerCase().includes(destination.toLowerCase())) return false;
      if (date) {
        const tripDate = t.departure_datetime.split('T')[0];
        if (tripDate !== date) return false;
      }
      if (maxPrice && t.price_per_seat > maxPrice) return false;
      return true;
    });
  };

  const getTripById = (id) => trips.find(t => t.id === id) || null;

  const publishTrip = async (tripData, driverUser) => {
    if (driverUser.role !== 'driver' || driverUser.driver_status !== 'VERIFIED' || !driverUser.is_driver_active) {
      throw new Error("403 FORBIDDEN: Seuls les chauffeurs vérifiés peuvent publier un trajet.");
    }
    
    // Le contrôle du quota est théoriquement fait par RLS sur Supabase
    
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
      cancellation_policy: tripData.cancellation_policy || 'Annulation gratuite jusqu\'à 24h avant le départ',
      status: 'scheduled'
    };

    const { data, error } = await supabase.from('trips').insert([newTrip]).select('*, driver:driver_id(*)').single();
    if (error) throw error;
    
    setTrips([data, ...trips]);
    return data;
  };

  const updateTrip = async (tripId, tripData, user) => {
    const { data, error } = await supabase.from('trips').update(tripData).eq('id', tripId).eq('driver_id', user.id).select('*, driver:driver_id(*)').single();
    if (error) throw error;
    setTrips(trips.map(t => t.id === tripId ? data : t));
    return data;
  };

  const deleteTrip = async (tripId, user) => {
    const { error } = await supabase.from('trips').delete().eq('id', tripId).eq('driver_id', user.id);
    if (error) throw error;
    setTrips(trips.filter(t => t.id !== tripId));
    return true;
  };

  const cancelTrip = async (tripId, user) => {
    const { data, error } = await supabase.from('trips').update({ status: 'cancelled' }).eq('id', tripId).eq('driver_id', user.id).select('*, driver:driver_id(*)').single();
    if (error) throw error;
    
    // Annulation des réservations en cascade (idéalement via trigger DB)
    await supabase.from('bookings').update({ status: 'rejected', rejection_reason: 'trip_cancelled' }).eq('trip_id', tripId).in('status', ['pending', 'accepted']);
    
    loadAllData(); // Refresh everything
    return data;
  };

  const createBooking = async ({ tripId, passengerUser, passengerInfo, seatsCount, pickupPoint }) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trajet non trouvé");

    const passengerName = passengerInfo ? `${passengerInfo.firstName} ${passengerInfo.lastName}` : passengerUser.full_name;
    const passengerPhone = passengerInfo ? passengerInfo.phone : (passengerUser.phone || 'N/A');
    const passengerAddress = passengerInfo ? passengerInfo.address : '';

    const newBooking = {
      trip_id: tripId,
      passenger_id: passengerUser.id,
      passenger_name: passengerName,
      passenger_phone: passengerPhone, 
      passenger_address: passengerAddress,
      seats_booked: seatsCount,
      total_price: trip.price_per_seat * seatsCount,
      pickup_point: pickupPoint || passengerAddress || trip.departure_address,
      status: 'pending'
    };

    const { data, error } = await supabase.from('bookings').insert([newBooking]).select('*, trip:trip_id(*)').single();
    if (error) throw error;
    
    setBookings([data, ...bookings]);
    return data;
  };

  const acceptBooking = async (bookingId, driverUser) => {
    const { data: booking, error } = await supabase.from('bookings').update({ status: 'accepted' }).eq('id', bookingId).select('*, trip:trip_id(*)').single();
    if (error) throw error;
    
    const trip = booking.trip;
    if (trip && trip.driver_id === driverUser.id) {
       await supabase.from('trips').update({ seats_available: Math.max(0, trip.seats_available - booking.seats_booked) }).eq('id', trip.id);
       loadAllData();
    }
    return booking;
  };

  const rejectBooking = async (bookingId, driverUser) => {
    const { data: booking, error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId).select('*, trip:trip_id(*)').single();
    if (error) throw error;
    loadAllData();
    return booking;
  };

  // Remaining stubs for now
  const submitDriverVerification = () => {};
  const reviewDriverVerification = () => {};
  const addReview = () => {};
  const createSearchAlert = () => {};

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
