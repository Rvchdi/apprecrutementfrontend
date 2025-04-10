import React from 'react';
import { 
  Monitor,
  User, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Book,
  Calendar,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const DashboardSidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  userData,
  handleLogout,
  unreadNotifications = 0,
  upcomingEntretiens = 0
}) => {
  // Configurer les éléments du menu en fonction du rôle
  const getMenuItems = () => {
    const commonItems = [
      { id: 'overview', label: 'Tableau de bord', icon: <Monitor size={20} /> },
      { id: 'profile', label: 'Profil', icon: <User size={20} /> },
      { id: 'entretiens', label: 'Entretiens', icon: <Calendar size={20} />, badge: upcomingEntretiens },
      { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, badge: unreadNotifications },
      { id: 'settings', label: 'Paramètres', icon: <Settings size={20} /> }
    ];
    
    if (userData?.role === 'etudiant') {
      return [
        ...commonItems.slice(0, 2),
        { id: 'applications', label: 'Mes candidatures', icon: <FileText size={20} /> },
        { id: 'tests', label: 'Tests', icon: <Book size={20} /> },
        ...commonItems.slice(2)
      ];
    } else if (userData?.role === 'entreprise') {
      return [
        ...commonItems.slice(0, 2),
        { id: 'offers', label: 'Mes offres', icon: <Briefcase size={20} /> },
        { id: 'candidates', label: 'Candidatures reçues', icon: <FileText size={20} /> },
        ...commonItems.slice(2)
      ];
    }
    
    return commonItems;
  };

  const getUserInitials = () => {
    if (userData?.role === 'etudiant') {
      return `${userData?.prenom?.[0]}${userData?.nom?.[0]}`;
    } else if (userData?.role === 'entreprise') {
      return userData?.entreprise?.nom_entreprise?.[0] || 'E';
    }
    return 'U';
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* En-tête sidebar */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex-1 flex items-center">
          <div className="h-8 w-8 bg-teal-500 text-white flex items-center justify-center rounded-lg text-sm font-bold">
            {getUserInitials()}
          </div>
          {!sidebarCollapsed && (
            <span className="ml-3 font-medium text-gray-800 truncate">
              {userData?.role === 'etudiant' 
                ? `${userData?.prenom} ${userData?.nom}` 
                : userData?.entreprise?.nom_entreprise || 'Entreprise'}
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
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3 flex-1 flex justify-between items-center">
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
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
  );
};

export default DashboardSidebar;