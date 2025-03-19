import React from 'react';
import { Link } from 'react-router-dom';

const TestsWidget = ({ tests, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-36"></div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">Tests techniques</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {tests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Vous n'avez pas encore de tests à compléter.
          </div>
        ) : (
          tests.map(test => (
            <div key={test.candidature_id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">{test.test.titre}</h4>
                <p className="text-sm text-gray-500">{test.entreprise.nom} • {test.test.duree_minutes} min</p>
              </div>
              <div className="flex items-center">
                {test.completed ? (
                  <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full mr-3">
                    Complété - {test.score}%
                  </span>
                ) : (
                  <span className="bg-yellow-50 text-yellow-600 px-2 py-1 text-xs rounded-full mr-3">
                    En attente
                  </span>
                )}
                
                {test.completed ? (
                  <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50">
                    Voir résultats
                  </button>
                ) : (
                  <Link 
                    to={`/tests/${test.test.id}/candidatures/${test.candidature_id}`}
                    className="bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600"
                  >
                    Commencer
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestsWidget;