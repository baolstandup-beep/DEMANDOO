import { createClient } from '@supabase/supabase-js';
import { INITIAL_TRIPS, INITIAL_DRIVERS, INITIAL_PARTNERS, INITIAL_NOTIFICATIONS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local Storage Keys
const STORAGE_KEYS = {
  TRIPS: 'demandoo_trips_v2',
  BOOKINGS: 'demandoo_bookings_v2',
  PAYMENTS: 'demandoo_payments_v2',
  DRIVERS: 'demandoo_drivers_v2',
  VERIFICATIONS: 'demandoo_verifications_v2',
  REVIEWS: 'demandoo_reviews_v2',
  NOTIFICATIONS: 'demandoo_notifications_v2',
  SEARCH_ALERTS: 'demandoo_search_alerts_v2',
  PARTNERS: 'demandoo_partners_v2',
  CURRENT_USER: 'demandoo_user_v2',
};

// Initialize Local Database Store if empty
export const initLocalDatabase = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(INITIAL_TRIPS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VERIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }
};

// Data access helpers
export const getLocalStore = (key) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key] || key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading local store:', e);
    return [];
  }
};

export const setLocalStore = (key, value) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing local store:', e);
  }
};
