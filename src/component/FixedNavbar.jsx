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
  Loader
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const FixedNavbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  // États
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Récupérer les données de l'utilisateur et les notifications
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          
          // Récupérer le nombre de notifications non lues
          const notifResponse = await axios.get('/api/notifications/unread-count');
          setUnreadNotificationsCount(notifResponse.data.count || 0);
          
          // Récupérer le nombre de messages non lus
          const messagesResponse = await axios.get('/api/messages/unread-count');
          setUnreadMessagesCount(messagesResponse.data.count || 0);
          
          // Récupérer les dernières notifications (limité à 5)
          if (isNotificationsOpen) {
            const notificationsResponse = await axios.get('/api/notifications?limit=5');
            setNotifications(notificationsResponse.data.notifications || []);
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Erreur lors de la récupération des données:', err);
          setError('Une erreur est survenue lors de la récupération des données.');
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // Mettre en place un intervalle pour vérifier régulièrement les nouvelles notifications
    const intervalId = setInterval(fetchUserData, 60000); // Vérifier toutes les minutes
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, isNotificationsOpen]);

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

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      
      // Mettre à jour les notifications
      setNotifications(notifications.map(notif => ({
        ...notif,
        lu: true
      })));
      
      // Réinitialiser le compteur
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      
      // Mettre à jour les notifications
      setNotifications(notifications.map(notif => {
        if (notif.id === id) {
          return { ...notif, lu: true };
        }
        return notif;
      }));
      
      // Mettre à jour le compteur
      setUnreadNotificationsCount(Math.max(0, unreadNotificationsCount - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Rechercher des offres
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/offres?search=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Formater la date relative
  const formatRelativeTime = (dateString) => {
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

  // Obtenir les initiales de l'utilisateur
  const getUserInitials = () => {
    if (!user) return '';
    
    if (user.role === 'etudiant') {
      return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`;
    } else if (user.role === 'entreprise' && user.entreprise) {
      return user.entreprise.nom_entreprise?.charAt(0) || 'E';
    }
    
    return 'U';
  };

  // Liens de navigation principale
  const navLinks = [
    { name: "Offres", href: "/offres", current: true },
    { name: "Entreprises", href: "/entreprises", current: false },
    { name: "Événements", href: "/evenements", current: false },
    { name: "Ressources", href: "/ressources", current: false }
  ];

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
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Rechercher des offres, entreprises..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <>
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
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Panneau de notifications */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">Notifications</h3>
                        {unreadNotificationsCount > 0 && (
                          <button 
                            className="text-xs text-teal-600 hover:text-teal-700"
                            onClick={markAllNotificationsAsRead}
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>
                      
                      {loading ? (
                        <div className="p-4 text-center">
                          <Loader className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                          <p className="text-sm text-gray-500 mt-1">Chargement des notifications...</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                          {notifications.length === 0 ? (
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
                                    markNotificationAsRead(notif.id);
                                  }
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
                      )}
                      
                      <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <Link to="/notifications" className="block w-full text-center text-xs text-teal-600 hover:text-teal-700 py-1">
                          Voir toutes les notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profil utilisateur */}
                <div className="relative" ref={profileRef}>
                  <button
                    className="flex items-center space-x-2 rounded-full hover:bg-gray-50 p-1 focus:outline-none"
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:flex md:items-center">
                      <span className="text-sm font-medium text-gray-700 mr-1">
                        {user ? (user.role === 'etudiant' ? `${user.prenom} ${user.nom}` : user.entreprise?.nom_entreprise) : 'Utilisateur'}
                      </span>
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </button>

                  {/* Menu du profil */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                      {isAuthenticated ? (
                        <>
                          <div className="p-3 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                                {getUserInitials()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">
                                  {user.role === 'etudiant' ? `${user.prenom} ${user.nom}` : user.entreprise?.nom_entreprise}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.role === 'etudiant' ? 'Étudiant' : user.role === 'entreprise' ? 'Entreprise' : user.role}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="py-1">
                            <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <User className="mr-3 h-5 w-5 text-gray-500" />
                              Mon profil
                            </Link>
                            <Link to="/candidatures" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                              {user.role === 'etudiant' ? 'Mes candidatures' : 'Mes offres'}
                            </Link>
                            <Link to="/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                              Messages
                              {unreadMessagesCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                  {unreadMessagesCount}
                                </span>
                              )}
                            </Link>
                            <Link to="/parametres" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Settings className="mr-3 h-5 w-5 text-gray-500" />
                              Paramètres
                            </Link>
                          </div>
                          <div className="py-1 border-t border-gray-100">
                            <button 
                              onClick={handleLogout}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="mr-3 h-5 w-5 text-red-500" />
                              Déconnexion
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="py-2">
                          <Link to="/login" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <User className="mr-3 h-5 w-5 text-gray-500" />
                            Se connecter
                          </Link>
                          <Link to="/registration" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <User className="mr-3 h-5 w-5 text-gray-500" />
                            S'inscrire
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Connexion
                </Link>
                <Link to="/registration" className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 text-sm font-medium">
                  Inscription
                </Link>
              </div>
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
                  aria-current={link.current ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
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
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher des offres, entreprises..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
                />
              </form>
            </div>

            {isAuthenticated ? (
              <>
                {/* Raccourcis */}
                <div className="pt-2 pb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    Raccourcis
                  </h3>
                  <div className="space-y-1">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      Mon profil
                    </Link>
                    <Link 
                      to="/candidatures" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                      {user?.role === 'etudiant' ? 'Mes candidatures' : 'Mes offres'}
                    </Link>
                    <Link 
                      to="/notifications" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Bell className="mr-3 h-5 w-5 text-gray-500" />
                      Notifications
                      {unreadNotificationsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/messages" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                      Messages
                      {unreadMessagesCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/parametres" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      onClick={() => setIsMobileMenuOpen(false)}
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
                      {getUserInitials()}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user?.role === 'etudiant' ? `${user.prenom} ${user.nom}` : user?.entreprise?.nom_entreprise}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-500" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-2">
                  <Link 
                    to="/login"
                    className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link 
                    to="/registration"
                    className="block w-full text-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default FixedNavbar;