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

  // Gestionnaire de déconnexion
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  }, [logout]);

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
              candidatures={dashboardData.applications || []} 
              loading={dashboardData.loading} 
            />
            {user?.role === 'entreprise' && (
              <div className="col-span-1">
                <OpportunitiesWidget 
                  offres={dashboardData.opportunities || []} 
                  loading={dashboardData.loading} 
                />
              </div>
            )}
            <NotificationsWidget 
              notifications={notifications.slice(0, 3)} 
              loading={dashboardData.loading} 
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
      // Autres onglets similaires avec des fallbacks
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
            candidatures={dashboardData.applications || []} 
            loading={dashboardData.loading} 
          />
        </Suspense>
      ),
      // ... autres onglets avec des fallbacks similaires
    };

    return renderMap[activeTab] || (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-600">Sélectionnez une option dans le menu</p>
      </div>
    );
  }, [
    activeTab, 
    user, 
    dashboardData
  ]);

  // Gestionnaire de recherche
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logique de recherche
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