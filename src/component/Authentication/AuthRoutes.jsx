import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Composant de chargement réutilisable
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
      <p className="text-gray-700">Chargement en cours...</p>
    </div>
  </div>
);

// Route publique - accessible à tous
export const PublicRoute = ({ children }) => {
  return children ? children : <Outlet />;
};

// Route qui nécessite une authentification
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, checkAuth, authError } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier l'authentification
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      if (!isValid && !loading) {
        navigate('/login');
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  // Si on a une erreur d'authentification, rediriger vers login
  if (authError) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children ? children : <Outlet />;
};

// Route qui nécessite une authentification ET un email vérifié
export const VerifiedRoute = ({ children }) => {
  const { user, isAuthenticated, loading, checkAuth, isUserVerified } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier l'authentification
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      if (!isValid && !loading) {
        navigate('/login');
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si l'email est vérifié
  const emailVerified = isUserVerified();
  
  if (!emailVerified) {
    return <Navigate to="/verification" replace />;
  }
  
  return children ? children : <Outlet />;
};

// Route accessible uniquement aux utilisateurs déconnectés
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children ? children : <Outlet />;
};

// Route spécifique au rôle
export const RoleRoute = ({ roles, children }) => {
  const { user, isAuthenticated, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier l'authentification
  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuth();
      if (!isValid && !loading) {
        navigate('/login');
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children ? children : <Outlet />;
};