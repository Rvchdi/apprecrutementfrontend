import React from 'react';
import { Briefcase, Search, ArrowLeft, Home } from 'lucide-react';
import NotFound from '../assets/404.png';

const Error404 = () => {
  const goBack = () => {
    window.history.back();
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 text-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center text-teal-600 transition-transform hover:scale-105 duration-300">
            <Briefcase className="mr-2" size={32} />
            JobConnect
          </div>
          <nav className="space-x-6">
            <a href="/" className="hover:text-teal-500 transition-colors duration-300">Accueil</a>
            <a href="/offres" className="hover:text-teal-500 transition-colors duration-300">Offres</a>
            <a href="/about" className="hover:text-teal-500 transition-colors duration-300">À propos</a>
            <a href="/login" className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 hover:shadow-lg">Connexion</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
          {/* Error Message */}
          <div className="p-8 text-center">
            <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-teal-600 mb-6">Page introuvable</h2>
            <p className="text-gray-600 mb-6">
              La page que vous recherchez semble avoir disparu ou n'existe pas. Peut-être que cette opportunité n'est plus disponible?
            </p>
          </div>
          
          {/* Image 404 - Agrandie */}
          <div className="px-6 pb-6 flex justify-center">
            <img 
              src={NotFound} 
              alt="Erreur 404" 
              className="w-full max-w-xl h-auto object-contain max-h-96 animate-float"
            />
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goBack}
                className="flex items-center justify-center gap-2 bg-white border border-teal-500 text-teal-600 px-6 py-3 rounded-lg hover:bg-teal-50 transition-all duration-300"
              >
                <ArrowLeft size={18} />
                Retour
              </button>
              <button
                onClick={goHome}
                className="flex items-center justify-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 hover:shadow-lg"
              >
                <Home size={18} />
                Accueil
              </button>
            </div>

            {/* Search */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une opportunité..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2025 JobConnect. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Error404;