import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from './AuthContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(result.message || 'Instructions de réinitialisation envoyées à votre adresse email.');
        setEmail(''); // Réinitialiser le champ
      } else {
        setError(result.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la demande de réinitialisation:', err);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer ultérieurement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mot de passe oublié?</h1>
          <Link
            to="/login"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Retour
          </Link>
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
              <KeyRound size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-blue-800 mb-2">Réinitialisation du mot de passe</h2>
              <p className="text-blue-700">
                Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien de réinitialisation pour créer un nouveau mot de passe.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Adresse Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
                disabled={submitting}
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className={`w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              'Envoyer les instructions'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Vous vous souvenez de votre mot de passe?{' '}
            <Link to="/login" className="text-teal-600 hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;