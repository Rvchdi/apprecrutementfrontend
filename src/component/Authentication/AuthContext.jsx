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

  // Vérifier l'authentification au chargement initial
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    
    initAuth();
  }, []); // Dépendance vide pour exécuter une seule fois

  // Fonction de connexion
  const login = async (credentials) => {
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
      
      // Utiliser directement la valeur email_verified du backend
      const isEmailVerified = email_verified === true;
      
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

  // Fonction pour gérer le mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message || 'Instructions envoyées par email' };
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      return { success: false, message: errorMessage };
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = async (data) => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.post('/api/auth/reset-password', data);
      return { success: true, message: response.data.message || 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      return { success: false, message: errorMessage };
    }
  };

  // Fonction pour vérifier si l'utilisateur est vérifié
  const isUserVerified = async () => {
    return true
    /* try {
      // Demander au backend si l'email est vérifié
      console.log("Demande de vérification d'email au backend...");
      const response = await axios.get('/api/auth/check-email-verified');
      
      console.log("Réponse du backend pour vérification d'email:", response.data);
      
      // Vérifier explicitement que la valeur est à true
      const verified = response.data.email_verified === true;
      console.log("L'email est-il vérifié selon le backend?", verified);
      
      // Vérifier les données de debug
      if (response.data.debug_info) {
        console.log("Informations de debug:", response.data.debug_info);
      }
      
      return verified;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de l\'email:', error);
      
      // Fallback en cas d'erreur - vérifier localement
      const localVerified = user && 
                           user.email_verified_at !== null && 
                           user.email_verified_at !== undefined && 
                           user.email_verified_at !== "";
      
      console.log("Fallback local pour la vérification d'email:", {
        user_email: user?.email,
        email_verified_at: user?.email_verified_at, 
        is_verified: localVerified
      });
      
      return localVerified;
    } */
  };

  // Fonction pour renvoyer l'email de vérification
  const resendVerificationEmail = async () => {
    try {
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.post('/api/auth/resend-verification-email');
      return { success: true, message: response.data.message || 'Email de vérification envoyé' };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      return { success: false, message: errorMessage };
    }
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
    isUserVerified,
    forgotPassword,
    resetPassword,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;