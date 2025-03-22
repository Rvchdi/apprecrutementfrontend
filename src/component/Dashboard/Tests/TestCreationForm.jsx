import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, 
  PlusCircle, 
  MinusCircle, 
  Clock, 
  Book, 
  X, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Edit,
  Trash2,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../Authentication/AuthContext';

const TestCreationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pour l'édition d'un test existant
  const { user } = useAuth();
  const isEditMode = Boolean(id);
  
  // États
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [offres, setOffres] = useState([]);
  
  // État principal du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree_minutes: 60,
    offre_id: '',
    questions: [{
      contenu: '',
      reponses: [
        { contenu: '', est_correcte: true },
        { contenu: '', est_correcte: false }
      ]
    }]
  });
  
  // Récupérer les offres de l'entreprise
  useEffect(() => {
    const fetchOffres = async () => {
      try {
        let url = '/api/entreprise/offres';
        if (user?.role === 'admin') {
          url = '/api/admin/offres';
        }
        
        const response = await axios.get(url);
        setOffres(response.data.offres || []);
        
        // Si c'est un nouveau test et qu'il y a des offres, sélectionner la première par défaut
        if (!isEditMode && response.data.offres && response.data.offres.length > 0) {
          setFormData(prev => ({
            ...prev,
            offre_id: response.data.offres[0].id
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des offres:', error);
        setError('Impossible de charger les offres disponibles. Veuillez réessayer.');
      }
    };
    
    fetchOffres();
  }, [user?.role, isEditMode]);
  
  // Charger le test en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchTest = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await axios.get(`/api/tests/${id}`);
          const test = response.data.test;
          
          setFormData({
            titre: test.titre || '',
            description: test.description || '',
            duree_minutes: test.duree_minutes || 60,
            offre_id: test.offre_id || '',
            questions: test.questions ? test.questions.map(q => ({
              id: q.id,
              contenu: q.contenu,
              reponses: q.reponses.map(r => ({
                id: r.id,
                contenu: r.contenu,
                est_correcte: r.est_correcte
              }))
            })) : [{
              contenu: '',
              reponses: [
                { contenu: '', est_correcte: true },
                { contenu: '', est_correcte: false }
              ]
            }]
          });
        } catch (err) {
          console.error('Erreur lors du chargement du test:', err);
          setError('Impossible de charger le test. Veuillez réessayer.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTest();
    }
  }, [id, isEditMode]);
  
  // Gérer les changements dans le formulaire principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duree_minutes' ? parseInt(value, 10) : value
    }));
  };
  
  // Ajouter une nouvelle question
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        contenu: '',
        reponses: [
          { contenu: '', est_correcte: true },
          { contenu: '', est_correcte: false }
        ]
      }]
    }));
  };
  
  // Modifier une question
  const updateQuestion = (index, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      if (field === 'contenu') {
        updatedQuestions[index].contenu = value;
      }
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  // Supprimer une question
  const removeQuestion = (index) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        questions: updatedQuestions.length > 0 ? updatedQuestions : [{
          contenu: '',
          reponses: [
            { contenu: '', est_correcte: true },
            { contenu: '', est_correcte: false }
          ]
        }]
      };
    });
  };
  
  // Ajouter une réponse à une question
  const addReponse = (questionIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[questionIndex].reponses.push({
        contenu: '',
        est_correcte: false
      });
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  // Modifier une réponse
  const updateReponse = (questionIndex, reponseIndex, field, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      
      if (field === 'est_correcte' && value === true) {
        // Si on marque une réponse comme correcte, s'assurer que les autres sont incorrectes
        updatedQuestions[questionIndex].reponses.forEach((rep, idx) => {
          updatedQuestions[questionIndex].reponses[idx].est_correcte = idx === reponseIndex;
        });
      } else {
        updatedQuestions[questionIndex].reponses[reponseIndex][field] = value;
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  // Supprimer une réponse
  const removeReponse = (questionIndex, reponseIndex) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      
      if (updatedQuestions[questionIndex].reponses.length <= 2) {
        return prev; // Garder au moins 2 réponses
      }
      
      // Si on supprime la réponse correcte, marquer la première comme correcte
      const isCorrect = updatedQuestions[questionIndex].reponses[reponseIndex].est_correcte;
      updatedQuestions[questionIndex].reponses.splice(reponseIndex, 1);
      
      if (isCorrect && updatedQuestions[questionIndex].reponses.length > 0) {
        updatedQuestions[questionIndex].reponses[0].est_correcte = true;
      }
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  // Vérifier que le formulaire est valide
  const validateForm = () => {
    if (!formData.titre.trim()) return false;
    if (!formData.description.trim()) return false;
    if (formData.duree_minutes <= 0) return false;
    if (!formData.offre_id) return false;
    
    // Vérifier que chaque question a un contenu et au moins 2 réponses valides
    for (const question of formData.questions) {
      if (!question.contenu.trim()) return false;
      
      if (question.reponses.length < 2) return false;
      
      // Vérifier qu'il y a au moins une réponse correcte
      if (!question.reponses.some(r => r.est_correcte)) return false;
      
      // Vérifier que toutes les réponses ont un contenu
      for (const reponse of question.reponses) {
        if (!reponse.contenu.trim()) return false;
      }
    }
    
    return true;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setSuccess(null);
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await axios.put(`/api/tests/${id}`, formData);
        setSuccess('Test mis à jour avec succès !');
      } else {
        response = await axios.post('/api/tests', formData);
        setSuccess('Test créé avec succès !');
        
        // Réinitialiser le formulaire après création
        setFormData({
          titre: '',
          description: '',
          duree_minutes: 60,
          offre_id: offres.length > 0 ? offres[0].id : '',
          questions: [{
            contenu: '',
            reponses: [
              { contenu: '', est_correcte: true },
              { contenu: '', est_correcte: false }
            ]
          }]
        });
      }
      
      // Rediriger vers la liste des tests après un délai
      setTimeout(() => {
        navigate('/tests');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde.');
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-4xl mx-auto pt-6 px-4">
        {/* En-tête */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Modifier le test' : 'Créer un nouveau test'}
            </h1>
            <p className="text-gray-600 mt-1">
              Créez des tests de compétences pour évaluer vos candidats
            </p>
          </div>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {/* Message de succès */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales du test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Informations générales du test
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Titre du test *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Test de compétences JavaScript"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez l'objectif du test et les compétences évaluées..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Durée (en minutes) *
                </label>
                <div className="relative">
                  <Clock className="h-5 w-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                  <input
                    type="number"
                    name="duree_minutes"
                    value={formData.duree_minutes}
                    onChange={handleChange}
                    min={1}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Offre associée *
                </label>
                <div className="relative">
                  <Briefcase className="h-5 w-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                  <select
                    name="offre_id"
                    value={formData.offre_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                    required
                    disabled={isEditMode} // Ne pas permettre de changer l'offre en mode édition
                  >
                    <option value="">Sélectionnez une offre</option>
                    {offres.map(offre => (
                      <option key={offre.id} value={offre.id}>
                        {offre.titre}
                      </option>
                    ))}
                  </select>
                </div>
                {offres.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Vous devez d'abord créer une offre avant de pouvoir y associer un test.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Section questions et réponses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                Questions et réponses
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center text-teal-600 hover:text-teal-700"
              >
                <PlusCircle size={16} className="mr-1" />
                Ajouter une question
              </button>
            </div>
            
            <div className="space-y-8">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Question {qIndex + 1} *
                      </label>
                      <input
                        type="text"
                        value={question.contenu}
                        onChange={(e) => updateQuestion(qIndex, 'contenu', e.target.value)}
                        placeholder="Saisissez votre question..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      disabled={formData.questions.length <= 1}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  {/* Liste des réponses */}
                  <div className="ml-4 mt-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Réponses (sélectionnez la réponse correcte) *
                    </label>
                    <div className="space-y-3">
                      {question.reponses.map((reponse, rIndex) => (
                        <div key={rIndex} className="flex items-center">
                          <input
                            type="radio"
                            checked={reponse.est_correcte}
                            onChange={() => updateReponse(qIndex, rIndex, 'est_correcte', true)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                            name={`question-${qIndex}-correct`}
                            required
                          />
                          <input
                            type="text"
                            value={reponse.contenu}
                            onChange={(e) => updateReponse(qIndex, rIndex, 'contenu', e.target.value)}
                            placeholder={`Réponse ${rIndex + 1}`}
                            className="ml-2 flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeReponse(qIndex, rIndex)}
                            className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                            disabled={question.reponses.length <= 2}
                          >
                            <MinusCircle size={16} />
                          </button>
                        </div>
                      ))}
                      
                      {/* Bouton pour ajouter une réponse */}
                      <button
                        type="button"
                        onClick={() => addReponse(qIndex)}
                        className="mt-2 flex items-center text-teal-600 hover:text-teal-700 text-sm"
                      >
                        <PlusCircle size={16} className="mr-1" />
                        Ajouter une réponse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/tests')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center"
              disabled={saving || offres.length === 0}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Enregistrer'} le test
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCreationForm;