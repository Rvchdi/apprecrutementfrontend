import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Briefcase, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import loginIllustration from '../../assets/Login.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate login process
    setTimeout(() => {
      if (formData.email === 'user@example.com' && formData.password === 'password') {
        navigate('/dashboard');
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-400 to-teal-600 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center bg-teal-600 text-white p-8">
          <img
            src={loginIllustration}
            alt="Connexion Illustration"
            className="w-3/4 mb-6"
          />
          <h2 className="text-3xl font-bold mb-4">Bienvenue sur JobConnect</h2>
          <p className="text-center">
            Connectez-vous pour accéder à votre espace personnel et découvrir
            des opportunités adaptées à votre profil.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Connexion</h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-100 text-red-600 p-4 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-gray-600 mb-2">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemple@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-600 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <button
                onClick={() => navigate('/registration')}
                className="text-teal-500 hover:underline"
              >
                Créer un compte
              </button>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Entreprise ?{' '}
              <button
                onClick={() => navigate('/registration/company')}
                className="text-teal-500 hover:underline"
              >
                Inscription entreprise
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;