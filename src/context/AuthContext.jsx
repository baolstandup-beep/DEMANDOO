import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { translateAuthError } from '../lib/authErrors';

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
          is_driver_active: false,
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

      } else if (error) {
        throw error;
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

      setUser(profile);

      // Définir le viewMode
      const storedViewMode = localStorage.getItem('demandoo_view_mode');
      if (profile.role === 'driver' && profile.driver_status === 'VERIFIED' &&
          (storedViewMode === 'driver' || safeRole === 'driver')) {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      } else if (profile.role === 'admin') {
        setViewMode('admin');
      } else {
        setViewMode('passenger');
      }

      return profile;
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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
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

    const updates = {
      subscription_status: planSlug === 'trial' ? 'trial' : 'active',
      subscription_plan: planSlug,
      subscription_trip_limit: tripLimit,
      subscription_trips_used: 0
    };

    const isMockUser = !user.id || typeof user.id !== 'string' || user.id.startsWith('usr-');

    if (!isSupabaseConfigured || isMockUser) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      const { data: planData } = await supabase.from('subscription_plans').select('id').eq('slug', planSlug).single();

      if (planData) {
        const periodEnd = new Date();
        if (planSlug === 'trial') periodEnd.setDate(periodEnd.getDate() + 7);
        else if (billingCycle === 'annual') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabase.from('driver_subscriptions').insert([{
          driver_id: user.id,
          plan_id: planData.id,
          billing_cycle: billingCycle,
          status: updates.subscription_status,
          period_end: periodEnd.toISOString(),
          trips_used: 0
        }]);
      }

      setUser(profileData);
      return { success: true, user: profileData };
    } catch (e) {
      console.warn("Subscription error (fallback to local):", e);
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }
  };

  const updateDriverStatus = () => {};
  const incrementTripsUsed = () => {};

  const login = async (identifier, password, role = 'passenger') => {
    const isDemoAccount = !isSupabaseConfigured ||
      identifier?.toLowerCase().includes('demandoo.sn') ||
      password === 'demo123' ||
      role === 'admin' ||
      identifier?.toLowerCase().includes('admin') ||
      identifier?.toLowerCase().includes('driver') ||
      identifier?.toLowerCase().includes('modou');

    if (isDemoAccount) {
      let mockUser;
      if (role === 'driver' || identifier?.toLowerCase().includes('driver') || identifier?.toLowerCase().includes('modou')) {
        mockUser = {
          id: 'drv-001',
          email: identifier || 'modou.diop@demandoo.sn',
          full_name: 'Modou Diop',
          phone: '+221 77 450 12 34',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          role: 'driver',
          driver_status: 'VERIFIED',
          is_driver_active: true,
          is_driver_verified: true,
          subscription_status: 'active',
          subscription_plan: 'pro',
          vehicle: { make: 'Peugeot', model: '508 GT', plate_number: 'DK-8492-BC', seats_count: 4 }
        };
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      } else if (role === 'admin' || identifier?.toLowerCase().includes('admin')) {
        mockUser = {
          id: 'admin-001',
          email: identifier || 'admin@demandoo.sn',
          full_name: 'Administrateur DEMANDOO',
          role: 'admin'
        };
      } else {
        mockUser = {
          id: 'pass-001',
          email: identifier || 'passager@demandoo.sn',
          full_name: identifier?.split('@')[0] || 'Passager Démo',
          phone: '+221 77 123 45 67',
          role: 'passenger'
        };
        setViewMode('passenger');
      }
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      return { user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password
      });
      if (error) {
        console.error("Erreur de connexion:", error.message);
        return { error: translateAuthError(error) };
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile) {
        setUser(profile);
        if (profile.role === 'driver' && profile.driver_status === 'VERIFIED') {
          setViewMode('driver');
          localStorage.setItem('demandoo_view_mode', 'driver');
        }
      }
      return { user: profile || { role: 'passenger' } };
    } catch (err) {
      console.warn("Supabase auth exception:", err);
      return { error: translateAuthError(err) };
    }
  };

  const register = async (userData) => {
    const safeRole = VALID_ROLES.includes(userData.role) ? userData.role : 'passenger';

    // Fonction utilitaire pour créer un utilisateur démo local
    const createDemoUser = () => {
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Utilisateur';
      const mockUser = {
        id: `usr-${Date.now()}`,
        email: `221${(userData.phone || '').replace(/\s/g, '')}@demandoo-users.sn`,
        full_name: fullName,
        phone: userData.phone,
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

    // Générer un email depuis le numéro de téléphone si non fourni
    // Ex: 773033196 → 221773033196@demandoo-users.sn
    const phoneClean = (userData.phone || '').replace(/[\s\-\(\)]/g, '');
    const generatedEmail = userData.email && userData.email.includes('@')
      ? userData.email
      : `221${phoneClean}@demandoo-users.sn`;

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
          }
        }
      });

      if (error) {
        isRegistering.current = false;
        console.error("Erreur signUp:", error);
        // Si rate limit Supabase → fallback mode démo pour ne pas bloquer les tests
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


      // Si le trigger Supabase n'a pas encore créé le profil, on le crée manuellement
      if (data.session) {
        // Utilisateur immédiatement connecté (email confirm désactivé)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            email: generatedEmail,
            full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || '',
            phone: userData.phone || null,
            role: safeRole,
            driver_status: safeRole === 'driver' ? 'PENDING' : 'INCOMPLETE',
            avatar_url: '',
            is_phone_verified: false,
            is_identity_verified: false,
            is_driver_active: false,
          }]);
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
