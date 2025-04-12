import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { usePersistentCache } from './usePersistentCache';

export const useDashboardData = (user) => {
  // États de gestion des données
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    applications: [],
    opportunities: [],
    tests: [],
    notifications: [],
    entretiens: [],
    loading: true,
    error: null,
    source: 'network'
  });

  // Initialiser le hook de cache
  const { getCachedData, setCachedData } = usePersistentCache('dashboard_data');

  // Fonction de récupération des données
  const fetchDashboardData = useCallback(async () => {
    // Vérifier d'abord le cache
    const cachedData = getCachedData();
    if (cachedData) {
      setDashboardData({
        ...cachedData,
        loading: false,
        source: 'cache'
      });
      return;
    }

    // Si pas de cache, récupérer depuis le réseau
    setDashboardData(prev => ({...prev, loading: true, error: null}));
    
    try {
      // Configuration des requêtes selon le rôle
      const requestConfigs = {
        etudiant: [
          { url: '/api/etudiant/profile', key: 'profile' },
          { url: '/api/etudiant/candidatures', key: 'applications' },
          { url: '/api/etudiant/tests', key: 'tests' },
          { url: '/api/notifications', key: 'notifications' }
        ],
        entreprise: [
          { url: '/api/entreprise/profile', key: 'profile' },
          { url: '/api/entreprise/offres', key: 'opportunities' },
          { url: '/api/entreprise/candidatures', key: 'applications' },
          { url: '/api/notifications', key: 'notifications' }
        ]
      };

      // Sélectionner les requêtes en fonction du rôle
      const requests = requestConfigs[user?.role] || [];
      const collectedData = {};
      
      for (const config of requests) {
        try {
          const response = await axios.get(config.url, { timeout: 20000 });
          
          // Extraire les données selon la structure de la réponse
          switch (config.key) {
            case 'profile':
              collectedData[config.key] = response.data || {};
              break;
              
            case 'notifications':
              collectedData[config.key] = response.data && response.data.notifications ? 
                response.data.notifications : [];
              break;
              
            case 'opportunities':
              collectedData[config.key] = response.data && response.data.offres ? 
                response.data.offres : [];
              break;
              
            case 'applications':
              collectedData[config.key] = response.data && response.data.candidatures ? 
                response.data.candidatures : [];
              break;
              
            case 'tests':
              collectedData[config.key] = response.data && response.data.tests ? 
                response.data.tests : [];
              break;
              
            default:
              collectedData[config.key] = response.data || [];
          }
          
          // Mise à jour progressive de l'état
          setDashboardData(prev => ({
            ...prev,
            [config.key]: collectedData[config.key]
          }));
        } catch (error) {
          collectedData[config.key] = [];
          if (error.response && error.response.status === 401) {
            throw new Error('Session expirée');
          }
        }
      }

      // Finaliser l'état
      const updatedData = {
        ...collectedData,
        loading: false,
        error: null,
        source: 'network',
        lastUpdated: new Date().toISOString()
      };
      
      setDashboardData(prev => ({
        ...prev,
        ...updatedData,
        loading: false
      }));

      // Mettre en cache les données
      setCachedData(updatedData);

    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur de chargement',
        source: 'fallback'
      }));
    }
  }, [user, getCachedData, setCachedData]);

  // Déclencher la récupération des données
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Fonction pour forcer un rafraîchissement des données
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...dashboardData,
    refreshData
  };
};