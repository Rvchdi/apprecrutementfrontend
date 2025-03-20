import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Briefcase, 
  Globe, 
  Filter, 
  X,
  Building,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

const EntreprisesList = () => {
  // États
  const [entreprises, setEntreprises] = useState([]);
  const [filteredEntreprises, setFilteredEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    secteurs: [],
    localisations: []
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Options de filtrage (statiques pour la démo, mais pourraient être chargées depuis l'API)
  const secteurs = [
    "Technologie",
    "Finance",
    "Santé",
    "Éducation",
    "Commerce",
    "Communication",
    "Ingénierie",
    "Marketing",
    "Ressources Humaines",
    "Autre"
  ];
  
  const localisations = [
    "Paris",
    "Lyon",
    "Marseille",
    "Bordeaux",
    "Toulouse",
    "Lille",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Autre"
  ];
  
  // Simuler le chargement des données depuis le serveur
  useEffect(() => {
    const fetchEntreprises = async () => {
      try {
        setLoading(true);
        
        // Simule un appel API
        // Dans un cas réel, utilisez axios ou fetch:
        // const response = await axios.get('/api/entreprises');
        // setEntreprises(response.data.entreprises);
        
        // Données fictives pour la démo
        const mockEntreprises = [
          {
            id: 1,
            nom_entreprise: "Tech Innovations",
            logo: null,
            secteur_activite: "Technologie",
            taille: "50-200",
            site_web: "http://www.techinnovations.com",
            description: "Entreprise spécialisée dans le développement d'applications web et mobiles innovantes.",
            ville: "Paris",
            offres_count: 12,
            est_verifie: true,
            created_at: "2025-01-15"
          },
          {
            id: 2,
            nom_entreprise: "Finance Experts",
            logo: null,
            secteur_activite: "Finance",
            taille: "200-500",
            site_web: "http://www.finance-experts.com",
            description: "Cabinet de conseil financier offrant des services aux entreprises et aux particuliers.",
            ville: "Lyon",
            offres_count: 8,
            est_verifie: true,
            created_at: "2025-02-10"
          },
          {
            id: 3,
            nom_entreprise: "Health Solutions",
            logo: null,
            secteur_activite: "Santé",
            taille: "500+",
            site_web: "http://www.healthsolutions.com",
            description: "Développement de solutions technologiques pour le secteur de la santé.",
            ville: "Marseille",
            offres_count: 15,
            est_verifie: true,
            created_at: "2025-01-20"
          },
          {
            id: 4,
            nom_entreprise: "EduLearn",
            logo: null,
            secteur_activite: "Éducation",
            taille: "10-50",
            site_web: "http://www.edulearn.com",
            description: "Plateforme e-learning proposant des formations en ligne dans divers domaines.",
            ville: "Bordeaux",
            offres_count: 5,
            est_verifie: false,
            created_at: "2025-03-01"
          },
          {
            id: 5,
            nom_entreprise: "Digital Agency",
            logo: null,
            secteur_activite: "Communication",
            taille: "10-50",
            site_web: "http://www.digital-agency.com",
            description: "Agence digitale spécialisée dans la création de sites web et le marketing digital.",
            ville: "Paris",
            offres_count: 7,
            est_verifie: true,
            created_at: "2025-02-25"
          },
          {
            id: 6,
            nom_entreprise: "Retail Masters",
            logo: null,
            secteur_activite: "Commerce",
            taille: "200-500",
            site_web: "http://www.retailmasters.com",
            description: "Entreprise leader dans le secteur de la distribution et du commerce de détail.",
            ville: "Lille",
            offres_count: 10,
            est_verifie: true,
            created_at: "2025-01-10"
          },
          {
            id: 7,
            nom_entreprise: "Ingénierie Solutions",
            logo: null,
            secteur_activite: "Ingénierie",
            taille: "50-200",
            site_web: "http://www.ingenieriesolutions.com",
            description: "Bureau d'études et de conseil en ingénierie industrielle et civile.",
            ville: "Toulouse",
            offres_count: 6,
            est_verifie: false,
            created_at: "2025-03-05"
          },
          {
            id: 8,
            nom_entreprise: "Marketing Pro",
            logo: null,
            secteur_activite: "Marketing",
            taille: "10-50",
            site_web: "http://www.marketingpro.com",
            description: "Agence de marketing offrant des services de stratégie marketing et de communication.",
            ville: "Nantes",
            offres_count: 4,
            est_verifie: true,
            created_at: "2025-02-20"
          }
        ];
        
        // Attente simulée pour démontrer le chargement
        setTimeout(() => {
          setEntreprises(mockEntreprises);
          setFilteredEntreprises(mockEntreprises);
          setTotalPages(Math.ceil(mockEntreprises.length / 6)); // 6 entreprises par page
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Erreur lors du chargement des entreprises:", err);
        setError("Une erreur est survenue lors du chargement des entreprises. Veuillez réessayer ultérieurement.");
        setLoading(false);
      }
    };
    
    fetchEntreprises();
  }, []);
  
  // Filtrer les entreprises en fonction des critères sélectionnés
  useEffect(() => {
    const filterEntreprises = () => {
      let results = [...entreprises];
      
      // Filtrer par recherche textuelle
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          entreprise => 
            entreprise.nom_entreprise.toLowerCase().includes(query) ||
            entreprise.description.toLowerCase().includes(query) ||
            entreprise.secteur_activite.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par secteur d'activité
      if (filters.secteurs.length > 0) {
        results = results.filter(
          entreprise => filters.secteurs.includes(entreprise.secteur_activite)
        );
      }
      
      // Filtrer par localisation
      if (filters.localisations.length > 0) {
        results = results.filter(
          entreprise => filters.localisations.includes(entreprise.ville)
        );
      }
      
      setFilteredEntreprises(results);
      setTotalPages(Math.ceil(results.length / 6)); // 6 entreprises par page
      setCurrentPage(1); // Réinitialiser à la première page lors d'un changement de filtre
    };
    
    if (entreprises.length > 0) {
      filterEntreprises();
    }
  }, [entreprises, searchQuery, filters]);
  
  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche est déjà gérée via l'useEffect
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
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      secteurs: [],
      localisations: []
    });
    setSearchQuery('');
  };
  
  // Obtenir la première lettre pour l'avatar (si pas de logo)
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'E';
  };
  
  // Obtenir les entreprises pour la page courante
  const getCurrentPageEntreprises = () => {
    const startIndex = (currentPage - 1) * 6;
    const endIndex = startIndex + 6;
    return filteredEntreprises.slice(startIndex, endIndex);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Annuaire des entreprises</h1>
          <p className="text-gray-600">Découvrez les entreprises qui recrutent sur notre plateforme</p>
        </div>
        
        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, secteur d'activité..." 
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
              {filters.secteurs.map(secteur => (
                <div key={secteur} className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {secteur}
                  <button 
                    onClick={() => toggleFilter('secteurs', secteur)}
                    className="ml-1 hover:text-teal-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {filters.localisations.map(localisation => (
                <div key={localisation} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {localisation}
                  <button 
                    onClick={() => toggleFilter('localisations', localisation)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
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
              
              {/* Secteur d'activité */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Secteur d'activité</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {secteurs.map((secteur) => (
                    <div key={secteur} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`secteur-${secteur}`}
                        checked={filters.secteurs.includes(secteur)}
                        onChange={() => toggleFilter('secteurs', secteur)}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor={`secteur-${secteur}`} className="ml-2 text-sm text-gray-700">
                        {secteur}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Localisation */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {localisations.map((localisation) => (
                    <div key={localisation} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`localisation-${localisation}`}
                        checked={filters.localisations.includes(localisation)}
                        onChange={() => toggleFilter('localisations', localisation)}
                        className="rounded text-teal-500 focus:ring-teal-500"
                      />
                      <label htmlFor={`localisation-${localisation}`} className="ml-2 text-sm text-gray-700">
                        {localisation}
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
                      {/* Secteur d'activité */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Secteur d'activité</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {secteurs.map((secteur) => (
                            <div key={secteur} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-secteur-${secteur}`}
                                checked={filters.secteurs.includes(secteur)}
                                onChange={() => toggleFilter('secteurs', secteur)}
                                className="rounded text-teal-500 focus:ring-teal-500"
                              />
                              <label htmlFor={`mobile-secteur-${secteur}`} className="ml-2 text-sm text-gray-700">
                                {secteur}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Localisation */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {localisations.map((localisation) => (
                            <div key={localisation} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`mobile-localisation-${localisation}`}
                                checked={filters.localisations.includes(localisation)}
                                onChange={() => toggleFilter('localisations', localisation)}
                                className="rounded text-teal-500 focus:ring-teal-500"
                              />
                              <label htmlFor={`mobile-localisation-${localisation}`} className="ml-2 text-sm text-gray-700">
                                {localisation}
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
          
          {/* Liste des entreprises */}
          <div className="flex-1">
            {/* État de chargement */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
                <p className="text-center text-gray-500 mt-4">Chargement des entreprises...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-red-500 mb-4">
                  <AlertCircle size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">{error}</p>
                <p className="text-center text-gray-500 mt-2">Veuillez réessayer ultérieurement.</p>
              </div>
            ) : filteredEntreprises.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-gray-400 mb-4">
                  <Building size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">Aucune entreprise trouvée</p>
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
                    {filteredEntreprises.length} entreprise{filteredEntreprises.length > 1 ? 's' : ''} trouvée{filteredEntreprises.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex space-x-2">
                    <select 
                      className="text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onChange={(e) => console.log(e.target.value)}
                    >
                      <option value="nom">Nom (A-Z)</option>
                      <option value="offres">Nombre d'offres</option>
                      <option value="recent">Plus récentes</option>
                    </select>
                  </div>
                </div>
                
                {/* Grille des entreprises */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentPageEntreprises().map((entreprise) => (
                    <div 
                      key={entreprise.id} 
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => console.log(`Voir l'entreprise ${entreprise.id}`)}
                    >
                      {/* En-tête avec couleur de fond selon le secteur */}
                      <div className="h-16 bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center relative">
                        <div className="absolute -bottom-8 left-4 h-16 w-16 rounded-full bg-white shadow flex items-center justify-center">
                          {entreprise.logo ? (
                            <img 
                              src={entreprise.logo} 
                              alt={`Logo ${entreprise.nom_entreprise}`} 
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-semibold">
                              {getInitial(entreprise.nom_entreprise)}
                            </div>
                          )}
                        </div>
                        
                        {entreprise.est_verifie && (
                          <div className="absolute top-2 right-2 bg-white text-teal-500 rounded-full px-2 py-0.5 text-xs font-medium">
                            Vérifié
                          </div>
                        )}
                      </div>
                      
                      {/* Contenu principal */}
                      <div className="p-4 pt-10">
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {entreprise.nom_entreprise}
                        </h3>
                        
                        <div className="text-sm text-gray-600 mb-3 flex items-center">
                          <Briefcase size={14} className="mr-1" />
                          {entreprise.secteur_activite}
                        </div>
                        
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {entreprise.description}
                        </p>
                        
                        <div className="flex flex-col space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{entreprise.ville}</span>
                          </div>
                          
                          {entreprise.taille && (
                            <div className="flex items-center text-gray-600">
                              <Users size={14} className="mr-1 flex-shrink-0" />
                              <span>{entreprise.taille} employés</span>
                            </div>
                          )}
                          
                          {entreprise.site_web && (
                            <div className="flex items-center text-gray-600">
                              <Globe size={14} className="mr-1 flex-shrink-0" />
                              <a 
                                href={entreprise.site_web} 
                                className="text-teal-600 hover:text-teal-700 truncate" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {entreprise.site_web.replace(/^https?:\/\/(www\.)?/, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Pied de carte */}
                      <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-teal-600">{entreprise.offres_count}</span> offre{entreprise.offres_count !== 1 ? 's' : ''}
                        </div>
                        <button className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                          Voir le profil
                        </button>
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

export default EntreprisesList;