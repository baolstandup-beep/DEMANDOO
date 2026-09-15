import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { supabase } from '../../lib/supabase';

export const LocationTracker = () => {
  const { user } = useAuth();
  
  // N'activer le tracking que si l'utilisateur est un chauffeur et qu'il est actif (en ligne)
  const isTrackingActive = Boolean(user && user.role === 'driver' && user.is_driver_active);
  
  const { location, error } = useGeolocation(isTrackingActive, 15000); // Mise à jour toutes les 15s

  useEffect(() => {
    const updateLocationInDB = async () => {
      if (!location || !user?.id) return;
      
      try {
        await supabase
          .from('profiles')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
            last_location_update: location.timestamp
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Erreur lors de la mise à jour GPS en BDD :', err);
      }
    };

    updateLocationInDB();
  }, [location, user?.id]);

  // Ce composant est invisible
  return null;
};
