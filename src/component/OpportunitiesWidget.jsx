import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const OpportunitiesWidget = ({ offres, loading }) => {
  // Données statiques des compétences en demande - à remplacer par des données dynamiques
  const inDemandSkills = [
    { name: 'React', percentage: 87, width: '87%' },
    { name: 'JavaScript', percentage: 78, width: '78%' },
    { name: 'Laravel', percentage: 65, width: '65%' },
    { name: 'UX/UI Design', percentage: 72, width: '72%' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-14 bg-gray-200 rounded"></div>
              <div className="h-14 bg-gray-200 rounded"></div>
              <div className="h-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">Opportunités recommandées</h3>
          <Link 
            to="/offres"
            className="text-teal-500 hover:text-teal-600 text-sm"
          >
            Voir toutes les offres
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {offres.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune opportunité disponible pour le moment.
            </div>
          ) : (
            offres.map(offre => (
              <div key={offre.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-800">{offre.titre}</h4>
                  <p className="text-sm text-gray-500">{offre.entreprise?.nom_entreprise}</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full flex items-center mr-3">
                    <Star size={12} className="mr-1 fill-current" /> Recommandé
                  </span>
                  <Link 
                    to={`/offres/${offre.id}`}
                    className="bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600"
                  >
                    Postuler
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Compétences recherchées */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium text-gray-800 mb-3">Compétences en demande</h3>
        <div className="space-y-3">
          {inDemandSkills.map((skill, index) => (
            <div key={index}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-700">{skill.name}</span>
                <span className="text-teal-600 font-medium">{skill.percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-teal-500 h-1.5 rounded-full" 
                  style={{ width: skill.width }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesWidget;