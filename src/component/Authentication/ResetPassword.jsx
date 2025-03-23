import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    token: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Récupérer les paramètres de l'URL
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({
        ...prev,
        token,
        email
      }));
    } else {
      setError('Lien de réinitialisation invalide. Veuillez demander un nouveau lien.');
    }
  }, [searchParams]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    // Vérifier la longueur minimale du mot de passe
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await resetPassword(formData);
      
      if (result.success) {
        setSuccess(result.message || 'Votre mot de passe a été réinitialisé avec succès.');
        
        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur lors de la réinitialisation:', err);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer ultérieurement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Réinitialisation du mot de passe</h1>
          <Link
            to="/login"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Connexion
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
              <h2 className="text-lg font-medium text-blue-800 mb-2">Créer un nouveau mot de passe</h2>
              <p className="text-blue-700">
                Veuillez créer un nouveau mot de passe pour votre compte. Assurez-vous qu'il est sécurisé et différent de vos mots de passe précédents.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ email (en lecture seule) */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Adresse Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              readOnly
            />
          </div>
          
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimum 8 caractères"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                required
                disabled={submitting}
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                placeholder="Confirmez votre mot de passe"
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
                Réinitialisation en cours...
              </span>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;