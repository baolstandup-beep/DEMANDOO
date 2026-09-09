import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStore, setLocalStore, initLocalDatabase, supabase } from '../lib/supabase';

const AuthContext = createContext();

const DEFAULT_PASSENGER = {
  id: "usr-passenger-101",
  full_name: "Fatou Sow",
  email: "fatou.sow@demandoo.sn",
  phone: "+221 77 888 99 00",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  role: "passenger",
  is_phone_verified: true,
  is_identity_verified: true,
  is_driver_active: false,
  created_at: new Date().toISOString()
};

const DEFAULT_DRIVER = {
  id: "drv-001",
  full_name: "Modou Diop",
  email: "modou.diop@demandoo.sn",
  phone: "+221 77 450 12 34",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  role: "driver",
  is_phone_verified: true,
  is_identity_verified: true,
  is_driver_active: true,
  is_driver_verified: true,
  license_number: "DK-2019-9482",
  driver_status: "VERIFIED",
  rating: 4.9,
  total_trips: 142,
  vehicle: {
    make: "Peugeot",
    model: "508 GT",
    year: 2021,
    color: "Gris Nardo",
    plate_number: "DK-8492-BC",
    seats_count: 4
  }
};

const DEFAULT_ADMIN = {
  id: "usr-admin-001",
  full_name: "Administrateur Demandoo",
  email: "admin@demandoo.sn",
  phone: "+221 33 800 00 00",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
  role: "admin",
  is_phone_verified: true,
  is_identity_verified: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('passenger'); // 'passenger' | 'driver'

  useEffect(() => {
    initLocalDatabase();
    const storedUser = localStorage.getItem('demandoo_user_v2');
    const storedViewMode = localStorage.getItem('demandoo_view_mode') || 'passenger';
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setViewMode(storedViewMode);
    } else {
      // Default initial logged in user as passenger
      setUser(DEFAULT_PASSENGER);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(DEFAULT_PASSENGER));
    }
    setLoading(false);
  }, []);

  const login = (email, password, roleChoice = 'passenger') => {
    let chosenUser = DEFAULT_PASSENGER;
    if (roleChoice === 'driver') chosenUser = DEFAULT_DRIVER;
    if (roleChoice === 'admin') chosenUser = DEFAULT_ADMIN;
    
    // Custom user payload if given specific email
    if (email && email.includes('admin')) chosenUser = DEFAULT_ADMIN;
    else if (email && (email.includes('driver') || email.includes('chauffeur'))) chosenUser = DEFAULT_DRIVER;

    setUser(chosenUser);
    localStorage.setItem('demandoo_user_v2', JSON.stringify(chosenUser));
    return { success: true, user: chosenUser };
  };

  const loginWithGoogle = async (roleChoice = 'passenger') => {
    try {
      if (supabase && import.meta.env.VITE_SUPABASE_URL) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.warn("Supabase Google OAuth fallback triggered:", err.message);
    }

    // Instant fail-safe Google Auth login for preview & local environment
    const googleUser = {
      id: `usr-google-${Date.now()}`,
      full_name: "Cheikh Ndiaye",
      email: "cheikh.ndiaye@gmail.com",
      phone: "+221 77 555 44 33",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
      role: roleChoice || 'passenger',
      is_phone_verified: true,
      is_identity_verified: false,
      is_driver_active: false,
      is_driver_verified: false,
      driver_status: roleChoice === 'driver' ? 'INCOMPLETE' : null,
      created_at: new Date().toISOString()
    };

    setUser(googleUser);
    localStorage.setItem('demandoo_user_v2', JSON.stringify(googleUser));
    return { success: true, user: googleUser };
  };

  const register = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'passenger',
      is_phone_verified: true,
      is_identity_verified: false,
      is_driver_active: false,
      is_driver_verified: false,
      driver_status: userData.role === 'driver' ? 'INCOMPLETE' : null,
      created_at: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('demandoo_user_v2', JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demandoo_user_v2');
  };

  const toggleViewMode = () => {
    if (!user || user.role !== 'driver' || user.driver_status !== 'VERIFIED') return;
    const newMode = viewMode === 'passenger' ? 'driver' : 'passenger';
    setViewMode(newMode);
    localStorage.setItem('demandoo_view_mode', newMode);
  };

  const updateDriverStatus = (status, notes = '') => {
    if (!user) return;
    const updated = { ...user, driver_status: status, driver_notes: notes };
    setUser(updated);
    localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
  };

  const completeDriverOnboarding = (formData) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    // Server-side validation simulation
    const missing = [];
    if (!formData.personalInfo?.phone) missing.push('Numéro de téléphone');
    if (!formData.licenseInfo?.licenseFront) missing.push('Permis de conduire');
    if (!formData.vehicleDocs?.registration) missing.push('Carte grise');
    if (!formData.vehicleDocs?.insurance) missing.push('Assurance');
    if (!formData.vehicleDocs?.vehicleFront) missing.push('Photo du véhicule');
    
    if (missing.length > 0) {
      updateDriverStatus('INCOMPLETE');
      return { 
        success: false, 
        error: `Il reste ${missing.length} élément(s) obligatoire(s) à fournir.`,
        missing 
      };
    }

    const updatedUser = {
      ...user,
      role: 'driver', // User naturally gets upgraded to driver
      driver_status: 'VERIFIED',
      is_driver_active: true,
      onboarding_completed: true,
      is_driver_verified: true,
      activated_at: new Date().toISOString()
    };
    
    setUser(updatedUser);
    localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
    
    // Automatically switch them to driver view mode
    setViewMode('driver');
    localStorage.setItem('demandoo_view_mode', 'driver');

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loading, viewMode, toggleViewMode, login, loginWithGoogle, register, logout, updateDriverStatus, completeDriverOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
