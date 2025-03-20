import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Eye,
  Clock,
  Calendar,
  MessageSquare,
  Briefcase,
  Users,
  X,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from './Authentication/AuthContext';

const NotificationsCenter = () => {
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  
  // Types de notifications possibles pour le filtrage
  const notificationTypes = [
    { value: 'all', label: 'Toutes', icon: Bell },
    { value: 'candidature', label: 'Candidatures', icon: Briefcase },
    { value: 'entretien', label: 'Entretiens', icon: Calendar },
    { value: 'message', label: 'Messages', icon: MessageSquare },
    { value: 'systeme', label: 'Système', icon: Check }
  ];
  
  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setError('Une erreur est survenue lors du chargement des notifications.');
      setLoading(false);
    }
  };
  
  // Charger les notifications au chargement du composant
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Filtrer les notifications selon le type actif
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(notif => notif.type === activeFilter);
  
  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => {
        if (notif.id === id) {
          return { ...notif, lu: true };
        }
        return notif;
      }));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      setError('Une erreur est survenue lors du marquage de la notification.');
    }
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => ({ ...notif, lu: true })));
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      setError('Une erreur est survenue lors du marquage des notifications.');
    }
  };
  
  // Supprimer une notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      
      // Mettre à jour l'état local
      setNotifications(notifications.filter(notif => notif.id !== id));
      
      // Mettre à jour les sélections
      setSelectedNotifications(selectedNotifications.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      setError('Une erreur est survenue lors de la suppression de la notification.');
    }
  };
  
  // Supprimer plusieurs notifications
  const deleteSelected = async () => {
    try {
      await axios.delete('/api/notifications/bulk', {
        data: { ids: selectedNotifications }
      });
      
      // Mettre à jour l'état local
      setNotifications(notifications.filter(notif => !selectedNotifications.includes(notif.id)));
      
      // Réinitialiser les sélections
      setSelectedNotifications([]);
      setAllSelected(false);
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
      setError('Une erreur est survenue lors de la suppression des notifications.');
    }
  };
  
  // Gérer la sélection d'une notification
  const toggleSelect = (id) => {
    setSelectedNotifications(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Sélectionner ou désélectionner toutes les notifications filtrées
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedNotifications([]);
      setAllSelected(false);
    } else {
      setSelectedNotifications(filteredNotifications.map(notif => notif.id));
      setAllSelected(true);
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
  
  // Récupérer l'icône selon le type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'candidature':
        return <Briefcase size={16} className="text-blue-500" />;
      case 'entretien':
        return <Calendar size={16} className="text-purple-500" />;
      case 'message':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'systeme':
        return <Check size={16} className="text-gray-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[500px]">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <Bell size={18} className="mr-2" />
            Centre de notifications
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Restez informé des activités concernant votre profil et vos candidatures
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          {notifications.some(notif => !notif.lu) && (
            <button
              onClick={markAllAsRead}
              className="text-teal-500 hover:text-teal-600 text-sm flex items-center"
            >
              <CheckCheck size={16} className="mr-1" />
              Tout marquer comme lu
            </button>
          )}
          
          {selectedNotifications.length > 0 && (
            <button
              onClick={deleteSelected}
              className="text-red-500 hover:text-red-600 text-sm flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Supprimer sélection
            </button>
          )}
          
          <button
            onClick={fetchNotifications}
            className="text-gray-500 hover:text-gray-600 text-sm flex items-center"
          >
            <RefreshCw size={16} className="mr-1" />
            Actualiser
          </button>
        </div>
      </div>
      
      {/* Filtres par type */}
      <div className="p-4 flex overflow-x-auto space-x-2 border-b border-gray-100">
        {notificationTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setActiveFilter(type.value)}
            className={`px-3 py-1 rounded-full text-sm flex items-center whitespace-nowrap ${
              activeFilter === type.value
                ? 'bg-teal-50 text-teal-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <type.icon size={14} className="mr-1" />
            {type.label}
          </button>
        ))}
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Chargement */}
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* Sélection et actions */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-b border-gray-100 flex items-center bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {selectedNotifications.length > 0
                    ? `${selectedNotifications.length} sélectionné${selectedNotifications.length > 1 ? 's' : ''}`
                    : 'Sélectionner tout'
                  }
                </span>
              </div>
            </div>
          )}
          
          {/* Liste des notifications */}
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune notification</h3>
              <p className="text-gray-500">
                {activeFilter === 'all'
                  ? 'Vous n\'avez pas encore reçu de notifications.'
                  : 'Vous n\'avez pas de notifications dans cette catégorie.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex hover:bg-gray-50 ${!notification.lu ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                >
                  <div className="flex items-start pr-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelect(notification.id)}
                      className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 rounded"
                    />
                  </div>
                  
                  <div className="flex-shrink-0 pt-1 pr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <h4 className="font-medium text-gray-800">{notification.titre}</h4>
                      <div className="flex items-center mt-1 sm:mt-0 sm:ml-4">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-1 text-sm">{notification.contenu}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!notification.lu && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
                        >
                          <Check size={12} className="mr-1" />
                          Marquer comme lu
                        </button>
                      )}
                      
                      {notification.lien && (
                        <Link
                          to={notification.lien}
                          className="text-xs text-teal-500 hover:text-teal-600 flex items-center"
                        >
                          <Eye size={12} className="mr-1" />
                          Voir détails
                        </Link>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center"
                      >
                        <Trash2 size={12} className="mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination - À implémenter si nécessaire */}
        </>
      )}
    </div>
  );
};

export default NotificationsCenter;