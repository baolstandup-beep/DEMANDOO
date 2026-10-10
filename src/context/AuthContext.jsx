import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { translateAuthError } from '../lib/authErrors';
import { isNative } from '../capacitor/index';

const AuthContext = createContext();

// Rôles valides — jamais 'admin' depuis le navigateur
const VALID_ROLES = ['passenger', 'driver'];

// Helper pour sécuriser le code secret de 4 chiffres
const padSecretCode = (code) => `DMD-Sec-24!${code}`;

// Le mode démo (données en localStorage) n'existe qu'en développement local.
// En production, une erreur serveur doit rester une erreur — jamais un faux succès.
const DEMO_MODE = import.meta.env.DEV;
const isDemoUser = (u) => DEMO_MODE && (!u?.id || typeof u.id !== 'string' || u.id.startsWith('usr-'));

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
    const isMockUser = isDemoUser(user);

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

      if (error) throw error;
      setUser({ ...user, ...data });
      return { success: true, user: data };
    } catch (err) {
      console.warn("Update profile error:", err);
      return { success: false, error: translateAuthError(err) };
    }
  };

  // Enregistre le dossier chauffeur. Le statut VERIFIED n'est JAMAIS posé ici :
  // il vient de /api/verify-kyc (IA, côté serveur) ou d'un administrateur.
  const completeDriverOnboarding = async (formData) => {
    if (!user) return { success: false, error: 'Non authentifié' };

    const extras = {
      vehicle: formData?.vehicleInfo || user.vehicle || null,
      license_info: formData?.licenseInfo || null,
      personal_info: formData?.personalInfo || null,
      onboarding_completed: true,
    };

    if (!isSupabaseConfigured || isDemoUser(user)) {
      const updatedUser = { ...user, ...extras, role: 'driver', driver_status: 'PENDING' };
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }

    try {
      const dbUpdates = {
        role: 'driver',
        ...(formData?.licenseInfo?.number ? { license_number: formData.licenseInfo.number } : {}),
        // Soumission du dossier (le trigger SQL n'autorise que INCOMPLETE/REJECTED → PENDING)
        ...(['VERIFIED', 'PENDING'].includes(user.driver_status) ? {} : { driver_status: 'PENDING' }),
      };

      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (error) throw error;

      // Relire le profil : le statut a pu être validé côté serveur par l'IA
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const refreshed = authUser ? await fetchUserProfile(authUser) : null;
      const finalUser = { ...(refreshed || user), ...extras };
      setUser(finalUser);
      if (finalUser.driver_status === 'VERIFIED') {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      }
      return { success: true, user: finalUser };
    } catch (err) {
      console.warn("Driver onboarding error:", err);
      return { success: false, error: "Impossible d'enregistrer votre dossier. Vérifiez votre connexion et réessayez." };
    }
  };

  // SaaS Subscriptions — seule l'offre gratuite s'active depuis le navigateur (RPC contrôlée,
  // 1 fois par chauffeur). Les formules payantes passent par /api/payments/checkout + webhook.
  const subscribeDriver = async (planSlug) => {
    if (!user) return { success: false };

    if (!isSupabaseConfigured || isDemoUser(user)) {
      const updated = { ...user, subscription_status: 'trial', subscription_plan: 'trial', subscription_trip_limit: 1, subscription_trips_used: 0 };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    if (planSlug !== 'trial') {
      return { success: false, error: 'Les formules payantes nécessitent un paiement.' };
    }

    try {
      const { data, error } = await supabase.rpc('start_free_trial');
      if (error) throw error;
      if (data?.status === 'already_used') {
        return { success: false, error: "Vous avez déjà profité de l'offre Découverte." };
      }
      const refreshed = await refreshProfile();
      return { success: true, user: refreshed };
    } catch (e) {
      console.warn("Subscription error:", e);
      return { success: false, error: "Impossible d'activer l'offre. Réessayez." };
    }
  };

  // Relit le profil depuis Supabase (ex. après confirmation d'un paiement par webhook)
  const refreshProfile = async () => {
    if (!isSupabaseConfigured || !user) return user;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    return authUser ? fetchUserProfile(authUser) : null;
  };

  const updateDriverStatus = async (isActive) => {
    if (!user) return { success: false };
    
    // Fallback mode if Supabase not configured
    const isMockUser = isDemoUser(user);
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
      const merged = { ...user, ...data };
      setUser(merged);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(merged));
      return { success: true, user: merged };
    } catch (err) {
      console.warn("Failed to update driver status:", err);
      return { success: false, error: translateAuthError(err) };
    }
  };

  const incrementTripsUsed = async () => {
    if (!user) return { success: false };
    
    const isMockUser = isDemoUser(user);
    if (!isSupabaseConfigured || isMockUser) {
      const updatedUser = { ...user, subscription_trips_used: (user.subscription_trips_used || 0) + 1 };
      setUser(updatedUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    }

    // Le compteur réel est incrémenté en base par le trigger after_trip_insert_increment_quota.
    // Ici on ne met à jour que l'affichage.
    const updatedUser = { ...user, subscription_trips_used: (user.subscription_trips_used || 0) + 1 };
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  };

  const login = async (identifier, password, role = 'passenger') => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) return { error: "Veuillez renseigner votre email ou numéro de téléphone." };

    // Padding du code secret s'il s'agit d'un code à 4 chiffres
    const paddedPassword = password?.length === 4 && /^\d+$/.test(password) 
      ? padSecretCode(password) 
      : password;

    // Si Supabase n'est pas configuré, mode hors-ligne basique (uniquement pour le développement)
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'mock-user-1',
        email: rawInput,
        full_name: 'Utilisateur Démo',
        role: role,
        driver_status: role === 'driver' ? 'PENDING' : null,
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

      for (const emailToTry of candidateEmails) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToTry,
          password: paddedPassword
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
          role: VALID_ROLES.includes(role) ? role : 'passenger',
          driver_status: role === 'driver' ? 'PENDING' : 'INCOMPLETE',
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
      } else if (completeProfile.role === 'driver' && completeProfile.driver_status === 'VERIFIED') {
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

    const userAvatar = userData.avatar_url || userData.avatarBase64 || '';
    // Ne JAMAIS envoyer de base64 lourd dans user_metadata Supabase Auth (limite stricte de 1MB par GoTrue)
    const lightweightAvatarUrl = (userAvatar && userAvatar.startsWith('http')) ? userAvatar : '';

    // Padding du code secret s'il s'agit d'un code à 4 chiffres
    const paddedPassword = userData.password?.length === 4 && /^\d+$/.test(userData.password) 
      ? padSecretCode(userData.password) 
      : userData.password;

    try {
      // Bloquer onAuthStateChange pendant l'inscription pour éviter une navigation prématurée
      isRegistering.current = true;

      const { data, error } = await supabase.auth.signUp({
        email: generatedEmail,
        password: paddedPassword,
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
        if (DEMO_MODE && (errMsg.includes('rate limit') || errMsg.includes('over_email_send_rate_limit') || error.status === 429)) {
          console.warn('[Auth] Rate limit Supabase — basculement mode démo (dev uniquement)');
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
      if (DEMO_MODE && (errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('fetch'))) {
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
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
