import React, { useState } from 'react';
import { User, MapPin, Calendar, Book, Briefcase, Phone, Mail, Link, Edit, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ProfileWidget = ({ userData, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Fonction pour déterminer le niveau de complétion du profil
  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    
    let totalFields = 0;
    let completedFields = 0;
    const fieldsToCheck = [];
    
    if (userData.role === 'etudiant') {
      const etudiant = userData.etudiant || {};
      
      fieldsToCheck.push(
        userData.nom,
        userData.prenom,
        userData.email,
        userData.telephone,
        etudiant.date_naissance,
        etudiant.niveau_etude,
        etudiant.filiere,
        etudiant.ecole,
        etudiant.disponibilite,
        etudiant.cv_file
      );
    } else if (userData.role === 'entreprise') {
      const entreprise = userData.entreprise || {};
      
      fieldsToCheck.push(
        userData.nom,
        userData.prenom,
        userData.email,
        userData.telephone,
        entreprise.nom_entreprise,
        entreprise.description,
        entreprise.secteur_activite,
        entreprise.site_web,
        entreprise.adresse,
        entreprise.ville
      );
    }
    
    totalFields = fieldsToCheck.length;
    completedFields = fieldsToCheck.filter(field => field && field.toString().trim() !== '').length;
    
    return Math.round((completedFields / totalFields) * 100);
  };
  
  // Afficher un placeholder pendant le chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Si aucune donnée n'est disponible
  if (!userData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600 mb-2">Aucune information disponible</p>
        <p className="text-gray-500 text-sm">
          Impossible de charger les données de votre profil.
        </p>
      </div>
    );
  }
  
  // Calculer la complétion du profil
  const completionPercentage = calculateProfileCompletion();
  const isEtudiant = userData.role === 'etudiant';
  const isEntreprise = userData.role === 'entreprise';
  const profileData = isEtudiant ? userData.etudiant : userData.entreprise;
  
  // Formatage de la date de naissance (pour les étudiants)
  const formatDate = (dateString) => {
    if (!dateString) return 'Non renseigné';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Mapping pour les disponibilités (pour les étudiants)
  const disponibiliteLabel = {
    'immédiate': 'Immédiate',
    '1_mois': 'Dans un mois',
    '3_mois': 'Dans trois mois',
    '6_mois': 'Dans six mois'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* En-tête du profil avec les infos principales */}
      <div className="p-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-16 w-16 bg-teal-500 text-white rounded-lg flex items-center justify-center text-xl font-bold mr-4">
              {isEtudiant 
                ? `${userData.prenom?.[0] || ''}${userData.nom?.[0] || ''}` 
                : (userData.entreprise?.nom_entreprise?.[0] || 'E')}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {isEtudiant 
                  ? `${userData.prenom || ''} ${userData.nom || ''}` 
                  : (userData.entreprise?.nom_entreprise || 'Entreprise')}
              </h2>
              <p className="text-gray-600">
                {isEtudiant 
                  ? (userData.etudiant?.filiere || 'Étudiant') 
                  : (userData.entreprise?.secteur_activite || 'Entreprise')}
              </p>
            </div>
          </div>
          
          <div className="md:ml-auto">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Modifier le profil
            </button>
          </div>
        </div>
      </div>
      
      {/* Barre de progression de complétion du profil */}
      <div className="px-6 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Profil complété à {completionPercentage}%</span>
          <span className="text-sm font-medium text-teal-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              completionPercentage < 30 ? 'bg-red-500' :
              completionPercentage < 70 ? 'bg-yellow-500' :
              'bg-teal-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Informations de contact communes */}
      <div className="px-6 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Informations de contact</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <Mail size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-800">{userData.email || 'Non renseigné'}</p>
              <p className="text-xs text-gray-500">Email</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-800">{userData.telephone || 'Non renseigné'}</p>
              <p className="text-xs text-gray-500">Téléphone</p>
            </div>
          </div>
          {isEntreprise && profileData?.site_web && (
            <div className="flex items-start">
              <Link size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <a href={profileData.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {profileData.site_web}
                </a>
                <p className="text-xs text-gray-500">Site web</p>
              </div>
            </div>
          )}
          {(isEntreprise && profileData?.ville) || (isEtudiant && profileData?.ville) ? (
            <div className="flex items-start">
              <MapPin size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">
                  {isEntreprise 
                    ? `${profileData?.ville || ''} ${profileData?.code_postal || ''}` 
                    : `${profileData?.ville || ''} ${profileData?.code_postal || ''}`}
                </p>
                <p className="text-xs text-gray-500">Localisation</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Informations spécifiques à l'étudiant */}
      {isEtudiant && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Informations académiques</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Calendar size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{formatDate(profileData?.date_naissance)}</p>
                <p className="text-xs text-gray-500">Date de naissance</p>
              </div>
            </div>
            <div className="flex items-start">
              <Book size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{profileData?.niveau_etude || 'Non renseigné'}</p>
                <p className="text-xs text-gray-500">Niveau d'études</p>
              </div>
            </div>
            <div className="flex items-start">
              <Briefcase size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{profileData?.ecole || 'Non renseigné'}</p>
                <p className="text-xs text-gray-500">École/Université</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{disponibiliteLabel[profileData?.disponibilite] || 'Non renseigné'}</p>
                <p className="text-xs text-gray-500">Disponibilité</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Informations spécifiques à l'entreprise */}
      {isEntreprise && (
        <div className="px-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Informations entreprise</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Briefcase size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{profileData?.secteur_activite || 'Non renseigné'}</p>
                <p className="text-xs text-gray-500">Secteur d'activité</p>
              </div>
            </div>
            <div className="flex items-start">
              <User size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-gray-800">{profileData?.taille || 'Non renseigné'}</p>
                <p className="text-xs text-gray-500">Taille de l'entreprise</p>
              </div>
            </div>
            {profileData?.description && (
              <div className="mt-2">
                <p className="text-sm text-gray-800 line-clamp-3">{profileData.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bouton pour compléter le profil si moins de 100% */}
      {completionPercentage < 100 && (
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Complétez votre profil pour améliorer vos chances
              </p>
              <p className="text-xs text-gray-500">
                {isEtudiant 
                  ? 'Un profil complet augmente vos chances d\'être remarqué par les recruteurs' 
                  : 'Un profil complet attire davantage de candidats qualifiés'}
              </p>
            </div>
            <button className="text-teal-600 hover:text-teal-700">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Message de confirmation si profil complet */}
      {completionPercentage === 100 && (
        <div className="bg-green-50 px-6 py-4">
          <div className="flex items-center">
            <CheckCircle size={18} className="text-green-500 mr-2" />
            <p className="text-sm text-green-700">
              Votre profil est complet ! Vous avez optimisé vos chances de succès.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileWidget;