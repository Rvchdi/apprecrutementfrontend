import { useState, useCallback } from 'react';

// Durée de vie du cache (1 heure)
const CACHE_DURATION = 3600000; // 1 heure en millisecondes

export const usePersistentCache = (key) => {
  // Récupérer les données du cache
  const getCachedData = useCallback(() => {
    try {
      const cachedItem = localStorage.getItem(key);
      
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        
        // Vérifier si le cache est encore valide
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
        
        // Supprimer le cache expiré
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
    }
    
    return null;
  }, [key]);

  // Mettre à jour le cache
  const setCachedData = useCallback((data) => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cache:', error);
    }
  }, [key]);

  // Effacer le cache
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }, [key]);

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
};