import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, AlertCircle, CheckCircle, ArrowRight, MailWarning, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth, isUserVerified, resendVerificationEmail } = useAuth();
  
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  
  // Vérifier si un token est présent dans l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);
  
  // Vérifier si l'utilisateur est déjà vérifié
  useEffect(() => {
    const checkVerificationStatus = async () => {
      setCheckingVerification(true);
      try {
        // Vérifier auprès du backend si l'email est vérifié
        const response = await axios.get('/api/auth/check-email-verified');
        const verified = response.data.email_verified === true;
        setIsVerified(verified);
        
        if (verified) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        // Fallback sur la méthode locale si la requête échoue
        const verified = await isUserVerified();
        setIsVerified(verified);
        
        if (verified) {
          navigate('/dashboard', { replace: true });
        }
      } finally {
        setCheckingVerification(false);
      }
    };
    
    if (user) {
      checkVerificationStatus();
    }
  }, [user, navigate, isUserVerified]);
  
  // Fonction pour vérifier l'email avec le token
  const verifyEmail = async (token) => {
    setVerifying(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/verify-email', { token });
      
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
        
        // Rafraîchir les informations utilisateur
        await checkAuth();
        
        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la vérification.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };
  
  // Fonction pour renvoyer l'email de vérification
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setSuccess(result.message || 'Un nouvel email de vérification a été envoyé.');
        
        // Démarrer le compte à rebours (60 secondes)
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'envoi.');
      }
    } catch (err) {
      console.error('Erreur lors du renvoi de l\'email:', err);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer ultérieurement.');
    } finally {
      setResending(false);
    }
  };
  
  // Afficher un écran de chargement pendant la vérification
  if (checkingVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-700">Vérification de votre compte...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-100 rounded-full p-4">
            <MailCheck size={40} className="text-teal-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Vérification de votre adresse email
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          Veuillez vérifier votre boîte email et cliquer sur le lien de confirmation pour activer votre compte.
        </p>
        
        {/* Messages d'erreur ou de succès */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        {/* Informations sur l'utilisateur */}
        {user && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-3 mr-4 flex-shrink-0">
                <MailWarning size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-blue-800 mb-2">Adresse email non vérifiée</h2>
                <p className="text-blue-700 mb-1">
                  Un email de vérification a été envoyé à <strong>{user.email}</strong>
                </p>
                <p className="text-blue-700 text-sm">
                  Si vous ne recevez pas l'email, vérifiez votre dossier de spam ou demandez un nouvel envoi.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Bouton de renvoi */}
        <button
          onClick={handleResendEmail}
          disabled={resending || countdown > 0}
          className={`w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors ${
            (resending || countdown > 0) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {resending ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : countdown > 0 ? (
            <>
              <RefreshCw size={18} className="mr-2" />
              Renvoyer l'email ({countdown}s)
            </>
          ) : (
            <>
              <RefreshCw size={18} className="mr-2" />
              Renvoyer l'email de vérification
            </>
          )}
        </button>
        
        {/* Lien vers le tableau de bord */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-teal-600 hover:text-teal-700 text-sm flex items-center justify-center mx-auto"
          >
            Continuer vers le tableau de bord
            <ArrowRight size={16} className="ml-1" />
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Vous pouvez accéder à certaines fonctionnalités en attendant la vérification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;