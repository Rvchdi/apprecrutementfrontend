import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './Authentication/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  ChevronLeft, 
  Star, 
  Users, 
  Tag, 
  Book,
  Award,
  Link as LinkIcon
} from 'lucide-react';
import MainLayout from './Dashboard/MainLayout';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [offre, setOffre] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [similarOffres, setSimilarOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidatureStatus, setCandidatureStatus] = useState(null);
  
  // États pour la modal de candidature
  const [showModal, setShowModal] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Récupérer les détails de l'offre
  useEffect(() => {
    const fetchOffreDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/offres/${id}`);
        
        setOffre(response.data.offre);
        setEntreprise(response.data.entreprise);
        setSimilarOffres(response.data.similar_offres || []);
        
        if (response.data.candidature_status) {
          setCandidatureStatus(response.data.candidature_status);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'offre:', err);
        setError('Une erreur est survenue lors du chargement des détails de l\'offre. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    fetchOffreDetails();
  }, [id]);
  
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Obtenir une couleur pour le niveau
  const getNiveauColor = (niveau) => {
    if (!niveau) return 'bg-gray-100 text-gray-700';
    
    const niveaux = {
      'Débutant': 'bg-green-100 text-green-700',
      'Bac': 'bg-blue-100 text-blue-700',
      'Bac+1': 'bg-blue-100 text-blue-700',
      'Bac+2': 'bg-indigo-100 text-indigo-700',
      'Bac+3': 'bg-indigo-100 text-indigo-700',
      'Bac+4': 'bg-purple-100 text-purple-700',
      'Bac+5': 'bg-purple-100 text-purple-700',
      'Doctorat': 'bg-pink-100 text-pink-700'
    };
    
    return niveaux[niveau] || 'bg-gray-100 text-gray-700';
  };
  
  // Obtenir une couleur pour le type d'offre
  const getTypeColor = (type) => {
    if (!type) return 'bg-gray-100 text-gray-700';
    
    const types = {
      'stage': 'bg-blue-100 text-blue-700',
      'emploi': 'bg-green-100 text-green-700',
      'alternance': 'bg-indigo-100 text-indigo-700'
    };
    
    return types[type] || 'bg-gray-100 text-gray-700';
  };
  
  // Traduire le type d'offre
  const translateType = (type) => {
    if (!type) return 'Non spécifié';
    
    const translations = {
      'stage': 'Stage',
      'emploi': 'Emploi',
      'alternance': 'Alternance'
    };
    
    return translations[type] || type;
  };
  
  // Traduire le statut de candidature
  const translateCandidatureStatus = (status) => {
    if (!status) return '';
    
    const translations = {
      'en_attente': 'En attente',
      'vue': 'Vue',
      'entretien': 'Entretien',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    
    return translations[status] || status;
  };
  
  // Obtenir une couleur pour le statut de candidature
  const getCandidatureStatusColor = (status) => {
    if (!status) return '';
    
    const colors = {
      'en_attente': 'bg-blue-100 text-blue-700',
      'vue': 'bg-indigo-100 text-indigo-700',
      'entretien': 'bg-purple-100 text-purple-700',
      'acceptee': 'bg-green-100 text-green-700',
      'refusee': 'bg-red-100 text-red-700'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-700';
  };
  
  // Soumettre une candidature
  const handleSubmitCandidature = async (e) => {
    e.preventDefault();
    
    if (lettreMotivation.trim().length < 100) {
      setErrorMessage('Veuillez rédiger une lettre de motivation d\'au moins 100 caractères.');
      return;
    }
    
    try {
      setSubmitting(true);
      setErrorMessage('');
      
      const response = await axios.post(`/api/offres/${id}/postuler`, {
        lettre_motivation: lettreMotivation
      });
      
      setSuccessMessage('Votre candidature a été envoyée avec succès !');
      setCandidatureStatus({
        status: 'en_attente',
        date_candidature: new Date().toISOString()
      });
      
      // Fermer la modal après quelques secondes
      setTimeout(() => {
        setShowModal(false);
        
        // Rediriger vers la page de candidature si un test est requis
        if (response.data.test_required) {
          navigate(`/candidatures/${response.data.candidature.id}`);
        }
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la candidature:', err);
      
      if (err.response?.data?.code === 'CV_REQUIRED') {
        setErrorMessage('Vous devez télécharger votre CV avant de postuler. Veuillez compléter votre profil.');
      } else {
        setErrorMessage(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre candidature.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Déterminer si l'utilisateur peut postuler
  const canApply = () => {
    if (!isAuthenticated) return false;
    if (user.role !== 'etudiant') return false;
    if (candidatureStatus) return false; // Déjà postulé
    if (offre?.entreprise?.user_id === user.id) return false; // C'est son offre
    return true;
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start text-red-600">
              <AlertCircle className="mt-0.5 mr-2" size={20} />
              <div>
                <h2 className="text-lg font-medium">Une erreur est survenue</h2>
                <p className="text-red-600 mt-1">{error}</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Retour aux offres
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!offre) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start">
              <AlertCircle className="mt-0.5 mr-2 text-yellow-500" size={20} />
              <div>
                <h2 className="text-lg font-medium">Offre non trouvée</h2>
                <p className="text-gray-600 mt-1">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
                <button 
                  onClick={() => navigate('/offres')} 
                  className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Retour aux offres
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <button 
                onClick={() => navigate(-1)} 
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{offre.titre}</h1>
            </div>
            
            <div className="flex flex-wrap items-center text-gray-600 gap-3 mt-2">
              <div className="flex items-center">
                <Building size={16} className="mr-1" />
                <span>{entreprise?.nom_entreprise || 'Entreprise non spécifiée'}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                <span>{offre.localisation || 'Lieu non spécifié'}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Début: {formatDate(offre.date_debut)}</span>
              </div>
              
              <div className="flex items-center">
                <Tag size={16} className="mr-1" />
                <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(offre.type)}`}>
                  {translateType(offre.type)}
                </span>
              </div>
              
              {offre.test_requis && (
                <div className="flex items-center">
                  <Book size={16} className="mr-1 text-indigo-500" />
                  <span className="text-indigo-600 text-sm font-medium">Test requis</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="md:col-span-2">
              {/* Statut de candidature */}
              {candidatureStatus && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCandidatureStatusColor(candidatureStatus.status)}`}>
                        <span className="flex items-center">
                          <CheckCircle size={16} className="mr-1" />
                          Candidature {translateCandidatureStatus(candidatureStatus.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Postulé le {formatDate(candidatureStatus.date_candidature)}
                    </div>
                  </div>
                  
                  {/* Test status */}
                  {offre.test_requis && (
                    <div className="mt-3 flex items-center">
                      {candidatureStatus.test_complete ? (
                        <div className="flex items-center text-sm">
                          <CheckCircle size={16} className="mr-1 text-green-500" />
                          <span>Test complété - Score: <span className="font-medium">{candidatureStatus.score_test}%</span></span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center text-sm text-amber-600">
                            <AlertCircle size={16} className="mr-1" />
                            <span>Test à compléter</span>
                          </div>
                          <Link 
                            to={`/tests/${offre.test?.id}/candidatures/${candidatureStatus.candidature_id}`}
                            className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm"
                          >
                            Passer le test
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            
              {/* Description de l'offre */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Description de l'offre</h2>
                <div className="prose max-w-none text-gray-700">
                  {offre.description ? (
                    <p className="whitespace-pre-line">{offre.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Aucune description disponible</p>
                  )}
                </div>
              </div>
              
              {/* Compétences requises */}
              {offre.competences && offre.competences.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Compétences requises</h2>
                  <div className="flex flex-wrap gap-2">
                    {offre.competences.map(competence => (
                      <span 
                        key={competence.id}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                      >
                        {competence.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Informations de l'offre */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Détails</h2>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{translateType(offre.type)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Début</span>
                    <span className="font-medium">{formatDate(offre.date_debut)}</span>
                  </li>
                  {offre.duree && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Durée</span>
                      <span className="font-medium">{offre.duree} mois</span>
                    </li>
                  )}
                  {offre.remuneration && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Rémunération</span>
                      <span className="font-medium">{offre.remuneration} €{offre.type === 'emploi' ? '/an' : '/mois'}</span>
                    </li>
                  )}
                  <li className="flex justify-between">
                    <span className="text-gray-600">Niveau requis</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getNiveauColor(offre.niveau_requis)}`}>
                      {offre.niveau_requis || 'Non spécifié'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Publication</span>
                    <span className="font-medium">{formatDate(offre.created_at)}</span>
                  </li>
                </ul>
              </div>
              
              {/* Entreprise */}
              {entreprise && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">À propos de l'entreprise</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold text-xl mr-3">
                      {entreprise.logo ? (
                        <img 
                          src={`/storage/${entreprise.logo}`} 
                          alt={entreprise.nom_entreprise} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        entreprise.nom_entreprise?.charAt(0) || 'E'
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{entreprise.nom_entreprise}</h3>
                      <p className="text-sm text-gray-500">{entreprise.secteur_activite}</p>
                    </div>
                  </div>
                  
                  {entreprise.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {entreprise.description}
                    </p>
                  )}
                  
                  {entreprise.site_web && (
                    <a 
                      href={entreprise.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <LinkIcon size={14} className="mr-1" />
                      Visiter le site web
                    </a>
                  )}
                </div>
              )}
              
              {/* Bouton de candidature */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {canApply() ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
                  >
                    <Send size={18} className="mr-2" />
                    Postuler à cette offre
                  </button>
                ) : candidatureStatus ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-2">Vous avez déjà postulé à cette offre</p>
                    <Link 
                      to={`/candidatures/${candidatureStatus.candidature_id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Voir ma candidature
                    </Link>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Connectez-vous pour postuler à cette offre</p>
                    <Link 
                      to={`/login?redirect=/offres/${id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg inline-block"
                    >
                      Se connecter
                    </Link>
                  </div>
                ) : user?.role === 'entreprise' ? (
                  <p className="text-gray-600 text-center">Les entreprises ne peuvent pas postuler aux offres</p>
                ) : (
                  <p className="text-gray-600 text-center">Vous ne pouvez pas postuler à cette offre</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Offres similaires */}
          {similarOffres.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-4">Offres similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarOffres.map(offre => (
                  <Link 
                    key={offre.id}
                    to={`/offres/${offre.id}`}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <h3 className="font-medium text-gray-900">{offre.titre}</h3>
                    <p className="text-sm text-gray-500 mb-2">{offre.entreprise?.nom_entreprise}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin size={12} className="mr-1" />
                      <span>{offre.localisation}</span>
                      <span className="mx-2">•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(offre.type)}`}>
                        {translateType(offre.type)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de candidature */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Candidature pour : {offre.titre}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {successMessage ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">{successMessage}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitCandidature}>
                  {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-red-700">{errorMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="lettre_motivation" className="block text-sm font-medium text-gray-700 mb-1">
                      Lettre de motivation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="lettre_motivation"
                      rows="10"
                      value={lettreMotivation}
                      onChange={(e) => setLettreMotivation(e.target.value)}
                      placeholder="Expliquez pourquoi vous êtes intéressé(e) par cette offre et pourquoi vous seriez un bon candidat..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {lettreMotivation.length} caractères (minimum 100 caractères)
                    </p>
                  </div>
                  
                  {offre.test_requis && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                        <div>
                          <p className="text-amber-700 font-medium">Test de compétences requis</p>
                          <p className="text-amber-700 text-sm">
                            Après avoir soumis votre candidature, vous devrez compléter un test de compétences.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || lettreMotivation.trim().length < 100}
                      className={`px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center ${
                        submitting || lettreMotivation.trim().length < 100 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Envoyer ma candidature
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default JobDetail;