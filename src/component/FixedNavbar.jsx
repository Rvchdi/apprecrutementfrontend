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
  ChevronDown
} from 'lucide-react';

const FixedNavbar = ({ userName = "Thomas Dupont", userRole = "Étudiant", userInitials = "TD" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Données d'exemple pour les notifications
  const notifications = [
    {
      id: 1,
      title: "Candidature vue",
      message: "Tech Innovations a consulté votre candidature",
      time: "Il y a 10 minutes",
      read: false
    },
    {
      id: 2,
      title: "Nouvel entretien",
      message: "Digital Solutions vous invite à un entretien le 20/03/2025",
      time: "Il y a 2 heures",
      read: false
    },
    {
      id: 3,
      title: "Test technique",
      message: "N'oubliez pas de compléter le test pour Web Agency",
      time: "Hier",
      read: true
    }
  ];

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

  // Compteur de notifications non lues
  const unreadNotificationsCount = notifications.filter(notif => !notif.read).length;

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
              <a href="/" className="flex items-center text-teal-600 font-semibold text-lg">
                <Briefcase className="h-6 w-6 mr-2" />
                <span>JobConnect</span>
              </a>
            </div>
            
            {/* Navigation principale - visible uniquement sur desktop */}
            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    link.current
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                  }`}
                  aria-current={link.current ? 'page' : undefined}
                >
                  {link.name}
                </a>
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
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Panneau de notifications */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <button className="text-xs text-teal-600 hover:text-teal-700">
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer ${notif.read ? '' : 'bg-blue-50 hover:bg-blue-50'}`}
                        >
                          <div className="flex items-start">
                            <div className={`mt-0.5 h-2 w-2 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <a href="/notifications" className="block w-full text-center text-xs text-teal-600 hover:text-teal-700 py-1">
                      Voir toutes les notifications
                    </a>
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
                  {userInitials}
                </div>
                <div className="hidden md:flex md:items-center">
                  <span className="text-sm font-medium text-gray-700 mr-1">{userName}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </button>

              {/* Menu du profil */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                        {userInitials}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <a href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      Mon profil
                    </a>
                    <a href="/candidatures" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                      Mes candidatures
                    </a>
                    <a href="/messages" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                      Messages
                    </a>
                    <a href="/parametres" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="mr-3 h-5 w-5 text-gray-500" />
                      Paramètres
                    </a>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <a href="/logout" className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="mr-3 h-5 w-5 text-red-500" />
                      Déconnexion
                    </a>
                  </div>
                </div>
              )}
            </div>
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
                <a
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    link.current
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
                  }`}
                  aria-current={link.current ? 'page' : undefined}
                >
                  {link.name}
                </a>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
                />
              </div>
            </div>

            {/* Raccourcis */}
            <div className="pt-2 pb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                Raccourcis
              </h3>
              <div className="space-y-1">
                <a href="/dashboard" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">
                  <User className="mr-3 h-5 w-5 text-gray-500" />
                  Mon profil
                </a>
                <a href="/candidatures" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">
                  <Bookmark className="mr-3 h-5 w-5 text-gray-500" />
                  Mes candidatures
                </a>
                <a href="/notifications" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">
                  <Bell className="mr-3 h-5 w-5 text-gray-500" />
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </a>
                <a href="/messages" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">
                  <MessageSquare className="mr-3 h-5 w-5 text-gray-500" />
                  Messages
                </a>
                <a href="/parametres" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">
                  <Settings className="mr-3 h-5 w-5 text-gray-500" />
                  Paramètres
                </a>
              </div>
            </div>

            {/* Informations utilisateur mobile */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
                  {userInitials}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userName}</div>
                  <div className="text-sm text-gray-500">{userRole}</div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="/logout"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-500" />
                  Déconnexion
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default FixedNavbar;