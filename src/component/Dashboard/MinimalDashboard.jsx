import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import NotificationsWidget from './Widgets/NotificationsWidget';
import SettingsWidget from './Widgets/SettingsWidget';

import { AlertCircle } from 'lucide-react';

const MinimalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Initialiser l'onglet actif en tenant compte des paramètres d'URL ou localStorage
  const initializeActiveTab = () => {
    // Vérifier si un paramètre tab est présent dans l'URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      return tabParam;
    }
    
    // Vérifier si un onglet est stocké dans localStorage
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      localStorage.removeItem('activeTab'); // Nettoyer après utilisation
      return storedTab;
    }
    
    // Valeur par défaut
    return 'overview';
  };
  
  // États
  const [activeTab, setActiveTab] = useState(initializeActiveTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    applications: [],
    opportunities: [],
    tests: [],
    stats: {}
  });
  
  // Effet pour mettre à jour l'onglet actif lors des changements d'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && ['overview', 'profile', 'applications', 'tests', 'notifications', 'settings', 'offers', 'candidates'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

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
        
        // Récupérer les notifications
        try {
          const notificationsResponse = await axios.get('/api/notifications');
          setNotifications(notificationsResponse.data.notifications || []);
        } catch (notifError) {
          console.error('Erreur lors de la récupération des notifications:', notifError);
        }
        
        // Récupérer les données en fonction du rôle
        if (user.role === 'etudiant') {
          // Profil de l'étudiant
          const profileResponse = await axios.get('/api/etudiant/profile');
          
          // Candidatures
          const applicationsResponse = await axios.get('/api/etudiant/candidatures');
          
          // Tests à compléter
          const testsResponse = await axios.get('/api/etudiant/tests');
          
          setDashboardData({
            profile: profileResponse.data,
            applications: applicationsResponse.data.candidatures || [],
            opportunities: [],
            tests: testsResponse.data.tests || [],
            stats: {}
          });
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
          
          setDashboardData({
            profile: profileResponse.data,
            applications: candidaturesResponse.data.candidatures || [],
            opportunities: offresResponse.data.offres || [],
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
  
  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Mettre à jour l'URL sans recharger la page
    const newUrl = `${window.location.pathname}?tab=${tabId}`;
    window.history.pushState({}, '', newUrl);
  };
  
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

  // Fonction pour marquer une notification comme lue
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, lu: true } : notif
    ));
  };

  // Gérer la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (activeTab === 'applications') {
        // Implémenter la recherche dans les candidatures
      } else if (activeTab === 'offers') {
        navigate(`/offres?search=${searchQuery}`);
      } else if (activeTab === 'candidates') {
        // Implémenter la recherche dans les candidatures reçues
      }
    }
  };

  // Conteneurs d'offres d'entreprise
  const OffersContainer = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
      {/* Contenu des offres de l'entreprise */}
    </div>
  );

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
            {user?.role === 'entreprise' && (
              <div className="col-span-1">
                <OffersContainer />
              </div>
            )}
            <NotificationsWidget 
              notifications={notifications.slice(0, 3)} 
              loading={loading} 
              onMarkAsRead={handleMarkAsRead} 
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
      case 'tests':
        return (
          <TestsWidget 
            tests={dashboardData.tests} 
            loading={loading} 
          />
        );
      case 'notifications':
        return (
          <NotificationsWidget 
            notifications={notifications} 
            loading={loading} 
            onMarkAsRead={handleMarkAsRead} 
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
        setActiveTab={handleTabChange} // Utilise handleTabChange au lieu de setActiveTab
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userData={user}
        handleLogout={handleLogout}
        unreadNotifications={notifications.filter(n => !n.lu).length}
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