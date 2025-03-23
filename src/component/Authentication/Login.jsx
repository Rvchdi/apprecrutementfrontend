import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight,
  Briefcase,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from '../../assets/Login.png';

// Configuration d'axios pour les cookies CSRF et l'authentification
axios.defaults.withCredentials = true; // Nécessaire pour les cookies Sanctum
axios.defaults.baseURL = 'http://localhost:8000'; // Ajustez l'URL selon votre configuration

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fonction pour vérifier si l'email est vérifié
  const isEmailVerified = (user, responseData) => {
    // Vérifie si email_verified_at existe, n'est pas null, n'est pas undefined, et n'est pas une chaîne vide
    const hasVerifiedTimestamp = user && 
                               user.email_verified_at !== null && 
                               user.email_verified_at !== undefined && 
                               user.email_verified_at !== "";
    
    // Vérifie également le flag email_verified dans la réponse
    const hasVerifiedFlag = responseData && responseData.email_verified === true;
    
    return hasVerifiedTimestamp || hasVerifiedFlag;
  };

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Réinitialiser les erreurs quand l'utilisateur commence à taper
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Récupérer le cookie CSRF d'abord
      await axios.get('/sanctum/csrf-cookie');

      // Envoyer les identifiants à l'API de login
      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log("Réponse de l'API:", response.data);
      
      const { token, user } = response.data;
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);
      
      // Configurer le header d'autorisation pour les futures requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Afficher un message de succès temporaire
      setSuccess('Connexion réussie');
      
      // Déterminer si l'email est vérifié avec notre fonction améliorée
      const emailVerified = isEmailVerified(user, response.data);
      
      // Déboguer la vérification d'email
      console.log("Détails de vérification d'email:");
      console.log("- user.email_verified_at:", user?.email_verified_at);
      console.log("- Type de user.email_verified_at:", typeof user?.email_verified_at);
      console.log("- response.data.email_verified:", response.data.email_verified);
      console.log("- Email vérifié selon notre logique:", emailVerified);
      
      // Rediriger en fonction du statut de vérification d'email
      if (!emailVerified) {
        console.log("Redirection vers la page de vérification...");
        setTimeout(() => {
          navigate('/verification');
        }, 1000);
      } else {
        console.log("Redirection vers le dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Gestion des erreurs du serveur (validation, identifiants incorrects, etc.)
        if (error.response.status === 422) {
          // Erreurs de validation
          setError('Veuillez vérifier vos identifiants');
          
          if (error.response.data && error.response.data.errors) {
            const errorMessages = Object.values(error.response.data.errors).flat();
            if (errorMessages.length > 0) {
              setError(errorMessages[0]);
            }
          }
        } else if (error.response.status === 401) {
          // Non autorisé
          setError(error.response.data.message || 'Email ou mot de passe incorrect');
        } else {
          setError('Une erreur s\'est produite. Veuillez réessayer.');
        }
      } else if (error.request) {
        // La requête a été faite mais pas de réponse reçue
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        // Erreurs réseau ou autres
        setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectToRegistration = () => {
    navigate('/registration');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Illustration (Mobile: Bottom) */}
        <div className="w-full md:w-1/2 bg-gradient-to-r from-teal-500 to-emerald-400 p-8 flex flex-col justify-center order-2 md:order-1">
          <div className="text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">Bienvenue sur JobConnect</h2>
            <p className="text-teal-50 text-lg">
              Connectez-vous pour accéder à votre espace personnel et retrouver vos candidatures et offres.
            </p>
          </div>
          
          <div className="mt-auto">
            <img 
              src={loginImage} 
              alt="Login illustration" 
              className="max-w-full h-auto mx-auto" 
            />
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center order-1 md:order-2">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion
            </h1>
            <p className="text-gray-600">
              Entrez vos identifiants pour vous connecter
            </p>
          </div>

          {/* Messages de statut */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center text-sm">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-lg flex items-center text-sm">
              <CheckCircle size={16} className="mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@email.com"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Mot de passe
                </label>
                <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">
                  Mot de passe oublié?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className={`w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center">
                  Se connecter
                  <ArrowRight className="ml-2" size={16} />
                </span>
              )}
            </button>
            
            <div className="flex items-center py-2">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="mx-4 text-gray-400 text-sm">ou</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            
            <div className="space-y-3">
              <button 
                type="button"
                onClick={redirectToRegistration}
                className="w-full border border-teal-600 text-teal-600 py-3 rounded-lg hover:bg-teal-50 transition-all duration-300 flex items-center justify-center"
              >
                Créer un compte étudiant
              </button>
              
              <button 
                type="button"
                onClick={() => navigate('/registration/company')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
              >
                <Briefcase className="mr-2" size={16} />
                Inscription Entreprise
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;