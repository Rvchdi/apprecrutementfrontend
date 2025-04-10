import React from 'react';
import { Calendar, MapPin, Video, Clock, User, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EntretiensWidget = ({ entretiens = [], loading }) => {
  // Formater la date et l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return "Date non spécifiée";
    
    const date = new Date(dateString);
    
    // Formater la date
    const dateFormatted = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Formater l'heure
    const timeFormatted = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${dateFormatted} à ${timeFormatted}`;
  };
  
  // Déterminer si un entretien est à venir (dans le futur)
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    const now = new Date();
    const entretienDate = new Date(dateString);
    return entretienDate > now;
  };
  
  // Déterminer si un entretien est aujourd'hui
  const isToday = (dateString) => {
    if (!dateString) return false;
    
    const now = new Date();
    const entretienDate = new Date(dateString);
    
    return entretienDate.getDate() === now.getDate() &&
           entretienDate.getMonth() === now.getMonth() &&
           entretienDate.getFullYear() === now.getFullYear();
  };
  
  // Déterminer si un entretien est imminent (dans les 24h)
  const isImminent = (dateString) => {
    if (!dateString) return false;
    
    const now = new Date();
    const entretienDate = new Date(dateString);
    const diffTime = entretienDate - now;
    const diffHours = diffTime / (1000 * 60 * 60);
    
    return diffHours > 0 && diffHours <= 24;
  };
  
  // Obtenir les jours restants avant l'entretien
  const getRemainingDays = (dateString) => {
    if (!dateString) return 0;
    
    const now = new Date();
    const entretienDate = new Date(dateString);
    const diffTime = entretienDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Entretiens planifiés</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Calendar size={18} className="text-teal-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Entretiens planifiés</h2>
        </div>
        <Link to="/entretiens" className="text-teal-500 hover:text-teal-600 text-sm">
          Voir tous
        </Link>
      </div>
      
      {entretiens.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucun entretien planifié</p>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas d'entretiens à venir pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entretiens
            .filter(e => isUpcoming(e.date_entretien))
            .sort((a, b) => new Date(a.date_entretien) - new Date(b.date_entretien))
            .slice(0, 3)
            .map((entretien) => (
              <Link 
                key={entretien.id} 
                to={`/candidatures/${entretien.id}`}
                className={`block p-4 border rounded-lg transition-colors ${
                  isToday(entretien.date_entretien)
                    ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                    : isImminent(entretien.date_entretien)
                      ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {entretien.offre?.titre || "Entretien"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {entretien.entreprise?.nom_entreprise || entretien.etudiant?.user?.nom}
                    </p>
                  </div>
                  
                  {isToday(entretien.date_entretien) ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Aujourd'hui
                    </span>
                  ) : isImminent(entretien.date_entretien) ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Dans {getRemainingDays(entretien.date_entretien)} jour{getRemainingDays(entretien.date_entretien) > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Dans {getRemainingDays(entretien.date_entretien)} jours
                    </span>
                  )}
                </div>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-2 text-gray-500" />
                    {formatDateTime(entretien.date_entretien)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    {entretien.type_entretien === 'présentiel' ? (
                      <>
                        <MapPin size={14} className="mr-2 text-gray-500" />
                        {entretien.lieu_entretien || "Lieu non spécifié"}
                      </>
                    ) : (
                      <>
                        <Video size={14} className="mr-2 text-gray-500" />
                        Entretien visio
                      </>
                    )}
                  </div>
                </div>
                
                {entretien.presence_confirmee ? (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <CheckCircle size={12} className="mr-1" />
                    Présence confirmée
                  </div>
                ) : (
                  <div className="mt-2 flex items-center text-xs text-yellow-600">
                    <AlertCircle size={12} className="mr-1" />
                    Confirmation en attente
                  </div>
                )}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default EntretiensWidget;