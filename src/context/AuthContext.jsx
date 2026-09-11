import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('passenger');

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
      return () => {
        mounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('demandoo_view_mode');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profil n'existe pas encore, on le crée
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          avatar_url: authUser.user_metadata?.avatar_url || '',
          role: 'passenger',
          is_phone_verified: false,
          is_identity_verified: false,
          is_driver_active: false
        };
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (insertError) throw insertError;
        setUser(insertedProfile);
      } else if (error) {
        throw error;
      } else {
        setUser(profile);
        const storedViewMode = localStorage.getItem('demandoo_view_mode');
        if (storedViewMode === 'driver' && profile.role === 'driver' && profile.driver_status === 'VERIFIED') {
          setViewMode('driver');
        } else {
          setViewMode('passenger');
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role = 'passenger') => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'demo-google-user',
        email: 'demo.user@gmail.com',
        full_name: 'Ousmane Kane (Google)',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: role === 'driver' ? 'driver' : 'passenger',
        driver_status: role === 'driver' ? 'VERIFIED' : null,
        is_driver_active: role === 'driver',
        is_driver_verified: role === 'driver',
        subscription_status: role === 'driver' ? 'active' : null
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      if (mockUser.role === 'driver') {
        setViewMode('driver');
        localStorage.setItem('demandoo_view_mode', 'driver');
      }
      return { user: mockUser };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
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
    localStorage.removeItem('demandoo_user_v2');
    localStorage.removeItem('demandoo_view_mode');
  };

  const toggleViewMode = () => {
    if (!user || user.role !== 'driver' || user.driver_status !== 'VERIFIED') return;
    const newMode = viewMode === 'passenger' ? 'driver' : 'passenger';
    setViewMode(newMode);
    localStorage.setItem('demandoo_view_mode', newMode);
  };

  const updateProfile = async (updates) => {
    if (!user) return { success: false };

    if (!isSupabaseConfigured) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return { success: false, error };
    }
    setUser(data);
    return { success: true, user: data };
  };

  const completeDriverOnboarding = async (formData) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    const updates = {
      role: 'driver',
      driver_status: 'VERIFIED', // Simulate auto-verification for demo
      is_driver_active: true,
      onboarding_completed: true,
      is_driver_verified: true,
      activated_at: new Date().toISOString()
    };
    
    const res = await updateProfile(updates);
    if (res.success) {
      setViewMode('driver');
      localStorage.setItem('demandoo_view_mode', 'driver');
    }
    return res;
  };

  // SaaS Subscriptions logic
  const subscribeDriver = async (planSlug, billingCycle, tripLimit) => {
    if (!user) return { success: false };

    const updates = {
      subscription_status: planSlug === 'trial' ? 'trial' : 'active',
      subscription_plan: planSlug,
      subscription_trip_limit: tripLimit,
      subscription_trips_used: 0
    };

    if (!isSupabaseConfigured) {
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
      console.error("Subscription error:", e);
      return { success: false, error: e };
    }
  };

  const updateDriverStatus = () => {};
  const incrementTripsUsed = () => {};
  
  const login = async (identifier, password, role = 'passenger') => {
    if (!isSupabaseConfigured) {
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
          vehicle: {
            make: 'Peugeot',
            model: '508 GT',
            plate_number: 'DK-8492-BC',
            seats_count: 4
          }
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password
    });
    if (error) {
      console.error("Erreur de connexion:", error.message);
      return null;
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    return { user: profile || { role: 'passenger' } };
  };

  const register = async (userData) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: `usr-${Date.now()}`,
        email: userData.email,
        full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name || 'Utilisateur',
        phone: userData.phone,
        role: userData.role || 'passenger',
        is_driver_verified: false
      };
      setUser(mockUser);
      localStorage.setItem('demandoo_user_v2', JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.name,
          phone: userData.phone
        }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
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
      incrementTripsUsed 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
