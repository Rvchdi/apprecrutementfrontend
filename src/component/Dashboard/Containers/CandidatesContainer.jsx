import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Mail, 
  Phone,
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageSquare,
  CalendarDays,
  ExternalLink,
  Download,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../Authentication/AuthContext';

const CandidatesContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [candidatures, setCandidatures] = useState([]);
  const [filteredCandidatures, setFilteredCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    statut: [], // 'en_attente', 'vue', 'entretien', 'acceptee', 'refusee'
    test: []    // 'complete', 'incomplete'
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date_candidature', direction: 'desc' });
  const [expandedCandidature, setExpandedCandidature] = useState(null);
  
  // État pour le modal d'entretien
  const [isEntretienModalOpen, setIsEntretienModalOpen] = useState(false);
  const [entretienData, setEntretienData] = useState({
    candidatureId: null,
    date: '',
    heure: '',
    type: 'présentiel', // ou 'visio'
    lieu: '',
    lien_visio: '',
    note: ''
  });
  
  // Référence pour le menu de filtres
  const filterMenuRef = useRef(null);
  
  const itemsPerPage = 10;
  
  // Charger les candidatures
  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        setLoading(true);
        
        // Vérifier si l'utilisateur est une entreprise
        if (user?.role !== 'entreprise') {
          navigate('/unauthorized');
          return;
        }
        
        const response = await axios.get('/api/entreprise/candidatures');
        
        if (response.data && response.data.candidatures) {
          const candidaturesData = response.data.candidatures;
          setCandidatures(candidaturesData);
          setFilteredCandidatures(candidaturesData);
          setTotalPages(Math.ceil(candidaturesData.length / itemsPerPage));
        } else {
          setCandidatures([]);
          setFilteredCandidatures([]);
          setTotalPages(1);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des candidatures:', error);
        setError('Une erreur est survenue lors du chargement des candidatures.');
        setLoading(false);
      }
    };
    
    fetchCandidatures();
  }, [user, navigate]);
  
  // Filtrer et trier les candidatures
  useEffect(() => {
    let results = [...candidatures];
    
    // Filtrer par recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(candidature => 
        (candidature.etudiant?.user?.nom?.toLowerCase().includes(query) || '') ||
        (candidature.etudiant?.user?.prenom?.toLowerCase().includes(query) || '') ||
        (candidature.etudiant?.filiere?.toLowerCase().includes(query) || '') ||
        (candidature.etudiant?.ecole?.toLowerCase().includes(query) || '') ||
        (candidature.offre?.titre?.toLowerCase().includes(query) || '')
      );
    }
    
    // Filtrer par statut
    if (filters.statut.length > 0) {
      results = results.filter(candidature => filters.statut.includes(candidature.statut));
    }
    
    // Filtrer par statut du test
    if (filters.test.length > 0) {
      results = results.filter(candidature => {
        if (filters.test.includes('complete') && candidature.test_complete) return true;
        if (filters.test.includes('incomplete') && candidature.offre?.test_requis && !candidature.test_complete) return true;
        return false;
      });
    }
    
    // Trier les résultats
    results.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Gérer les propriétés imbriquées
      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }
      
      // Gestion des valeurs nulles
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Comparaison de dates
      if (sortConfig.key === 'date_candidature') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue) - new Date(bValue) 
          : new Date(bValue) - new Date(aValue);
      }
      
      // Comparaison alphabétique
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Comparaison numérique
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    setFilteredCandidatures(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Réinitialiser à la première page
  }, [candidatures, searchQuery, filters, sortConfig]);
  
  // Obtenir les candidatures pour la page courante
  const getCurrentPageCandidatures = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCandidatures.slice(startIndex, endIndex);
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
      test: []
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
  
  // Basculer l'affichage détaillé d'une candidature
  const toggleExpandCandidature = (id) => {
    setExpandedCandidature(expandedCandidature === id ? null : id);
  };
  
  // Mettre à jour le statut d'une candidature
  const updateCandidatureStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/entreprise/candidatures/${id}/status`, {
        statut: newStatus
      });
      
      // Mettre à jour l'état local
      setCandidatures(prevCandidatures => 
        prevCandidatures.map(candidature => 
          candidature.id === id 
            ? { ...candidature, statut: newStatus } 
            : candidature
        )
      );
      
      // Si on fixe un entretien, ouvrir le modal
      if (newStatus === 'entretien') {
        setEntretienData({
          ...entretienData,
          candidatureId: id,
          date: '',
          heure: '',
          type: 'présentiel',
          lieu: '',
          lien_visio: '',
          note: ''
        });
        setIsEntretienModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut.');
    }
  };
  
  // Gérer l'ouverture du modal d'entretien
  const handleOpenEntretienModal = (candidatureId) => {
    setEntretienData({
      ...entretienData,
      candidatureId
    });
    setIsEntretienModalOpen(true);
  };
  
  // Gérer la fermeture du modal d'entretien
  const handleCloseEntretienModal = () => {
    setIsEntretienModalOpen(false);
  };
  
  // Gérer les changements dans le formulaire d'entretien
  const handleEntretienChange = (e) => {
    const { name, value } = e.target;
    setEntretienData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Soumettre le formulaire d'entretien
  const handleEntretienSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Vérifier que les champs obligatoires sont remplis
      if (!entretienData.date || !entretienData.heure || 
          (entretienData.type === 'présentiel' && !entretienData.lieu) || 
          (entretienData.type === 'visio' && !entretienData.lien_visio)) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      // Formater les données
      const formattedData = {
        date_entretien: `${entretienData.date}T${entretienData.heure}:00`,
        type_entretien: entretienData.type,
        lieu_entretien: entretienData.type === 'présentiel' ? entretienData.lieu : null,
        lien_visio: entretienData.type === 'visio' ? entretienData.lien_visio : null,
        note: entretienData.note
      };
      
      // Envoyer les données au serveur
      await axios.post(`/api/candidatures/${entretienData.candidatureId}/entretien`, formattedData);
      
      // Fermer le modal
      setIsEntretienModalOpen(false);
      
      // Mettre à jour l'affichage
      setCandidatures(prevCandidatures => 
        prevCandidatures.map(candidature => 
          candidature.id === entretienData.candidatureId 
            ? { 
                ...candidature, 
                statut: 'entretien',
                date_entretien: formattedData.date_entretien,
                type_entretien: formattedData.type_entretien,
                lieu_entretien: formattedData.lieu_entretien,
                lien_visio: formattedData.lien_visio
              } 
            : candidature
        )
      );
      
      // Afficher un message de succès
      alert('Entretien planifié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la planification de l\'entretien:', error);
      alert('Une erreur est survenue lors de la planification de l\'entretien.');
    }
  };
  
  // Gérer le téléchargement du CV
  const handleDownloadCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };
  
  // Envoyer un message à un candidat
  const handleSendMessage = async (candidatureId) => {
    try {
      navigate(`/messages/candidature/${candidatureId}`);
    } catch (error) {
      console.error('Erreur lors de la redirection vers la messagerie:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };
  
  // Formater la date relative
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Date inconnue";
    
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
  
  // Formater la date et l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return "Non défini";
    
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtenir la classe de couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
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
  
  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
          <p className="text-center text-gray-500 mt-4">Chargement des candidatures...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center text-red-500 mb-4">
            <AlertCircle size={48} />
          </div>
          <p className="text-center text-gray-700 font-medium">{error}</p>
          <p className="text-center text-gray-500 mt-2">Veuillez réessayer ultérieurement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Titre et description */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidatures reçues</h1>
          <p className="text-gray-600">
            Gérez et suivez les candidatures reçues pour vos offres d'emploi et de stage.
          </p>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par nom, école, formation..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative" ref={filterMenuRef}>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-200 rounded-lg flex items-center hover:bg-gray-50"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                >
                  <Filter size={16} className="mr-2 text-gray-500" />
                  Filtres
                  {Object.values(filters).some(arr => arr.length > 0) && (
                    <span className="ml-2 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {Object.values(filters).reduce((sum, arr) => sum + arr.length, 0)}
                    </span>
                  )}
                </button>
                
                {/* Menu déroulant pour les filtres */}
                {isFilterMenuOpen && <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-10 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Statut</h3>
                    <div className="space-y-2">
                      {['en_attente', 'vue', 'entretien', 'acceptee', 'refusee'].map(statut => (
                        <div key={statut} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`statut-${statut}`}
                            checked={filters.statut.includes(statut)}
                            onChange={() => toggleFilter('statut', statut)}
                            className="rounded text-teal-500 focus:ring-teal-500"
                          />
                          <label htmlFor={`statut-${statut}`} className="ml-2 text-sm text-gray-700">
                            {translateStatus(statut)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Test</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="test-complete"
                          checked={filters.test.includes('complete')}
                          onChange={() => toggleFilter('test', 'complete')}
                          className="rounded text-teal-500 focus:ring-teal-500"
                        />
                        <label htmlFor="test-complete" className="ml-2 text-sm text-gray-700">
                          Test complété
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="test-incomplete"
                          checked={filters.test.includes('incomplete')}
                          onChange={() => toggleFilter('test', 'incomplete')}
                          className="rounded text-teal-500 focus:ring-teal-500"
                        />
                        <label htmlFor="test-incomplete" className="ml-2 text-sm text-gray-700">
                          Test non complété
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="button"
                      className="text-sm text-teal-600 hover:text-teal-800"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>}
                
              </div>
              
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Rechercher
              </button>
            </div>
          </form>
          
          {/* Filtres actifs */}
          {Object.values(filters).some(arr => arr.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.statut.map(statut => (
                <div key={statut} className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {translateStatus(statut)}
                  <button 
                    onClick={() => toggleFilter('statut', statut)}
                    className="ml-1 hover:text-teal-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {filters.test.map(test => (
                <div key={test} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center">
                  {test === 'complete' ? 'Test complété' : 'Test non complété'}
                  <button 
                    onClick={() => toggleFilter('test', test)}
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
        
        {/* Liste des candidatures */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredCandidatures.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune candidature trouvée</h3>
              <p className="text-gray-500">
                {candidatures.length === 0 
                  ? "Vous n'avez pas encore reçu de candidatures pour vos offres."
                  : "Aucune candidature ne correspond à vos critères de recherche."}
              </p>
            </div>
          ) : (
            <>
              {/* En-tête du tableau */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('etudiant.user.nom')}
                      >
                        <div className="flex items-center">
                          Candidat
                          {sortConfig.key === 'etudiant.user.nom' && (
                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('offre.titre')}
                      >
                        <div className="flex items-center">
                          Offre
                          {sortConfig.key === 'offre.titre' && (
                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('date_candidature')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig.key === 'date_candidature' && (
                            sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Statut
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentPageCandidatures().map((candidature) => (
                      <React.Fragment key={candidature.id}>
                        <tr 
                          className={`hover:bg-gray-50 cursor-pointer ${expandedCandidature === candidature.id ? 'bg-gray-50' : ''}`}
                          onClick={() => toggleExpandCandidature(candidature.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-teal-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {candidature.etudiant?.user?.prenom} {candidature.etudiant?.user?.nom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidature.etudiant?.filiere || "Non spécifiée"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {candidature.offre?.titre || "Offre non disponible"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidature.offre?.type === 'stage' ? 'Stage' : 
                               candidature.offre?.type === 'emploi' ? 'Emploi' : 
                               candidature.offre?.type === 'alternance' ? 'Alternance' : 
                               candidature.offre?.type || "Type non spécifié"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock size={14} className="mr-1.5" />
                              {formatRelativeTime(candidature.date_candidature)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(candidature.statut)}`}>
                              {translateStatus(candidature.statut)}
                            </span>
                            
                            {candidature.offre?.test_requis && (
                              <div className="mt-1">
                                <span className={`px-2 py-0.5 inline-flex items-center text-xs rounded-full ${
                                  candidature.test_complete 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {candidature.test_complete ? 'Test complété' : 'Test en attente'}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEntretienModal(candidature.id);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Fixer un entretien"
                              >
                                <CalendarDays size={18} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendMessage(candidature.id);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Envoyer un message"
                              >
                                <MessageSquare size={18} />
                              </button>
                              {candidature.etudiant?.cv_file && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadCV(`/storage/${candidature.etudiant.cv_file}`);
                                  }}
                                  className="text-teal-600 hover:text-teal-900"
                                  title="Télécharger le CV"
                                >
                                  <Download size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        
                        {/* Détails de la candidature (visible uniquement si déplié) */}
                        {expandedCandidature === candidature.id && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Informations sur le candidat */}
                                <div>
                                  <h4 className="font-medium text-gray-800 mb-3">Informations candidat</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-start">
                                      <User size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{candidature.etudiant?.user?.prenom} {candidature.etudiant?.user?.nom}</p>
                                        <p className="text-xs text-gray-500">Nom</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <Mail size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{candidature.etudiant?.user?.email || 'Non renseigné'}</p>
                                        <p className="text-xs text-gray-500">Email</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <Phone size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{candidature.etudiant?.user?.telephone || 'Non renseigné'}</p>
                                        <p className="text-xs text-gray-500">Téléphone</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <BookOpen size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{candidature.etudiant?.filiere || 'Non renseigné'}</p>
                                        <p className="text-xs text-gray-500">Formation</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <MapPin size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{candidature.etudiant?.ecole || 'Non renseigné'}</p>
                                        <p className="text-xs text-gray-500">École</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Informations sur la candidature */}
                                <div>
                                  <h4 className="font-medium text-gray-800 mb-3">Détails de la candidature</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-start">
                                      <Clock size={16} className="mt-0.5 text-gray-400 mr-2" />
                                      <div>
                                        <p className="text-sm text-gray-800">{formatDateTime(candidature.date_candidature)}</p>
                                        <p className="text-xs text-gray-500">Date de candidature</p>
                                      </div>
                                    </div>
                                    
                                    {candidature.offre?.test_requis && (
                                      <div className="flex items-start">
                                        <BookOpen size={16} className="mt-0.5 text-gray-400 mr-2" />
                                        <div>
                                          {candidature.test_complete ? (
                                            <>
                                              <p className="text-sm text-gray-800">Test complété - Score: {candidature.score_test}%</p>
                                              <p className="text-xs text-gray-500">Test de compétences</p>
                                            </>
                                          ) : (
                                            <>
                                              <p className="text-sm text-gray-800">Test non complété</p>
                                              <p className="text-xs text-gray-500">En attente</p>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {candidature.statut === 'entretien' && candidature.date_entretien && (
                                      <div className="flex items-start">
                                        <Calendar size={16} className="mt-0.5 text-gray-400 mr-2" />
                                        <div>
                                          <p className="text-sm text-gray-800">{formatDateTime(candidature.date_entretien)}</p>
                                          <p className="text-xs text-gray-500">
                                            Entretien {candidature.type_entretien === 'présentiel' ? 'présentiel' : 'en visio'}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Lettre de motivation */}
                                <div className="md:col-span-1">
                                  <h4 className="font-medium text-gray-800 mb-3">Lettre de motivation</h4>
                                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-6">
                                      {candidature.lettre_motivation || 'Aucune lettre de motivation fournie.'}
                                    </p>
                                    <button className="text-xs text-teal-600 hover:text-teal-700 mt-2">
                                      Voir plus
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions sur la candidature */}
                              <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between items-center">
                                <div>
                                  <span className="text-sm text-gray-500">Mettre à jour le statut:</span>
                                </div>
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCandidatureStatus(candidature.id, 'vue');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                      candidature.statut === 'vue' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                  >
                                    <Eye size={12} className="inline mr-1" />
                                    Vue
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCandidatureStatus(candidature.id, 'entretien');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                      candidature.statut === 'entretien' 
                                        ? 'bg-purple-600 text-white' 
                                        : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                                    }`}
                                  >
                                    <Calendar size={12} className="inline mr-1" />
                                    Entretien
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCandidatureStatus(candidature.id, 'acceptee');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                      candidature.statut === 'acceptee' 
                                        ? 'bg-green-600 text-white' 
                                        : 'border border-green-600 text-green-600 hover:bg-green-50'
                                    }`}
                                  >
                                    <CheckCircle size={12} className="inline mr-1" />
                                    Accepter
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateCandidatureStatus(candidature.id, 'refusee');
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                      candidature.statut === 'refusee' 
                                        ? 'bg-red-600 text-white' 
                                        : 'border border-red-600 text-red-600 hover:bg-red-50'
                                    }`}
                                  >
                                    <XCircle size={12} className="inline mr-1" />
                                    Refuser
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredCandidatures.length)}
                        </span>{' '}
                        sur <span className="font-medium">{filteredCandidatures.length}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Précédent</span>
                          <ChevronUp className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            aria-current={currentPage === i + 1 ? 'page' : undefined}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Suivant</span>
                          <ChevronDown className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal pour planifier un entretien */}
      {isEntretienModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CalendarDays className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Planifier un entretien
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Définissez les détails de l'entretien avec le candidat.
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleEntretienSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date de l'entretien*
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={entretienData.date}
                        onChange={handleEntretienChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="heure" className="block text-sm font-medium text-gray-700">
                        Heure de l'entretien*
                      </label>
                      <input
                        type="time"
                        id="heure"
                        name="heure"
                        value={entretienData.heure}
                        onChange={handleEntretienChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type d'entretien*
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="type-presentiel"
                          name="type"
                          type="radio"
                          value="présentiel"
                          checked={entretienData.type === 'présentiel'}
                          onChange={handleEntretienChange}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                        />
                        <label htmlFor="type-presentiel" className="ml-3 block text-sm font-medium text-gray-700">
                          Entretien présentiel
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="type-visio"
                          name="type"
                          type="radio"
                          value="visio"
                          checked={entretienData.type === 'visio'}
                          onChange={handleEntretienChange}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                        />
                        <label htmlFor="type-visio" className="ml-3 block text-sm font-medium text-gray-700">
                          Entretien en visioconférence
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {entretienData.type === 'présentiel' && (
                    <div>
                      <label htmlFor="lieu" className="block text-sm font-medium text-gray-700">
                        Lieu de l'entretien*
                      </label>
                      <input
                        type="text"
                        id="lieu"
                        name="lieu"
                        value={entretienData.lieu}
                        onChange={handleEntretienChange}
                        placeholder="Adresse complète"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required={entretienData.type === 'présentiel'}
                      />
                    </div>
                  )}
                  
                  {entretienData.type === 'visio' && (
                    <div>
                      <label htmlFor="lien_visio" className="block text-sm font-medium text-gray-700">
                        Lien de la visioconférence*
                      </label>
                      <input
                        type="text"
                        id="lien_visio"
                        name="lien_visio"
                        value={entretienData.lien_visio}
                        onChange={handleEntretienChange}
                        placeholder="https://..."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        required={entretienData.type === 'visio'}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                      Note ou instructions supplémentaires
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={entretienData.note}
                      onChange={handleEntretienChange}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    * Champs obligatoires
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleEntretienSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Planifier l'entretien
                </button>
                <button
                  type="button"
                  onClick={handleCloseEntretienModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default CandidatesContainer;

/*
POUR INTÉGRER CE COMPOSANT DANS VOTRE APPLICATION:

1. Importez ce composant dans votre fichier App.jsx:
   import CandidatesContainer from "./component/Dashboard/CandidatesContainer";

2. Ajoutez la route suivante dans la section des routes protégées dans App.jsx:
   <Route path="/candidates" element={
     <MainLayout>
       <CandidatesContainer />
     </MainLayout>
   } />
   
3. Vous devrez également ajouter un lien vers cette page dans la barre latérale 
   ou la navigation pour que les entreprises puissent y accéder.

4. Sur votre API, assurez-vous que l'endpoint suivant existe et est protégé:
   - GET /api/entreprise/candidatures (récupère toutes les candidatures pour les offres de l'entreprise)
   - PATCH ou PUT /api/entreprise/candidatures/{id}/status (met à jour le statut d'une candidature)
   - POST /api/candidatures/{id}/entretien (planifie un entretien)
*/