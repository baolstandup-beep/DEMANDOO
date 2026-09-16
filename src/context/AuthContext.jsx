import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
          console.error("Error reading stored local session:", e);
        } finally {
          if (mounted) setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    if (!isSupabaseConfigured) {
      return () => { mounted = false; };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      // Ne pas interrompre une inscription en cours
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
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
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
    if (!rawInput) return { error: "Veuillez renseigner votre email ou numéro de téléphone." };

    // Si Supabase n'est pas configuré, mode hors-ligne basique (uniquement pour le développement)
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'mock-user-1',
        email: rawInput,
        full_name: 'Utilisateur Démo',
        role: role,
        driver_status: role === 'driver' ? 'VERIFIED' : null,
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      if (role === 'driver') setViewMode('driver');
      return { user: mockUser };
    }

    try {
      let candidateEmails = [];

      if (rawInput.includes('@')) {
        candidateEmails.push(rawInput);
      } else {
        // C'est un numéro de téléphone
        const digits = rawInput.replace(/\D/g, '');
        const phoneNoCountry = digits.replace(/^221/, '').replace(/^0+/, '');

        // 1. Chercher dans la table profiles si un utilisateur correspond à ce numéro
        try {
          const { data: matchedProfiles } = await supabase
            .from('profiles')
            .select('email, phone')
            .or(`phone.ilike.%${phoneNoCountry}%,email.ilike.%${phoneNoCountry}%`)
            .limit(3);

          if (matchedProfiles && matchedProfiles.length > 0) {
            matchedProfiles.forEach(p => {
              if (p.email && !candidateEmails.includes(p.email)) {
                candidateEmails.push(p.email);
              }
            });
          }
        } catch (queryErr) {
          console.warn("Phone lookup in profiles table failed:", queryErr);
        }

        // 2. Ajouter les formats générés standards
        if (phoneNoCountry) {
          candidateEmails.push(`driver.${phoneNoCountry}@demandoo.sn`);
          candidateEmails.push(`driver.${digits}@demandoo.sn`);
          candidateEmails.push(`221${phoneNoCountry}@demandoo.com`);
          candidateEmails.push(`${phoneNoCountry}@demandoo.sn`);
        }
      }

      let authData = null;
      let lastError = null;

      // Tester successivement les emails candidats
      for (const emailToTry of candidateEmails) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password
        });
        if (!error && data?.user) {
          authData = data;
          lastError = null;
          break;
        } else {
          lastError = error;
        }
      }

      if (!authData || !authData.user) {
        return { error: translateAuthError(lastError) };
      }

      // Récupérer le profil complet
      let profile = null;
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      profile = userProfile;

      if (!profile) {
        const newProfile = {
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Utilisateur',
          role: role || 'driver',
          driver_status: 'VERIFIED',
          is_driver_active: true,
          phone: authData.user.user_metadata?.phone || rawInput
        };
        const { data: inserted } = await supabase.from('profiles').insert([newProfile]).select().single();
        profile = inserted || newProfile;
      }

      const isAdmin = authData.user?.app_metadata?.role === 'admin';
      const completeProfile = {
        ...profile,
        app_metadata: authData.user?.app_metadata || {},
        role: isAdmin ? 'admin' : (profile?.role || role || 'passenger')
      };

      setUser(completeProfile);
      if (completeProfile.role === 'admin') {
        setViewMode('admin');
        localStorage.setItem('demandoo_view_mode', 'admin');
      } else if (completeProfile.role === 'driver' || role === 'driver') {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      }
      localStorage.setItem('demandoo_user_v2', JSON.stringify(completeProfile));

      return { user: completeProfile };
    } catch (err) {
      console.warn("Supabase auth exception:", err);
      return { error: translateAuthError(err) };
    }
  };

  const register = async (userData) => {
    const safeRole = VALID_ROLES.includes(userData.role) ? userData.role : 'passenger';

    // Helper pour créer un profil démo si Supabase rate-limite ou est indisponible
    const createDemoUser = () => {
      const mockUser = {
        id: `driver-${Date.now()}`,
        email: userData.email || `${(userData.phone || '770000000').replace(/\D/g, '')}@demandoo.sn`,
        full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || 'Chauffeur Demandoo',
        phone: userData.phone || '',
        avatar_url: userData.avatar_url || userData.avatarBase64 || '',
        role: safeRole,
        driver_status: safeRole === 'driver' ? 'PENDING' : 'INCOMPLETE',
        is_driver_verified: false
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    };

    if (!isSupabaseConfigured) {
      return createDemoUser();
    }

    // Générer un email propre depuis le numéro de téléphone ou l'email renseigné
    // Ex: 77 303 31 96 → driver.773033196@demandoo.sn
    const phoneDigits = (userData.phone || '').replace(/\D/g, '').replace(/^221/, '');
    const generatedEmail = (userData.email && userData.email.includes('@'))
      ? userData.email.trim()
      : `driver.${phoneDigits || Date.now()}@demandoo.sn`;

    // Ne JAMAIS envoyer de base64 lourd dans user_metadata Supabase Auth (limite stricte de 1MB par GoTrue)
    const lightweightAvatarUrl = (userAvatar && userAvatar.startsWith('http')) ? userAvatar : '';

    try {
      // Bloquer onAuthStateChange pendant l'inscription pour éviter une navigation prématurée
      isRegistering.current = true;

      const { data, error } = await supabase.auth.signUp({
        email: generatedEmail,
        password: userData.password,
        options: {
          data: {
            full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || '',
            phone: userData.phone || '',
            role: safeRole,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            avatar_url: lightweightAvatarUrl,
          }
        }
      });

      if (error) {
        isRegistering.current = false;
        console.error("Erreur signUp:", error);
        // Si rate limit Supabase ou erreur de validation mail → fallback mode démo
        const errMsg = (error.message || '').toLowerCase();
        if (errMsg.includes('rate limit') || errMsg.includes('over_email_send_rate_limit') || error.status === 429) {
          console.warn('[Auth] Rate limit Supabase — basculement mode démo');
          return createDemoUser();
        }
        return { success: false, error: translateAuthError(error) };
      }

      if (!data.user) {
        isRegistering.current = false;
        return { success: false, error: "Impossible de créer votre compte. Veuillez réessayer." };
      }

      // Mettre à jour l'avatar et les infos du profil en DB
      if (data.session) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (userAvatar) {
          try {
            await supabase.from('profiles').update({ avatar_url: userAvatar }).eq('id', data.user.id);
          } catch (photoErr) {
            console.warn("Échec mise à jour avatar_url:", photoErr);
          }
        }

        // Enregistrer le véhicule en DB si fourni lors de l'inscription chauffeur
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
              status: 'pending'
            }]);
          } catch (vehError) {
            console.warn("Échec insertion véhicule (non-bloquant):", vehError);
          }
        }

        await fetchUserProfile(data.user, safeRole);
      }

      // Libérer le flag — l'inscription est terminée
      isRegistering.current = false;
      return { success: true, user: data.user, needsEmailConfirmation: !data.session };
    } catch (err) {
      isRegistering.current = false;
      console.error("Register exception:", err);
      // Fallback démo si Supabase est injoignable ou rate limité
      const errMsg = (err.message || '').toLowerCase();
      if (errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('fetch')) {
        console.warn('[Auth] Exception réseau — basculement mode démo');
        return createDemoUser();
      }
      return { success: false, error: translateAuthError(err) };
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
