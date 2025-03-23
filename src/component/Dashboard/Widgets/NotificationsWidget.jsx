import React, { useState } from 'react';
import { Bell, Clock, CheckCircle, Eye, Briefcase, FileText, MessageSquare, AlertCircle, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const NotificationsWidget = ({ notifications = [], loading, onMarkAsRead }) => {
  const [expandedNotification, setExpandedNotification] = useState(null);

  // Fonction pour formater la date relative
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

  // Obtenir l'icône appropriée en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'candidature':
        return <FileText size={18} className="text-blue-500" />;
      case 'entretien':
        return <Briefcase size={18} className="text-purple-500" />;
      case 'test':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'message':
        return <MessageSquare size={18} className="text-teal-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation(); // Empêcher la propagation vers le parent (expansion)
    
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      if (onMarkAsRead) onMarkAsRead(id);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Afficher un message si aucune notification n'est disponible
  if (!loading && (!notifications || notifications.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Bell size={18} className="text-teal-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
        </div>
        
        <div className="text-center py-8">
          <Bell size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-600 mb-2">Aucune notification</p>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas de nouvelles notifications pour le moment.
          </p>
        </div>
      </div>
    );
  }

  // Afficher un placeholder pendant le chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Bell size={18} className="text-teal-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Bell size={18} className="text-teal-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
        </div>
        <Link to="/notifications" className="text-teal-500 hover:text-teal-600 text-sm">
          Voir toutes
        </Link>
      </div>
      
      <div className="space-y-3">
        {notifications.slice(0, 5).map((notification) => (
          <div 
            key={notification.id} 
            className={`border border-gray-100 rounded-lg ${notification.lu ? 'bg-white' : 'bg-blue-50'} overflow-hidden`}
          >
            <div 
              className="p-3 cursor-pointer"
              onClick={() => setExpandedNotification(expandedNotification === notification.id ? null : notification.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">
                      {notification.titre}
                    </h3>
                    <p className={`text-sm ${expandedNotification === notification.id ? '' : 'line-clamp-1'} text-gray-600 mt-1`}>
                      {notification.contenu}
                    </p>
                  </div>
                </div>
                <div className="flex items-center ml-2">
                  {!notification.lu && (
                    <button 
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="p-1 hover:bg-gray-100 rounded-full mr-1"
                      title="Marquer comme lu"
                    >
                      <Eye size={16} className="text-gray-500" />
                    </button>
                  )}
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatRelativeTime(notification.created_at)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions et détails supplémentaires (visibles uniquement si déplié) */}
            {expandedNotification === notification.id && notification.lien && (
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {notification.lu ? 'Lu' : 'Non lu'}
                </span>
                
                <Link 
                  to={notification.lien}
                  className="px-3 py-1 bg-teal-500 text-white rounded-lg text-xs flex items-center hover:bg-teal-600"
                >
                  Voir les détails
                  <ChevronRight size={14} className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {notifications.length > 5 && (
        <div className="text-center mt-4">
          <Link 
            to="/notifications" 
            className="text-sm text-teal-600 hover:text-teal-700"
          >
            Voir les {notifications.length - 5} autres notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;