import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  Suspense, 
  lazy 
} from 'react';

// Hooks personnalisés
import { useDashboardData } from './../../cache/userDashboardData';
import { useAuth } from '../Authentication/AuthContext';

// Lazy loading des composants
const ProfileWidget = lazy(() => import('./Widgets/ProfileWidget'));
const ApplicationsWidget = lazy(() => import('./Widgets/ApplicationWidget'));
const OpportunitiesWidget = lazy(() => import('./Widgets/OpportunitiesWidget'));
const TestsWidget = lazy(() => import('./Widgets/TestsWidget'));
const NotificationsWidget = lazy(() => import('./Widgets/NotificationsWidget'));
const EntretienWidget = lazy(() => import('./Widgets/EntretiensWidget'));
const SettingsWidget = lazy(() => import('./Widgets/SettingsWidget'));
const CandidatesContainer = lazy(() => import('./Containers/CandidatesContainer'));
const DashboardSidebar = lazy(() => import('./DashboardSidebar'));
const DashboardHeader = lazy(() => import('./DashboardHeader'));

// Composant de chargement
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
  </div>
);

// Composant principal du dashboard
const MinimalDashboard = () => {
  // Gestionnaire d'onglets avec mémorisation
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Contexte d'authentification
  const { user, logout } = useAuth();

  // Récupération des données du dashboard
  const dashboardData = useDashboardData(user);
  
  // Log pour débogage
  useEffect(() => {
    console.log("Dashboard Data:", dashboardData);
    console.log("Active Tab:", activeTab);
  }, [dashboardData, activeTab]);

  // Gestionnaire de déconnexion
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, [logout]);

  // Gestionnaire pour marquer une notification comme lue
  const handleMarkNotificationAsRead = useCallback(async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      // Mettre à jour l'état localement
      if (dashboardData.notifications) {
        const updatedNotifications = dashboardData.notifications.map(notif => 
          notif.id === id ? { ...notif, lu: true } : notif
        );
        
        dashboardData.notifications = updatedNotifications;
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  }, [dashboardData]);

  // Rendu du contenu du dashboard
  const renderContent = useMemo(() => {
    // Gestion des états de chargement et d'erreur
    if (dashboardData.loading) {
      return <LoadingIndicator />;
    }

    if (dashboardData.error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{dashboardData.error}</p>
        </div>
      );
    }

    // Mapper les notifications avec un fallback
    const notifications = Array.isArray(dashboardData.notifications) 
      ? dashboardData.notifications 
      : [];

    // Mapper les tests avec un fallback
    const tests = Array.isArray(dashboardData.tests) 
      ? dashboardData.tests 
      : [];
      
    // Mapper les opportunités (offres) avec un fallback
    const opportunities = Array.isArray(dashboardData.opportunities)
      ? dashboardData.opportunities
      : [];
      
    // Mapper les candidatures avec un fallback
    const applications = Array.isArray(dashboardData.applications)
      ? dashboardData.applications
      : [];

    // Log pour débogage des données disponibles
    console.log("Content rendering with:", {
      notificationsCount: notifications.length,
      testsCount: tests.length,
      opportunitiesCount: opportunities.length,
      applicationsCount: applications.length,
      activeTab
    });

    // Mapping des onglets aux widgets
    const renderMap = {
      overview: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingIndicator />}>
            <div className="md:col-span-2">
              <ProfileWidget 
                userData={user} 
                loading={dashboardData.loading} 
              />
            </div>
            <ApplicationsWidget 
              candidatures={applications} 
              loading={dashboardData.loading} 
            />
            {user?.role === 'entreprise' && (
              <div className="col-span-1">
                <OpportunitiesWidget 
                  offres={opportunities} 
                  loading={dashboardData.loading} 
                />
              </div>
            )}
            <NotificationsWidget 
              notifications={notifications.slice(0, 3)} 
              loading={dashboardData.loading} 
              onMarkAsRead={handleMarkNotificationAsRead}
            />
            {user?.role === 'etudiant' && tests.length > 0 && (
              <div className="md:col-span-2">
                <TestsWidget 
                  tests={tests} 
                  loading={dashboardData.loading} 
                />
              </div>
            )}
          </Suspense>
        </div>
      ),
      profile: (
        <Suspense fallback={<LoadingIndicator />}>
          <ProfileWidget 
            userData={user} 
            loading={dashboardData.loading} 
          />
        </Suspense>
      ),
      applications: (
        <Suspense fallback={<LoadingIndicator />}>
          <ApplicationsWidget 
            candidatures={applications} 
            loading={dashboardData.loading} 
          />
        </Suspense>
      ),
      notifications: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <NotificationsWidget 
              notifications={notifications} 
              loading={dashboardData.loading}
              onMarkAsRead={handleMarkNotificationAsRead}
            />
          </div>
        </Suspense>
      ),
      entretiens: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Entretiens planifiés</h1>
            <EntretienWidget 
              entretiens={dashboardData.entretiens || []}
              loading={dashboardData.loading}
            />
          </div>
        </Suspense>
      ),
      settings: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
            <SettingsWidget 
              userData={user}
              loading={dashboardData.loading}
            />
          </div>
        </Suspense>
      ),
      tests: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tests de compétences</h1>
            <TestsWidget 
              tests={tests}
              loading={dashboardData.loading}
            />
          </div>
        </Suspense>
      ),
      offers: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Mes offres publiées</h1>
            {/* Debugging pour voir les données disponibles */}
            {opportunities.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-700">Aucune offre n'est disponible. Vérifiez la console pour plus de détails.</p>
              </div>
            )}
            <OpportunitiesWidget 
              offres={opportunities} 
              loading={dashboardData.loading}
              error={dashboardData.error}
            />
          </div>
        </Suspense>
      ),
      candidates: (
        <Suspense fallback={<LoadingIndicator />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Candidatures reçues</h1>
            <CandidatesContainer 
              candidatures={applications} 
              loading={dashboardData.loading}
            />
          </div>
        </Suspense>
      ),
    };

    // Retourne le contenu pour l'onglet actif ou un message par défaut
    return renderMap[activeTab] || (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-600">Sélectionnez une option dans le menu</p>
        <p className="text-gray-500 mt-2">Onglet actuel: {activeTab}</p>
      </div>
    );
  }, [
    activeTab, 
    user, 
    dashboardData,
    handleMarkNotificationAsRead
  ]);

  // Gestionnaire de recherche
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logique de recherche
      console.log("Recherche:", searchQuery);
    }
  }, [searchQuery]);

  // Ne pas afficher le dashboard si l'utilisateur n'est pas chargé
  if (!user) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Suspense fallback={<LoadingIndicator />}>
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          userData={user}
          handleLogout={handleLogout}
          unreadNotifications={
            Array.isArray(dashboardData.notifications) 
              ? dashboardData.notifications.filter(n => !n.lu).length 
              : 0
          }
        />
      </Suspense>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={<LoadingIndicator />}>
          <DashboardHeader
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        </Suspense>
        
        {/* Corps principal */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent}
        </main>
      </div>
    </div>
  );
};

export default MinimalDashboard;