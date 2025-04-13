import React, { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  PencilIcon, 
  SearchIcon, 
  PlusIcon,
  TagIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationIcon
} from '@heroicons/react/outline';
import axios from 'axios';

const CompetenceManagement = () => {
  const [competences, setCompetences] = useState([]);
  const [filteredCompetences, setFilteredCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });
  const [filters, setFilters] = useState({ categorie: 'all' });
  const [selectedCompetence, setSelectedCompetence] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);

  // État pour l'édition d'une compétence
  const [editForm, setEditForm] = useState({
    nom: '',
    categorie: ''
  });

  // État pour l'ajout d'une compétence
  const [addForm, setAddForm] = useState({
    nom: '',
    categorie: ''
  });

  // Chargement des compétences
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/competences');
        setCompetences(response.data.competences);
        setFilteredCompetences(response.data.competences);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(response.data.competences.map(comp => comp.categorie).filter(Boolean))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des compétences:', err);
        setError('Impossible de charger les compétences. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchCompetences();
  }, []);

  // Filtrage et tri des compétences
  useEffect(() => {
    let result = [...competences];
    
    // Appliquer le filtre de recherche
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        competence => competence.nom?.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Appliquer le filtre de catégorie
    if (filters.categorie !== 'all') {
      result = result.filter(competence => competence.categorie === filters.categorie);
    }

    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCompetences(result);
  }, [competences, searchQuery, filters, sortConfig]);

  // Trier par colonne
  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Gérer la sélection d'une compétence pour l'édition
  const handleEditClick = competence => {
    setSelectedCompetence(competence);
    setEditForm({
      nom: competence.nom || '',
      categorie: competence.categorie || ''
    });
    setIsEditModalOpen(true);
  };

  // Gérer la sélection d'une compétence pour la suppression
  const handleDeleteClick = competence => {
    setSelectedCompetence(competence);
    setIsDeleteModalOpen(true);
  };

  // Mettre à jour une compétence
  const handleUpdateCompetence = async () => {
    try {
      const response = await axios.put(`/api/admin/competences/${selectedCompetence.id}`, editForm);
      
      // Mettre à jour la liste des compétences
      setCompetences(competences.map(competence => 
        competence.id === selectedCompetence.id ? { ...competence, ...editForm } : competence
      ));
      
      setIsEditModalOpen(false);
      // Afficher une notification de succès
      alert('Compétence mise à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la compétence:', err);
      alert('Erreur lors de la mise à jour de la compétence.');
    }
  };

  // Ajouter une compétence
  const handleAddCompetence = async () => {
    try {
      const response = await axios.post('/api/admin/competences', addForm);
      
      // Ajouter la nouvelle compétence à la liste
      setCompetences([...competences, response.data.competence]);
      
      // Réinitialiser le formulaire
      setAddForm({
        nom: '',
        categorie: ''
      });
      
      setIsAddModalOpen(false);
      // Afficher une notification de succès
      alert('Compétence ajoutée avec succès !');
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la compétence:', err);
      alert('Erreur lors de l\'ajout de la compétence.');
    }
  };

  // Supprimer une compétence
  const handleDeleteCompetence = async () => {
    try {
      await axios.delete(`/api/admin/competences/${selectedCompetence.id}`);
      
      // Mettre à jour la liste des compétences
      setCompetences(competences.filter(competence => competence.id !== selectedCompetence.id));
      
      setIsDeleteModalOpen(false);
      // Afficher une notification de succès
      alert('Compétence supprimée avec succès !');
    } catch (err) {
      console.error('Erreur lors de la suppression de la compétence:', err);
      alert('Erreur lors de la suppression de la compétence.');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCompetences.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompetences.length / itemsPerPage);

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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des compétences</h2>
          <p className="text-gray-600">Gérer les compétences disponibles sur la plateforme</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <div className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            <span>Ajouter une compétence</span>
          </div>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des compétences */}
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
                  onClick={() => requestSort('nom')}
                >
                  <div className="flex items-center">
                    Nom
                    {sortConfig.key === 'nom' && (
                      sortConfig.direction === 'asc' 
                      ? <ChevronUpIcon className="w-4 h-4 ml-1" />
                      : <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('categorie')}
                >
                  <div className="flex items-center">
                    Catégorie
                    {sortConfig.key === 'categorie' && (
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
                    Date de création
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
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune compétence trouvée
                  </td>
                </tr>
              ) : (
                currentItems.map(competence => (
                  <tr key={competence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {competence.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {competence.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {competence.categorie || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(competence.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(competence)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(competence)}
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
                  {indexOfLastItem > filteredCompetences.length ? filteredCompetences.length : indexOfLastItem}
                </span>{' '}
                sur <span className="font-medium">{filteredCompetences.length}</span> compétences
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

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TagIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Ajouter une compétence
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="add-nom" className="block text-sm font-medium text-gray-700">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="add-nom"
                          value={addForm.nom}
                          onChange={(e) => setAddForm({ ...addForm, nom: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="add-categorie" className="block text-sm font-medium text-gray-700">
                          Catégorie
                        </label>
                        <input
                          type="text"
                          id="add-categorie"
                          value={addForm.categorie}
                          onChange={(e) => setAddForm({ ...addForm, categorie: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          list="categories-list"
                        />
                        <datalist id="categories-list">
                          {categories.map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddCompetence}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Modifier la compétence
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="edit-nom"
                          value={editForm.nom}
                          onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-categorie" className="block text-sm font-medium text-gray-700">
                          Catégorie
                        </label>
                        <input
                          type="text"
                          id="edit-categorie"
                          value={editForm.categorie}
                          onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          list="categories-list-edit"
                        />
                        <datalist id="categories-list-edit">
                          {categories.map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateCompetence}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Annuler
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
                        Êtes-vous sûr de vouloir supprimer cette compétence ? Cette action est irréversible.
                      </p>
                      <p className="text-sm text-red-600 mt-2">
                        Attention : Cette compétence pourrait être utilisée par des étudiants ou des offres d'emploi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteCompetence}
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

export default CompetenceManagement;