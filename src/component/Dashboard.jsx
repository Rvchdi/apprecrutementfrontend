import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Composants de widgets
import ProfileWidget from './ProfileWidget';
import ApplicationsWidget from './ApplicationsWidget';
import OpportunitiesWidget from './OpportunitiesWidget';
import TestsWidget from './TestsWidget';
import MessagesWidget from './MessagesWidget';

// Composants UI
import { 
  User, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Search,
  Book,
  MessageSquare,
  BarChart2,
  PlusSquare,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    applications: [],
    opportunities: [],
    tests: [],
    stats: {}
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  
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
          
          // Tests à compléter
          const testsResponse = await axios.get('/api/etudiant/tests');
          
          // Compteurs
          const notifResponse = await axios.get('/api/notifications/unread-count');
          const messageResponse = await axios.get('/api/messages/unread-count');
          
          setDashboardData({
            profile: profileResponse.data,
            applications: applicationsResponse.data.candidatures || [],
            opportunities: opportunitiesResponse.data.recommended_offers || [],
            tests: testsResponse.data.tests || [],
            stats: {}
          });
          
          setNotificationCount(notifResponse.data.count || 0);
          setMessageCount(messageResponse.data.count || 0);
        } 
        else if (user.role === 'entreprise') {
          // Profil de l'entreprise
          const profileResponse = await axios.get('/api/entreprise/profile');
          
          // Offres publiées
          const offresResponse = await axios.get('/api/entreprise/offres');
          
          // Candidatures reçues
          const candidaturesResponse = await axios.get('/api/entreprise/candidatures');
          
          // Statistiques
          const statsResponse = await axios.get('/api/entreprise/statistiques');
          
          // Compteurs
          const notifResponse = await axios.get('/api/notifications/unread-count');
          const messageResponse = await axios.get('/api/messages/unread-count');
          
          setDashboardData({
            profile: profileResponse.data,
            applications: candidaturesResponse.data.candidatures || [],
            opportunities: offresResponse.data.offres || [],
            tests: [],
            stats: statsResponse.data || {}
          });
          
          setNotificationCount(notifResponse.data.count || 0);
          setMessageCount(messageResponse.data.count || 0);
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
  
  // Configurez les éléments du menu en fonction du rôle
  const getMenuItems = () => {
    const commonItems = [
      { id: 'overview', label: 'Tableau de bord', icon: <BarChart2 size={20} /> },
      { id: 'profile', label: 'Profil', icon: <User size={20} /> },
      { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} />, count: messageCount },
      { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, count: notificationCount },
      { id: 'settings', label: 'Paramètres', icon: <Settings size={20} /> }
    ];
    
    if (user?.role === 'etudiant') {
      return [
        ...commonItems.slice(0, 2),
        { id: 'applications', label: 'Candidatures', icon: <FileText size={20} /> },
        { id: 'opportunities', label: 'Opportunités', icon: <Briefcase size={20} /> },
        { id: 'tests', label: 'Tests', icon: <Book size={20} /> },
        ...commonItems.slice(2)
      ];
    } else if (user?.role === 'entreprise') {
      return [
        ...commonItems.slice(0, 2),
        { id: 'offers', label: 'Mes offres', icon: <Briefcase size={20} /> },
        { id: 'candidates', label: 'Candidatures', icon: <FileText size={20} /> },
        { id: 'create-offer', label: 'Créer une offre', icon: <PlusSquare size={20} /> },
        ...commonItems.slice(2)
      ];
    }
    
    return commonItems;
  };

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
                user={user} 
                userSkills={dashboardData.profile.etudiant?.competences || []} 
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
          </div>
        );
      case 'profile':
        return (
          <ProfileWidget 
            user={user} 
            userSkills={dashboardData.profile.etudiant?.competences || []} 
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
        // Contenu spécifique pour les entreprises
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
            {/* Contenu des offres de l'entreprise */}
          </div>
        );
      case 'candidates':
        // Contenu spécifique pour les entreprises
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Candidatures reçues</h2>
            {/* Contenu des candidatures reçues */}
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Paramètres du compte</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  readOnly
                  className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Préférences de notification</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="notif1" className="rounded text-teal-500 focus:ring-teal-500" />
                    <label htmlFor="notif1" className="ml-2 text-sm text-gray-800">Nouvelles offres correspondant à mon profil</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="notif2" className="rounded text-teal-500 focus:ring-teal-500" />
                    <label htmlFor="notif2" className="ml-2 text-sm text-gray-800">Mises à jour sur mes candidatures</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="notif3" className="rounded text-teal-500 focus:ring-teal-500" />
                    <label htmlFor="notif3" className="ml-2 text-sm text-gray-800">Messages des recruteurs</label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </div>
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
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* En-tête sidebar */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="flex-1 flex items-center">
            <div className="h-8 w-8 bg-teal-500 text-white flex items-center justify-center rounded-lg text-sm font-bold">
              {user?.role === 'etudiant' 
                ? `${user?.prenom?.[0]}${user?.nom?.[0]}` 
                : user?.entreprise?.nom_entreprise?.[0] || 'E'}
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3 font-medium text-gray-800 truncate">
                {user?.role === 'etudiant' 
                  ? `${user?.prenom} ${user?.nom}` 
                  : user?.entreprise?.nom_entreprise || 'Entreprise'}
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-gray-600"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        {/* Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {getMenuItems().map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    {item.icon}
                    {item.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Logout button */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <LogOut size={20} />
              {!sidebarCollapsed && (
                <span className="ml-3">Déconnexion</span>
              )}
            </button>
          </div>
        </nav>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeTab === 'overview' && 'Tableau de bord'}
            {activeTab === 'profile' && 'Mon profil'}
            {activeTab === 'applications' && 'Mes candidatures'}
            {activeTab === 'opportunities' && 'Opportunités'}
            {activeTab === 'tests' && 'Tests techniques'}
            {activeTab === 'messages' && 'Messages'}
            {activeTab === 'notifications' && 'Notifications'}
            {activeTab === 'settings' && 'Paramètres'}
            {activeTab === 'offers' && 'Mes offres'}
            {activeTab === 'candidates' && 'Candidatures reçues'}
            {activeTab === 'create-offer' && 'Créer une offre'}
          </h1>
          
          {/* Barre de recherche (visible sur certains onglets) */}
          {['opportunities', 'applications', 'offers', 'candidates'].includes(activeTab) && (
            <div className="ml-auto relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Rechercher...`}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          )}
        </header>
        
        {/* Corps principal */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;