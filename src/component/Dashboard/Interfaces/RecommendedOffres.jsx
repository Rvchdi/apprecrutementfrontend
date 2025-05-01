import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Filter, ChevronDown, Percent } from 'lucide-react';

// Basic Loading/Error components with improved styling
const LoadingIndicator = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    <p className="ml-4 text-gray-600">Chargement des offres recommandées...</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message || "Impossible de charger les offres recommandées."}</p>
      </div>
    </div>
  </div>
);

const NoOffersMessage = () => (
  <div className="text-center p-8 bg-gray-50 rounded-lg">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre recommandée</h3>
    <p className="mt-1 text-sm text-gray-500">
      Nous n'avons pas encore de recommandations pour vous.<br />
      Complétez votre profil avec plus de compétences pour obtenir des suggestions personnalisées.
    </p>
  </div>
);

function RecommendedOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMatch: 0,
    offerTypes: [], // 'stage', 'emploi', 'alternance'
    includeApplied: false
  });

  useEffect(() => {
    const fetchRecommendedOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Construire les paramètres de requête
        const params = {};
        
        if (filters.includeApplied) {
          params.include_applied = true;
        }
        
        // Utiliser axios au lieu de fetch
        const response = await axios.get('/api/etudiant/offres/recommended', { 
          params,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Avec axios, les données sont déjà parsées du JSON
        const data = response.data;
        setOffers(data.recommended_offers || []); // Ensure offers is always an array
        setStudentProfile(data.etudiant_profile);
      } catch (err) {
        console.error("Failed to fetch recommended offers:", err);
        // Extraire le message d'erreur spécifique si disponible
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
     
    fetchRecommendedOffers();
  }, [filters.includeApplied]); // Re-fetch when includeApplied filter changes

  // Filtrer les offres côté client selon le score minimum et le type
  const filteredOffers = offers.filter(offer => {
    // Appliquer le filtre de pourcentage de correspondance
    if (offer.match_percentage < filters.minMatch) {
      return false;
    }
    
    // Appliquer le filtre de type d'offre
    if (filters.offerTypes.length > 0 && !filters.offerTypes.includes(offer.type)) {
      return false;
    }
    
    return true;
  });

  // Gérer le changement de filtre de type
  const handleTypeFilterChange = (type) => {
    setFilters(prev => {
      const offerTypes = [...prev.offerTypes];
      const index = offerTypes.indexOf(type);
      
      if (index === -1) {
        offerTypes.push(type);
      } else {
        offerTypes.splice(index, 1);
      }
      
      return {
        ...prev,
        offerTypes
      };
    });
  };

  // --- Render Logic ---
  if (loading) {
    return <LoadingIndicator />;
  }
   
  if (error) {
    return <ErrorMessage message={error} />;
  }
   
  if (!offers.length) {
    return <NoOffersMessage />;
  }

  // Badge de type d'offre avec style approprié
  const OfferTypeBadge = ({ type }) => {
    const typeStyles = {
      'stage': 'bg-purple-100 text-purple-800',
      'emploi': 'bg-blue-100 text-blue-800',
      'alternance': 'bg-orange-100 text-orange-800'
    };
    
    const typeName = {
      'stage': 'Stage',
      'emploi': 'Emploi',
      'alternance': 'Alternance'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeStyles[type] || 'bg-gray-100 text-gray-800'}`}>
        {typeName[type] || type}
      </span>
    );
  };

  // Badge de correspondance avec couleur selon le pourcentage
  const MatchBadge = ({ percentage }) => {
    let color = 'bg-gray-100 text-gray-800';
    
    if (percentage >= 80) {
      color = 'bg-green-100 text-green-800';
    } else if (percentage >= 60) {
      color = 'bg-teal-100 text-teal-800';
    } else if (percentage >= 40) {
      color = 'bg-blue-100 text-blue-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center ${color}`}>
        <Percent className="w-3 h-3 mr-1" />
        {percentage}% match
      </span>
    );
  };
   
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Award className="w-6 h-6 mr-2 text-teal-500" />
          Offres Recommandées Pour Vous
        </h2>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-gray-600 hover:text-teal-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtrer
          <ChevronDown className={`w-4 h-4 ml-1 transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre de pourcentage minimal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correspondance minimale: {filters.minMatch}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.minMatch}
                onChange={(e) => setFilters(prev => ({ ...prev, minMatch: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Filtre de type d'offre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'offre
              </label>
              <div className="flex flex-wrap gap-2">
                {['stage', 'emploi', 'alternance'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilterChange(type)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      filters.offerTypes.includes(type)
                        ? type === 'stage' ? 'bg-purple-100 text-purple-800' :
                          type === 'emploi' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {type === 'stage' ? 'Stage' : 
                     type === 'emploi' ? 'Emploi' : 
                     'Alternance'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Inclure offres postulées */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeApplied"
                checked={filters.includeApplied}
                onChange={(e) => setFilters(prev => ({ ...prev, includeApplied: e.target.checked }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="includeApplied" className="ml-2 block text-sm text-gray-700">
                Inclure offres déjà postulées
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Information sur le nombre de résultats */}
      <p className="text-sm text-gray-600 mb-4">
        {filteredOffers.length} offre{filteredOffers.length !== 1 ? 's' : ''} correspond{filteredOffers.length !== 1 ? 'ent' : ''} à vos critères
      </p>
      
      {/* Liste des offres */}
      {filteredOffers.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600">Aucune offre ne correspond à vos filtres actuels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* En-tête avec badge de correspondance */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <OfferTypeBadge type={offer.type} />
                <MatchBadge percentage={offer.match_percentage} />
              </div>
              
              {/* Corps de la carte */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{offer.titre}</h3>
                <p className="text-sm text-gray-600 mb-3">{offer.entreprise?.nom_entreprise}</p>
                
                {/* Description courte */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {offer.description?.substring(0, 150)}...
                </p>
                
                {/* Compétences */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {offer.competences?.slice(0, 3).map(comp => (
                    <span key={comp.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {comp.nom}
                    </span>
                  ))}
                  {offer.competences?.length > 3 && (
                    <span className="text-xs text-gray-500">+{offer.competences.length - 3}</span>
                  )}
                </div>
                
                {/* Détails de la correspondance si disponibles */}
                {offer.score_details && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div>Compétences: {offer.score_details.competences}%</div>
                      <div>Localisation: {offer.score_details.localisation}%</div>
                      <div>Disponibilité: {offer.score_details.disponibilite}%</div>
                      <div>Fraîcheur: {offer.score_details.fraicheur}%</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer avec lien vers l'offre */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <a 
                  href={`/offers/${offer.id}`}
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Voir l'offre →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedOffers;