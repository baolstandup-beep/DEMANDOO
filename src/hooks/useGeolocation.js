import { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export const useGeolocation = (isActive = false, intervalMs = 15000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location === 'granted') {
          setHasPermission(true);
        } else {
          const request = await Geolocation.requestPermissions();
          if (request.location === 'granted') {
            setHasPermission(true);
          }
        }
      } catch (err) {
        console.warn("Erreur de permission GPS (probablement environnement web sans HTTPS) :", err);
        // Fallback pour le web si Capacitor échoue
        setHasPermission(true); 
      }
    };
    
    checkPermissions();
  }, []);

  useEffect(() => {
    if (!isActive || !hasPermission) {
      clearTracking();
      return;
    }

    startTracking();

    return () => clearTracking();
  }, [isActive, hasPermission]);

  const getCurrentPosition = async () => {
    try {
      // Pour une précision maximale sur mobile
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      const newLoc = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };
      
      setLocation(newLoc);
      return newLoc;
    } catch (err) {
      console.warn("Erreur GPS :", err);
      setError(err);
      return null;
    }
  };

  const startTracking = async () => {
    // Obtenir la position immédiate
    await getCurrentPosition();
    
    // Ensuite, mettre à jour toutes les X secondes via un intervalle pour l'envoi BDD
    intervalRef.current = setInterval(() => {
      getCurrentPosition();
    }, intervalMs);
  };

  const clearTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { location, error, hasPermission, getCurrentPosition };
};
