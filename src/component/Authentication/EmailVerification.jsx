import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, ArrowLeft, Loader2, Mail, ExternalLink, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Récupérer le token de l'URL si présent
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get('token');
  
  // États
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Vérifier le token s'il est présent dans l'URL
  useEffect(() => {
    if (tokenFromUrl) {
      verifyEmail(tokenFromUrl);
    }
  }, [tokenFromUrl]);
  
  // Effet pour gérer le compte à rebours de renvoi du code
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Vérifier le token
  const verifyEmail = async (token) => {
    try {
      setIsVerifying(true);
      setError(null);
      
      const response = await axios.post('/api/auth/verify-email', { token });
      
      setIsVerified(true);
      setSuccessMessage(response.data.message || 'Votre adresse e-mail a été vérifiée avec succès !');
      
      // Mettre à jour l'état d'authentification après une courte attente
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la vérification :', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la vérification de votre e-mail.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Renvoyer le code de vérification
  const resendVerificationEmail = async () => {
    try {
      setIsResending(true);
      setError(null);
      
      const response = await axios.post('/api/auth/resend-verification-email');
      
      setSuccessMessage(response.data.message || 'Un nouvel e-mail de vérification a été envoyé !');
      setCountdown(30);
      setCanResend(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi :', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de l\'e-mail.');
    } finally {
      setIsResending(false);
    }
  };
  
  // Retourner au tableau de bord
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
          <h1 className="text-xl font-semibold flex items-center justify-center mb-2">
            <Mail className="mr-2" size={24} />
            Vérification de votre e-mail
          </h1>
          <p className="text-teal-100 text-center">
            {isVerified
              ? "Votre adresse e-mail a été vérifiée avec succès"
              : `Veuillez vérifier votre adresse e-mail : ${user?.email || ""}`
            }
          </p>
        </div>
        
        {/* Contenu principal */}
        <div className="p-6">
          {isVerified ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">Vérification réussie</h2>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={goToDashboard}
                className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Accéder à mon tableau de bord
              </button>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
                  <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium">Une erreur est survenue</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              {successMessage && !error && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                  <p>{successMessage}</p>
                </div>
              )}
              
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Comment vérifier votre e-mail</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-start mb-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2 flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-700">
                      Consultez votre boîte de réception et ouvrez l'e-mail intitulé 
                      <span className="font-medium"> Vérification de votre adresse email</span>
                    </p>
                  </div>
                  <div className="flex items-start mb-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2 flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-700">
                      Cliquez sur le bouton <span className="font-medium">Vérifier mon adresse email</span> présent dans l'e-mail
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-2 flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-700">
                      Vous serez automatiquement redirigé vers votre tableau de bord
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={resendVerificationEmail}
                    disabled={isResending || !canResend}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center transition-colors ${
                      isResending || !canResend
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Envoi en cours...
                      </>
                    ) : !canResend ? (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        Renvoyer le lien ({countdown}s)
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        Renvoyer le lien de vérification
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button
                      onClick={goToDashboard}
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      Retourner au tableau de bord
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes importantes</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Certaines fonctionnalités sont limitées tant que votre e-mail n'est pas vérifié</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Vérifiez également vos dossiers de spam si vous ne trouvez pas l'e-mail</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Pied de page */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <div>
            <span>Besoin d'aide ? </span>
            <a href="mailto:support@jobconnect.com" className="text-teal-600 hover:underline">Contactez-nous</a>
          </div>
          <div>
            JobConnect © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;