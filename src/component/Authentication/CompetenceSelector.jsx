import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X, Plus, CheckCircle } from 'lucide-react';

const CompetenceSelector = ({ 
  selectedCompetences, 
  onCompetencesChange,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCompetences, setAvailableCompetences] = useState([]);
  const [filteredCompetences, setFilteredCompetences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCompetence, setNewCompetence] = useState('');

  // Charger les compétences disponibles
  useEffect(() => {
    const fetchCompetences = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/competences');
        const competences = response.data.competences || [];
        setAvailableCompetences(competences);
        setFilteredCompetences(competences);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
      setLoading(false);
    };

    fetchCompetences();
  }, []);

  // Filtrer les compétences en fonction de la recherche
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCompetences(availableCompetences);
    } else {
      const filtered = availableCompetences.filter(comp => 
        comp.nom.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompetences(filtered);
    }
  }, [searchQuery, availableCompetences]);

  // Ajouter une compétence
  const handleAddCompetence = (competence) => {
    if (!selectedCompetences.some(c => c.id === competence.id)) {
      onCompetencesChange([...selectedCompetences, { 
        id: competence.id, 
        nom: competence.nom,
        niveau: 'débutant' // Niveau par défaut
      }]);
    }
  };

  // Supprimer une compétence
  const handleRemoveCompetence = (competenceId) => {
    onCompetencesChange(selectedCompetences.filter(c => c.id !== competenceId));
  };

  // Créer une nouvelle compétence
  const handleCreateCompetence = async () => {
    if (!newCompetence.trim()) return;

    try {
      const response = await axios.post('/api/competences', { 
        nom: newCompetence.trim(),
        categorie: 'personnelle' // Catégorie par défaut pour les compétences ajoutées par l'utilisateur
      });

      const newCompetenceData = response.data.competence;
      
      // Ajouter la nouvelle compétence aux compétences sélectionnées
      onCompetencesChange([...selectedCompetences, { 
        id: newCompetenceData.id, 
        nom: newCompetenceData.nom,
        niveau: 'débutant'
      }]);

      // Réinitialiser le champ de nouvelle compétence
      setNewCompetence('');
      
      // Mettre à jour la liste des compétences disponibles
      setAvailableCompetences([...availableCompetences, newCompetenceData]);
    } catch (error) {
      console.error('Erreur lors de la création de la compétence:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Titre et bouton de fermeture */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Sélectionnez vos compétences</h2>
          <button 
           onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Recherche et ajout de compétences */}
        <div className="p-6 pt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Ajout de nouvelle compétence */}
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Ajouter une nouvelle compétence"
              value={newCompetence}
              onChange={(e) => setNewCompetence(e.target.value)}
              className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleCreateCompetence}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Liste des compétences */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-500 py-4">Chargement...</div>
            ) : filteredCompetences.length === 0 ? (
              <div className="text-center text-gray-500 py-4">Aucune compétence trouvée</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredCompetences.map(competence => (
                  <div 
                    key={competence.id} 
                    className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                      selectedCompetences.some(c => c.id === competence.id) 
                        ? 'bg-teal-50 border border-teal-300' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-800">{competence.nom}</span>
                      {competence.categorie && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {competence.categorie}
                        </span>
                      )}
                    </div>
                    <div>
                      {selectedCompetences.some(c => c.id === competence.id) ? (
                        <button 
                          onClick={() => handleRemoveCompetence(competence.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAddCompetence(competence)}
                          className="text-teal-500 hover:text-teal-700"
                        >
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Compétences sélectionnées */}
        <div className="p-6 pt-0">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Compétences sélectionnées</h3>
          {selectedCompetences.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune compétence sélectionnée</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedCompetences.map(competence => (
                <div 
                  key={competence.id} 
                  className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center"
                >
                  {competence.nom}
                  <button 
                    onClick={() => handleRemoveCompetence(competence.id)}
                    className="ml-2 text-teal-500 hover:text-teal-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de confirmation */}
        <div className="p-6 pt-0 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center"
          >
            <CheckCircle size={16} className="mr-2" />
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetenceSelector;