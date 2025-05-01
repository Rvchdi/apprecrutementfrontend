import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  lazy
} from 'react';
import axios from 'axios'; // Keep axios for notification update example

// Hooks
import { useDashboardData } from './../../cache/userDashboardData'; // Adjust path if needed
import { useAuth } from '../Authentication/AuthContext'; // Adjust path if needed

// --- Lazy Loading Components ---
// (Assuming these components exist and are styled appropriately or accept style props)
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

// --- Loading Indicator Component ---
const LoadingIndicator = ({ message = "Chargement..." }) => (
  <div className="flex flex-col justify-center items-center h-full py-16 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
  </div>
);

// --- Error Display Component ---
const ErrorDisplay = ({ error }) => (
   <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm my-4" role="alert">
      <p className="font-bold">Une erreur est survenue</p>
      <p>{typeof error === 'string' ? error : 'Impossible de charger les données.'}</p>
   </div>
);

// --- Main Dashboard Component ---
const MinimalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const dashboardData = useDashboardData(user); // Fetch data using custom hook

  // Debug logs (optional)
  useEffect(() => {
      console.log("Dashboard Data Status:", { loading: dashboardData.loading, error: dashboardData.error, hasData: !!dashboardData });
      console.log("Active Tab:", activeTab);
  }, [dashboardData, activeTab]);

  // Logout handler
  const handleLogout = useCallback(async () => {
      try {
          await logout();
          // Navigate to login or home page is usually handled within AuthContext or App router
      } catch (err) {
          console.error('Logout failed:', err);
          // Display error notification to user if needed
      }
  }, [logout]);

  // Notification read handler
  const handleMarkNotificationAsRead = useCallback(async (id) => {
      // Optimistic UI update (example - adapt based on useDashboardData implementation)
      const originalNotifications = dashboardData.notifications ? [...dashboardData.notifications] : [];
      const updatedNotifications = originalNotifications.map(notif =>
          notif.id === id ? { ...notif, lu: true } : notif
      );
       // TODO: Replace this direct mutation if useDashboardData provides a setter
       // This might cause issues if dashboardData is meant to be immutable.
       // Ideally, useDashboardData should expose a way to update its state,
       // e.g., refetch or provide a setData function.
       if (dashboardData.setData) {
           dashboardData.setData(prev => ({ ...prev, notifications: updatedNotifications }));
       } else {
           console.warn("Direct mutation of dashboardData.notifications. Consider using a state setter.");
           dashboardData.notifications = updatedNotifications; // Less ideal fallback
       }


      try {
          await axios.patch(`/api/notifications/${id}/read`);
          // Optional: Refetch notifications or rely on optimistic update
           if (dashboardData.refetch) dashboardData.refetch('notifications');

      } catch (error) {
          console.error('Failed to mark notification as read:', error);
          // Revert optimistic update on error
           if (dashboardData.setData) {
               dashboardData.setData(prev => ({ ...prev, notifications: originalNotifications }));
           } else {
               dashboardData.notifications = originalNotifications; // Revert fallback
           }
          // Show error message to user
      }
  }, [dashboardData]); // Dependency array needs dashboardData and potentially its update methods


  // Memoized content rendering based on active tab
  const renderContent = useMemo(() => {
      if (dashboardData.loading && !dashboardData.profile) { // Show loading only if essential data isn't there yet
          return <LoadingIndicator />;
      }

      if (dashboardData.error && !dashboardData.profile) { // Show error prominently if loading failed
          return <ErrorDisplay error={dashboardData.error} />;
      }

      // Use safe defaults for data arrays
      const notifications = Array.isArray(dashboardData.notifications) ? dashboardData.notifications : [];
      const tests = Array.isArray(dashboardData.tests) ? dashboardData.tests : [];
      const opportunities = Array.isArray(dashboardData.opportunities) ? dashboardData.opportunities : [];
      const applications = Array.isArray(dashboardData.applications) ? dashboardData.applications : [];
      const entretiens = Array.isArray(dashboardData.entretiens) ? dashboardData.entretiens : [];

      // Map tab keys to titles and components
      const tabConfig = {
           overview: {
               title: "Vue d'ensemble",
               component: (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
                      <div className="lg:col-span-3">
                          <ProfileWidget userData={user} loading={dashboardData.loading} />
                      </div>
                      <div className="lg:col-span-1">
                          <ApplicationsWidget candidatures={applications} loading={dashboardData.loading} />
                      </div>
                      <div className="lg:col-span-1">
                           <NotificationsWidget
                               notifications={notifications.slice(0, 5)} // Show recent 5
                               loading={dashboardData.loading}
                               onMarkAsRead={handleMarkNotificationAsRead}
                           />
                      </div>
                       {user?.role === 'entreprise' && (
                          <div className="lg:col-span-1">
                              <OpportunitiesWidget offres={opportunities} loading={dashboardData.loading} />
                          </div>
                       )}
                       {user?.role === 'etudiant' && (
                          <div className="lg:col-span-1">
                              <TestsWidget tests={tests} loading={dashboardData.loading} />
                          </div>
                       )}
                       {/* Add more overview widgets here */}
                  </div>
               )
           },
           profile: { title: "Mon Profil", component: <ProfileWidget userData={user} loading={dashboardData.loading} /> },
           applications: { title: "Mes Candidatures", component: <ApplicationsWidget candidatures={applications} loading={dashboardData.loading} /> },
           notifications: { title: "Notifications", component: <NotificationsWidget notifications={notifications} loading={dashboardData.loading} onMarkAsRead={handleMarkNotificationAsRead} /> },
           entretiens: { title: "Mes Entretiens", component: <EntretienWidget entretiens={entretiens} loading={dashboardData.loading} /> },
           settings: { title: "Paramètres", component: <SettingsWidget userData={user} loading={dashboardData.loading} /> },
           // Student specific
           tests: { title: "Mes Tests", component: <TestsWidget tests={tests} loading={dashboardData.loading} />, roles: ['etudiant'] },
           // Entreprise specific
           offers: { title: "Mes Offres Publiées", component: <OpportunitiesWidget offres={opportunities} loading={dashboardData.loading} error={dashboardData.error} />, roles: ['entreprise'] },
           candidates: { title: "Candidatures Reçues", component: <CandidatesContainer candidatures={applications} loading={dashboardData.loading} />, roles: ['entreprise'] },
      };

      const currentTabConfig = tabConfig[activeTab];

      // Handle unknown tab or role mismatch
      if (!currentTabConfig || (currentTabConfig.roles && !currentTabConfig.roles.includes(user?.role))) {
          return (
              <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Contenu non disponible</h2>
                  <p className="text-gray-500">L'onglet '{activeTab}' n'existe pas ou n'est pas accessible pour votre type de compte.</p>
              </div>
          );
      }

      return (
          <div className="space-y-6">
              {/* Optional: Display error inline if data for specific tab failed but others loaded */}
               {dashboardData.error && activeTab !== 'overview' && <ErrorDisplay error={dashboardData.error} />}

               {/* Render the component for the active tab */}
              <Suspense fallback={<LoadingIndicator message={`Chargement de ${currentTabConfig.title}...`} />}>
                  {currentTabConfig.component}
              </Suspense>
          </div>
      );

  }, [activeTab, user, dashboardData, handleMarkNotificationAsRead]); // Dependencies for rendering

  // Search handler (basic implementation)
  const handleSearch = useCallback((e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          console.log("Perform search for:", searchQuery);
          // Implement actual search logic:
          // - Navigate to a search results page/tab
          // - Filter current view data (if applicable)
          // - Make an API call for search results
      }
  }, [searchQuery]);

  // Don't render dashboard until user is loaded (basic check)
  if (!user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <LoadingIndicator message="Chargement de la session..." />
          </div>
      );
  }

  // Main dashboard structure
  return (
      <div className="min-h-screen bg-gray-100 flex text-gray-800">
          {/* Sidebar */}
          <Suspense fallback={<div className="w-16 md:w-64 bg-white shadow-md h-screen flex items-center justify-center"><LoadingIndicator /></div>}>
              <DashboardSidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  sidebarCollapsed={sidebarCollapsed}
                  setSidebarCollapsed={setSidebarCollapsed}
                  userData={user}
                  handleLogout={handleLogout}
                  unreadNotificationsCount={
                      Array.isArray(dashboardData.notifications)
                          ? dashboardData.notifications.filter(n => !n.lu).length
                          : 0
                  }
              />
          </Suspense>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Suspense fallback={<div className="h-16 bg-white shadow-sm flex items-center justify-center"><LoadingIndicator /></div>}>
                  <DashboardHeader
                       // Pass the title dynamically
                      title={useMemo(() => {
                          const tabs = { overview: "Vue d'ensemble", profile: "Mon Profil", applications: "Mes Candidatures", notifications: "Notifications", entretiens: "Mes Entretiens", settings: "Paramètres", tests: "Mes Tests", offers: "Mes Offres", candidates: "Candidatures Reçues" };
                          return tabs[activeTab] || "Dashboard";
                      }, [activeTab])}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      handleSearch={handleSearch}
                      userName={user?.nom || user?.name || 'Utilisateur'} // Display user name
                      userRole={user?.role || ''} // Display user role
                      userAvatar={user?.avatar_url || null} // Pass avatar URL
                  />
              </Suspense>

              {/* Scrollable Main Body */}
              <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 bg-gray-100">
                  {renderContent}
              </main>
          </div>
      </div>
  );
};

export default MinimalDashboard;