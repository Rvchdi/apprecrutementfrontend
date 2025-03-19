import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Building,
  Globe,
  Users,
  Check,
  FileCheck,
  Tag,
  AlertCircle,
  ChevronLeft,
  Share2,
  Bookmark,
  User,
  FileText,
  Eye,
  X,
  Send
} from 'lucide-react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offre, setOffre] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [similarOffres, setSimilarOffres] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [candidatureSubmitting, setCandidatureSubmitting] = useState(false);
  const [candidatureStatus, setCandidatureStatus] = useState(null);
  const [savedStatus, setSavedStatus] = useState(false);
  
  // Chargement de l'offre
  useEffect(() => {
    const fetchOffre = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/offres/${id}`);
        
        setOffre(response.data.offre);
        setEntreprise(response.data.entreprise);
        setSimilarOffres(response.data.similar_offres || []);
        
        // Vérifier si l'utilisateur a déjà postulé
        if (isAuthenticated && user?.role === 'etudiant') {
          const statusResponse = await axios.get(`/api/offres/${id}/candidature-status`);
          setCandidatureStatus(statusResponse.data.status);
          setSavedStatus(statusResponse.data.saved || false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'offre:', error);
        setError('Une erreur est survenue lors du chargement de l\'offre.');
        setLoading(false);
      }
    };
    
    fetchOffre();
  }, [id, isAuthenticated, user]);
  
  // Formatter la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Sauvegarder/retirer des favoris
  const toggleSaveOffre = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      if (savedStatus) {
        await axios.delete(`/api/offres/${id}/save`);
      } else {
        await axios.post(`/api/offres/${id}/save`);
      }
      
      setSavedStatus(!savedStatus);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'offre:', error);
      setError('Une erreur est survenue lors de la sauvegarde de l\'offre.');
    }
  };
  
  // Partager l'offre
  const shareOffre = () => {
    if (navigator.share) {
      navigator.share({
        title: offre.titre,
        text: `Découvrez cette offre : ${offre.titre} chez ${entreprise.nom_entreprise}`,
        url: window.location.href
      })
      .catch(err => console.error('Erreur lors du partage:', err));
    } else {
      // Copier le lien dans le presse-papier
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Lien copié dans le presse-papier !');
        })
        .catch(err => console.error('Erreur lors de la copie:', err));
    }
  };
  
  // Soumettre une candidature
  const submitCandidature = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setCandidatureSubmitting(true);
      
      await axios.post(`/api/offres/${id}/postuler`, {
        lettre_motivation: lettreMotivation
      });
      
      setCandidatureSubmitting(false);
      setCandidatureStatus('en_attente');
      setShowApplyModal(false);
      
      // Réinitialiser le formulaire
      setLettreMotivation('');
    } catch (error) {
      console.error('Erreur lors de la soumission de la candidature:', error);
      setError('Une erreur est survenue lors de la soumission de la candidature.');
      setCandidatureSubmitting(false);
    }
  };
  
  // Redirection vers le test de compétences
  const startSkillTest = () => {
    if (offre && candidatureStatus) {
      navigate(`/tests/${offre.test_id}/candidatures/${candidatureStatus.candidature_id}`);
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error || !offre) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error || "Cette offre n'existe pas ou a été supprimée."}</p>
          <Link 
            to="/offres"
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Découvrir d'autres offres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero section avec informations principales */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link 
            to="/offres"
            className="inline-flex items-center text-gray-600 hover:text-teal-600 mb-4"
          >
            <ChevronLeft size={16} className="mr-1" />
            Retour aux offres
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{offre.titre}</h1>
              
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-100 mr-3 flex items-center justify-center">
                  {entreprise.logo ? (
                    <img
                      src={entreprise.logo}
                      alt={entreprise.nom_entreprise}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Building size={20} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-gray-800">{entreprise.nom_entreprise}</h2>
                  <p className="text-sm text-gray-500">{entreprise.secteur_activite}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  {offre.localisation}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Début: {formatDate(offre.date_debut)}
                </div>
                <div className="flex items-center">
                  {offre.type === 'stage' ? (
                    <Briefcase size={16} className="mr-1" />
                  ) : offre.type === 'alternance' ? (
                    <Users size={16} className="mr-1" />
                  ) : (
                    <Building size={16} className="mr-1" />
                  )}
                  {offre.type === 'stage' ? 'Stage' : offre.type === 'alternance' ? 'Alternance' : 'Emploi'}
                </div>
                {offre.duree > 0 && (
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {offre.duree} {offre.duree > 1 ? 'mois' : 'mois'}
                  </div>
                )}
                {offre.remuneration && (
                  <div className="flex items-center">
                    <CreditCard size={16} className="mr-1" />
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(offre.remuneration)}
                    {offre.type === 'alternance' ? '/an' : offre.type === 'stage' ? '/mois' : '/an'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex flex-col md:items-end space-y-3">
              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={toggleSaveOffre}
                  className={`p-2 rounded-full ${
                    savedStatus 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark size={20} fill={savedStatus ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={shareOffre}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              {/* Bouton de candidature */}
              {user?.role === 'etudiant' ? (
                candidatureStatus ? (
                  <div>
                    <div className={`px-4 py-2 rounded-lg ${
                      candidatureStatus.status === 'en_attente' ? 'bg-blue-100 text-blue-800' :
                      candidatureStatus.status === 'vue' ? 'bg-indigo-100 text-indigo-800' :
                      candidatureStatus.status === 'entretien' ? 'bg-purple-100 text-purple-800' :
                      candidatureStatus.status === 'acceptee' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <div className="font-medium">
                        {candidatureStatus.status === 'en_attente' ? 'Candidature en attente' :
                        candidatureStatus.status === 'vue' ? 'Candidature vue' :
                        candidatureStatus.status === 'entretien' ? 'Entretien proposé' :
                        candidatureStatus.status === 'acceptee' ? 'Candidature acceptée' :
                        'Candidature refusée'}
                      </div>
                      <div className="text-xs mt-1">
                        Postuler le {formatDate(candidatureStatus.date_candidature)}
                      </div>
                    </div>
                    
                    {/* Test de compétences si nécessaire */}
                    {offre.test_requis && candidatureStatus.status !== 'refusee' && (
                      <div className="mt-2">
                        {candidatureStatus.test_complete ? (
                          <div className="flex items-center text-sm text-green-600">
                            <Check size={16} className="mr-1" />
                            Test complété - Score: {candidatureStatus.score_test || 'N/A'}
                          </div>
                        ) : (
                          <button
                            onClick={startSkillTest}
                            className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
                          >
                            <FileCheck size={16} className="mr-2" />
                            Passer le test technique
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
                  >
                    <Briefcase size={18} className="mr-2" />
                    Postuler maintenant
                  </button>
                )
              ) : (
                <Link
                  to={user ? '/dashboard' : '/login'}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-center"
                >
                  {user ? 'Accéder au tableau de bord' : 'Se connecter pour postuler'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section principale */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Description du poste</h2>
              <div className="prose text-gray-700">
                {offre.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {/* Compétences requises */}
            {offre.competences && offre.competences.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Compétences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {offre.competences.map(competence => (
                    <div 
                      key={competence.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {competence.nom}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Informations sur le test */}
            {offre.test_requis && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FileCheck size={20} className="mr-2 text-amber-500" />
                  Test de compétences requis
                </h2>
                <p className="text-gray-700 mb-4">
                  Cette offre nécessite de passer un test de compétences pour évaluer votre niveau technique.
                </p>
                <div className="bg-amber-50 rounded-lg p-4 text-sm">
                  <div className="font-medium text-amber-800 mb-2">Informations importantes:</div>
                  <ul className="list-disc list-inside text-amber-700 space-y-1">
                    <li>Durée approximative: {offre.test?.duree_minutes || 30} minutes</li>
                    <li>Le test est composé de questions à choix multiples</li>
                    <li>Vous pouvez passer le test après avoir postulé</li>
                    <li>Vous ne pouvez passer le test qu'une seule fois</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Offres similaires */}
            {similarOffres.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Offres similaires</h2>
                <div className="space-y-4">
                  {similarOffres.map(offre => (
                    <Link 
                      key={offre.id}
                      to={`/offres/${offre.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-800">{offre.titre}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Building size={12} className="mr-1" />
                          {offre.entreprise.nom_entreprise}
                        </div>
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {offre.localisation}
                        </div>
                        <div className="flex items-center">
                          {offre.type === 'stage' ? (
                            <Briefcase size={12} className="mr-1" />
                          ) : offre.type === 'alternance' ? (
                            <Users size={12} className="mr-1" />
                          ) : (
                            <Building size={12} className="mr-1" />
                          )}
                          {offre.type === 'stage' ? 'Stage' : offre.type === 'alternance' ? 'Alternance' : 'Emploi'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations sur l'entreprise */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">À propos de l'entreprise</h2>
              
              {entreprise.logo ? (
                <img
                  src={entreprise.logo}
                  alt={entreprise.nom_entreprise}
                  className="h-16 object-contain mb-4"
                />
              ) : (
                <div className="h-16 w-full flex items-center justify-start mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building size={24} className="text-gray-400" />
                  </div>
                </div>
              )}
              
              <h3 className="font-medium text-gray-800 mb-1">{entreprise.nom_entreprise}</h3>
              <p className="text-sm text-gray-500 mb-3">{entreprise.secteur_activite}</p>
              
              {entreprise.description && (
                <p className="text-sm text-gray-600 mb-4">{entreprise.description}</p>
              )}
              
              <div className="space-y-2 text-sm">
                {entreprise.site_web && (
                  <div className="flex items-center">
                    <Globe size={16} className="mr-2 text-gray-400" />
                    <a 
                      href={entreprise.site_web} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      Site web
                    </a>
                  </div>
                )}
                
                {entreprise.taille && (
                  <div className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-400" />
                    <span>{entreprise.taille}</span>
                  </div>
                )}
                
                {entreprise.ville && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>{`${entreprise.ville}${entreprise.pays ? ', ' + entreprise.pays : ''}`}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link 
                  to={`/entreprises/${entreprise.id}`}
                  className="text-teal-500 hover:text-teal-600 text-sm flex items-center"
                >
                  Voir toutes les offres
                  <ChevronLeft size={16} className="ml-1 rotate-180" />
                </Link>
              </div>
            </div>
            
            {/* Informations clés */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Informations clés</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 text-teal-500">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Type de contrat</h3>
                    <p className="text-sm text-gray-600">
                      {offre.type === 'stage' 
                        ? 'Stage' 
                        : offre.type === 'alternance' 
                        ? 'Alternance' 
                        : 'Emploi'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 text-teal-500">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Date de début</h3>
                    <p className="text-sm text-gray-600">{formatDate(offre.date_debut)}</p>
                  </div>
                </div>
                
                {offre.duree > 0 && (
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-teal-500">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Durée</h3>
                      <p className="text-sm text-gray-600">{offre.duree} {offre.duree > 1 ? 'mois' : 'mois'}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3 text-teal-500">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Localisation</h3>
                    <p className="text-sm text-gray-600">{offre.localisation}</p>
                  </div>
                </div>
                
                {offre.remuneration && (
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-teal-500">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Rémunération</h3>
                      <p className="text-sm text-gray-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(offre.remuneration)}
                        {offre.type === 'alternance' ? '/an' : offre.type === 'stage' ? '/mois' : '/an'}
                      </p>
                    </div>
                  </div>
                )}
                
                {offre.niveau_requis && (
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-teal-500">
                      <User size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Niveau requis</h3>
                      <p className="text-sm text-gray-600">{offre.niveau_requis}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de candidature */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-800">Soumettre votre candidature</h2>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg mb-4">
                <div className="rounded-full p-2 bg-blue-100 text-blue-600 mr-3">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-blue-800">{offre.titre}</h3>
                  <p className="text-sm text-blue-600">{entreprise.nom_entreprise} - {offre.localisation}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lettre de motivation
                </label>
                <textarea
                  rows="6"
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
                  value={lettreMotivation}
                  onChange={(e) => setLettreMotivation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  Expliquez pourquoi vous êtes le candidat idéal pour ce poste et ce qui vous motive à rejoindre cette entreprise.
                </p>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    CV et autres documents
                  </label>
                  <Link
                    to="/dashboard"
                    className="text-xs text-teal-500 hover:text-teal-600"
                  >
                    Gérer mes documents
                  </Link>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="mr-3 text-gray-400">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Mon CV actuel</p>
                      <p className="text-xs text-gray-500">Mis à jour le {formatDate(new Date())}</p>
                    </div>
                    <a href="#" className="text-teal-500 hover:text-teal-600">
                      <Eye size={16} />
                    </a>
                  </div>
                </div>
              </div>
              
              {offre.test_requis && (
                <div className="mb-6 bg-amber-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3 text-amber-500">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Cette offre nécessite un test de compétences</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Après avoir postulé, vous devrez réaliser un test technique pour compléter votre candidature.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={submitCandidature}
                  disabled={candidatureSubmitting || !lettreMotivation.trim()}
                  className={`px-6 py-2 rounded-lg text-white flex items-center ${
                    candidatureSubmitting || !lettreMotivation.trim() 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-teal-500 hover:bg-teal-600'
                  }`}
                >
                  {candidatureSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;