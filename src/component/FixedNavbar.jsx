import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const FixedNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // États
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Fermer les menus déroulants lors du clic à l'extérieur
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Gestion du menu profil
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      
      // Gestion du menu notifications
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Désactiver le défilement lorsque le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);
  
  // Charger les notifications et les compteurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Récupérer les notifications
        const notifResponse = await axios.get('/api/notifications?limit=5');
        setNotifications(notifResponse.data.notifications || []);
        
        // Récupérer le nombre de notifications non lues
        const notifCountResponse = await axios.get('/api/notifications/unread-count');
        setNotificationCount(notifCountResponse.data.count || 0);
        
        // Récupérer le nombre de messages non lus
        const messageResponse = await axios.get('/api/messages/unread-count');
        setMessageCount(messageResponse.data.count || 0);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Mettre à jour les notifications toutes les 60 secondes
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => ({ ...notif, lu: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };
  
  // Marquer une notification comme lue
  const markAsRead = async (notifId) => {
    try {
      await axios.patch(`/api/notifications/${notifId}/read`);
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => {
        if (notif.id === notifId) {
          return { ...notif, lu: true };
        }
        return notif;
      }));
      
      // Décrémenter le compteur si nécessaire
      const unreadNotif = notifications.find(n => n.id === notifId && !n.lu);
      if (unreadNotif) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };
  
  // Gérer la recherche
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/offres?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Liens de navigation principale
  const navLinks = [
    { name: "Offres", href: "/offres", current: window.location.pathname === '/offres' },
    { name: "Entreprises", href: "/entreprises", current: window.location.pathname.startsWith('/entreprises') },
    { name: "Dashboard", href: "/dashboard", current: window.location.pathname.startsWith('/dashboard') }
  ];
  
  // Formater la date relative
  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSec < 60) {
      return 'À l\'instant';
    } else if (diffMin < 60) {
      return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation principale - visible sur desktop */}
          <div className="flex">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center text-teal-600 font-semibold text-lg">
                <Briefcase className="h-6 w-6 mr-2" />
                <span>JobConnect</span>
              </Link>
            </div>
            
            {/* Navigation principale - visible uniquement sur desktop */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    link.current
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                  }`}
                  aria-current={link.current ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Bouton de menu mobile */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-50 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Actions et profil - visible sur desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Barre de recherche */}
            <div className="relative">
              <button 
                className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none ${isSearchOpen ? 'bg-gray-100 text-teal-600' : 'text-gray-500'}`}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Formulaire de recherche étendu */}
              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Rechercher des offres, entreprises..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                className={`p-2 rounded-full hover:bg-gray-100 focus:outline-none ${isNotificationsOpen ? 'bg-gray-100 text-teal-600' : 'text-gray-500'}`}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Panneau de notifications */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    {notificationCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-teal-600 hover:text-teal-700"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin h-5 w-5 border-t-2 border-teal-500 border-r-2 rounded-full mx-auto mb-2"></div>
                        Chargement...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer ${notif.lu ? '' : 'bg-blue-50 hover:bg-blue-50'}`}
                          onClick={() => {
                            if (!notif.lu) {
                              markAsRead(notif.id);
                            }
                            
                            // Rediriger si un lien est disponible
                            if (notif.lien) {
                              navigate(notif.lien);
                              setIsNotificationsOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${notif.lu ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-800">{notif.titre}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.contenu}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notif.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <Link 
                      to="/notifications" 
                      className="block w-full text-center text-xs text-teal-600 hover:text-teal-700 py-1"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profil utilisateur */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center space-x-2 rounded-full hover:bg-gray-50 p-1 focus:outline-none"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                >
                  <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                  <div className="hidden md:flex md:items-center">
                    <span className="text-sm font-medium text-gray-700 mr-1">{user.prenom} {user.nom}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </button>

                {/* Menu du profil */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                          {user.prenom?.[0]}{user.nom?.[0]}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</p>
                          <p className="text-xs text-gray-500">{user.role === 'etudiant' ? 'Étudiant' : user.role === 'entreprise' ? 'Entreprise' : user.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="mr-3 h-5 w-5 text-gray-500" />
                        Mon profil
                      </Link>
                      
                      {user.role === 'etudiant' && (
                        <Link to="/candidatures" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                          Mes candidatures
                        </Link>
                      )}
                      
                      <Link to="/messages" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <div className="relative mr-3">
                          <MessageSquare className="h-5 w-5 text-gray-500" />
                          {messageCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
                          )}
                        </div>
                        Messages
                        {messageCount > 0 && (
                          <span className="ml-auto bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs">
                            {messageCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="mr-3 h-5 w-5 text-gray-500" />
                        Paramètres
                      </Link>
                    </div>
                    <div className="py-1 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-16 overflow-y-auto">
          <div className="px-4 pt-4 pb-6 space-y-6">
            {/* Navigation principale */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Navigation
              </h3>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    link.current
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={link.current ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Barre de recherche mobile */}
            <div className="pt-2 pb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Recherche
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher des offres, entreprises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {user && (
              <>
                {/* Raccourcis */}
                <div className="pt-2 pb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    Raccourcis
                  </h3>
                  <div className="space-y-1">
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    >
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      Mon profil
                    </Link>
                    
                    {user.role === 'etudiant' && (
                      <Link 
                        to="/candidatures" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      >
                        <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                        Mes candidatures
                      </Link>
                    )}
                    
                    <Link 
                      to="/notifications" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    >
                      <Bell className="mr-3 h-5 w-5 text-gray-500" />
                      Notifications
                      {notificationCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {notificationCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link 
                      to="/messages" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    >
                      <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                      Messages
                      {messageCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {messageCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                    >
                      <Settings className="mr-3 h-5 w-5 text-gray-500" />
                      Paramètres
                    </Link>
                  </div>
                </div>

                {/* Informations utilisateur mobile */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-3">
                    <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.prenom} {user.nom}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-500" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {!user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/registration"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center mt-2 border border-teal-500 text-teal-500 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default FixedNavbar;