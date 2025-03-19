import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Search,
  ChevronDown,
  Tag,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const StudentSkills = () => {
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('débutant');
  const [editingSkill, setEditingSkill] = useState(null);
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Niveaux de compétence
  const skillLevels = [
    { value: 'débutant', label: 'Débutant', color: 'bg-blue-100 text-blue-800' },
    { value: 'intermédiaire', label: 'Intermédiaire', color: 'bg-green-100 text-green-800' },
    { value: 'avancé', label: 'Avancé', color: 'bg-purple-100 text-purple-800' },
    { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
  ];

  // Charger les compétences de l'utilisateur et les compétences disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les compétences de l'étudiant
        const userSkillsResponse = await axios.get('/api/etudiant/competences');
        setSkills(userSkillsResponse.data.competences || []);
        
        // Récupérer toutes les compétences disponibles dans le système
        const allSkillsResponse = await axios.get('/api/competences');
        setAllSkills(allSkillsResponse.data.competences || []);
        
        // Récupérer les compétences recommandées basées sur le profil
        const recommendedResponse = await axios.get('/api/etudiant/competences/recommandees');
        setRecommendedSkills(recommendedResponse.data.competences || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
        setError('Une erreur est survenue lors du chargement des compétences.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrer les compétences disponibles en fonction de la recherche
  const filteredSkills = allSkills.filter(skill => 
    skill.nom.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !skills.some(userSkill => userSkill.id === skill.id)
  );

  // Ajouter une compétence
  const addSkill = async () => {
    if (!selectedSkill) return;
    
    try {
      const response = await axios.post('/api/etudiant/competences', {
        competence_id: selectedSkill.id,
        niveau: selectedLevel
      });
      
      // Mettre à jour la liste des compétences
      setSkills([...skills, {...selectedSkill, niveau: selectedLevel, pivot: { niveau: selectedLevel }}]);
      
      // Réinitialiser le formulaire
      setSelectedSkill(null);
      setSelectedLevel('débutant');
      setIsAddingSkill(false);
      setSearchQuery('');
      setShowDropdown(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la compétence:', error);
      setError('Une erreur est survenue lors de l\'ajout de la compétence.');
    }
  };

  // Mettre à jour une compétence
  const updateSkill = async (skillId, newLevel) => {
    try {
      await axios.put(`/api/etudiant/competences/${skillId}`, {
        niveau: newLevel
      });
      
      // Mettre à jour la liste des compétences
      setSkills(skills.map(skill => {
        if (skill.id === skillId) {
          return { ...skill, niveau: newLevel, pivot: { ...skill.pivot, niveau: newLevel } };
        }
        return skill;
      }));
      
      // Fermer l'édition
      setEditingSkill(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la compétence:', error);
      setError('Une erreur est survenue lors de la mise à jour de la compétence.');
    }
  };

  // Supprimer une compétence
  const removeSkill = async (skillId) => {
    try {
      await axios.delete(`/api/etudiant/competences/${skillId}`);
      
      // Mettre à jour la liste des compétences
      setSkills(skills.filter(skill => skill.id !== skillId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error);
      setError('Une erreur est survenue lors de la suppression de la compétence.');
    }
  };
  
  // Récupérer la couleur associée au niveau
  const getLevelColor = (level) => {
    const levelObj = skillLevels.find(l => l.value === level);
    return levelObj ? levelObj.color : 'bg-gray-100 text-gray-800';
  };
  
  // Ajouter une compétence recommandée
  const addRecommendedSkill = async (skill) => {
    try {
      const response = await axios.post('/api/etudiant/competences', {
        competence_id: skill.id,
        niveau: 'débutant'
      });
      
      // Mettre à jour la liste des compétences
      setSkills([...skills, {...skill, niveau: 'débutant', pivot: { niveau: 'débutant' }}]);
      
      // Mettre à jour les recommandations
      setRecommendedSkills(recommendedSkills.filter(rec => rec.id !== skill.id));
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la compétence recommandée:', error);
      setError('Une erreur est survenue lors de l\'ajout de la compétence.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Mes compétences</h2>
        <p className="text-gray-500 text-sm mt-1">
          Gérez vos compétences pour améliorer votre visibilité auprès des recruteurs
        </p>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="mx-6 my-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
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
        <div className="p-6">
          {/* Liste des compétences */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-700 font-medium">Compétences actuelles</h3>
              <button
                onClick={() => setIsAddingSkill(!isAddingSkill)}
                className="text-teal-500 hover:text-teal-600 text-sm flex items-center"
              >
                {isAddingSkill ? (
                  <>
                    <X size={16} className="mr-1" />
                    Annuler
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-1" />
                    Ajouter une compétence
                  </>
                )}
              </button>
            </div>
            
            {skills.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Tag size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Vous n'avez pas encore ajouté de compétences</p>
                <p className="text-gray-500 text-sm">
                  Les compétences vous permettent de mettre en valeur votre profil auprès des recruteurs
                </p>
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Ajouter ma première compétence
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map(skill => (
                  <div 
                    key={skill.id} 
                    className="border border-gray-200 rounded-lg p-3 flex items-center justify-between group hover:border-gray-300 transition-all"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{skill.nom}</div>
                      {editingSkill === skill.id ? (
                        <div className="mt-2">
                          <select
                            value={skill.niveau}
                            onChange={(e) => updateSkill(skill.id, e.target.value)}
                            className="block w-full border border-gray-300 rounded-md text-sm p-1"
                          >
                            {skillLevels.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex mt-2 space-x-2">
                            <button
                              onClick={() => setEditingSkill(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => updateSkill(skill.id, skill.niveau)}
                              className="text-xs text-teal-500 hover:text-teal-700 flex items-center"
                            >
                              <Check size={12} className="mr-1" />
                              Confirmer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 mt-1 inline-block rounded-full ${getLevelColor(skill.niveau || skill.pivot?.niveau)}`}>
                          {skillLevels.find(l => l.value === (skill.niveau || skill.pivot?.niveau))?.label || 'Débutant'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingSkill(skill.id)}
                        className="p-1 text-gray-500 hover:text-teal-500 hover:bg-gray-100 rounded"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="p-1 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Formulaire d'ajout de compétence */}
            {isAddingSkill && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Ajouter une nouvelle compétence</h4>
                
                <div className="mb-3 relative">
                  <label className="block text-xs text-gray-600 mb-1">Compétence</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher une compétence..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onClick={() => setShowDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search size={16} />
                    </div>
                  </div>
                  
                  {/* Dropdown de sélection */}
                  {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkills.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          Aucune compétence trouvée
                        </div>
                      ) : (
                        <div>
                          {filteredSkills.map(skill => (
                            <div
                              key={skill.id}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setSelectedSkill(skill);
                                setSearchQuery(skill.nom);
                                setShowDropdown(false);
                              }}
                            >
                              <div className="font-medium text-sm text-gray-800">{skill.nom}</div>
                              {skill.categorie && (
                                <div className="text-xs text-gray-500">{skill.categorie}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs text-gray-600 mb-1">Niveau</label>
                  <div className="flex flex-wrap gap-2">
                    {skillLevels.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSelectedLevel(level.value)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          selectedLevel === level.value 
                            ? level.color 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={addSkill}
                    disabled={!selectedSkill}
                    className={`px-4 py-2 rounded-lg text-white ${
                      selectedSkill ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Compétences recommandées */}
          {recommendedSkills.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <BookOpen size={18} className="text-amber-500 mr-2" />
                <h3 className="text-gray-700 font-medium">Compétences recommandées</h3>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <p className="text-amber-800 text-sm mb-3">
                  Basé sur votre profil et le marché actuel, nous vous recommandons d'ajouter ces compétences :
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {recommendedSkills.map(skill => (
                    <div 
                      key={skill.id}
                      className="flex items-center bg-white border border-amber-200 rounded-full px-3 py-1 text-sm"
                    >
                      <span className="text-gray-800">{skill.nom}</span>
                      <button
                        onClick={() => addRecommendedSkill(skill)}
                        className="ml-2 text-amber-500 hover:text-amber-700"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSkills;