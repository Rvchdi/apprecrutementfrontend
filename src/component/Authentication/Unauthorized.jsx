import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldOff, Home } from 'lucide-react';
import { useAuth } from './AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 rounded-full p-4">
            <ShieldOff size={48} className="text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Accès non autorisé
        </h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          {isAuthenticated && user?.role && (
            <span> Votre rôle actuel est <strong>{user.role}</strong>.</span>
          )}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Retour à la page précédente
          </button>
          
          <Link
            to="/dashboard"
            className="w-full block bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all duration-300"
          >
            {isAuthenticated ? "Aller au tableau de bord" : "Se connecter"}
          </Link>
          
          <Link
            to="/"
            className="w-full block border border-teal-600 text-teal-600 py-3 rounded-lg hover:bg-teal-50 transition-all duration-300 flex items-center justify-center"
          >
            <Home size={16} className="mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;