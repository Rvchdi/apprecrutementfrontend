import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Tag, 
  Save, 
  Plus,
  Minus,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Book,
  Info,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from './Authentication/AuthContext';

const CreateOffreForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pour l'édition d'une offre existante
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableCompetences, setAvailableCompetences] = useState([]);
  
  // État du formulaire principal
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'stage', // stage, emploi, alternance
    niveau_requis: '',
    localisation: '',
    remuneration: '',
    date_debut: '',
    duree: '',
    competences_requises: [],
    test_requis: false,
    statut: 'active'
  });
  
  // État pour le test (si test_requis est true)
  const [testData, setTestData] = useState({
    titre: '',
    description: '',
    duree_minutes: 30,
    questions: [{
      contenu: '',
      reponses: [
        { contenu: '', est_correcte: true },
        { contenu: '', est_correcte: false }
      ]
    }]
  });
  
  // Charger les données en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchOffreData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/offres/${id}`);
          const offre = response.data.offre;
          
          // Remplir les données de l'offre
          setFormData({
            titre: offre.titre || '',
            description: offre.description || '',
            type: offre.type || 'stage',
            niveau_requis: offre.niveau_requis || '',
            localisation: offre.localisation || '',
            remuneration: offre.remuneration || '',
            date_debut: offre.date_debut ? new Date(offre.date_debut).toISOString().split('T')[0] : '',
            duree: offre.duree || '',
            competences_requises: offre.competences ? offre.competences.map(c => c.id) : [],
            test_requis: offre.test_requis || false,
            statut: offre.statut || 'active'
          });
          
          // Si un test est associé à l'offre, le charger
          if (offre.test) {
            setTestData({
              titre: offre.test.titre || '',
              description: offre.test.description || '',
              duree_minutes: offre.test.duree_minutes || 30,
              questions: offre.test.questions ? offre.test.questions.map(q => ({
                contenu: q.contenu || '',
                reponses: q.reponses ? q.reponses.map(r => ({
                  contenu: r.contenu || '',
                  est_correcte: r.est_correcte || false
                })) : [
                  { contenu: '', est_correcte: true },
                  { contenu: '', est_correcte: false }
                ]
              })) : [{
                contenu: '',
                reponses: [
                  { contenu: '', est_correcte: true },
                  { contenu: '', est_correcte: false }
                ]
              }]
            });
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'offre:', error);
          setError('Impossible de charger les données de l\'offre.');
          setLoading(false);
        }
      };
      
      fetchOffreData();
    }
  }, [id, isEditMode]);
  
  // Charger les compétences disponibles
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        const response = await axios.get('/api/competences');
        setAvailableCompetences(response.data.competences || []);
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
    };
    
    fetchCompetences();
  }, []);
  
  // Mettre à jour les données du formulaire principal
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Si test_requis passe à false, réinitialiser éventuellement les données du test
    if (name === 'test_requis' && !checked) {
      setTestData({
        titre: '',
        description: '',
        duree_minutes: 30,
        questions: [{
          contenu: '',
          reponses: [
            { contenu: '', est_correcte: true },
            { contenu: '', est_correcte: false }
          ]
        }]
      });
    } else if (name === 'test_requis' && checked) {
      // Pré-remplir le titre du test
      setTestData(prev => ({
        ...prev,
        titre: `Test pour ${formData.titre}`,
        description: `Test de compétences pour l'offre ${formData.titre}`
      }));
    }
  };
  
  // Gérer les compétences multiple select
  const handleCompetenceChange = (competenceId) => {
    setFormData(prev => {
      const currentCompetences = [...prev.competences_requises];
      
      if (currentCompetences.includes(competenceId)) {
        return {
          ...prev,
          competences_requises: currentCompetences.filter(id => id !== competenceId)
        };
      } else {
        return {
          ...prev,
          competences_requises: [...currentCompetences, competenceId]
        };
      }
    });
  };
  
  // Mettre à jour les données du test
  const handleTestChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Ajouter une question au test
  const addQuestion = () => {
    setTestData(prev => ({
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
  
  // Mettre à jour une question
  const updateQuestion = (index, field, value) => {
    setTestData(prev => {
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
    setTestData(prev => {
      if (prev.questions.length <= 1) {
        return prev;
      }
      
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(index, 1);
      return {
        ...prev,
        questions: updatedQuestions
      };
    });
  };
  
  // Ajouter une réponse à une question
  const addReponse = (questionIndex) => {
    setTestData(prev => {
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
  
  // Mettre à jour une réponse
  const updateReponse = (questionIndex, reponseIndex, field, value) => {
    setTestData(prev => {
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
    setTestData(prev => {
      const updatedQuestions = [...prev.questions];
      
      // Garder au moins 2 réponses
      if (updatedQuestions[questionIndex].reponses.length <= 2) {
        return prev;
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
  
  // Valider le formulaire avant soumission
  const validateForm = () => {
    // Vérifier les champs obligatoires de l'offre
    if (!formData.titre.trim()) return false;
    if (!formData.description.trim()) return false;
    if (!formData.type) return false;
    if (!formData.localisation.trim()) return false;
    if (!formData.date_debut) return false;
    
    // Si un test est requis, valider également les données du test
    if (formData.test_requis) {
      if (!testData.titre.trim()) return false;
      if (!testData.description.trim()) return false;
      if (testData.duree_minutes <= 0) return false;
      
      // Vérifier que chaque question a un contenu et au moins une réponse correcte
      for (const question of testData.questions) {
        if (!question.contenu.trim()) return false;
        
        if (question.reponses.length < 2) return false;
        
        // Vérifier qu'il y a au moins une réponse correcte
        if (!question.reponses.some(r => r.est_correcte)) return false;
        
        // Vérifier que toutes les réponses ont un contenu
        for (const reponse of question.reponses) {
          if (!reponse.contenu.trim()) return false;
        }
      }
    }
    
    return true;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const dataToSubmit = {
        ...formData,
        questions: formData.test_requis ? testData.questions : undefined,
        test_titre: formData.test_requis ? testData.titre : undefined,
        test_description: formData.test_requis ? testData.description : undefined,
        test_duree_minutes: formData.test_requis ? testData.duree_minutes : undefined
      };
      
      let response;
      
      if (isEditMode) {
        response = await axios.put(`/api/offres/${id}`, dataToSubmit);
        setSuccess('Offre mise à jour avec succès !');
      } else {
        response = await axios.post('/api/offres', dataToSubmit);
        setSuccess('Offre créée avec succès !');
        
        // Réinitialiser le formulaire après la création
        setFormData({
          titre: '',
          description: '',
          type: 'stage',
          niveau_requis: '',
          localisation: '',
          remuneration: '',
          date_debut: '',
          duree: '',
          competences_requises: [],
          test_requis: false,
          statut: 'active'
        });
        
        setTestData({
          titre: '',
          description: '',
          duree_minutes: 30,
          questions: [{
            contenu: '',
            reponses: [
              { contenu: '', est_correcte: true },
              { contenu: '', est_correcte: false }
            ]
          }]
        });
      }
      
      // Rediriger vers la liste des offres après un délai
      setTimeout(() => {
        navigate('/dashboard?tab=offers');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'offre:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  // Si l'utilisateur n'est pas une entreprise, rediriger
  if (user && user.role !== 'entreprise') {
    navigate('/dashboard');
    return null;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
              {isEditMode ? 'Modifier l\'offre' : 'Publier une nouvelle offre'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {isEditMode 
                ? 'Modifiez les détails de votre offre et le test associé si nécessaire' 
                : 'Créez une nouvelle offre et ajoutez un test de compétences si souhaité'}
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
        
        <form onSubmit={handleSubmit}>
          {/* Section 1: Informations générales de l'offre */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Titre de l'offre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'offre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Frontend React"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              
              {/* Type d'offre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'offre <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="emploi">Emploi</option>
                </select>
              </div>
              
              {/* Niveau requis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau requis <span className="text-red-500">*</span>
                </label>
                <select
                  name="niveau_requis"
                  value={formData.niveau_requis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Bac">Bac</option>
                  <option value="Bac+1">Bac+1</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+4">Bac+4</option>
                  <option value="Bac+5">Bac+5</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>
              
              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="localisation"
                    value={formData.localisation}
                    onChange={handleChange}
                    placeholder="Ex: Paris"
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              
              {/* Rémunération */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rémunération
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="remuneration"
                    value={formData.remuneration}
                    onChange={handleChange}
                    placeholder="Ex: 1500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                    €{formData.type === 'emploi' ? '/an' : '/mois'}
                  </div>
                </div>
              </div>
              
              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleChange}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              
              {/* Durée (en mois) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (en mois)
                </label>
                <input
                  type="number"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  placeholder="Ex: 6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Décrivez l'offre, les missions, le profil recherché..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              
              {/* Compétences requises */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compétences requises
                </label>
                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableCompetences.map(competence => (
                      <label key={competence.id} className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-teal-500 rounded"
                          checked={formData.competences_requises.includes(competence.id)}
                          onChange={() => handleCompetenceChange(competence.id)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{competence.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 2: Option de test */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800">Test de compétences</h2>
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-700">Ajouter un test</span>
                <input
                  type="checkbox"
                  name="test_requis"
                  checked={formData.test_requis}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-teal-500 rounded"
                />
              </label>
            </div>
            
            {!formData.test_requis ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Book size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 mb-1">Aucun test n'est actuellement associé à cette offre</p>
                <p className="text-sm text-gray-500">
                  Cochez la case ci-dessus pour ajouter un test de compétences aux candidats
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Info size={20} className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-medium">Test de compétences</p>
                      <p className="text-amber-700 text-sm mt-1">
                        Ce test sera présenté aux candidats après leur candidature. Leur score sera visible dans leur profil de candidature.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Informations générales du test */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du test <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={testData.titre}
                      onChange={handleTestChange}
                      placeholder="Ex: Test de connaissances en développement web"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required={formData.test_requis}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description du test <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={testData.description}
                      onChange={handleTestChange}
                      rows="3"
                      placeholder="Instructions et informations pour les candidats..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required={formData.test_requis}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (en minutes) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        name="duree_minutes"
                        value={testData.duree_minutes}
                        onChange={handleTestChange}
                        min="1"
                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required={formData.test_requis}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Questions et réponses */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-700">Questions et réponses</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center text-teal-600 hover:text-teal-700 text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Ajouter une question
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {testData.questions.map((question, qIndex) => (
                      <div 
                        key={qIndex} 
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Question {qIndex + 1} <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700 p-1"
                            disabled={testData.questions.length <= 1}
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={question.contenu}
                          onChange={(e) => updateQuestion(qIndex, 'contenu', e.target.value)}
                          placeholder="Saisissez votre question..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                          required={formData.test_requis}
                        />
                        
                        <div className="ml-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Réponses (sélectionnez la réponse correcte) <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="space-y-2 mb-2">
                            {question.reponses.map((reponse, rIndex) => (
                              <div key={rIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  checked={reponse.est_correcte}
                                  onChange={() => updateReponse(qIndex, rIndex, 'est_correcte', true)}
                                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                                  name={`question-${qIndex}-correct`}
                                  required={formData.test_requis}
                                />
                                <input
                                  type="text"
                                  value={reponse.contenu}
                                  onChange={(e) => updateReponse(qIndex, rIndex, 'contenu', e.target.value)}
                                  placeholder={`Réponse ${rIndex + 1}`}
                                  className="ml-2 flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  required={formData.test_requis}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeReponse(qIndex, rIndex)}
                                  className="ml-2 p-1 text-red-500 hover:text-red-700"
                                  disabled={question.reponses.length <= 2}
                                >
                                  <Minus size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => addReponse(qIndex)}
                            className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                          >
                            <Plus size={14} className="mr-1" />
                            Ajouter une réponse
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditMode ? 'Mettre à jour' : 'Publier l\'offre'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOffreForm;