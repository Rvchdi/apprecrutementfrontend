import React, { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  EyeIcon, 
  SearchIcon, 
  FilterIcon,
  BriefcaseIcon,
  OfficeBuildingIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationIcon,
  LocationMarkerIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/outline';
import axios from 'axios';

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({ 
    type: 'all',
    statut: 'all'
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Chargement des offres
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/offres');
        setOffers(response.data.offres);
        setFilteredOffers(response.data.offres);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des offres:', err);
        setError('Impossible de charger les offres. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Filtrage et tri des offres
  useEffect(() => {
    let result = [...offers];
    
    // Appliquer le filtre de recherche
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        offer =>
          offer.titre?.toLowerCase().includes(lowerCaseQuery) ||
          offer.description?.toLowerCase().includes(lowerCaseQuery) ||
          offer.localisation?.toLowerCase().includes(lowerCaseQuery) ||
          (offer.entreprise?.nom_entreprise && offer.entreprise.nom_entreprise.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Appliquer le filtre de type
    if (filters.type !== 'all') {
      result = result.filter(offer => offer.type === filters.type);
    }

    // Appliquer le filtre de statut
    if (filters.statut !== 'all') {
      result = result.filter(offer => offer.statut === filters.statut);
    }

    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Gérer le tri pour les entreprises (propriété imbriquée)
        if (sortConfig.key === 'entreprise') {
          const aEntreprise = a.entreprise?.nom_entreprise?.toLowerCase() || '';
          const bEntreprise = b.entreprise?.nom_entreprise?.toLowerCase() || '';
          
          if (aEntreprise < bEntreprise) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aEntreprise > bEntreprise) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Tri standard pour les autres propriétés
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOffers(result);
  }, [offers, searchQuery, filters, sortConfig]);

  // Trier par colonne
  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Gérer la sélection d'une offre pour la visualisation
  const handleViewClick = offer => {
    setSelectedOffer(offer);
    setIsViewModalOpen(true);
  };

  // Gérer la sélection d'une offre pour la suppression
  const handleDeleteClick = offer => {
    setSelectedOffer(offer);
    setIsDeleteModalOpen(true);
  };

  // Supprimer une offre
  const handleDeleteOffer = async () => {
    try {
      await axios.delete(`/api/admin/offres/${selectedOffer.id}`);
      
      // Mettre à jour la liste des offres
      setOffers(offers.filter(offer => offer.id !== selectedOffer.id));
      
      setIsDeleteModalOpen(false);
      // Afficher une notification de succès
      alert('Offre supprimée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'offre:', err);
      alert('Erreur lors de la suppression de l\'offre.');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOffers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex">
          <div className="py-1">
            <ExclamationIcon className="h-6 w-6 text-red-500 mr-4" />
          </div>
          <div>
            <p className="font-bold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Obtenir la classe de couleur en fonction du statut
  const getStatusColorClass = (statut) => {
    switch (statut) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'cloturee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la classe de couleur en fonction du type
  const getTypeColorClass = (type) => {
    switch (type) {
      case 'stage':
        return 'bg-blue-100 text-blue-800';
      case 'emploi':
        return 'bg-purple-100 text-purple-800';
      case 'alternance':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des offres</h2>
          <p className="text-gray-600">Gérer les offres publiées sur la plateforme</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une offre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les types</option>
                <option value="stage">Stage</option>
                <option value="emploi">Emploi</option>
                <option value="alternance">Alternance</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cloturee">Clôturée</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des offres */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {sortConfig.key === 'id' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('titre')}
                >
                  <div className="flex items-center">
                    Titre
                    {sortConfig.key === 'titre' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('entreprise')}
                >
                  <div className="flex items-center">
                    Entreprise
                    {sortConfig.key === 'entreprise' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortConfig.key === 'type' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('statut')}
                >
                  <div className="flex items-center">
                    Statut
                    {sortConfig.key === 'statut' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date de publication
                    {sortConfig.key === 'created_at' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune offre trouvée
                  </td>
                </tr>
              ) : (
                currentItems.map(offer => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {offer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.titre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <OfficeBuildingIcon className="flex-shrink-0 h-5 w-5 text-gray-500" />
                        <span className="ml-2 text-sm text-gray-900">
                          {offer.entreprise?.nom_entreprise || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColorClass(offer.type)}`}>
                        {offer.type === 'stage' ? 'Stage' :
                         offer.type === 'emploi' ? 'Emploi' :
                         offer.type === 'alternance' ? 'Alternance' : offer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(offer.statut)}`}>
                        {offer.statut === 'active' ? 'Active' :
                         offer.statut === 'inactive' ? 'Inactive' :
                         offer.statut === 'cloturee' ? 'Clôturée' : offer.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(offer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewClick(offer)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(offer)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{' '}
                <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                <span className="font-medium">
                  {indexOfLastItem > filteredOffers.length ? filteredOffers.length : indexOfLastItem}
                </span>{' '}
                sur <span className="font-medium">{filteredOffers.length}</span> offres
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronUpIcon className="h-5 w-5 transform rotate-90" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === i + 1 
                        ? 'z-10 bg-teal-50 border-teal-500 text-teal-600' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronDownIcon className="h-5 w-5 transform rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de visualisation détaillée */}
      {isViewModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                        Détails de l'offre
                      </h3>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(selectedOffer.statut)}`}>
                        {selectedOffer.statut === 'active' ? 'Active' :
                         selectedOffer.statut === 'inactive' ? 'Inactive' :
                         selectedOffer.statut === 'cloturee' ? 'Clôturée' : selectedOffer.statut}
                      </span>
                    </div>
                    
                    <div className="mt-4 space-y-6">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{selectedOffer.titre}</h4>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <OfficeBuildingIcon className="h-4 w-4 mr-1" />
                          <span>{selectedOffer.entreprise?.nom_entreprise || 'Entreprise non spécifiée'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Type</p>
                            <p className="text-sm text-gray-600">
                              {selectedOffer.type === 'stage' ? 'Stage' :
                               selectedOffer.type === 'emploi' ? 'Emploi' :
                               selectedOffer.type === 'alternance' ? 'Alternance' : selectedOffer.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <LocationMarkerIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Localisation</p>
                            <p className="text-sm text-gray-600">{selectedOffer.localisation || 'Non spécifiée'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Date de début</p>
                            <p className="text-sm text-gray-600">{formatDate(selectedOffer.date_debut)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Durée</p>
                            <p className="text-sm text-gray-600">
                              {selectedOffer.duree ? `${selectedOffer.duree} mois` : 'Non spécifiée'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Rémunération</p>
                            <p className="text-sm text-gray-600">
                              {selectedOffer.remuneration 
                                ? `${selectedOffer.remuneration} € ${selectedOffer.type === 'emploi' ? '/an' : '/mois'}`
                                : 'Non spécifiée'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <ExclamationIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Test requis</p>
                            <p className="text-sm text-gray-600">
                              {selectedOffer.test_requis ? 'Oui' : 'Non'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                        <div className="bg-gray-50 p-4 rounded-lg prose max-w-none">
                          <p className="text-sm text-gray-600 whitespace-pre-line">{selectedOffer.description}</p>
                        </div>
                      </div>
                      
                      {selectedOffer.competences && selectedOffer.competences.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Compétences requises</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedOffer.competences.map(comp => (
                              <span key={comp.id} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                                {comp.nom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Statistiques</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Nombre de vues</p>
                            <p className="text-lg font-semibold text-gray-800">{selectedOffer.vues_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Candidatures reçues</p>
                            <p className="text-lg font-semibold text-gray-800">{selectedOffer.candidatures_count || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    onClick={() => handleDeleteClick(selectedOffer)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                    Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
                      </p>
                      <p className="text-sm text-red-600 mt-2">
                        Attention : Toutes les candidatures associées à cette offre seront également supprimées.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteOffer}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;