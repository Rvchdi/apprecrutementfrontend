import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Briefcase,
    Bell,
    Search,
    User,
    Bookmark,
    MessageSquare,
    LogOut,
    Settings,
    Menu,
    X,
    ChevronDown,
    Loader // Using Loader instead of Loader2 for consistency if preferred
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Authentication/AuthContext'; // Adjust path if needed

// Helper function to format relative time (kept as is)
const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHours = Math.round(diffMin / 60);
        const diffDays = Math.round(diffHours / 24);

        if (diffSec < 60) return "à l'instant";
        if (diffMin < 60) return `il y a ${diffMin} min`;
        if (diffHours < 24) return `il y a ${diffHours} h`;
        if (diffDays < 7) return `il y a ${diffDays} j`;
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'date invalide';
    }
};


const FixedNavbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    // --- State Management ---
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Assuming this is still needed
    const [loadingCounts, setLoadingCounts] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false); // Separate loading for list
    const [error, setError] = useState(null);

    // Refs for outside click detection
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const mobileMenuRef = useRef(null); // Ref for mobile menu


    // --- Data Fetching Logic ---

    // Fetch Unread Counts on Mount/Auth Change
    const fetchUnreadCounts = useCallback(async () => {
        if (!isAuthenticated) {
             setUnreadNotificationsCount(0);
             setUnreadMessagesCount(0);
             return;
        };

        setLoadingCounts(true);
        setError(null);
        try {
            const [notifRes, msgRes] = await Promise.all([
                axios.get('/api/notifications/unread-count').catch(e => ({ data: { count: 0 }, error: e })), // Prevent Promise.all failure
                axios.get('/api/messages/unread-count').catch(e => ({ data: { count: 0 }, error: e }))
            ]);

            if (!notifRes.error) setUnreadNotificationsCount(notifRes.data.count || 0);
            else console.error("Failed to fetch notification count:", notifRes.error);

            if (!msgRes.error) setUnreadMessagesCount(msgRes.data.count || 0);
             else console.error("Failed to fetch message count:", msgRes.error);

        } catch (err) {
            // This catch might not be reached if individual catches handle errors
            console.error('Error fetching unread counts:', err);
            setError('Erreur de chargement des compteurs.');
        } finally {
            setLoadingCounts(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchUnreadCounts();
    }, [fetchUnreadCounts]); // Fetch counts when auth status changes


    // Fetch Notification List when Dropdown Opens
    useEffect(() => {
        const fetchNotificationList = async () => {
            if (isNotificationsOpen && isAuthenticated) {
                setLoadingNotifications(true);
                setError(null); // Clear previous errors specific to list fetching
                try {
                    const response = await axios.get('/api/notifications?limit=7&sort=desc'); // Fetch recent 7
                    setNotifications(response.data.notifications || []);
                } catch (err) {
                    console.error('Error fetching notifications list:', err);
                    setError('Impossible de charger les notifications.');
                    setNotifications([]); // Clear potentially stale data
                } finally {
                    setLoadingNotifications(false);
                }
            }
        };

        fetchNotificationList();
     }, [isNotificationsOpen, isAuthenticated]); // Only depends on these


    // --- Event Listeners ---

    // Close dropdowns on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
             // Close mobile menu on outside click as well
             if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-label="Ouvrir le menu"]')) {
                 // Check if the click target is NOT the menu button itself
                 setIsMobileMenuOpen(false);
             }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isMobileMenuOpen]); // Add isMobileMenuOpen dependency


    // Disable body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; }; // Cleanup
    }, [isMobileMenuOpen]);


    // --- Handlers ---

    const handleLogout = useCallback(async () => {
        setIsProfileOpen(false); // Close dropdown
        setIsMobileMenuOpen(false); // Close mobile menu
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            setError("Erreur lors de la déconnexion."); // Show user feedback
        }
    }, [logout, navigate]);


    const updateNotificationState = (id, readStatus) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: readStatus } : n));
         // Adjust count accurately based on previous read status
         const wasUnread = notifications.find(n => n.id === id)?.lu === false;
         if (readStatus && wasUnread) {
             setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
         } else if (!readStatus && !wasUnread) {
             // Optional: Handle marking as unread if needed
             setUnreadNotificationsCount(prev => prev + 1);
         }
    };

    const handleMarkNotificationAsRead = useCallback(async (id) => {
        const notification = notifications.find(n => n.id === id);
        if (!notification || notification.lu) return; // Already read or not found

        // Optimistic UI update
        updateNotificationState(id, true);

        try {
            await axios.patch(`/api/notifications/${id}/read`);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert UI on error
            updateNotificationState(id, false);
            setError("Erreur lors de la mise à jour de la notification.");
        }
    }, [notifications]); // Dependency: notifications array


    const handleMarkAllNotificationsAsRead = useCallback(async () => {
        const unreadIds = notifications.filter(n => !n.lu).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic UI update
        setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
        setUnreadNotificationsCount(0);

        try {
            await axios.patch('/api/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Revert UI (more complex, might need original state snapshot)
            // For simplicity, refetch counts or show error
            setError("Erreur lors du marquage des notifications.");
            fetchUnreadCounts(); // Refetch counts to be sure
        }
    }, [notifications, fetchUnreadCounts]);


    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/offres?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false); // Close mobile menu on search
        }
    };

    const handleNotificationClick = (notification) => {
         if (!notification.lu) {
             handleMarkNotificationAsRead(notification.id);
         }
         if (notification.lien) {
             navigate(notification.lien);
             setIsNotificationsOpen(false); // Close dropdown on navigation
             setIsMobileMenuOpen(false); // Close mobile menu
         }
     };

    // --- Helpers ---
    const getUserInitials = useCallback(() => {
        if (!user) return '?';
        const firstName = user.prenom || '';
        const lastName = user.nom || '';
        const companyName = user.entreprise?.nom_entreprise || '';

        if (user.role === 'etudiant') return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'ET';
        if (user.role === 'entreprise') return companyName.charAt(0).toUpperCase() || 'EN';
        return user.name?.charAt(0).toUpperCase() || 'U';
    }, [user]);


    // --- Links ---
    const navLinks = useMemo(() => [
        { name: "Offres d'emploi", href: "/offers" },
        { name: "Offres recommandées", href: "/offers/recommended" },
    ], []);

    const profileMenuItems = useMemo(() => [
         { name: "Mon Dashboard", href: "/dashboard", icon: User, roles: ['etudiant', 'entreprise', 'admin'] },
         { name: "Mes Candidatures", href: "/dashboard?tab=applications", icon: Bookmark, roles: ['etudiant'] },
         { name: "Mes Offres", href: "/dashboard?tab=offers", icon: Briefcase, roles: ['entreprise'] },
         { name: "Messages", href: "/messages", icon: MessageSquare, roles: ['etudiant', 'entreprise', 'admin'], badge: unreadMessagesCount },
         { name: "Paramètres", href: "/dashboard?tab=settings", icon: Settings, roles: ['etudiant', 'entreprise', 'admin'] },
     ], [unreadMessagesCount]);


    return (
        <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Increased max-width */}
                <div className="flex justify-between items-center h-16">

                    {/* Left Side: Logo & Desktop Nav */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center flex-shrink-0 text-teal-600 hover:text-teal-700 transition duration-150 ease-in-out">
                            <Briefcase className="h-7 w-7 mr-2" />
                            <span className="text-xl font-bold tracking-tight">JobConnect</span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition duration-150 ease-in-out"
                                    // Add active styling if needed using useLocation hook from react-router-dom
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Search, Actions, Profile */}
                    <div className="flex items-center">
                        {/* Desktop Search Form */}
                        <div className="hidden md:ml-6 md:block">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 lg:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 ease-in-out focus:w-56 lg:focus:w-72"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </form>
                        </div>

                        {/* Mobile Search Toggle - Replaces search form on small screens */}
                        {/* <button className="md:hidden ml-4 p-2 rounded-full text-gray-500 hover:text-teal-600 hover:bg-gray-100 focus:outline-none">
                             <Search className="h-5 w-5" />
                         </button> */}


                        {/* Authenticated User Actions (Desktop) */}
                        {isAuthenticated && (
                            <div className="hidden md:ml-4 md:flex md:items-center md:space-x-2">
                                {/* Notifications */}
                                <div className="relative" ref={notificationsRef}>
                                    <button
                                        className={`p-2 rounded-full relative focus:outline-none transition duration-150 ease-in-out ${isNotificationsOpen ? 'bg-gray-100 text-teal-600' : 'text-gray-500 hover:text-teal-600 hover:bg-gray-100'}`}
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        aria-label="Voir notifications"
                                    >
                                        <Bell className="h-5 w-5" />
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform scale-90">
                                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                            </span>
                                        )}
                                    </button>
                                    {/* Notifications Dropdown Panel */}
                                     <div
                                         className={`absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition ease-out duration-100 ${isNotificationsOpen ? 'transform opacity-100 scale-100 z-20' : 'transform opacity-0 scale-95 -z-10'}`}
                                         style={{ pointerEvents: isNotificationsOpen ? 'auto' : 'none' }} // Prevent interaction when hidden
                                     >
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                            <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
                                            {unreadNotificationsCount > 0 && (
                                                <button
                                                    className="text-xs text-teal-600 hover:text-teal-700 focus:outline-none"
                                                    onClick={handleMarkAllNotificationsAsRead}
                                                    disabled={loadingNotifications}
                                                >
                                                    Tout marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                        {loadingNotifications ? (
                                            <div className="p-6 text-center">
                                                <Loader className="h-6 w-6 animate-spin mx-auto text-teal-500" />
                                            </div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-sm text-gray-500">
                                                        {error ? <span className="text-red-600">{error}</span> : "Aucune nouvelle notification."}
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={`p-3 transition duration-150 ease-in-out ${notif.lien ? 'cursor-pointer' : ''} ${notif.lu ? 'hover:bg-gray-50' : 'bg-teal-50 hover:bg-teal-100'}`}
                                                            onClick={() => handleNotificationClick(notif)}
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notif.lu ? 'bg-gray-300' : 'bg-teal-500'}`}></div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{notif.titre}</p>
                                                                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.contenu}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notif.created_at)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                        <div className="p-2 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                                            <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)} className="block w-full text-center text-xs text-teal-600 hover:text-teal-700 py-1 font-medium">
                                                Voir toutes les notifications
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1 focus:outline-none transition duration-150 ease-in-out"
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        aria-label="Ouvrir le menu profil"
                                        aria-haspopup="true"
                                        aria-expanded={isProfileOpen}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white">
                                            {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" /> : getUserInitials()}
                                        </div>
                                        <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                     {/* Profile Dropdown Panel */}
                                     <div
                                         className={`absolute right-0 mt-2 w-60 origin-top-right bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition ease-out duration-100 ${isProfileOpen ? 'transform opacity-100 scale-100 z-20' : 'transform opacity-0 scale-95 -z-10'}`}
                                         style={{ pointerEvents: isProfileOpen ? 'auto' : 'none' }}
                                         role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button"
                                     >
                                        <div className="p-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800 truncate" role="menuitem">
                                                {user?.role === 'etudiant' ? `${user.prenom} ${user.nom}` : user?.entreprise?.nom_entreprise || user?.name || 'Utilisateur'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate" role="menuitem">{user?.email}</p>
                                        </div>
                                        <div className="py-1" role="none">
                                            {profileMenuItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                                                 <Link
                                                     key={item.name}
                                                     to={item.href}
                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition duration-150 ease-in-out"
                                                     role="menuitem"
                                                     onClick={() => setIsProfileOpen(false)}
                                                 >
                                                     <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                                     <span>{item.name}</span>
                                                     {item.badge > 0 && (
                                                         <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 font-medium">
                                                             {item.badge > 9 ? '9+' : item.badge}
                                                         </span>
                                                     )}
                                                 </Link>
                                            ))}
                                        </div>
                                        <div className="py-1 border-t border-gray-100" role="none">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150 ease-in-out"
                                                role="menuitem"
                                            >
                                                <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                                                Déconnexion
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Login/Register Buttons (Desktop) */}
                        {!isAuthenticated && (
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-3">
                                <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition duration-150 ease-in-out">
                                    Connexion
                                </Link>
                                <Link to="/registration" className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out shadow-sm">
                                    Inscription
                                </Link>
                            </div>
                        )}


                        {/* Mobile Menu Button */}
                        <div className="ml-4 flex items-center md:hidden">
                             <button
                                 type="button"
                                 className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                 aria-label="Ouvrir le menu"
                                 aria-expanded={isMobileMenuOpen}
                             >
                                 {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                             </button>
                        </div>
                    </div>
                </div>
            </div>

             {/* --- Mobile Menu Panel --- */}
             {/* Use a transition library like Headless UI or Framer Motion for smoother slide-in/out */}
            <div
                ref={mobileMenuRef} // Add ref here
                className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} bg-white shadow-lg overflow-y-auto`}
             >
                 <div className="pt-16 h-full"> {/* Add padding top equal to navbar height */}
                    {/* Close button inside mobile menu */}
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                             type="button"
                             className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                             onClick={() => setIsMobileMenuOpen(false)}
                         >
                             <span className="sr-only">Fermer le menu</span>
                             <X className="h-6 w-6" aria-hidden="true" />
                         </button>
                     </div>

                     <div className="px-4 pt-5 pb-6 space-y-6">
                         {/* Mobile Search */}
                         <div>
                             <form onSubmit={handleSearchSubmit} className="relative mt-2">
                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                 <input
                                     type="text"
                                     placeholder="Rechercher des offres..."
                                     value={searchQuery}
                                     onChange={(e) => setSearchQuery(e.target.value)}
                                     className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 bg-gray-50"
                                 />
                             </form>
                         </div>

                         {/* Mobile Navigation */}
                         <nav className="space-y-1">
                             <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</h3>
                             {navLinks.map((link) => (
                                 <Link key={link.name} to={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600" onClick={() => setIsMobileMenuOpen(false)}>
                                     {link.name}
                                 </Link>
                             ))}
                         </nav>

                         {/* Authenticated User Links (Mobile) */}
                         {isAuthenticated && user ? (
                             <div className="border-t border-gray-200 pt-4">
                                 <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mon Compte</h3>
                                 <div className="space-y-1">
                                     {profileMenuItems.filter(item => item.roles.includes(user.role)).map((item) => (
                                         <Link
                                             key={item.name}
                                             to={item.href}
                                             className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                                             onClick={() => setIsMobileMenuOpen(false)}
                                         >
                                             <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                             <span>{item.name}</span>
                                             {item.badge > 0 && (
                                                 <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 font-medium">
                                                     {item.badge > 9 ? '9+' : item.badge}
                                                 </span>
                                             )}
                                         </Link>
                                     ))}
                                      <button
                                         onClick={handleLogout}
                                         className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                                      >
                                         <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                                         Déconnexion
                                      </button>
                                 </div>
                             </div>
                         ) : (
                             // Login/Register Buttons (Mobile)
                             <div className="border-t border-gray-200 pt-4 space-y-3">
                                 <Link to="/login" className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                                     Se connecter
                                 </Link>
                                 <Link to="/registration" className="block w-full text-center px-4 py-2 bg-teal-500 text-white rounded-lg text-base font-medium hover:bg-teal-600" onClick={() => setIsMobileMenuOpen(false)}>
                                     S'inscrire
                                 </Link>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
        </nav>
    );
};

export default FixedNavbar;