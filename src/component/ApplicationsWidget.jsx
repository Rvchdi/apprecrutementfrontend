import React, { useState } from 'react';
import { Search, ChevronRight, Calendar, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplicationsWidget = ({ candidatures, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Style pour le statut
  const getStatusStyle = (status) => {
    switch(status) {
      case "entretien": return "text-green-500 bg-green-50";
      case "en_attente": return "text-yellow-500 bg-yellow-50";
      case "refusee": return "text-red-500 bg-red-50";
      case "vue": return "text-blue-500 bg-blue-50";
      case "acceptee": return "text-green-500 bg-green-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  // Formater le statut pour l'affichage
  const formatStatus = (status) => {
    const statusMapping = {
      "en_attente": "En attente",
      "vue": "Vue",
      "entretien": "Entretien",
      "acceptee": "Acceptée",
      "refusee": "Refusée"
    };
    
    return statusMapping[status] || status;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Filtrer les candidatures selon la recherche
  const filteredCandidatures = candidatures.filter(candidature => 
    candidature.offre?.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidature.offre?.entreprise?.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          <div className="w-48 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">Mes candidatures</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredCandidatures.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {candidatures.length === 0 
                ? "Vous n'avez pas encore postulé à des offres."
                : "Aucune candidature ne correspond à votre recherche."}
            </div>
          ) : (
            filteredCandidatures.map(candidature => (
              <div key={candidature.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-800">{candidature.offre?.titre}</h4>
                  <p className="text-sm text-gray-500">{candidature.offre?.entreprise?.nom_entreprise}</p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(candidature.statut)}`}>
                    {formatStatus(candidature.statut)}
                  </span>
                  <Link 
                    to={`/candidatures/${candidature.id}`}
                    className="ml-3 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Actions rapides */}
      {candidatures.some(c => c.statut === 'entretien' || (c.offre?.test_requis && !c.test_complete)) && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium text-gray-800 mb-3">Actions recommandées</h3>
          <div className="space-y-2">
            {candidatures
              .filter(c => c.statut === 'entretien')
              .map(candidature => (
                <div key={candidature.id} className="flex items-center p-3 bg-blue-50 rounded-md">
                  <Calendar className="text-blue-500 mr-2" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Entretien {candidature.offre?.entreprise?.nom_entreprise} - {formatDate(candidature.updated_at)}</p>
                  </div>
                  <Link
                    to={`/candidatures/${candidature.id}`}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Préparer
                  </Link>
                </div>
              ))
            }
            
            {candidatures
              .filter(c => c.offre?.test_requis && !c.test_complete)
              .map(candidature => (
                <div key={`test-${candidature.id}`} className="flex items-center p-3 bg-amber-50 rounded-md">
                  <Book className="text-amber-500 mr-2" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Test technique à compléter - {candidature.offre?.entreprise?.nom_entreprise}</p>
                  </div>
                  <Link
                    to={`/tests/${candidature.offre?.test?.id}/candidatures/${candidature.id}`}
                    className="text-xs bg-amber-500 text-white px-2 py-1 rounded"
                  >
                    Commencer
                  </Link>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsWidget;