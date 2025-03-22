import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';

// Composants du dashboard
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

// Widgets
import ProfileWidget from './Widgets/ProfileWidget';
import ApplicationsWidget from './Widgets/ApplicationWidget';
import OpportunitiesWidget from './Widgets/OpportunitiesWidget';
import TestsWidget from './Widgets/TestsWidget';
import MessagesWidget from './Widgets/MessagesWidget';
import SettingsWidget from './Widgets/SettingsWidget';

import { AlertCircle, PlusCircle, Clock, MapPin, Users, Eye, Edit, Trash2, Search, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const MinimalDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    applications: [],
    opportunities: [],
    tests: [],
    stats: {}
  });
  
  // Charger les données du dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Vérifier si l'utilisateur est authentifié
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Configuration de l'en-tête d'authentification
        const token = localStorage.getItem('auth_token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Récupérer les données en fonction du rôle
        if (user.role === 'etudiant') {
          // Profil de l'étudiant
          const profileResponse = await axios.get('/api/etudiant/profile');
          
          // Candidatures
          const applicationsResponse = await axios.get('/api/etudiant/candidatures');
          
          // Offres recommandées
          const opportunitiesResponse = await axios.get('/api/etudiant/recommended-offers');
          console.log('Offres recommandées reçues:', opportunitiesResponse.data);
          
          // Tests à compléter
          const testsResponse = await axios.get('/api/etudiant/tests');
          
          setDashboardData({
            profile: profileResponse.data,
            applications: applicationsResponse.data.candidatures || [],
            opportunities: opportunitiesResponse.data.recommended_offers || [],
            tests: testsResponse.data.tests || [],
            stats: {}
          });
        } 
        else if (user.role === 'entreprise') {
          // Profil de l'entreprise
          const profileResponse = await axios.get('/api/entreprise/profile');
          
          // Candidatures reçues
          const candidaturesResponse = await axios.get('/api/entreprise/candidatures');
          
          // Statistiques
          const statsResponse = await axios.get('/api/entreprise/statistiques');
          
          setDashboardData({
            profile: profileResponse.data,
            applications: candidaturesResponse.data.candidatures || [],
            opportunities: [],
            tests: [],
            stats: statsResponse.data || {}
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Une erreur est survenue lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, navigate]);
  
  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Une erreur est survenue lors de la déconnexion.');
    }
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (activeTab === 'opportunities') {
        navigate(`/offres?search=${searchQuery}`);
      } else if (activeTab === 'applications') {
        // Implémenter la recherche dans les candidatures
      }
    }
  };

  // Conteneur des offres d'entreprise
  const OffersContainer = () => {
    const [offres, setOffres] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
      type: '',
      statut: ''
    });

    useEffect(() => {
      const fetchOffres = async () => {
        try {
          setLoading(true);
          console.log("Récupération des offres de l'entreprise...");
          
          const response = await axios.get('/api/entreprise/offres');
          console.log("Réponse API des offres:", response.data);
          
          if (response.data && response.data.offres) {
            setOffres(response.data.offres);
          } else {
            console.error("Format de réponse inattendu:", response.data);
            setOffres([]);
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des offres:', err);
          setError('Une erreur est survenue lors du chargement des offres.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchOffres();
    }, []);

    // Filtrer les offres
    const filteredOffres = offres.filter(offre => {
      // Filtre de recherche textuelle
      const matchesSearch = searchQuery === '' || 
        offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offre.description && offre.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (offre.localisation && offre.localisation.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filtres de type et statut
      const matchesType = filters.type === '' || offre.type === filters.type;
      const matchesStatut = filters.statut === '' || offre.statut === filters.statut;
      
      return matchesSearch && matchesType && matchesStatut;
    });

    // Formater la date
    const formatDate = (dateString) => {
      if (!dateString) return 'Date inconnue';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    // Badge de statut
    const StatusBadge = ({ statut }) => {
      if (!statut) return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Inconnu</span>;
      
      let bgColor = 'bg-gray-100 text-gray-800';
      if (statut === 'active') bgColor = 'bg-green-100 text-green-800';
      if (statut === 'inactive') bgColor = 'bg-yellow-100 text-yellow-800';
      if (statut === 'cloturee') bgColor = 'bg-red-100 text-red-800';
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
          {statut === 'active' ? 'Active' : 
           statut === 'inactive' ? 'Inactive' : 
           statut === 'cloturee' ? 'Clôturée' : statut}
        </span>
      );
    };

    // Supprimer une offre
    const handleDelete = async (id, e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) {
        try {
          await axios.delete(`/api/offres/${id}`);
          setOffres(offres.filter(offre => offre.id !== id));
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          alert("Une erreur est survenue lors de la suppression de l'offre.");
        }
      }
    };

    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-800">Mes offres publiées</h2>
          <button
            onClick={() => navigate('/create-offer')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Publier une offre
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une offre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Tous les types</option>
              <option value="stage">Stage</option>
              <option value="emploi">Emploi</option>
              <option value="alternance">Alternance</option>
            </select>
            
            <select 
              value={filters.statut}
              onChange={(e) => setFilters({...filters, statut: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cloturee">Clôturée</option>
            </select>
          </div>
        </div>

        {/* Liste des offres */}
        {filteredOffres.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 mb-2">Aucune offre publiée</p>
            <p className="text-gray-500 text-sm mb-4">
              Vous n'avez pas encore publié d'offres ou aucune offre ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={() => navigate('/create-offer')}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors inline-flex items-center"
            >
              <PlusCircle size={16} className="mr-2" />
              Publier votre première offre
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidatures</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffres.map((offre) => (
                  <tr key={offre.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{offre.titre}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin size={12} className="mr-1" />
                          {offre.localisation || 'Non spécifié'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {offre.type === 'stage' ? 'Stage' : 
                         offre.type === 'emploi' ? 'Emploi' : 'Alternance'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        {formatDate(offre.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users size={14} className="mr-1 text-gray-400" />
                        {offre.candidatures_count || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge statut={offre.statut} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/offres/${offre.id}`} className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </Link>
                        <Link to={`/offres/${offre.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={(e) => handleDelete(offre.id, e)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Conteneur des candidatures pour les entreprises
  const CandidatesContainer = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Candidatures reçues</h2>
      {/* Contenu des candidatures reçues */}
    </div>
  );

  // Rendu conditionnel en fonction de l'onglet actif
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-2 mt-0.5" size={16} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <ProfileWidget 
                userData={user} 
                loading={loading} 
              />
            </div>
            <ApplicationsWidget 
              candidatures={dashboardData.applications} 
              loading={loading} 
            />
            <OpportunitiesWidget 
              offres={dashboardData.opportunities} 
              loading={loading} 
            />
            {user?.role === 'etudiant' && dashboardData.tests.length > 0 && (
              <div className="md:col-span-2">
                <TestsWidget 
                  tests={dashboardData.tests} 
                  loading={loading} 
                />
              </div>
            )}
          </div>
        );
      case 'profile':
        return (
          <ProfileWidget 
            userData={user} 
            loading={loading} 
          />
        );
      case 'applications':
        return (
          <ApplicationsWidget 
            candidatures={dashboardData.applications} 
            loading={loading} 
          />
        );
      case 'opportunities':
        return (
          <OpportunitiesWidget 
            offres={dashboardData.opportunities} 
            loading={loading} 
          />
        );
      case 'tests':
        return (
          <TestsWidget 
            tests={dashboardData.tests} 
            loading={loading} 
          />
        );
      case 'messages':
        return (
          <MessagesWidget 
            messages={[]} 
            loading={loading} 
          />
        );
      case 'offers':
        return <OffersContainer />;
      case 'candidates':
        return <CandidatesContainer />;
      case 'settings':
        return (
          <SettingsWidget 
            userData={user} 
            loading={loading} 
          />
        );
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600">Sélectionnez une option dans le menu</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userData={user}
        handleLogout={handleLogout}
      />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <DashboardHeader
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        
        {/* Corps principal */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MinimalDashboard;