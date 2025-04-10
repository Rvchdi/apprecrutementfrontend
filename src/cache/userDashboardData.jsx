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
    loading: true,
    error: null,
    source: 'network' // 'network', 'cache', ou 'fallback'
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

      // Requêtes parallèles avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes max

      const responses = await Promise.all(
        requests.map(config => 
          axios.get(config.url, { 
            signal: controller.signal 
          }).catch(error => {
            console.error(`Erreur lors de la requête ${config.url}:`, error);
            return { data: null };
          })
        )
      );

      clearTimeout(timeoutId);

      // Construire les données du dashboard
      const newDashboardData = requests.reduce((acc, config, index) => {
        const response = responses[index];
        acc[config.key] = response.data || [];
        return acc;
      }, {});

      // Mettre à jour l'état
      const updatedData = {
        ...newDashboardData,
        loading: false,
        error: null,
        source: 'network'
      };

      setDashboardData(updatedData);

      // Mettre en cache les données
      setCachedData(updatedData);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      
      // Gestion des erreurs avec fallback
      setDashboardData({
        profile: {},
        applications: [],
        opportunities: [],
        tests: [],
        notifications: [],
        loading: false,
        error: error.message || 'Erreur de chargement',
        source: 'fallback'
      });
    }
  }, [user, getCachedData, setCachedData]);

  // Déclencher la récupération des données
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  return dashboardData;
};