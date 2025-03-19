import React from 'react';
import { Star, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OpportunitiesWidget = ({ offres, loading }) => {
  // Obtenir la couleur pour le pourcentage de correspondance
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 75) return "text-teal-600 bg-teal-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Opportunités recommandées</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">Opportunités recommandées</h2>
        <Link to="/offres" className="text-teal-500 hover:text-teal-600 text-sm">
          Voir toutes
        </Link>
      </div>
      
      {offres.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucune opportunité</p>
          <p className="text-gray-500 text-sm">
            Ajoutez des compétences à votre profil pour recevoir des recommandations.
          </p>
          <Link 
            to="/skills" 
            className="mt-4 inline-block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Ajouter des compétences
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offres.slice(0, 5).map((offre) => (
            <Link 
              key={offre.id} 
              to={`/offres/${offre.id}`}
              className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{offre.titre}</h3>
                  <p className="text-sm text-gray-500">{offre.entreprise.nom_entreprise}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getMatchColor(offre.match)}`}>
                    <Star size={12} className="mr-1 fill-current" /> {offre.match}%
                  </span>
                  <ChevronRight size={16} className="ml-2 text-gray-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <MapPin size={12} className="mr-1" />
                {offre.localisation}
                <span className="mx-2">•</span>
                {offre.type === 'stage' ? 'Stage' : 
                 offre.type === 'alternance' ? 'Alternance' : 'Emploi'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesWidget;