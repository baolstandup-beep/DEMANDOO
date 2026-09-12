import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Mode démo (sans Supabase) : pas d'appel réseau
    if (!isSupabaseConfigured) return;

    loadNotifications();

    const channel = supabase.channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!isSupabaseConfigured || !user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (data) setNotifications(data);
  };

  const addNotification = async ({ title, message, type = 'info', link = null }) => {
    if (!user) return;

    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: user.id,
      title,
      message,
      type,
      link,
      read: false,
      created_at: new Date().toISOString()
    };

    // En mode démo : ajout local immédiat, pas d'appel Supabase
    if (!isSupabaseConfigured) {
      setNotifications(prev => [newNotif, ...prev]);
      return;
    }

    // Avec Supabase : insertion en DB (la souscription realtime mettra à jour l'état)
    const { error } = await supabase.from('notifications').insert([{
      user_id: newNotif.user_id,
      title: newNotif.title,
      message: newNotif.message,
      type: newNotif.type,
      link: newNotif.link,
      read: newNotif.read
    }]);

    if (error) {
      // Fallback : ajout local si Supabase échoue
      console.warn('Notification insert error, using local fallback:', error.message);
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
