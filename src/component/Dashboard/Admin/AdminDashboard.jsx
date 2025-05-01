import React, { useState, useEffect } from 'react';
import {
    UsersIcon,
    BriefcaseIcon,
    TagIcon,
    ChartBarIcon,
    CogIcon,
    TrashIcon, // Keep if used in child components
    PencilIcon, // Keep if used in child components
    PlusIcon, // Keep if used in child components
    UserIcon,
    CheckIcon, // Keep if used in child components
    XIcon as XIconOutline, // Keep if used in child components
    SearchIcon,
    FilterIcon, // Keep if used in child components
    EyeIcon, // Keep if used in child components
    ChevronDownIcon, // Keep if used in child components
    ChevronUpIcon, // Keep if used in child components
    MenuIcon,
    XIcon, // Using solid version for close buttons usually looks better
    LogoutIcon, // More semantic icon for logout
} from '@heroicons/react/outline'; // Consider using solid icons for some elements too if preferred
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is configured (e.g., baseURL, interceptors for auth)
import { useAuth } from '../../Authentication/AuthContext'; // Ensure path is correct

// Widgets (Assuming these exist and are styled)
import UserManagement from './Widgets/UserMangement';
import CompetenceManagement from './Widgets/CompetenceManagement';
import OfferManagement from './Widgets/OfferManagement';
import DashboardStats from './Widgets/DashboardStats';
import Settings from './Widgets/Settings';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate(); // Initialize navigate
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
    const [loadingStats, setLoadingStats] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        students: 0,
        companies: 0,
        offers: 0,
        applications: 0,
        competences: 0
    });

    // --- Hooks ---

    // Redirect if not admin
    useEffect(() => {
        // Add a check to ensure user data is loaded before redirecting
        if (user && user.role !== 'admin') {
            console.warn("Redirecting: User is not an admin.");
            navigate('/unauthorized'); // Make sure this route exists
        }
    }, [user, navigate]);

    // Fetch dashboard statistics
    useEffect(() => {
        // Only fetch if the user is confirmed to be an admin (or during initial load before confirmation)
        if (!user || user.role === 'admin') {
            const fetchStats = async () => {
                try {
                    setLoadingStats(true);
                    // Ensure axios includes auth token (e.g., via interceptors)
                    const response = await axios.get('/api/admin/dashboard');
                    setStats(response.data);
                    console.log('Dashboard Stats:', response.data);
                } catch (error) {
                    console.error('Error loading dashboard stats:', error);
                    // Handle error display to the user if needed
                } finally {
                    setLoadingStats(false);
                }
            };
            fetchStats();
        } else {
            // If user exists but is not admin, no need to fetch admin stats
             setLoadingStats(false);
        }
    }, [user]); // Re-run if user changes (e.g., on login)

    // --- Data & Configuration ---

    const navItems = [
        { id: 'dashboard', name: 'Tableau de bord', icon: ChartBarIcon },
        { id: 'users', name: 'Utilisateurs', icon: UsersIcon },
        { id: 'competences', name: 'Compétences', icon: TagIcon },
        { id: 'offers', name: 'Offres', icon: BriefcaseIcon },
        { id: 'settings', name: 'Paramètres', icon: CogIcon },
    ];

    // --- Event Handlers ---

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redirect to login after logout
        } catch (error) {
            console.error('Logout failed:', error);
            // Display error notification to user if needed
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after selection
            setSidebarOpen(false);
        }
    };

    // --- Content Rendering ---

    const renderContent = () => {
        // Ensure user context is available if widgets depend on it
        if (!user && activeTab !== 'dashboard') return null; // Or a loading/placeholder state

        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats stats={stats} loading={loadingStats} />;
            case 'users':
                return <UserManagement />;
            case 'competences':
                return <CompetenceManagement />;
            case 'offers':
                return <OfferManagement />;
            case 'settings':
                return <Settings />;
            default:
                // Fallback to dashboard or show an error/empty state
                return <DashboardStats stats={stats} loading={loadingStats} />;
        }
    };

    // --- UI Rendering ---

    // Loading state for the entire dashboard before user role is confirmed?
    // If user is null during initial load, you might want a full-screen loader.
    // if (!user) {
    //    return <div className="flex items-center justify-center h-screen">Loading User...</div>;
    // }


    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <BriefcaseIcon className="w-7 h-7 text-teal-600" />
                        <span className="text-xl font-semibold text-gray-800 tracking-tight">JobConnect</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4">
                   <div className="flex items-center p-3 mb-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white shadow">
                            {/* Placeholder Icon - Replace with user avatar if available */}
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                                {user?.prenom} {user?.nom || 'Admin User'}
                            </p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Administrateur
                            </p>
                        </div>
                    </div>
                </div>


                {/* Navigation */}
                <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon; // Get the component type
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`group flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ease-in-out ${
                                    isActive
                                        ? 'bg-teal-50 text-teal-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <Icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                                        isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-500'
                                    }`}
                                    aria-hidden="true"
                                />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer (Logout) */}
                <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-800 transition-colors duration-150 ease-in-out"
                    >
                        <LogoutIcon className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-700" aria-hidden="true" />
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                {/* Header Bar */}
                <header className="relative z-10 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200 flex-shrink-0">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>

                    {/* Section Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate ml-4 lg:ml-0">
                            {navItems.find(item => item.id === activeTab)?.name || 'Tableau de bord'}
                        </h1>
                    </div>


                    {/* Header Right Side (e.g., Search, Notifications, Profile) */}
                    <div className="flex items-center space-x-4">
                       {/* Search Bar - Keep it simple or enhance based on needs */}
                       <div className="relative hidden md:block">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                           </div>
                           <input
                               type="text"
                               placeholder="Rechercher..."
                               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition duration-150 ease-in-out"
                           />
                        </div>

                        {/* Add other header items here if needed (e.g., Notification bell) */}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        {/* Content Switches Here */}
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;