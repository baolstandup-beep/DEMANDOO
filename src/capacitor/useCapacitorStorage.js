/**
 * Hook storage abstrait : localStorage (web) ↔ Capacitor Preferences (mobile)
 * Permet une session persistante et sécurisée sur Android et iOS.
 */
import { isNative } from './index';

// API unifiée de stockage
export const storage = {
  async get(key) {
    if (isNative()) {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const result = await Preferences.get({ key });
        return result.value;
      } catch {
        return localStorage.getItem(key);
      }
    }
    return localStorage.getItem(key);
  },

  async set(key, value) {
    if (isNative()) {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: String(value) });
        return;
      } catch {
        localStorage.setItem(key, value);
        return;
      }
    }
    localStorage.setItem(key, value);
  },

  async remove(key) {
    if (isNative()) {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key });
        return;
      } catch {
        localStorage.removeItem(key);
        return;
      }
    }
    localStorage.removeItem(key);
  },
};

/**
 * Versions synchrones pour compatibilité avec le code existant
 * (utilisées en fallback dans AuthContext)
 */
export const storageSync = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};
