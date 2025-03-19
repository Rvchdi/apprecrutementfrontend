import React from 'react';
import { Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplicationsWidget = ({ candidatures, loading }) => {
  // Formater la date relative
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "Aujourd'hui";
    if (diffDays <= 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    // Formater la date complète
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'en_attente': return 'bg-blue-100 text-blue-800';
      case 'vue': return 'bg-indigo-100 text-indigo-800';
      case 'entretien': return 'bg-purple-100 text-purple-800';
      case 'acceptee': return 'bg-green-100 text-green-800';
      case 'refusee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Traduire le statut
  const translateStatus = (status) => {
    const translations = {
      'en_attente': 'En attente',
      'vue': 'Vue',
      'entretien': 'Entretien',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Candidatures récentes</h2>
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
        <h2 className="text-lg font-medium text-gray-800">Candidatures récentes</h2>
        <Link to="/applications" className="text-teal-500 hover:text-teal-600 text-sm">
          Voir toutes
        </Link>
      </div>
      
      {candidatures.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucune candidature</p>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas encore postulé à des offres.
          </p>
          <Link 
            to="/offres" 
            className="mt-4 inline-block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Découvrir les offres
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {candidatures.slice(0, 5).map((candidature) => (
            <Link 
              key={candidature.id} 
              to={`/candidatures/${candidature.id}`}
              className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{candidature.offre.titre}</h3>
                  <p className="text-sm text-gray-500">{candidature.offre.entreprise.nom_entreprise}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(candidature.statut)}`}>
                    {translateStatus(candidature.statut)}
                  </span>
                  <ChevronRight size={16} className="ml-2 text-gray-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <Clock size={12} className="mr-1" />
                Postulé {formatRelativeTime(candidature.date_candidature)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsWidget;