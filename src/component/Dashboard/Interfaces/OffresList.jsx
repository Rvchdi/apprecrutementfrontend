import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Tag, 
  AlertCircle,
  ChevronDown,
  X,
  Clock
} from 'lucide-react';
import axios from 'axios';

const OffresList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États
  const [offres, setOffres] = useState([]);
  const [filteredOffres, setFilteredOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    types: [],
    localisations: [],
    competences: []
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [competencesList, setCompetencesList] = useState([]);
  
  const itemsPerPage = 10;

  // Extraire les paramètres de recherche de l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Charger les compétences disponibles
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        const response = await axios.get('/api/competences');
        setCompetencesList(response.data.competences || []);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
    };
    
    fetchCompetences();
  }, []);

  // Charger les offres
  const fetchOffres = useCallback(async () => {
    try {
      setLoading(true);
      
      // Construire les paramètres de recherche
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (filters.types.length > 0) {
        filters.types.forEach(type => params.append('type[]', type));
      }
      
      if (filters.localisations.length > 0) {
        filters.localisations.forEach(loc => params.append('localisation[]', loc));
      }
      
      if (filters.competences.length > 0) {
        filters.competences.forEach(comp => params.append('competences[]', comp));
      }
      
      params.append('page', currentPage);
      
      const response = await axios.get(`/api/offres?${params.toString()}`);
      
      setOffres(response.data.offres.data || []);
      setFilteredOffres(response.data.offres.data || []);
      setTotalPages(Math.ceil((response.data.offres.total || 0) / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      setError('Une erreur est survenue lors du chargement des offres.');
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage]);

  useEffect(() => {
    fetchOffres();
  }, [fetchOffres]);

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOffres();
  };

  // Gérer les filtres
  const toggleFilter = (category, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      
      return newFilters;
    });
    
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      types: [],
      localisations: [],
      competences: []
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Naviguer vers la page de détail de l'offre
  const goToOffreDetail = (id) => {
    navigate(`/offres/${id}`);
  };

  // Extraire les localisations uniques pour les filtres
  const uniqueLocations = [...new Set(offres.map(offre => offre.localisation))].filter(Boolean);

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculer le temps écoulé depuis la publication
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  // Obtenir le style de background en fonction du type d'offre
  const getTypeBackground = (type) => {
    switch (type) {
      case 'stage': return 'bg-purple-100 text-purple-800';
      case 'emploi': return 'bg-blue-100 text-blue-800';
      case 'alternance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Traduire le type d'offre
  const translateType = (type) => {
    const translations = {
      'stage': 'Stage',
      'emploi': 'Emploi',
      'alternance': 'Alternance'
    };
    return translations[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offres d'emploi, stages et alternances</h1>
          <p className="text-gray-600">Trouvez l'opportunité qui correspond à votre profil</p>
        </div>
        
        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par titre, entreprise, compétence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button 
              type="submit"
              className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors flex-shrink-0"
            >
              Rechercher
            </button>
            
            <button 
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="sm:hidden flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter size={18} className="mr-2 text-gray-500" />
              Filtres
              {Object.values(filters).some(arr => arr.length > 0) && (
                <span className="ml-2 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                </span>
              )}
            </button>
          </form>
          
          {/* Filtres actifs (chips) */}
          {Object.values(filters).some(arr => arr.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.types.map(type => (
                <div key={type} className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {translateType(type)}
                  <button 
                    onClick={() => toggleFilter('types', type)}
                    className="ml-1 hover:text-teal-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {filters.localisations.map(location => (
                <div key={location} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {location}
                  <button 
                    onClick={() => toggleFilter('localisations', location)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {filters.competences.map(compId => {
                const comp = competencesList.find(c => c.id === parseInt(compId));
                return (
                  <div key={compId} className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-xs flex items-center">
                    {comp?.nom || compId}
                    <button 
                      onClick={() => toggleFilter('competences', compId)}
                      className="ml-1 hover:text-purple-900"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              
              <button 
                onClick={resetFilters}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full px-3 py-1 text-xs flex items-center"
              >
                Tout effacer
                <X size={14} className="ml-1" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtres (sidebar) - visible sur desktop */}
          <div className="w-full md:w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-gray-800">Filtres</h2>
                {Object.values(filters).some(arr => arr.length > 0) && (
                  <button 
                    onClick={resetFilters}
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
              
              {/* Type d'offre */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Type d'offre</h3>
                <div className="space-y-2">
                  {['stage', 'emploi', 'alternance'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                        {translateType(type)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Localisation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uniqueLocations.map((location) => (
                    <div key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`location-${location}`}
                        checked={filters.localisations.includes(location)}
                        onChange={() => toggleFilter('localisations', location)}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor={`location-${location}`} className="ml-2 text-sm text-gray-700 truncate">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Compétences */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Compétences</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {competencesList.slice(0, 15).map((comp) => (
                    <div key={comp.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`comp-${comp.id}`}
                        checked={filters.competences.includes(comp.id.toString())}
                        onChange={() => toggleFilter('competences', comp.id.toString())}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor={`comp-${comp.id}`} className="ml-2 text-sm text-gray-700 truncate">
                        {comp.nom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Panneau de filtres mobile */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)}></div>
              <div className="fixed inset-y-0 right-0 max-w-full flex">
                <div className="relative w-screen max-w-md">
                  <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        <span className="sr-only">Fermer</span>
                        <X size={24} aria-hidden="true" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      {/* Type d'offre */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Type d'offre</h3>
                        <div className="space-y-2">
                          {['stage', 'emploi', 'alternance'].map((type) => (
                            <div key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-type-${type}`}
                                checked={filters.types.includes(type)}
                                onChange={() => toggleFilter('types', type)}
                                className="rounded text-teal-500 focus:ring-teal-500"
                              />
                              <label htmlFor={`mobile-type-${type}`} className="ml-2 text-sm text-gray-700">
                                {translateType(type)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Localisation */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {uniqueLocations.map((location) => (
                            <div key={location} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-location-${location}`}
                                checked={filters.localisations.includes(location)}
                                onChange={() => toggleFilter('localisations', location)}
                                className="rounded text-teal-500 focus:ring-teal-500"
                              />
                              <label htmlFor={`mobile-location-${location}`} className="ml-2 text-sm text-gray-700 truncate">
                                {location}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Compétences */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Compétences</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {competencesList.slice(0, 15).map((comp) => (
                            <div key={comp.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-comp-${comp.id}`}
                                checked={filters.competences.includes(comp.id.toString())}
                                onChange={() => toggleFilter('competences', comp.id.toString())}
                                className="rounded text-teal-500 focus:ring-teal-500"
                              />
                              <label htmlFor={`mobile-comp-${comp.id}`} className="ml-2 text-sm text-gray-700 truncate">
                                {comp.nom}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 flex space-x-3">
                      <button
                        type="button"
                        className="flex-1 bg-gray-100 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-200"
                        onClick={resetFilters}
                      >
                        Réinitialiser
                      </button>
                      <button
                        type="button"
                        className="flex-1 bg-teal-500 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-teal-600"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Liste des offres */}
          <div className="flex-1">
            {/* État de chargement */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
                <p className="text-center text-gray-500 mt-4">Chargement des offres...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-red-500 mb-4">
                  <AlertCircle size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">{error}</p>
                <p className="text-center text-gray-500 mt-2">Veuillez réessayer ultérieurement.</p>
              </div>
            ) : filteredOffres.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-gray-400 mb-4">
                  <AlertCircle size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">Aucune offre trouvée</p>
                <p className="text-center text-gray-500 mt-2">Essayez de modifier vos critères de recherche.</p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* En-tête de la liste */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
                  <p className="text-gray-600 text-sm">
                    {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} trouvée{filteredOffres.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex space-x-2">
                    <select 
                      className="text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onChange={(e) => console.log(e.target.value)}
                    >
                      <option value="latest">Plus récentes</option>
                      <option value="oldest">Plus anciennes</option>
                    </select>
                  </div>
                </div>
                
                {/* Liste des offres */}
                <div className="space-y-4">
                  {filteredOffres.map((offre) => (
                    <div 
                      key={offre.id} 
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => goToOffreDetail(offre.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {offre.entreprise?.logo ? (
                                <img src={offre.entreprise.logo} alt={`Logo ${offre.entreprise.nom_entreprise}`} className="h-10 w-10 object-contain" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                                  {offre.entreprise?.nom_entreprise?.charAt(0) || 'E'}
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">{offre.titre}</h3>
                              <p className="text-gray-600">{offre.entreprise?.nom_entreprise}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${getTypeBackground(offre.type)}`}>
                            {translateType(offre.type)}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-y-2 gap-x-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin size={16} className="mr-1" />
                            {offre.localisation}
                          </div>
                          
                          {offre.remuneration && (
                            <div className="flex items-center text-gray-600">
                              <Tag size={16} className="mr-1" />
                              {offre.remuneration} € {offre.type === 'stage' || offre.type === 'alternance' ? '/mois' : '/an'}
                            </div>
                          )}
                          
                          <div className="flex items-center text-gray-600">
                            <Calendar size={16} className="mr-1" />
                            Début : {formatDate(offre.date_debut)}
                          </div>
                          
                          {offre.duree && (
                            <div className="flex items-center text-gray-600">
                              <Clock size={16} className="mr-1" />
                              {offre.duree} mois
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-gray-700 line-clamp-2">
                            {offre.description}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {offre.competences?.slice(0, 5).map((comp) => (
                            <span key={comp.id} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                              {comp.nom}
                            </span>
                          ))}
                          
                          {offre.competences?.length > 5 && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                              +{offre.competences.length - 5}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(offre.created_at)}
                          </span>
                          <button className="px-4 py-1 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-colors">
                            Voir détails
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Précédent
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === i + 1
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffresList;