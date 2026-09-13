/**
 * Capacitor Mobile Utilities
 * Détection de plateforme et helpers natifs pour Demandoo
 */

// Vérifier si on est dans un environnement Capacitor natif
export const isNative = () => {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
};

export const getPlatform = () => {
  if (typeof window === 'undefined') return 'web';
  return window.Capacitor?.getPlatform?.() || 'web';
};

export const isAndroid = () => getPlatform() === 'android';
export const isIOS = () => getPlatform() === 'ios';

/**
 * Initialise Capacitor pour l'application
 * Doit être appelé au démarrage dans main.jsx
 */
export const initCapacitor = async () => {
  if (!isNative()) return;

  try {
    // StatusBar
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: 'Dark' });
    await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
    
    // Splash screen — cacher après que l'app est prête
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    // Silencieux — ne jamais planter à cause de Capacitor
    console.warn('[Capacitor] Init error (non-fatal):', err);
  }
};

/**
 * Enregistrer le listener bouton retour Android
 * Empêche la fermeture accidentelle de l'app
 */
export const registerAndroidBackButton = (navigate, location) => {
  if (!isAndroid()) return () => {};

  let backButtonListener = null;

  const setup = async () => {
    try {
      const { App } = await import('@capacitor/app');
      const listener = await App.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/') {
          // Sur l'accueil : demander confirmation avant de quitter
          App.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          navigate('/');
        }
      });
      backButtonListener = listener;
    } catch (err) {
      console.warn('[Capacitor] BackButton listener error:', err);
    }
  };

  setup();

  // Retourner une fonction de nettoyage
  return () => {
    if (backButtonListener) {
      backButtonListener.remove();
    }
  };
};
