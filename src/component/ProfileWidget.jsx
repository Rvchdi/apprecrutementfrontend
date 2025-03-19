import React from 'react';
import { Edit, Upload, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileWidget = ({ user, userSkills, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-14 w-14 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carte profil */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-14 w-14 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-semibold">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">{user?.prenom} {user?.nom}</h2>
              <p className="text-gray-500">{user?.etudiant?.niveau_etude} - {user?.etudiant?.filiere}</p>
            </div>
          </div>
          <Link to="/profile/edit" className="text-teal-500 hover:text-teal-600 flex items-center text-sm">
            <Edit size={16} className="mr-1" /> Modifier
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-3">Contact</h3>
            <div className="space-y-2">
              <p className="text-gray-800">{user?.email}</p>
              <p className="text-gray-800">{user?.telephone || 'Téléphone non renseigné'}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm uppercase text-gray-500 font-medium">Compétences</h3>
              <Link to="/skills" className="text-teal-500 hover:text-teal-600 text-xs">
                <Edit size={12} className="inline mr-1" /> Éditer
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {userSkills.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucune compétence ajoutée</p>
              ) : (
                userSkills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700 flex items-center"
                  >
                    {skill.nom}
                    <span className="ml-1 text-xs text-teal-600">
                      ({skill.pivot?.niveau || 'débutant'})
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm uppercase text-gray-500 font-medium">CV et Portfolio</h3>
            <button className="text-teal-500 hover:text-teal-600 text-xs flex items-center">
              <Upload size={12} className="mr-1" /> Mettre à jour
            </button>
          </div>
          <div className="flex gap-4">
            {user?.etudiant?.cv_file ? (
              <a href={`/storage/${user.etudiant.cv_file}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm underline">
                Voir mon CV
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Aucun CV téléchargé</span>
            )}
            
            {user?.etudiant?.portfolio_url ? (
              <a href={user.etudiant.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm underline">
                Voir mon portfolio
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Aucun portfolio renseigné</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Résumé IA */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-800">Résumé généré par IA</h3>
          <button className="text-teal-500 hover:text-teal-600 text-xs flex items-center">
            <Edit size={12} className="mr-1" /> Personnaliser
          </button>
        </div>
        <p className="text-gray-700 text-sm">
          {user?.etudiant?.cv_resume || 
            `${user?.prenom} ${user?.nom} est un(e) étudiant(e) en ${user?.etudiant?.niveau_etude || 'formation supérieure'} 
            ${user?.etudiant?.filiere ? `dans le domaine ${user?.etudiant?.filiere}` : ''}.
            ${userSkills.length > 0 ? `Ses compétences incluent ${userSkills.map(s => s.nom).join(', ')}.` : ''}
            ${user?.etudiant?.disponibilite ? `Disponibilité: ${user?.etudiant?.disponibilite}.` : ''}`
          }
        </p>
        <div className="mt-4 flex items-center">
          <CheckCircle size={16} className="text-green-500 mr-2" />
          <span className="text-sm text-gray-600">Résumé optimisé pour le recrutement</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileWidget;