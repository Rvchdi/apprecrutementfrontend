import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Book, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../Authentication/AuthContext';

const TestsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    statut: [], // 'actif', 'inactif'
    duree: []   // 'court', 'moyen', 'long'
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [expandedTest, setExpandedTest] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  
  const itemsPerPage = 10;
  const isEntreprise = user?.role === 'entreprise';
  const isAdmin = user?.role === 'admin';
  const canCreateTests = isEntreprise || isAdmin;

  // Charger les tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        
        // Endpoint différent selon le rôle
        let url = '/api/tests';
        if (isEntreprise) {
          url = '/api/entreprise/tests';
        } else if (isAdmin) {
          url = '/api/admin/tests';
        }
        
        const response = await axios.get(url);
        
        // Normaliser la structure des données
        const testsData = response.data.tests || [];
        
        setTests(testsData);
        setFilteredTests(testsData);
        setTotalPages(Math.ceil(testsData.length / itemsPerPage));
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des tests:', error);
        setError('Une erreur est survenue lors du chargement des tests. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    fetchTests();
  }, [isEntreprise, isAdmin]);

  // Filtrer et trier les tests
  useEffect(() => {
    const filterAndSortTests = () => {
      let results = [...tests];
      
      // Filtrer par recherche textuelle
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(test => 
          test.titre.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query) ||
          test.offre?.titre?.toLowerCase().includes(query)
        );
      }
      
      // Filtrer par statut
      if (filters.statut.length > 0) {
        results = results.filter(test => {
          if (filters.statut.includes('actif') && test.offre?.statut === 'active') return true;
          if (filters.statut.includes('inactif') && test.offre?.statut !== 'active') return true;
          return false;
        });
      }
      
      // Filtrer par durée
      if (filters.duree.length > 0) {
        results = results.filter(test => {
          const duree = test.duree_minutes;
          if (filters.duree.includes('court') && duree <= 30) return true;
          if (filters.duree.includes('moyen') && duree > 30 && duree <= 60) return true;
          if (filters.duree.includes('long') && duree > 60) return true;
          return false;
        });
      }
      
      // Trier les résultats
      results.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Gérer le tri par propriété imbriquée (ex: offre.titre)
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }
        
        // Gérer les valeurs nulles
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Comparer les valeurs
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
      
      setFilteredTests(results);
      setTotalPages(Math.ceil(results.length / itemsPerPage));
      setCurrentPage(1); // Réinitialiser à la première page
    };
    
    if (tests.length > 0) {
      filterAndSortTests();
    }
  }, [tests, searchQuery, filters, sortConfig]);
  
  // Obtenir les tests pour la page courante
  const getCurrentPageTests = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTests.slice(startIndex, endIndex);
  };

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
      statut: [],
      duree: []
    });
    setSearchQuery('');
  };

  // Gérer le tri
  const requestSort = (key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Naviguer vers la création d'un test
  const goToCreateTest = () => {
    navigate('/tests/create');
  };

  // Naviguer vers l'édition d'un test
  const goToEditTest = (id, e) => {
    e.stopPropagation();
    navigate(`/tests/${id}/edit`);
  };

  // Afficher le modal de confirmation de suppression
  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setTestToDelete(id);
    setDeleteModalOpen(true);
  };

  // Supprimer un test
  const deleteTest = async () => {
    if (!testToDelete) return;
    
    try {
      await axios.delete(`/api/tests/${testToDelete}`);
      
      // Mettre à jour la liste des tests
      setTests(tests.filter(test => test.id !== testToDelete));
      
      // Fermer le modal
      setDeleteModalOpen(false);
      setTestToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du test:', error);
      setError('Une erreur est survenue lors de la suppression du test.');
    }
  };

  // Formater la durée du test
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Basculer l'affichage détaillé d'un test
  const toggleExpandTest = (id) => {
    setExpandedTest(expandedTest === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 pt-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tests de compétences</h1>
            <p className="text-gray-600">
              {isEntreprise 
                ? 'Créez et gérez vos tests pour évaluer les candidats'
                : 'Consultez les tests disponibles pour les offres'}
            </p>
          </div>
          
          {canCreateTests && (
            <button
              onClick={goToCreateTest}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Créer un test
            </button>
          )}
        </div>
        
        {/* Barre de recherche principale */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par titre, description..." 
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
              {filters.statut.map(statut => (
                <div key={statut} className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {statut === 'actif' ? 'Actif' : 'Inactif'}
                  <button 
                    onClick={() => toggleFilter('statut', statut)}
                    className="ml-1 hover:text-teal-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {filters.duree.map(duree => (
                <div key={duree} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {duree === 'court' ? 'Court (≤ 30min)' : 
                   duree === 'moyen' ? 'Moyen (31-60min)' : 
                   'Long (> 60min)'}
                  <button 
                    onClick={() => toggleFilter('duree', duree)}
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
              
              {/* Statut */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Statut</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="statut-actif"
                      checked={filters.statut.includes('actif')}
                      onChange={() => toggleFilter('statut', 'actif')}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor="statut-actif" className="ml-2 text-sm text-gray-700">Actif</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="statut-inactif"
                      checked={filters.statut.includes('inactif')}
                      onChange={() => toggleFilter('statut', 'inactif')}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor="statut-inactif" className="ml-2 text-sm text-gray-700">Inactif</label>
                  </div>
                </div>
              </div>
              
              {/* Durée */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Durée</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="duree-court"
                      checked={filters.duree.includes('court')}
                      onChange={() => toggleFilter('duree', 'court')}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor="duree-court" className="ml-2 text-sm text-gray-700">Court (≤ 30 min)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="duree-moyen"
                      checked={filters.duree.includes('moyen')}
                      onChange={() => toggleFilter('duree', 'moyen')}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor="duree-moyen" className="ml-2 text-sm text-gray-700">Moyen (31-60 min)</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="duree-long"
                      checked={filters.duree.includes('long')}
                      onChange={() => toggleFilter('duree', 'long')}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor="duree-long" className="ml-2 text-sm text-gray-700">Long (> 60 min)</label>
                  </div>
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
                      {/* Statut */}
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Statut</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mobile-statut-actif"
                              checked={filters.statut.includes('actif')}
                              onChange={() => toggleFilter('statut', 'actif')}
                              className="rounded text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="mobile-statut-actif" className="ml-2 text-sm text-gray-700">Actif</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mobile-statut-inactif"
                              checked={filters.statut.includes('inactif')}
                              onChange={() => toggleFilter('statut', 'inactif')}
                              className="rounded text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="mobile-statut-inactif" className="ml-2 text-sm text-gray-700">Inactif</label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Durée */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Durée</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mobile-duree-court"
                              checked={filters.duree.includes('court')}
                              onChange={() => toggleFilter('duree', 'court')}
                              className="rounded text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="mobile-duree-court" className="ml-2 text-sm text-gray-700">Court (≤ 30 min)</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mobile-duree-moyen"
                              checked={filters.duree.includes('moyen')}
                              onChange={() => toggleFilter('duree', 'moyen')}
                              className="rounded text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="mobile-duree-moyen" className="ml-2 text-sm text-gray-700">Moyen (31-60 min)</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="mobile-duree-long"
                              checked={filters.duree.includes('long')}
                              onChange={() => toggleFilter('duree', 'long')}
                              className="rounded text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="mobile-duree-long" className="ml-2 text-sm text-gray-700">Long (> 60 min)</label>
                          </div>
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
          
          {/* Liste des tests */}
          <div className="flex-1">
            {/* État de chargement */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
                <p className="text-center text-gray-500 mt-4">Chargement des tests...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-red-500 mb-4">
                  <AlertCircle size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">{error}</p>
                <p className="text-center text-gray-500 mt-2">Veuillez réessayer ultérieurement.</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-center text-gray-400 mb-4">
                  <Book size={48} />
                </div>
                <p className="text-center text-gray-700 font-medium">Aucun test trouvé</p>
                <p className="text-center text-gray-500 mt-2">
                  {canCreateTests 
                    ? 'Créez votre premier test pour évaluer les candidats'
                    : 'Essayez de modifier vos critères de recherche'}
                </p>
                {canCreateTests && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={goToCreateTest}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Créer un test
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* En-tête de la liste */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
                  <p className="text-gray-600 text-sm">
                    {filteredTests.length} test{filteredTests.length > 1 ? 's' : ''} trouvé{filteredTests.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex space-x-2">
                    <select 
                      className="text-sm border border-gray-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onChange={(e) => requestSort(e.target.value)}
                      value={sortConfig.key}
                    >
                      <option value="created_at">Date de création</option>
                      <option value="titre">Titre (A-Z)</option>
                      <option value="duree_minutes">Durée</option>
                      <option value="offre.titre">Offre</option>
                    </select>
                    <button
                      onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                      className="p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                
                {/* Liste des tests */}
                <div className="space-y-4">
                  {getCurrentPageTests().map((test) => (
                    <div 
                      key={test.id} 
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpandTest(test.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="mr-3 bg-teal-100 p-2 rounded-lg">
                              <Book size={20} className="text-teal-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{test.titre}</h3>
                              <p className="text-sm text-gray-600">
                                {test.offre?.titre 
                                  ? `Pour l'offre : ${test.offre.titre}` 
                                  : 'Aucune offre associée'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                              test.offre?.statut === 'active' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {test.offre?.statut === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                            <div className="w-4">
                              {expandedTest === test.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-1" />
                            {formatDuration(test.duree_minutes)}
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Calendar size={16} className="mr-1" />
                            Créé le {formatDate(test.created_at)}
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <FileText size={16} className="mr-1" />
                            {test.questions?.length || 0} question{test.questions?.length !== 1 ? 's' : ''}
                          </div>
                          
                          {(test.candidatures_count || test.tentatives_count) && (
                            <div className="flex items-center text-gray-600">
                              <Users size={16} className="mr-1" />
                              {test.candidatures_count || test.tentatives_count} passage{(test.candidatures_count || test.tentatives_count) !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Détails du test (visible uniquement si déplié) */}
                      {expandedTest === test.id && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                          {test.description && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                              <p className="text-sm text-gray-600">{test.description}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-4 mb-4">
                            {test.questions && test.questions.length > 0 && (
                              <div className="w-full md:w-auto">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Questions</h4>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {test.questions.slice(0, 3).map((question, index) => (
                                    <li key={index} className="truncate">{question.contenu}</li>
                                  ))}
                                  {test.questions.length > 3 && (
                                    <li className="text-gray-500">+ {test.questions.length - 3} autres questions</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          {(isEntreprise || isAdmin) && (
                            <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100">
                              <button
                                onClick={(e) => goToEditTest(test.id, e)}
                                className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <Edit size={14} className="mr-1" />
                                Modifier
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(test.id, e)}
                                className="text-xs px-3 py-1.5 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
      
      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmation de suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce test ? Cette action est irréversible et supprimera également toutes les données associées.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={deleteTest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestsList;