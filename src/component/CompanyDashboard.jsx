import React, { useState, useEffect } from 'react';
import { 
  Briefcase,
  Users,
  FileText,
  BarChart2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Clock,
  Mail,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState('offres');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'offres') {
          const response = await axios.get('/api/entreprise/offres');
          setOffres(response.data.offres);
        } 
        else if (activeTab === 'candidatures') {
          const response = await axios.get('/api/entreprise/candidatures');
          setCandidatures(response.data.candidatures);
        }
        else if (activeTab === 'statistiques') {
          const response = await axios.get('/api/entreprise/statistiques');
          setStatistiques(response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement des données.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);
  
  // Filtrer les offres
  const filteredOffres = offres.filter(offre => {
    const matchesSearch = offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offre.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatut = filtreStatut === 'all' || offre.statut === filtreStatut;
    
    return matchesSearch && matchesStatut;
  });
  
  // Filtrer les candidatures
  const filteredCandidatures = candidatures.filter(candidature => {
    const matchesSearch = candidature.etudiant.user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidature.etudiant.user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidature.offre.titre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatut = filtreStatut === 'all' || candidature.statut === filtreStatut;
    
    return matchesSearch && matchesStatut;
  });
  
  // Supprimer une offre
  const deleteOffre = async (id) => {
    try {
      await axios.delete(`/api/offres/${id}`);
      setOffres(offres.filter(offre => offre.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'offre:', error);
      setError('Une erreur est survenue lors de la suppression de l\'offre.');
    }
  };
  
  // Mettre à jour le statut d'une candidature
  const updateCandidatureStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/candidatures/${id}/status`, { statut: newStatus });
      
      setCandidatures(candidatures.map(candidature => {
        if (candidature.id === id) {
          return { ...candidature, statut: newStatus };
        }
        return candidature;
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Une erreur est survenue lors de la mise à jour du statut.');
    }
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Style pour les statuts
  const getStatusStyle = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'cloturee':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
        return 'bg-blue-100 text-blue-800';
      case 'vue':
        return 'bg-indigo-100 text-indigo-800';
      case 'entretien':
        return 'bg-purple-100 text-purple-800';
      case 'acceptee':
        return 'bg-green-100 text-green-800';
      case 'refusee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Traduction des statuts
  const translateStatus = (status) => {
    const translations = {
      'active': 'Active',
      'inactive': 'Inactive',
      'cloturee': 'Clôturée',
      'en_attente': 'En attente',
      'vue': 'Vue',
      'entretien': 'Entretien',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    
    return translations[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            {user?.entreprise?.logo ? (
              <img 
                src={user.entreprise.logo} 
                alt={user.entreprise.nom_entreprise} 
                className="h-10 w-10 rounded-lg object-cover mr-3"
              />
            ) : (
              <div className="h-10 w-10 bg-teal-500 text-white flex items-center justify-center rounded-lg mr-3 text-sm font-medium">
                {user?.entreprise?.nom_entreprise?.substring(0, 2) || 'EN'}
              </div>
            )}
            <div>
              <h2 className="text-sm font-medium text-gray-800">{user?.entreprise?.nom_entreprise || 'Entreprise'}</h2>
              <p className="text-xs text-gray-500">{user?.entreprise?.secteur_activite || 'Secteur d\'activité'}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('offres')}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
              activeTab === 'offres' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Briefcase size={18} className="mr-3" />
            Mes offres
          </button>
          <button
            onClick={() => setActiveTab('candidatures')}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
              activeTab === 'candidatures' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={18} className="mr-3" />
            Candidatures
          </button>
          <button
            onClick={() => setActiveTab('statistiques')}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
              activeTab === 'statistiques' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart2 size={18} className="mr-3" />
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('profil')}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
              activeTab === 'profil' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText size={18} className="mr-3" />
            Profil entreprise
          </button>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-teal-500 text-white flex items-center justify-center rounded-lg mr-2 text-sm font-medium">
                {user?.entreprise?.nom_entreprise?.substring(0, 2) || 'EN'}
              </div>
              <h2 className="text-sm font-medium text-gray-800">{user?.entreprise?.nom_entreprise || 'Entreprise'}</h2>
            </div>
            
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('offres')}
                className={`p-2 rounded-md ${activeTab === 'offres' ? 'bg-teal-50 text-teal-600' : 'text-gray-500'}`}
              >
                <Briefcase size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('candidatures')}
                className={`p-2 rounded-md ${activeTab === 'candidatures' ? 'bg-teal-50 text-teal-600' : 'text-gray-500'}`}
              >
                <Users size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('statistiques')}
                className={`p-2 rounded-md ${activeTab === 'statistiques' ? 'bg-teal-50 text-teal-600' : 'text-gray-500'}`}
              >
                <BarChart2 size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('profil')}
                className={`p-2 rounded-md ${activeTab === 'profil' ? 'bg-teal-50 text-teal-600' : 'text-gray-500'}`}
              >
                <FileText size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Titre et actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'offres' && 'Gestion des offres'}
              {activeTab === 'candidatures' && 'Suivi des candidatures'}
              {activeTab === 'statistiques' && 'Statistiques de recrutement'}
              {activeTab === 'profil' && 'Profil de l\'entreprise'}
            </h1>
            
            {activeTab === 'offres' && (
              <button 
                onClick={() => navigate('/create-announcement')}
                className="mt-3 md:mt-0 bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-teal-600 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Créer une nouvelle offre
              </button>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Chargement */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              {/* Contenu selon l'onglet actif */}
              {activeTab === 'offres' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Filtres et recherche */}
                  <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher une offre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">Statut:</span>
                      <select
                        value={filtreStatut}
                        onChange={(e) => setFiltreStatut(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="all">Tous</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="cloturee">Clôturée</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Liste des offres */}
                  {filteredOffres.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Briefcase size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune offre trouvée</h3>
                      <p className="text-gray-500">
                        {searchQuery || filtreStatut !== 'all' 
                          ? 'Essayez de modifier vos filtres de recherche.'
                          : 'Commencez par créer votre première offre d\'emploi.'}
                      </p>
                      {!searchQuery && filtreStatut === 'all' && (
                        <button 
                          onClick={() => navigate('/create-announcement')}
                          className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center mx-auto hover:bg-teal-600 transition-colors"
                        >
                          <Plus size={16} className="mr-2" />
                          Créer une offre
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredOffres.map(offre => (
                        <div key={offre.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-3 md:mb-0">
                              <h3 className="text-lg font-medium text-gray-800">{offre.titre}</h3>
                              <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 gap-3">
                                <div className="flex items-center">
                                  <MapPin size={14} className="mr-1" />
                                  {offre.localisation}
                                </div>
                                <div className="flex items-center">
                                  <Calendar size={14} className="mr-1" />
                                  Début: {formatDate(offre.date_debut)}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase size={14} className="mr-1" />
                                  {offre.type === 'stage' ? 'Stage' : offre.type === 'emploi' ? 'Emploi' : 'Alternance'}
                                </div>
                                {offre.test_requis && (
                                  <div className="flex items-center text-amber-600">
                                    <FileText size={14} className="mr-1" />
                                    Test requis
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(offre.statut)}`}>
                                {translateStatus(offre.statut)}
                              </span>
                              
                              <div className="flex space-x-1">
                                <Link 
                                  to={`/offres/${offre.id}`}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                  <Eye size={16} />
                                </Link>
                                <Link 
                                  to={`/offres/${offre.id}/edit`}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                  <Edit size={16} />
                                </Link>
                                <button 
                                  onClick={() => setConfirmDelete(offre.id)}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Statistiques de l'offre */}
                          <div className="mt-4 flex flex-wrap gap-3">
                            <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-1 flex items-center">
                              <Users size={14} className="mr-1" />
                              {offre.candidatures_count || 0} candidat(s)
                            </div>
                            <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-1 flex items-center">
                              <Eye size={14} className="mr-1" />
                              {offre.vues_count || 0} vue(s)
                            </div>
                            <div className="bg-purple-50 text-purple-700 text-xs rounded-lg px-3 py-1 flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {offre.jours_actifs || 0} jour(s) en ligne
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Candidatures */}
              {activeTab === 'candidatures' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Filtres et recherche */}
                  <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Rechercher un candidat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">Statut:</span>
                      <select
                        value={filtreStatut}
                        onChange={(e) => setFiltreStatut(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="all">Tous</option>
                        <option value="en_attente">En attente</option>
                        <option value="vue">Vue</option>
                        <option value="entretien">Entretien</option>
                        <option value="acceptee">Acceptée</option>
                        <option value="refusee">Refusée</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Liste des candidatures */}
                  {filteredCandidatures.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune candidature trouvée</h3>
                      <p className="text-gray-500">
                        {searchQuery || filtreStatut !== 'all' 
                          ? 'Essayez de modifier vos filtres de recherche.'
                          : 'Vous n\'avez pas encore reçu de candidatures.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCandidatures.map(candidature => (
                        <div key={candidature.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-3 md:mb-0">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium mr-3">
                                  {candidature.etudiant.user.prenom[0]}{candidature.etudiant.user.nom[0]}
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    {candidature.etudiant.user.prenom} {candidature.etudiant.user.nom}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {candidature.etudiant.niveau_etude} - {candidature.etudiant.filiere}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-2 pl-12">
                                <p className="text-sm text-gray-600">
                                  Candidature pour: <span className="font-medium">{candidature.offre.titre}</span>
                                </p>
                                <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 gap-3">
                                  <div className="flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    Postuler le: {formatDate(candidature.date_candidature)}
                                  </div>
                                  {candidature.test_complete && (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle size={12} className="mr-1" />
                                      Test complété - Score: {candidature.score_test || 'N/A'}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:items-end gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(candidature.statut)}`}>
                                {translateStatus(candidature.statut)}
                              </span>
                              
                              <div className="flex space-x-1">
                                <Link 
                                  to={`/candidatures/${candidature.id}`}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                  <Eye size={16} />
                                </Link>
                                
                                <div className="relative" onClick={e => e.stopPropagation()}>
                                  <button
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center"
                                    onClick={() => {
                                      const menu = document.getElementById(`status-menu-${candidature.id}`);
                                      menu.classList.toggle('hidden');
                                    }}
                                  >
                                    <Edit size={16} className="mr-1" />
                                    <ChevronDown size={16} />
                                  </button>
                                  
                                  <div 
                                    id={`status-menu-${candidature.id}`}
                                    className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 z-10 hidden"
                                  >
                                    <button
                                      onClick={() => updateCandidatureStatus(candidature.id, 'en_attente')}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      En attente
                                    </button>
                                    <button
                                      onClick={() => updateCandidatureStatus(candidature.id, 'vue')}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      Vue
                                    </button>
                                    <button
                                      onClick={() => updateCandidatureStatus(candidature.id, 'entretien')}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      Entretien
                                    </button>
                                    <button
                                      onClick={() => updateCandidatureStatus(candidature.id, 'acceptee')}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      Accepter
                                    </button>
                                    <button
                                      onClick={() => updateCandidatureStatus(candidature.id, 'refusee')}
                                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                      Refuser
                                    </button>
                                  </div>
                                </div>
                                
                                <a 
                                  href={`mailto:${candidature.etudiant.user.email}`}
                                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                >
                                  <Mail size={16} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Statistiques */}
              {activeTab === 'statistiques' && statistiques && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Carte statistiques générales */}
                  <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-2 lg:col-span-3">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Aperçu du recrutement</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Offres publiées</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{statistiques.offres_count}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Briefcase size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Candidatures reçues</p>
                            <p className="text-2xl font-bold text-green-700 mt-1">{statistiques.candidatures_count}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Users size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Entretiens</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{statistiques.entretiens_count}</p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Calendar size={20} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-600 text-sm font-medium">Taux de conversion</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">
                              {statistiques.taux_conversion ? `${statistiques.taux_conversion}%` : 'N/A'}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <BarChart2 size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Graphiques et autres statistiques - à implémenter selon les besoins */}
                  {/* Ces sections peuvent être complétées avec des graphiques, tableaux et autres visualisations */}
                </div>
              )}

              {/* Profil de l'entreprise */}
              {activeTab === 'profil' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800 mb-1">Profil de l'entreprise</h2>
                    <p className="text-gray-500 text-sm">Modifiez les informations de votre entreprise pour attirer les meilleurs candidats</p>
                  </div>
                  
                  <div className="p-6">
                    <form className="space-y-6">
                      {/* Informations de base */}
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-4">Informations de base</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom de l'entreprise
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.nom_entreprise || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Secteur d'activité
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.secteur_activite || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Taille de l'entreprise
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="">Sélectionnez une taille</option>
                              <option value="1-10">1-10 employés</option>
                              <option value="11-50">11-50 employés</option>
                              <option value="51-200">51-200 employés</option>
                              <option value="201-500">201-500 employés</option>
                              <option value="501+">Plus de 500 employés</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Site web
                            </label>
                            <input
                              type="url"
                              value={user?.entreprise?.site_web || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-4">Description et présentation</h3>
                        <textarea
                          rows="5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Décrivez votre entreprise, sa culture, ses valeurs..."
                        ></textarea>
                      </div>
                      
                      {/* Localisation */}
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-4">Localisation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Adresse
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.adresse || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ville
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.ville || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Code postal
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.code_postal || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pays
                            </label>
                            <input
                              type="text"
                              value={user?.entreprise?.pays || ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Logo */}
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-4">Logo et identité visuelle</h3>
                        <div className="flex items-center">
                          <div className="mr-4">
                            {user?.entreprise?.logo ? (
                              <img 
                                src={user.entreprise.logo} 
                                alt="Logo" 
                                className="h-20 w-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Briefcase size={32} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center">
                              <label className="bg-teal-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-600 transition-colors">
                                Télécharger un logo
                                <input type="file" className="hidden" accept="image/*" />
                              </label>
                              <p className="mt-2 text-xs text-gray-500">
                                Format recommandé: JPEG ou PNG, 1:1, min. 200x200px
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-3"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Enregistrer les modifications
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Supprimer cette offre ?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible et supprimera également toutes les candidatures associées.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteOffre(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

export default CompanyDashboard;