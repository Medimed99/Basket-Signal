import { useState, useEffect } from 'react';

// Hook personnalisé pour la persistance avec localStorage
export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${key} depuis localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${key} dans localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState];
}

// Fonction utilitaire pour calculer la distance entre deux points (formule de Haversine)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Formater la distance en format lisible
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Réinitialiser toutes les données de démo
export function resetDemoData() {
  const keys = [
    'streetsignal_courts',
    'streetsignal_user',
    'streetsignal_signals',
    'streetsignal_vibes',
    'streetsignal_favorites'
  ];
  keys.forEach(key => localStorage.removeItem(key));
  window.location.reload();
}

