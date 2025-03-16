import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configurer axios pour toutes les requêtes
  axios.defaults.baseURL = 'http://localhost:8000';
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.defaults.headers.post['Accept'] = 'application/json';

  // Vérifier l'authentification de l'utilisateur au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Configurer le header d'autorisation pour les requêtes
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Vérifier si le token est valide en appelant une route protégée
          const response = await axios.get('/api/auth/me');
          
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          // Token invalide ou expiré, le nettoyer
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_id');
          axios.defaults.headers.common['Authorization'] = '';
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);
      
      // Configurer le header d'autorisation pour les futures requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Appeler l'API pour invalider le token
      await axios.post('/api/auth/logout');
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

  // Valeur du contexte à fournir
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};