import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured, setCustomAuthToken, clearCustomAuthToken } from '../lib/supabase';
import { translateAuthError } from '../lib/authErrors';
import { isNative } from '../capacitor/index';

const AuthContext = createContext();

// Rôles valides — jamais 'admin' depuis le navigateur
const VALID_ROLES = ['passenger', 'driver'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('passenger');
  // Ref pour bloquer onAuthStateChange pendant une inscription en cours
  const isRegistering = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      // ── 1. Tentative via Custom JWT (Phone + PIN) ─────────────────────────
      try {
        const meResp = await fetch('/api/auth/me', { credentials: 'include' });
        if (meResp.ok) {
          const meData = await meResp.json();
          if (meData.success && meData.user && mounted) {
            // Injecter le JWT custom dans le client Supabase (RLS compatibility)
            setCustomAuthToken(meData.access_token);
            setUser(meData.user);
            if (meData.user.role === 'driver' && meData.user.driver_status === 'VERIFIED') {
              const storedMode = localStorage.getItem('demandoo_view_mode');
              setViewMode(storedMode === 'driver' ? 'driver' : 'passenger');
            }
            if (mounted) setLoading(false);
            return;
          }
        }
      } catch (e) {
        // API custom non disponible (dev local sans Vercel) — continuer
        console.info('[Auth] Custom API unavailable, falling back to Supabase Auth');
      }

      // ── 2. Fallback mode hors-ligne (démo) ───────────────────────────────
      if (!isSupabaseConfigured) {
        try {
          const stored = localStorage.getItem('demandoo_user_v2');
          if (stored && mounted) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            const storedMode = localStorage.getItem('demandoo_view_mode');
            if (storedMode) setViewMode(storedMode);
            else if (parsed.role === 'driver') setViewMode('driver');
          }
        } catch (e) {
          console.error('Error reading stored local session:', e);
        } finally {
          if (mounted) setLoading(false);
        }
        return;
      }

      // ── 3. Fallback Supabase Auth (Google OAuth) ──────────────────────────
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting Supabase session:', error);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    if (!isSupabaseConfigured) {
      return () => { mounted = false; };
    }

    // Écouter les événements Supabase Auth (Google OAuth seulement)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (isRegistering.current) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('demandoo_view_mode');
        localStorage.removeItem('demandoo_intended_role');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser, intendedRoleOverride = null) => {
    try {
      const intendedRole = intendedRoleOverride || localStorage.getItem('demandoo_intended_role');
      // Valider le rôle — jamais admin depuis le navigateur
      const safeRole = VALID_ROLES.includes(intendedRole) ? intendedRole : null;

      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let profile = existingProfile;

      if (error && error.code === 'PGRST116') {
        // Profil inexistant — créer avec le bon rôle
        const roleToAssign = safeRole || authUser.user_metadata?.role || 'passenger';
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || `${authUser.user_metadata?.firstName || ''} ${authUser.user_metadata?.lastName || ''}`.trim() || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: roleToAssign,
          driver_status: roleToAssign === 'driver' ? 'PENDING' : 'INCOMPLETE',
          is_phone_verified: false,
          is_identity_verified: false,
          phone: authUser.user_metadata?.phone || null,
        };

        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
        profile = insertedProfile;

      } else if (profile && safeRole && profile.role !== safeRole && safeRole === 'driver') {
        // Profil existant mais veut devenir chauffeur — mettre à jour
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'driver', driver_status: 'PENDING' })
          .eq('id', profile.id)
          .select()
          .single();

        if (!updateError && updatedProfile) {
          profile = updatedProfile;
        }
      }

      // Nettoyer le rôle temporaire
      if (intendedRole) {
        localStorage.removeItem('demandoo_intended_role');
      }

      const isAdmin = authUser?.app_metadata?.role === 'admin';
      const completeProfile = {
        ...profile,
        app_metadata: authUser?.app_metadata || {},
        role: isAdmin ? 'admin' : (profile?.role || 'passenger')
      };

      setUser(completeProfile);

      // Définir le viewMode
      const storedViewMode = localStorage.getItem('demandoo_view_mode');
      if (completeProfile.role === 'driver' && completeProfile.driver_status === 'VERIFIED' &&
          (storedViewMode === 'driver' || safeRole === 'driver')) {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      } else if (completeProfile.role === 'admin') {
        setViewMode('admin');
      } else {
        setViewMode('passenger');
      }

      return completeProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role = 'passenger') => {
    if (!isSupabaseConfigured) {
      const safeRole = VALID_ROLES.includes(role) ? role : 'passenger';
      const mockUser = {
        id: 'demo-google-user',
        email: 'demo.user@gmail.com',
        full_name: 'Ousmane Kane (Google)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: safeRole,
        driver_status: safeRole === 'driver' ? 'PENDING' : 'INCOMPLETE',
        is_driver_active: safeRole === 'driver',
        is_driver_verified: false,
        subscription_status: null
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      if (mockUser.role === 'driver') {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      }
      return { user: mockUser };
    }

    // Stocker le rôle avant de rediriger
    const safeRole = VALID_ROLES.includes(role) ? role : 'passenger';
    localStorage.setItem('demandoo_intended_role', safeRole);

    // Sur mobile natif : utiliser le deep link de l'app pour le retour après Google
    // Sur web : utiliser l'origine standard
    // ⚠️ Configurer sn.demandoo.app://auth/callback dans Supabase > Auth > URL Configuration
    const redirectTo = isNative()
      ? 'sn.demandoo.app://auth/callback'
      : `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    // Déconnexion Custom Auth (Phone+PIN)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.warn('[Auth] Logout API unavailable', e);
    }
    clearCustomAuthToken();

    // Déconnexion Supabase Auth (Google OAuth)
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    setViewMode('passenger');
    localStorage.removeItem('demandoo_user_v2');
    localStorage.removeItem('demandoo_view_mode');
    localStorage.removeItem('demandoo_intended_role');
  };

  const toggleViewMode = () => {
    if (!user || user.role !== 'driver' || user.driver_status !== 'VERIFIED') return;
    const newMode = viewMode === 'passenger' ? 'driver' : 'passenger';
    setViewMode(newMode);
    localStorage.setItem('demandoo_view_mode', newMode);
  };

  const updateProfile = async (updates) => {
    if (!user) return { success: false };

    // Bloquer les champs sensibles côté frontend
    const { role: _r, is_admin: _a, ...safeUpdates } = updates;
    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');

    if (!isSupabaseConfigured || isMockUser) {
      const updated = { ...user, ...safeUpdates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.warn("Update profile error (fallback to local):", error);
        const updated = { ...user, ...safeUpdates };
        setUser(updated);
        localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
        return { success: true, user: updated };
      }
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      console.warn("Exception in updateProfile (fallback to local):", err);
      const updated = { ...user, ...safeUpdates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  };

  const completeDriverOnboarding = async (formData) => {
    if (!user) return { success: false, error: 'Non authentifié' };

    const updates = {
      role: 'driver',
      driver_status: 'VERIFIED',
      is_driver_active: true,
      kyc_status: 'verified',
      license_number: formData?.licenseInfo?.number || user.license_number || '',
    };

    const updatedUser = {
      ...user,
      ...updates,
      vehicle: formData?.vehicleInfo || user.vehicle || null,
      license_info: formData?.licenseInfo || null,
      personal_info: formData?.personalInfo || null,
      onboarding_completed: true,
    };

    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');

    if (!isSupabaseConfigured || isMockUser) {
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      setViewMode('driver');
      localStorage.setItem('demandoo_view_mode', 'driver');
      return { success: true, user: updatedUser };
    }

    try {
      // Uniquement les colonnes valides pour public.profiles dans Supabase
      const dbUpdates = {
        role: 'driver',
        driver_status: 'VERIFIED',
        is_driver_active: true,
        kyc_status: 'verified',
        ...(formData?.licenseInfo?.number ? { license_number: formData.licenseInfo.number } : {})
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.warn("Supabase driver onboarding update fallback to local:", error);
        setUser(updatedUser);
        localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
        return { success: true, user: updatedUser };
      }

      const finalUser = { ...updatedUser, ...(data || {}) };
      setUser(finalUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(finalUser));
      setViewMode('driver');
      localStorage.setItem('demandoo_view_mode', 'driver');
      return { success: true, user: finalUser };
    } catch (err) {
      console.warn("Exception during driver onboarding (fallback to local):", err);
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      setViewMode('driver');
      localStorage.setItem('demandoo_view_mode', 'driver');
      return { success: true, user: updatedUser };
    }
  };

  // SaaS Subscriptions
  const subscribeDriver = async (planSlug, billingCycle, tripLimit) => {
    if (!user) return { success: false };

    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');

    if (!isSupabaseConfigured || isMockUser) {
      const updates = {
        subscription_status: planSlug === 'trial' ? 'trial' : 'active',
        subscription_plan: planSlug,
        subscription_trip_limit: tripLimit,
        subscription_trips_used: 0
      };
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    try {
      const mockTransactionId = `DEM-${Date.now()}`;
      const amount = planSlug === 'pro' ? 5000 : (planSlug === 'standard' ? 2500 : 0);

      const { error } = await supabase.rpc('mock_payment_webhook', {
        p_transaction_id: mockTransactionId,
        p_driver_id: user.id,
        p_plan: planSlug,
        p_amount: amount
      });

      if (error) throw error;

      // Refresh profile
      const { data: refreshedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (refreshedProfile) {
        setUser(refreshedProfile);
        localStorage.setItem('demandoo_user_v2', JSON.stringify(refreshedProfile));
        return { success: true, user: refreshedProfile };
      }

      return { success: false };
    } catch (e) {
      console.warn("Subscription error:", e);
      return { success: false, error: e };
    }
  };

  const updateDriverStatus = async (isActive) => {
    if (!user) return { success: false };
    
    // Fallback mode if Supabase not configured
    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');
    if (!isSupabaseConfigured || isMockUser) {
      const updated = { ...user, is_driver_active: isActive };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_driver_active: isActive })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setUser(data);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(data));
      return { success: true, user: data };
    } catch (err) {
      console.warn("Failed to update driver status:", err);
      const updated = { ...user, is_driver_active: isActive };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  };

  const incrementTripsUsed = async () => {
    if (!user) return { success: false };
    
    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');
    if (!isSupabaseConfigured || isMockUser) {
      const updatedUser = { ...user, subscription_trips_used: (user.subscription_trips_used || 0) + 1 };
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }

    try {
      const newTripsUsed = (user.subscription_trips_used || 0) + 1;
      
      const { error } = await supabase
        .from('driver_subscriptions')
        .update({ trips_used: newTripsUsed })
        .eq('driver_id', user.id)
        .in('status', ['active', 'trial']);
        
      if (error) throw error;
      const updatedUser = { ...user, subscription_trips_used: newTripsUsed };
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      console.warn("Failed to increment trips used:", err);
      const updatedUser = { ...user, subscription_trips_used: (user.subscription_trips_used || 0) + 1 };
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }
  };

  const login = async (identifier, password, role = 'passenger') => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) return { error: 'Veuillez renseigner votre téléphone.' };

    // ── Mode démo (Supabase non configuré) ───────────────────────────────────
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'mock-user-1',
        phone: rawInput,
        full_name: 'Chauffeur Démo',
        role: 'driver',
        driver_status: 'VERIFIED',
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      setViewMode('driver');
      return { user: mockUser };
    }

    // ── Auth Custom Phone + PIN ───────────────────────────────────────────────
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: rawInput, pin: password }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.user) {
        return { error: data.error || 'Identifiants incorrects.' };
      }

      // Injecter le JWT dans le client Supabase (compatibilité RLS)
      setCustomAuthToken(data.access_token);
      setUser(data.user);

      if (data.user.role === 'admin') {
        setViewMode('admin');
        localStorage.setItem('demandoo_view_mode', 'admin');
      } else if (data.user.role === 'driver') {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      }
      localStorage.setItem('demandoo_user_v2', JSON.stringify(data.user));
      return { user: data.user };
    } catch (err) {
      // Fallback Supabase Auth si l'API custom est indisponible (dev local)
      console.warn('[Auth] Custom login API unavailable, trying Supabase Auth fallback:', err);
      return { error: 'Impossible de se connecter. Vérifiez votre connexion.' };
    }
  };

  const register = async (userData) => {
    const safeRole = VALID_ROLES.includes(userData.role) ? userData.role : 'passenger';

    // ── Mode démo ────────────────────────────────────────────────────────────
    const createDemoUser = () => {
      const mockUser = {
        id: `driver-${Date.now()}`,
        phone: userData.phone || '',
        full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || 'Chauffeur Demandoo',
        avatar_url: userData.avatar_url || userData.avatarBase64 || '',
        role: safeRole,
        driver_status: safeRole === 'driver' ? 'PENDING' : 'INCOMPLETE',
        is_driver_verified: false
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    };

    if (!isSupabaseConfigured) return createDemoUser();

    // ── Auth Custom Phone + PIN ───────────────────────────────────────────────
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: userData.phone,
          pin: userData.password,       // Le champ password du formulaire sert de PIN
          firstName: userData.firstName || userData.name?.split(' ')[0] || 'Chauffeur',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || 'Demandoo',
          avatarUrl: (userData.avatarBase64?.startsWith('http') ? userData.avatarBase64 : '') || '',
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.user) {
        // Fallback mode démo si le serveur est indisponible (dev local)
        if (resp.status >= 500) return createDemoUser();
        return { success: false, error: data.error || "Impossible de créer votre compte. Réessayez." };
      }

      // Injecter le JWT dans le client Supabase
      setCustomAuthToken(data.access_token);
      setUser(data.user);
      setViewMode('driver');
      localStorage.setItem('demandoo_view_mode', 'driver');
      localStorage.setItem('demandoo_user_v2', JSON.stringify(data.user));

      // Enregistrer le véhicule si fourni
      if (safeRole === 'driver' && userData.vehicle && (userData.vehicle.brand || userData.vehicle.model)) {
        try {
          await supabase.from('vehicles').insert([{
            driver_id: data.user.id,
            brand: userData.vehicle.brand || 'Standard',
            model: userData.vehicle.model || 'Standard',
            year: parseInt(userData.vehicle.year, 10) || new Date().getFullYear(),
            color: userData.vehicle.color || 'Gris',
            license_plate: userData.vehicle.license_plate || userData.vehicle.plate_number || 'DK-0000-AA',
            seats: parseInt(userData.vehicle.seats_count || userData.vehicle.seats, 10) || 4,
            vehicle_type: userData.vehicle.vehicle_type || 'Berline',
            status: 'pending',
          }]);
        } catch (vehError) {
          console.warn('Échec insertion véhicule (non-bloquant):', vehError);
        }
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.warn('[Auth] Register API exception — mode démo:', err);
      return createDemoUser();
    }
  };



  return (
    <AuthContext.Provider value={{
      user,
      loading,
      viewMode,
      toggleViewMode,
      login,
      loginWithGoogle,
      register,
      updateProfile,
      logout,
      updateDriverStatus,
      completeDriverOnboarding,
      subscribeDriver,
      incrementTripsUsed,
      fetchUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
