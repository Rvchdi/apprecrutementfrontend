import React from 'react';
import { Clock, Calendar, Play, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TestsWidget = ({ tests, loading }) => {
  // Formater la date relative
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "Aujourd'hui";
    if (diffDays <= 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    
    // Formater la date complète
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Tests à passer</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <BookOpen size={18} className="text-teal-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-800">Tests à passer</h2>
      </div>
      
      {tests.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucun test à passer</p>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas de tests en attente pour vos candidatures.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div 
              key={test.id} 
              className="p-4 border border-amber-200 rounded-lg bg-amber-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{test.titre}</h3>
                  <p className="text-sm text-gray-600">
                    {test.entreprise} • {test.offre_titre}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    <span>Candidature du {formatRelativeTime(test.date_candidature)}</span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>Durée: {test.duree_minutes} minutes</span>
                  </div>
                </div>
                <Link 
                  to={`/tests/${test.id}/candidatures/${test.candidature_id}`}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs flex items-center"
                >
                  <Play size={12} className="mr-1" />
                  Commencer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestsWidget;