import React from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessagesWidget = ({ messages, loading }) => {
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
      return `Il y a ${diffMin} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Variables pour les données de démonstration (si aucun message n'est fourni)
  const demoMessages = [
    {
      id: 1,
      sender: { name: 'Tech Innovations', initials: 'TI', isCompany: true },
      content: 'Bonjour, suite à votre candidature, nous aimerions vous inviter à un entretien...',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      unread: true
    },
    {
      id: 2,
      sender: { name: 'Digital Solutions', initials: 'DS', isCompany: true },
      content: 'N\'oubliez pas de compléter le test technique pour votre candidature...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      unread: false
    }
  ];

  // Utiliser les messages fournis ou les démos
  const displayMessages = messages && messages.length > 0 ? messages : demoMessages;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Messages récents</h2>
        <div className="animate-pulse space-y-4">
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
          <MessageSquare size={18} className="text-teal-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Messages récents</h2>
        </div>
        <Link to="/messages" className="text-teal-500 hover:text-teal-600 text-sm">
          Voir tous
        </Link>
      </div>
      
      {displayMessages.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucun message</p>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas encore de conversations.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayMessages.map((message) => (
            <Link 
              key={message.id} 
              to={`/messages/${message.conversationId || message.id}`}
              className={`block py-3 hover:bg-gray-50 transition-colors ${message.unread ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full ${message.sender.isCompany ? 'bg-blue-500' : 'bg-teal-500'} text-white flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0`}>
                  {message.sender.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800 truncate">{message.sender.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatRelativeTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {message.content}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesWidget;