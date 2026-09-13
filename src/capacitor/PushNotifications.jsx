import React, { useEffect, useRef } from 'react';
import { isNative, isAndroid } from './index';

/**
 * Composant qui initialise les notifications push Capacitor.
 * Ne s'active que sur une plateforme native (Android / iOS).
 * 
 * ⚠️ CONFIGURATION REQUISE POUR LA PRODUCTION :
 * - Android : Créer un projet Firebase, télécharger google-services.json,
 *             le placer dans android/app/ et activer FCM dans Firebase Console.
 * - iOS : Activer les Push Notifications dans Apple Developer > Certificates,
 *         télécharger le certificat APNs et le configurer dans Supabase.
 * 
 * Ces étapes ne peuvent pas être faites automatiquement.
 */
export const PushNotificationsSetup = ({ onNotificationReceived }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isNative() || initialized.current) return;
    initialized.current = true;

    const setupPush = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');

        // Vérifier/demander la permission
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('[Push] Permission refusée — notifications désactivées');
          return;
        }

        // S'enregistrer pour recevoir les notifications
        await PushNotifications.register();

        // Listeners
        PushNotifications.addListener('registration', (token) => {
          console.info('[Push] Token FCM/APNs obtenu:', token.value);
          // TODO Production : envoyer ce token à Supabase
          // await supabase.from('device_tokens').upsert({
          //   user_id: currentUserId,
          //   token: token.value,
          //   platform: isAndroid() ? 'android' : 'ios',
          // });
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('[Push] Erreur enregistrement:', error.error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.info('[Push] Notification reçue (foreground):', notification);
          if (onNotificationReceived) {
            onNotificationReceived({
              title: notification.title || 'Demandoo',
              message: notification.body || '',
              type: 'info',
            });
          }
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.info('[Push] Notification tapée:', action);
          // TODO : naviguer vers la bonne page selon action.notification.data
        });

      } catch (err) {
        // Non-fatal : l'app fonctionne sans push
        console.warn('[Push] Setup error (non-fatal):', err);
      }
    };

    setupPush();

    return () => {
      // Nettoyage des listeners si le composant est démonté
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.removeAllListeners();
      }).catch(() => {});
    };
  }, []);

  // Composant invisible — juste de la logique
  return null;
};
