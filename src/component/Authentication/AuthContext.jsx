import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// Création du contexte d'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // États de l'authentification
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Configuration initiale d'axios
  useEffect(() => {
    // Configuration de base d'axios
    axios.defaults.baseURL = 'http://localhost:8000';
    axios.defaults.headers.common['Accept'] = 'application/json';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.withCredentials = true; // Important pour Sanctum
    
    // Vérifier s'il y a un token dans le localStorage et le configurer
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Vérifier l'authentification de l'utilisateur
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }
    
    try {
      // Configurer le header d'autorisation pour les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Vérifier si le token est valide
      const response = await axios.get('/api/auth/me');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      // Nettoyer en cas d'erreur
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      axios.defaults.headers.common['Authorization'] = '';
      
      setUser(null);
      setIsAuthenticated(false);
      setAuthError('Session expirée. Veuillez vous reconnecter.');
    }
    
    setLoading(false);
    return false;
  }, []);

  // Vérifier l'authentification au chargement initial seulement
  useEffect(() => {
    checkAuth();
  }, []); // Dépendance vide pour exécuter une seule fois

  // Fonction de connexion
  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      // Récupérer le cookie CSRF
      await axios.get('/sanctum/csrf-cookie');

      // Envoyer les identifiants à l'API
      const response = await axios.post('/api/auth/login', credentials);
      
      const { token, user, email_verified } = response.data;
      
      if (!token || !user) {
        throw new Error('Informations d\'authentification manquantes dans la réponse');
      }
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role || 'user');
      localStorage.setItem('user_id', user.id);
      
      // Configurer le header d'autorisation
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Déterminer si l'email est vérifié
      const isEmailVerified = 
        (user && user.email_verified_at !== null && 
         user.email_verified_at !== undefined && 
         user.email_verified_at !== "") || 
        (email_verified === true);
      
      return { 
        success: true, 
        user, 
        email_verified: isEmailVerified
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setAuthError(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage et l'état, même en cas d'erreur
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      
      // Nettoyer le header d'autorisation
      axios.defaults.headers.common['Authorization'] = '';
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Fonction pour vérifier si l'utilisateur est vérifié
  const isUserVerified = () => {
    return user && 
           user.email_verified_at !== null && 
           user.email_verified_at !== undefined && 
           user.email_verified_at !== "";
  };

  // Valeur du contexte
  const value = {
    user,
    loading,
    isAuthenticated,
    authError,
    login,
    logout,
    checkAuth,
    isUserVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;