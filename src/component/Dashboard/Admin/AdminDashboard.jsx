import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  BriefcaseIcon, 
  TagIcon, 
  ChartBarIcon, 
  CogIcon,
  TrashIcon, 
  PencilIcon, 
  PlusIcon,
  UserIcon,
  CheckIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MenuIcon,
  XCircleIcon
} from '@heroicons/react/outline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../Authentication/AuthContext';

// Composants
import UserManagement from './Widgets/UserMangement';
import CompetenceManagement from './Widgets/CompetenceManagement';
import OfferManagement from './Widgets/OfferManagement';
import DashboardStats from './Widgets/DashboardStats';
import Settings from './Widgets/Settings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    companies: 0,
    offers: 0,
    applications: 0,
    competences: 0
  });

  // Vérification que l'utilisateur est bien un administrateur
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [user]);

  // Charger les statistiques au montage du composant
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/api/admin/dashboard');
        setStats(response.data);
        console.log('Statistiques:', response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Navigation du sidebar
  const navItems = [
    { id: 'dashboard', name: 'Tableau de bord', icon: <ChartBarIcon className="w-6 h-6" /> },
    { id: 'users', name: 'Utilisateurs', icon: <UsersIcon className="w-6 h-6" /> },
    { id: 'competences', name: 'Compétences', icon: <TagIcon className="w-6 h-6" /> },
    { id: 'offers', name: 'Offres', icon: <BriefcaseIcon className="w-6 h-6" /> },
    { id: 'settings', name: 'Paramètres', icon: <CogIcon className="w-6 h-6" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Rendu du contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={stats} loading={loading} />;
      case 'users':
        return <UserManagement />;
      case 'competences':
        return <CompetenceManagement />;
      case 'offers':
        return <OfferManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardStats stats={dashboardStats} loading={loading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Mobile Toggle */}
      <div className="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden" 
           onClick={() => setSidebarOpen(false)}
           style={{ display: sidebarOpen ? 'block' : 'none' }}></div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-all transform bg-white shadow-lg lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
      }`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-gray-800">JobConnect</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-md lg:hidden hover:bg-gray-100">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center p-3 mb-6 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-teal-500 text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user?.nom} {user?.prenom}
              </p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-sm rounded-lg ${
                    activeTab === item.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 rounded-md lg:hidden hover:bg-gray-100">
              <MenuIcon className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.id === activeTab)?.name || 'Tableau de bord'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;