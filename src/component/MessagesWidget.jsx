import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessagesWidget = ({ messages, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-6 flex justify-center items-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-14 w-14 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si nous avons des messages, on pourrait les afficher ici
  // Pour l'instant, nous affichons toujours l'état vide
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Messagerie</h3>
        <Link 
          to="/messages"
          className="text-teal-500 hover:text-teal-600 text-sm"
        >
          Voir tous les messages
        </Link>
      </div>
      
      <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
        <MessageSquare size={40} className="text-gray-300 mb-3" />
        <p className="mb-4">Vos conversations s'afficheront ici</p>
        <Link 
          to="/messages"
          className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Accéder à la messagerie
        </Link>
      </div>
    </div>
  );
};

export default MessagesWidget;