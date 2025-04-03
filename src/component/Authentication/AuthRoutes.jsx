import React, { useEffect, useState } from 'react';
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
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier l'authentification
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !loading) {
        const isValid = await checkAuth();
        if (!isValid) {
          navigate('/login', { replace: true });
        }
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading, isAuthenticated]);
  
  if (loading) {
    return <LoadingScreen />;
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
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Vérifier l'authentification et la vérification d'email
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("VerifiedRoute - Début de la vérification");
        
        // Si pas authentifié et pas en chargement, vérifier l'authentification
        if (!isAuthenticated && !loading) {
          console.log("VerifiedRoute - Utilisateur non authentifié, vérification...");
          const isValid = await checkAuth();
          
          if (!isValid) {
            console.log("VerifiedRoute - Authentification échouée, redirection vers login");
            navigate('/login', { replace: true });
            return;
          }
          
          console.log("VerifiedRoute - Authentification réussie");
        }
        
        // À ce stade, on est authentifié (ou on a vérifié que c'était le cas)
        if (!verificationChecked) {
          console.log("VerifiedRoute - Vérification de l'email nécessaire");
          
          try {
            console.log("VerifiedRoute - Demande au backend...");
            // Vérifier directement auprès du backend
            const verified = await isUserVerified();
            console.log("VerifiedRoute - Réponse du backend:", verified);
            
            setIsVerified(verified);
            setVerificationChecked(true);
            
            if (!verified) {
              console.log("VerifiedRoute - Email non vérifié, redirection vers verification");
              navigate('/verification', { replace: true });
            } else {
              console.log("VerifiedRoute - Email vérifié, accès autorisé");
            }
          } catch (error) {
            console.error("VerifiedRoute - Erreur de vérification d'email:", error);
            // En cas d'erreur, par précaution, rediriger vers la page de vérification
            navigate('/verification', { replace: true });
          }
        }
      } catch (error) {
        console.error("VerifiedRoute - Erreur générale:", error);
        navigate('/login', { replace: true });
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading, isAuthenticated, verificationChecked, isUserVerified]);
  
  if (loading || !verificationChecked) {
    console.log("VerifiedRoute - Affichage écran de chargement");
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    console.log("VerifiedRoute - Pas authentifié, redirection vers login");
    return <Navigate to="/login" replace />;
  }
  
  if (!isVerified) {
    console.log("VerifiedRoute - Email non vérifié, redirection vers verification");
    return <Navigate to="/verification" replace />;
  }
  
  console.log("VerifiedRoute - Tout est OK, affichage du contenu protégé");
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
  const { user, isAuthenticated, loading, checkAuth, isUserVerified } = useAuth();
  const navigate = useNavigate();
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Vérifier l'authentification, la vérification d'email et le rôle
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && !loading) {
        const isValid = await checkAuth();
        if (!isValid) {
          navigate('/login', { replace: true });
        } else if (isValid && user) {
          // Vérifier l'état de vérification d'email auprès du backend
          try {
            const verified = await isUserVerified();
            setIsVerified(verified);
            setVerificationChecked(true);
            
            if (!verified) {
              navigate('/verification', { replace: true });
            } else if (!roles.includes(user.role)) {
              navigate('/unauthorized', { replace: true });
            }
          } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
            navigate('/verification', { replace: true });
          }
        }
      } else if (isAuthenticated && user && !verificationChecked) {
        // Vérifier l'état de vérification d'email auprès du backend
        try {
          const verified = await isUserVerified();
          setIsVerified(verified);
          setVerificationChecked(true);
          
          if (!verified) {
            navigate('/verification', { replace: true });
          } else if (!roles.includes(user.role)) {
            navigate('/unauthorized', { replace: true });
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'email:', error);
          navigate('/verification', { replace: true });
        }
      }
    };
    
    verifyAuth();
  }, [checkAuth, navigate, loading, isAuthenticated, user, isUserVerified, verificationChecked, roles]);
  
  if (loading || !verificationChecked) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isVerified) {
    return <Navigate to="/verification" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children ? children : <Outlet />;
};