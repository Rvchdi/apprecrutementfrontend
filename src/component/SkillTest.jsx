import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Flag,
  BookOpen,
  Info,
  X
} from 'lucide-react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const SkillTest = () => {
  const { testId, candidatureId } = useParams();
  const navigate = useNavigate();
  
  // État pour gérer le test
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [confirming, setConfirming] = useState(false);
  
  // Charger les données du test
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tests/${testId}?candidature_id=${candidatureId}`);
        
        setTest(response.data.test);
        setQuestions(response.data.questions);
        setTimeRemaining(response.data.test.duree_minutes * 60); // Convertir en secondes
        
        // Initialiser les réponses
        const initialAnswers = {};
        response.data.questions.forEach(question => {
          initialAnswers[question.id] = null;
        });
        setSelectedAnswers(initialAnswers);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du test:', error);
        setError('Impossible de charger le test. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [testId, candidatureId]);
  
  // Gérer le compte à rebours
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || testSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          submitTest(); // Soumettre automatiquement le test quand le temps est écoulé
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, testSubmitted]);
  
  // Formater le temps restant
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Vérifier si toutes les questions ont une réponse
  const allQuestionsAnswered = () => {
    return questions.every(question => selectedAnswers[question.id] !== null);
  };
  
  // Marquer une question
  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };
  
  // Sélectionner une réponse
  const selectAnswer = (questionId, reponseId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: reponseId
    }));
  };
  
  // Passer à la question suivante
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Revenir à la question précédente
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Aller à une question spécifique
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };
  
  // Soumettre le test
  const submitTest = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(`/api/tests/${testId}/submit`, {
        candidature_id: candidatureId,
        reponses: selectedAnswers
      });
      
      setScore(response.data.score);
      setTestSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du test:', error);
      setError('Une erreur est survenue lors de la soumission du test. Veuillez réessayer.');
      setLoading(false);
    }
  };
  
  // Vérifier si une confirmation est nécessaire pour soumettre
  const handleSubmit = () => {
    if (!allQuestionsAnswered()) {
      setConfirming(true);
    } else {
      submitTest();
    }
  };

  // Affichage pendant le chargement
  if (loading && !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-600">Chargement du test...</p>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Retourner au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // Affichage du résultat après soumission
  if (testSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-teal-500 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Test terminé !</h2>
            <p>Merci d'avoir complété ce test.</p>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32">
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="60" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="60" 
                    fill="none" 
                    stroke={score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="8" 
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * score / 100)}
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">{score}%</span>
              </div>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">
                {score >= 70 ? "Excellent !" : score >= 50 ? "Bien joué !" : "Vous pouvez faire mieux !"}
              </h3>
              <p className="text-gray-600">
                {score >= 70 ? 
                  "Votre score démontre une excellente maîtrise du sujet." : 
                  score >= 50 ? 
                  "Votre score montre une bonne compréhension du sujet." : 
                  "Continuez à vous entraîner pour améliorer vos connaissances."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <button 
                onClick={() => navigate(`/offres/${test.offre_id}`)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retour à l'offre
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage principal du test
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* En-tête avec timer et progression */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{test.titre}</h1>
            <p className="text-sm text-gray-500">Test pour {test.offre ? test.offre.titre : 'cette offre'}</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className={`flex items-center ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-600'}`}>
              <Clock size={20} className="mr-2" />
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
            
            <div className="text-sm text-gray-600">
              Question <span className="font-medium">{currentQuestionIndex + 1}</span> / {questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Corps principal */}
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4">
          {/* Card de question */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Question {currentQuestionIndex + 1}
                </h3>
                <button 
                  className={`p-2 rounded-full ${flaggedQuestions.includes(currentQuestion.id) ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                  onClick={() => toggleFlagQuestion(currentQuestion.id)}
                >
                  <Flag size={16} />
                </button>
              </div>
              
              <p className="text-gray-700 mb-6">{currentQuestion.contenu}</p>
              
              <div className="space-y-3">
                {currentQuestion.reponses && currentQuestion.reponses.map(reponse => (
                  <div 
                    key={reponse.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAnswers[currentQuestion.id] === reponse.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => selectAnswer(currentQuestion.id, reponse.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 ${
                        selectedAnswers[currentQuestion.id] === reponse.id
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion.id] === reponse.id && <Check size={12} />}
                      </div>
                      <span className="text-gray-800">{reponse.contenu}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Barre de navigation (fixée en bas) */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            {/* Navigation */}
            <div className="flex space-x-2">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-3 py-2 rounded-lg flex items-center ${
                  currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={18} className="mr-1" />
                Précédent
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-3 py-2 rounded-lg flex items-center ${
                  currentQuestionIndex === questions.length - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Suivant
                <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
            
            {/* Sommaire des questions */}
            <div className="hidden md:flex items-center space-x-1">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${index === currentQuestionIndex ? 'bg-teal-500 text-white' : ''}
                    ${selectedAnswers[question.id] !== null ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'}
                    ${flaggedQuestions.includes(question.id) ? 'ring-2 ring-amber-500' : ''}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            {/* Bouton de soumission */}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Terminer le test
            </button>
          </div>
        </div>
      </footer>

      {/* Dialogue de confirmation pour soumettre sans répondre à toutes les questions */}
      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center text-amber-500 mb-4">
              <Info size={24} className="mr-2" />
              <h3 className="text-lg font-medium text-gray-800">Confirmation</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Vous n'avez pas répondu à toutes les questions. Êtes-vous sûr de vouloir soumettre le test ?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Revenir au test
              </button>
              <button
                onClick={submitTest}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTest;