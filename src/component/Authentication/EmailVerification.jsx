import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from './AuthContext';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading, resendVerificationEmail, verifyEmail } = useAuth();
  
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // Vérifier le token dans l'URL s'il est présent
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmailWithToken(token);
    }
  }, [searchParams]);
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [navigate, isAuthenticated, loading]);
  
  // Gérer le compte à rebours pour empêcher les envois d'email trop fréquents
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Vérifier un token d'email
  const verifyEmailWithToken = async (token) => {
    setVerifying(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setSuccess(result.message || 'Votre adresse email a été vérifiée avec succès!');
        // Rediriger vers le dashboard après vérification
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setError(result.message || 'Le lien de vérification est invalide ou a expiré.');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError('Une erreur est survenue lors de la vérification de votre email.');
    } finally {
      setVerifying(false);
    }
  };
  
  // Renvoyer l'email de vérification
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        setSuccess(result.message || 'Un nouvel email de vérification a été envoyé.');
        setCountdown(60); // Désactiver le bouton pendant 60 secondes
      } else {
        setError(result.message || 'Impossible d\'envoyer l\'email de vérification.');
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError('Une erreur est survenue lors de l\'envoi de l\'email.');
    } finally {
      setResending(false);
    }
  };
  
  // Retourner à la page d'accueil
  const goBack = () => {
    navigate('/dashboard');
  };
  
  // Si en attente, afficher un loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
          <p className="text-gray-700">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Vérification d'email</h1>
          <button
            onClick={goBack}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Retour
          </button>
        </div>
        
        {/* Messages de statut */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center text-sm">
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-3 mr-4 flex-shrink-0">
              <MailCheck size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-blue-800 mb-2">Vérification requise</h2>
              <p className="text-blue-700 mb-2">
                Veuillez vérifier votre adresse email pour accéder à toutes les fonctionnalités.
                Un email de vérification a été envoyé à <strong>{user?.email}</strong>.
              </p>
              <p className="text-blue-600 text-sm">
                Si vous ne trouvez pas l'email, vérifiez votre dossier spam ou cliquez sur le bouton ci-dessous pour recevoir un nouvel email.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleResendEmail}
            disabled={resending || countdown > 0}
            className={`flex items-center px-5 py-3 rounded-lg ${
              resending || countdown > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            } transition-colors`}
          >
            {resending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : countdown > 0 ? (
              <>
                <Mail size={18} className="mr-2" />
                Renvoyer dans {countdown}s
              </>
            ) : (
              <>
                <Mail size={18} className="mr-2" />
                Renvoyer l'email de vérification
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Si vous avez besoin d'aide, veuillez contacter notre support à{' '}
            <a href="mailto:support@jobconnect.com" className="text-teal-600 hover:underline">
              support@jobconnect.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;