import React, { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const PushNotificationsSetup = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Les push notifications ne fonctionnent que sur appareil natif (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications non supportées sur le web.');
      return;
    }

    const registerPush = async () => {
      try {
        // Demande la permission
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          throw new Error('Permission refusée pour les notifications push');
        }

        // Enregistre l'appareil auprès du service (ex: FCM)
        await PushNotifications.register();
      } catch (e) {
        console.warn('Erreur initialisation Push Notifications :', e);
      }
    };

    registerPush();

    // Listeners
    const setupListeners = async () => {
      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Sauvegarder le token FCM dans Supabase
        if (user?.id) {
          try {
            await supabase
              .from('profiles')
              .update({ fcm_token: token.value })
              .eq('id', user.id);
          } catch (err) {
            console.error('Erreur sauvegarde FCM token', err);
          }
        }
      });

      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Erreur lors de l\'enregistrement Push : ' + JSON.stringify(error));
      });

      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notification Push reçue : ', notification);
        // Afficher dans l'interface (cloche interne)
        addNotification({
          title: notification.title || 'Nouvelle notification',
          message: notification.body || '',
          type: 'info'
        });
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Action sur la notification push: ', notification);
        // Rediriger l'utilisateur si besoin selon les datas de la notification
      });
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [user?.id, addNotification]);

  return null; // Composant silencieux (Headless)
};
