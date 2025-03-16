import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  BookOpen, 
  ListChecks,
  Info,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';

const CreateAnnouncementForm = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    niveau_requis: '',
    localisation: '',
    remuneration: '',
    date_debut: '',
    duree: '',
    competences_requises: [],
    test_requis: false,
    questions: []
  });

  const [newCompetence, setNewCompetence] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    contenu: '',
    reponses: [
      { contenu: '', est_correcte: true },
      { contenu: '', est_correcte: false },
      { contenu: '', est_correcte: false },
      { contenu: '', est_correcte: false }
    ]
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Add a new competence to the list
  const addCompetence = () => {
    if (newCompetence.trim() !== '') {
      setFormData({
        ...formData,
        competences_requises: [...formData.competences_requises, newCompetence.trim()]
      });
      setNewCompetence('');
    }
  };

  // Remove a competence from the list
  const removeCompetence = (index) => {
    const updatedCompetences = [...formData.competences_requises];
    updatedCompetences.splice(index, 1);
    setFormData({
      ...formData,
      competences_requises: updatedCompetences
    });
  };

  // Handle question form changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: value
    });
  };

  // Handle response form changes
  const handleResponseChange = (index, value) => {
    const updatedReponses = [...newQuestion.reponses];
    updatedReponses[index].contenu = value;
    setNewQuestion({
      ...newQuestion,
      reponses: updatedReponses
    });
  };

  // Set correct answer
  const setCorrectAnswer = (index) => {
    const updatedReponses = newQuestion.reponses.map((reponse, i) => ({
      ...reponse,
      est_correcte: i === index
    }));
    setNewQuestion({
      ...newQuestion,
      reponses: updatedReponses
    });
  };

  // Add question to the list
  const addQuestion = () => {
    if (newQuestion.contenu.trim() !== '' && newQuestion.reponses.every(r => r.contenu.trim() !== '')) {
      setFormData({
        ...formData,
        questions: [...formData.questions, { ...newQuestion }]
      });
      setNewQuestion({
        contenu: '',
        reponses: [
          { contenu: '', est_correcte: true },
          { contenu: '', est_correcte: false },
          { contenu: '', est_correcte: false },
          { contenu: '', est_correcte: false }
        ]
      });
    }
  };

  // Remove question from the list
  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Here you would normally send the data to your API
    alert('Annonce créée avec succès !');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 py-6 px-6">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Briefcase className="mr-2" />
              Créer une nouvelle annonce
            </h1>
            <p className="text-teal-100 mt-1">
              Publiez votre offre et trouvez les talents qui correspondent à vos besoins
            </p>
          </div>

          <form onSubmit={handleSubmit} className="py-6 px-6 space-y-8">
            {/* Informations générales */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations générales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du poste <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="ex: Développeur Full Stack React/Laravel"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de contrat <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="stage">Stage</option>
                    <option value="emploi">Emploi</option>
                    <option value="alternance">Alternance</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="niveau_requis" className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau d'étude requis <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="niveau_requis"
                    name="niveau_requis"
                    value={formData.niveau_requis}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="Bac+2">Bac+2</option>
                    <option value="Bac+3">Bac+3</option>
                    <option value="Bac+4">Bac+4</option>
                    <option value="Bac+5">Bac+5</option>
                    <option value="Bac+8">Bac+8</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="localisation" className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      id="localisation"
                      name="localisation"
                      value={formData.localisation}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="ex: Paris, France"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="remuneration" className="block text-sm font-medium text-gray-700 mb-1">
                    Rémunération (€)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      id="remuneration"
                      name="remuneration"
                      value={formData.remuneration}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="ex: 45000"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      id="date_debut"
                      name="date_debut"
                      value={formData.date_debut}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (en mois, 0 pour CDI) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      id="duree"
                      name="duree"
                      value={formData.duree}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="ex: 6 (0 pour CDI)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Description du poste</h2>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Décrivez les responsabilités, missions et avantages du poste..."
              ></textarea>
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <Info size={12} className="mr-1" />
                Une description détaillée attire des candidats plus qualifiés
              </p>
            </div>

            {/* Compétences requises */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Compétences requises</h2>
              <div className="flex mb-3">
                <input
                  type="text"
                  value={newCompetence}
                  onChange={(e) => setNewCompetence(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: React.js"
                />
                <button
                  type="button"
                  onClick={addCompetence}
                  className="px-4 py-2 bg-teal-500 text-white rounded-r-lg hover:bg-teal-600 focus:outline-none"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.competences_requises.map((competence, index) => (
                  <div key={index} className="flex items-center bg-teal-50 px-3 py-1 rounded-full">
                    <span className="text-teal-800 text-sm">{competence}</span>
                    <button
                      type="button"
                      onClick={() => removeCompetence(index)}
                      className="ml-2 text-teal-600 hover:text-teal-800 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.competences_requises.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucune compétence ajoutée</p>
                )}
              </div>
            </div>

            {/* Test technique */}
            <div>
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Test technique</h2>
                <div className="ml-auto flex items-center">
                  <input
                    type="checkbox"
                    id="test_requis"
                    name="test_requis"
                    checked={formData.test_requis}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="test_requis" className="ml-2 block text-sm text-gray-700">
                    Ajouter un test QCM
                  </label>
                </div>
              </div>

              {formData.test_requis && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                      <BookOpen size={16} className="mr-2" />
                      Configuration du QCM
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Créez jusqu'à 10 questions à choix multiples. Chaque question doit avoir une seule bonne réponse.
                    </p>

                    {/* Liste des questions existantes */}
                    {formData.questions.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center">
                          <ListChecks size={16} className="mr-2" />
                          Questions ({formData.questions.length}/10)
                        </h4>
                        {formData.questions.map((question, qIndex) => (
                          <div key={qIndex} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-gray-800">
                                {qIndex + 1}. {question.contenu}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <ul className="mt-2 space-y-1">
                              {question.reponses.map((reponse, rIndex) => (
                                <li key={rIndex} className="text-xs text-gray-600 flex items-center">
                                  <span className={`w-4 h-4 inline-block rounded-full mr-2 ${reponse.est_correcte ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                                  {reponse.contenu}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire d'ajout de question */}
                    {formData.questions.length < 10 && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="mb-3">
                          <label htmlFor="questionContenu" className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            id="questionContenu"
                            name="contenu"
                            value={newQuestion.contenu}
                            onChange={handleQuestionChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="ex: Quelle est la bonne façon d'initialiser un état dans React?"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Réponses (cochez la bonne réponse)</label>
                          {newQuestion.reponses.map((reponse, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="radio"
                                checked={reponse.est_correcte}
                                onChange={() => setCorrectAnswer(index)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                              />
                              <input
                                type="text"
                                value={reponse.contenu}
                                onChange={(e) => handleResponseChange(index, e.target.value)}
                                className="ml-2 flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                placeholder={`Réponse ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={addQuestion}
                            className="w-full px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 focus:outline-none flex items-center justify-center"
                          >
                            <Plus size={16} className="mr-1" />
                            Ajouter cette question
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none flex items-center"
              >
                <Save size={16} className="mr-2" />
                Publier l'annonce
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementForm;