import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Loader2, // Added for loading spinner
  Facebook, // Example social icons (replace if needed)
  Twitter,  // Example social icons (replace if needed)
  Instagram // Example social icons (replace if needed)
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from '../../assets/Login.png'; // Ensure the path is correct

// Axios configuration (remains the same)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Use env variable

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.get('/sanctum/csrf-cookie');
      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Login successful, token stored.');

      // Redirect based on role
      switch (user.role) {
        case 'etudiant':
          navigate('/dashboard/etudiant');
          break;
        case 'entreprise':
          navigate('/dashboard/entreprise');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        if (err.response.status === 422) {
          // Validation errors (might be more specific)
          setError(err.response.data.message || 'Veuillez vérifier vos identifiants.');
          // Optional: Extract specific field errors
          // if (err.response.data && err.response.data.errors) {
          //   const firstError = Object.values(err.response.data.errors).flat()[0];
          //   setError(firstError || 'Veuillez vérifier vos identifiants.');
          // }
        } else if (err.response.status === 401) {
          setError(err.response.data.message || 'Email ou mot de passe incorrect.');
        } else {
          setError(`Erreur serveur (${err.response.status}). Veuillez réessayer.`);
        }
      } else if (err.request) {
        setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectToRegistration = (type = 'student') => {
    if (type === 'company') {
      navigate('/registration/company');
    } else {
      navigate('/registration'); // Default to student registration
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div
             onClick={() => navigate('/')}
             className="text-2xl font-bold flex items-center text-teal-600 transition-transform hover:scale-105 duration-300 cursor-pointer"
           >
            <Briefcase className="mr-2 text-teal-500" size={30} strokeWidth={2} />
            JobConnect
          </div>
          <nav className="space-x-6 text-sm font-medium">
            <a href="/" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">Accueil</a>
            <a href="/offres" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">Offres</a>
            <a href="/about" className="text-gray-600 hover:text-teal-600 transition-colors duration-300">À propos</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 73px)' }}>
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">

          {/* Left Side - Illustration */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-teal-500 to-sky-600 text-white flex flex-col items-center justify-center p-8 sm:p-12 order-1 lg:order-1 min-h-[300px] lg:min-h-0">
            <div className="w-full max-w-xs sm:max-w-sm transform hover:scale-105 transition-transform duration-500 ease-out mb-6">
              <img src={loginImage} alt="Connexion à JobConnect" className="w-full drop-shadow-xl" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">Bienvenue sur JobConnect</h3>
              <p className="text-teal-100 text-sm max-w-sm mx-auto">Connectez-vous pour accéder à votre espace personnalisé et découvrir de nouvelles opportunités.</p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 order-2 lg:order-2">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Bon Retour !
                </h2>
                <p className="text-gray-600 text-base">
                  Connectez-vous pour continuer.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center text-sm shadow-sm" role="alert">
                  <AlertCircle size={18} className="mr-3 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse Email
                </label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors duration-300 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="votre.email@exemple.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="peer block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out shadow-sm hover:shadow-md"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                 <div className="flex justify-between items-center mb-1">
                   <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                     Mot de Passe
                   </label>
                   <a href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800 hover:underline transition-colors duration-300">
                     Oublié ?
                   </a>
                 </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors duration-300 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="peer block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-300 ease-in-out shadow-sm hover:shadow-md"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-300 ease-in-out ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se Connecter <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-sm text-gray-500">
                    Ou
                  </span>
                </div>
              </div>

              {/* Registration Buttons */}
              <div className="space-y-3">
                 <p className="text-center text-sm text-gray-600">
                   Nouveau sur JobConnect ?
                 </p>
                <button
                  type="button"
                  onClick={() => redirectToRegistration('student')}
                  className="w-full flex items-center justify-center py-3 px-6 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition duration-300 ease-in-out text-sm font-medium"
                  disabled={loading}
                >
                  Créer un compte Étudiant
                </button>
                <button
                  type="button"
                  onClick={() => redirectToRegistration('company')}
                  className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-300 ease-in-out"
                  disabled={loading}
                >
                  <Briefcase className="mr-2" size={16} />
                  Inscrire mon Entreprise
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
       <footer className="bg-white text-gray-600 py-8 border-t border-gray-200 mt-auto">
         <div className="container mx-auto px-6 text-center">
           {/* Optional Social Links */}
           {/* <div className="flex justify-center space-x-5 mb-4">
             <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors duration-300">
               <Facebook size={20} />
             </a>
             <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors duration-300">
               <Twitter size={20} />
             </a>
             <a href="#" className="text-gray-400 hover:text-teal-600 transition-colors duration-300">
               <Instagram size={20} />
             </a>
           </div> */}
           <p className="text-sm">&copy; {new Date().getFullYear()} JobConnect. Tous droits réservés.</p>
           <p className="text-xs text-gray-400 mt-1">Développé avec ❤️</p>
         </div>
       </footer>
    </div>
  );
};

export default Login;