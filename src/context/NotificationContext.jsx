import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStore, setLocalStore } from '../lib/supabase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loaded = getLocalStore('NOTIFICATIONS');
    setNotifications(loaded);
  }, []);

  const addNotification = ({ title, message, type = 'info', link = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      link,
      read: false,
      created_at: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    setLocalStore('NOTIFICATIONS', updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    setLocalStore('NOTIFICATIONS', updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setLocalStore('NOTIFICATIONS', updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
