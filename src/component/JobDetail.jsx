import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './Authentication/AuthContext';
import {
  Briefcase, MapPin, Calendar, Clock, Building, CheckCircle, AlertCircle, Send,
  ChevronLeft, Star, Users, Tag, Book, Award, Link as LinkIcon, X, Loader2,
  Info, ExternalLink, FileText, CheckSquare, AlertTriangle, MessageSquare
} from 'lucide-react';
import MainLayout from './Dashboard/MainLayout'; // Assuming MainLayout provides basic page structure

// Helper component for info items in the sidebar
const InfoItem = ({ icon: Icon, label, value, children }) => (
  <li className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center text-sm text-gray-600">
      <Icon size={16} className="mr-2 flex-shrink-0 text-gray-400" />
      <span>{label}</span>
    </div>
    <div className="text-sm font-medium text-gray-800 text-right">
      {value || children}
    </div>
  </li>
);

// Helper component for Badges
const Badge = ({ color = 'gray', children }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

// Helper Alert Component
const Alert = ({ type = 'info', title, message, children }) => {
  const config = {
    info: { icon: Info, color: 'blue', border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', iconColor: 'text-blue-500' },
    success: { icon: CheckCircle, color: 'green', border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', iconColor: 'text-green-500' },
    warning: { icon: AlertTriangle, color: 'amber', border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', iconColor: 'text-amber-500' },
    error: { icon: AlertCircle, color: 'red', border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', iconColor: 'text-red-500' },
  };
  const { icon: Icon, border, bg, text, iconColor } = config[type];

  return (
    <div className={`${bg} border-l-4 ${border} p-4 mb-4 rounded-r-md`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${text}`}>{title}</h3>}
          <div className={`mt-1 text-sm ${text}`}>
            {message || children}
          </div>
        </div>
      </div>
    </div>
  );
};


const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [offre, setOffre] = useState(null);
  const [entreprise, setEntreprise] = useState(null);
  const [similarOffres, setSimilarOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidatureStatus, setCandidatureStatus] = useState(null); // { status: '...', date_candidature: '...', candidature_id: '...', test_complete: bool, score_test: number }

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [lettreMotivation, setLettreMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const fetchOffreDetails = async () => {
      setLoading(true);
      setError(null);
      setOffre(null); // Reset state on ID change
      setEntreprise(null);
      setSimilarOffres([]);
      setCandidatureStatus(null);

      if (!id || isNaN(parseInt(id))) {
        setError('Identifiant d\'offre invalide.');
        setLoading(false);
        return;
      }

      try {
        // Fetch data with user token if authenticated to get candidature status
        const headers = isAuthenticated ? { Authorization: `Bearer ${user?.token}` } : {}; // Adjust based on your actual auth token storage
        const response = await axios.get(`/api/offres/${id}`, { headers });

        setOffre(response.data.offre);
        setEntreprise(response.data.entreprise);
        setSimilarOffres(response.data.similar_offres || []);
        if (response.data.candidature_status) {
          setCandidatureStatus(response.data.candidature_status);
        }

      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'offre:', err);
        if (err.response && err.response.status === 404) {
            setError("L'offre demandée n'a pas été trouvée.");
        } else {
            setError('Impossible de charger les détails de l\'offre. Veuillez réessayer plus tard.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffreDetails();
  }, [id, isAuthenticated, user?.token]); // Re-fetch if ID or auth status changes

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return 'Date invalide';
    }
  };

  const getNiveauColor = (niveau) => {
    const niveaux = { 'Débutant': 'green', 'Bac': 'blue', 'Bac+1': 'blue', 'Bac+2': 'indigo', 'Bac+3': 'indigo', 'Bac+4': 'purple', 'Bac+5': 'purple', 'Doctorat': 'pink' };
    return niveaux[niveau] || 'gray';
  };

  const getTypeColor = (type) => {
    const types = { 'stage': 'blue', 'emploi': 'green', 'alternance': 'indigo' };
    return types[type] || 'gray';
  };

  const translateType = (type) => {
    const translations = { 'stage': 'Stage', 'emploi': 'Emploi', 'alternance': 'Alternance' };
    return translations[type] || type || 'Non spécifié';
  };

  const translateCandidatureStatus = (status) => {
    const translations = { 'en_attente': 'En attente', 'vue': 'Vue', 'entretien': 'Entretien', 'acceptee': 'Acceptée', 'refusee': 'Refusée' };
    return translations[status] || status || 'Inconnu';
  };

  const getCandidatureStatusColor = (status) => {
    const colors = { 'en_attente': 'blue', 'vue': 'indigo', 'entretien': 'purple', 'acceptee': 'green', 'refusee': 'red' };
    return colors[status] || 'gray';
  };

    const handleOpenModal = () => {
        setLettreMotivation('');
        setModalError('');
        setModalSuccess('');
        setSubmitting(false);
        setShowModal(true);
    };

  const handleSubmitCandidature = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!id || isNaN(parseInt(id))) {
      setModalError('Identifiant d\'offre invalide.');
      return;
    }

    if (lettreMotivation.trim().length < 100) {
      setModalError('Veuillez rédiger une lettre de motivation d\'au moins 100 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      const offreId = parseInt(id);
      const headers = { Authorization: `Bearer ${user?.token}` }; // Ensure token is sent
      const response = await axios.post(`/api/offres/${offreId}/postuler`, {
        lettre_motivation: lettreMotivation
      }, { headers });

      setModalSuccess('Votre candidature a été envoyée avec succès !');
      // Update candidature status locally immediately
      setCandidatureStatus({
        status: 'en_attente',
        date_candidature: new Date().toISOString(),
        candidature_id: response.data.candidature?.id, // Get ID from response
        test_complete: false, // Assume test is not complete initially if required
        score_test: null
      });

      // Handle redirection or closing modal
      const shouldRedirectToTest = response.data.test_required && response.data.test_id && response.data.candidature?.id;

      setTimeout(() => {
        setShowModal(false);
        if (shouldRedirectToTest) {
          // Navigate to the test page associated with this specific candidature
          navigate(`/tests/${response.data.test_id}/candidatures/${response.data.candidature.id}`);
        }
      }, shouldRedirectToTest ? 2500 : 2000); // Slightly longer delay if redirecting

    } catch (err) {
      console.error('Erreur lors de l\'envoi de la candidature:', err);
      let specificError = 'Une erreur est survenue lors de l\'envoi de votre candidature.';
      if (err.response?.data?.code === 'CV_REQUIRED') {
        specificError = (
            <span>
                Vous devez télécharger votre CV avant de postuler. Veuillez{' '}
                <Link to="/profil" className="underline hover:text-blue-700">compléter votre profil</Link>.
            </span>
        );
      } else if (err.response?.data?.message) {
        specificError = err.response.data.message;
      }
      setModalError(specificError);
    } finally {
      // Keep submitting true briefly even on success to show success message before closing
      if (!modalSuccess) {
          setSubmitting(false);
      }
    }
  };

  const canApply = () => {
    if (!isAuthenticated || user?.role !== 'etudiant' || candidatureStatus || offre?.entreprise?.user_id === user?.id) {
      return false;
    }
    return true;
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="animate-spin text-teal-500" size={48} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Alert type="error" title="Erreur de chargement">
            <p>{error}</p>
            <button
              onClick={() => navigate('/offres')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ChevronLeft size={16} className="mr-1" />
              Retour aux offres
            </button>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (!offre) {
     // This case should ideally be covered by the error state from the fetch if 404,
     // but added as a fallback.
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Alert type="warning" title="Offre non trouvée">
            <p>L'offre que vous recherchez n'existe pas ou n'est plus disponible.</p>
            <button
              onClick={() => navigate('/offres')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <ChevronLeft size={16} className="mr-1" />
              Retour aux offres
            </button>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  // --- Main Job Detail Display ---
  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            Retour
          </button>

          {/* Header Section */}
          <div className="bg-white shadow-sm rounded-xl p-6 md:p-8 mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between md:items-start">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{offre.titre}</h1>
                    <div className="flex flex-wrap items-center text-gray-600 gap-x-4 gap-y-2 mb-4">
                        <div className="flex items-center">
                            <Building size={16} className="mr-1.5 text-gray-400" />
                            <span>{entreprise?.nom_entreprise || 'Entreprise inconnue'}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin size={16} className="mr-1.5 text-gray-400" />
                            <span>{offre.localisation || 'Non spécifié'}</span>
                        </div>
                         <div className="flex items-center">
                            <Calendar size={16} className="mr-1.5 text-gray-400" />
                            <span>Début: {formatDate(offre.date_debut)}</span>
                        </div>
                    </div>
                </div>
                 <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 flex flex-col items-start md:items-end space-y-2">
                     <Badge color={getTypeColor(offre.type)}>
                        {translateType(offre.type)}
                    </Badge>
                    {offre.test_requis && (
                         <Badge color="indigo">
                            <Book size={12} className="inline mr-1" /> Test Requis
                        </Badge>
                    )}
                 </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Info) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Candidature Status */}
              {candidatureStatus && (
                <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                      <div className="flex items-center mb-2 sm:mb-0">
                          <Badge color={getCandidatureStatusColor(candidatureStatus.status)}>
                              <CheckCircle size={14} className="inline mr-1" />
                              Candidature {translateCandidatureStatus(candidatureStatus.status)}
                          </Badge>
                          <span className="ml-3 text-sm text-gray-500">
                              Postulé le {formatDate(candidatureStatus.date_candidature)}
                          </span>
                      </div>
                       <Link
                          to={`/candidatures/${candidatureStatus.candidature_id}`}
                          className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Voir ma candidature
                       </Link>
                  </div>

                  {/* Test Status within Candidature */}
                  {offre.test_requis && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {candidatureStatus.test_complete ? (
                        <Alert type="success" title="Test Complété">
                          <p>Score obtenu : <span className="font-semibold">{candidatureStatus.score_test ?? 'N/A'}%</span></p>
                        </Alert>
                      ) : (
                        <Alert type="warning" title="Test Requis">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <p className="mb-2 sm:mb-0">Vous devez compléter le test associé à cette candidature.</p>
                                 {/* Ensure you have the test ID available, potentially on the 'offre' or 'candidatureStatus' object */}
                                {offre.test?.id && candidatureStatus.candidature_id ? (
                                  <Link
                                    to={`/tests/${offre.test.id}/candidatures/${candidatureStatus.candidature_id}`} // Updated link structure
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                  >
                                    Passer le test maintenant
                                  </Link>
                                ) : (
                                     <span className="text-xs text-gray-500 italic">Lien vers le test indisponible.</span>
                                )}
                          </div>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Description de l'offre</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {offre.description ? (
                    <p className="whitespace-pre-line">{offre.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Aucune description fournie.</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {offre.competences && offre.competences.length > 0 && (
                <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Compétences requises</h2>
                  <div className="flex flex-wrap gap-2">
                    {offre.competences.map(comp => (
                      <Badge key={comp.id} color="teal">{comp.nom}</Badge>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Job Details Card */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Détails de l'offre</h2>
                <ul className="space-y-1">
                  <InfoItem icon={Tag} label="Type" value={translateType(offre.type)} />
                  <InfoItem icon={Calendar} label="Début Prévu" value={formatDate(offre.date_debut)} />
                  {offre.duree && <InfoItem icon={Clock} label="Durée" value={`${offre.duree} mois`} />}
                  {offre.remuneration && (
                    <InfoItem icon={Award} label="Rémunération">
                        {offre.remuneration} MAD {offre.type === 'emploi' ? <span className="text-xs text-gray-500">/an</span> : <span className="text-xs text-gray-500">/mois</span>}
                    </InfoItem>
                  )}
                  <InfoItem icon={Users} label="Niveau Requis">
                    <Badge color={getNiveauColor(offre.niveau_requis)}>
                      {offre.niveau_requis || 'Non spécifié'}
                    </Badge>
                  </InfoItem>
                   <InfoItem icon={Clock} label="Publiée le" value={formatDate(offre.created_at)} />
                </ul>
              </div>

              {/* Company Card */}
              {entreprise && (
                <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">À propos de {entreprise.nom_entreprise}</h2>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-teal-600 font-bold text-xl mr-4 flex-shrink-0 overflow-hidden">
                      {entreprise.logo ? (
                        <img
                          src={`/storage/${entreprise.logo}`} // Adjust path as needed
                          alt={`${entreprise.nom_entreprise} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display='none'} // Hide img on error
                        />
                      ) : (
                        entreprise.nom_entreprise?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{entreprise.nom_entreprise}</h3>
                      <p className="text-sm text-gray-500">{entreprise.secteur_activite}</p>
                    </div>
                  </div>

                  {entreprise.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-4">
                      {entreprise.description}
                    </p>
                  )}

                  {entreprise.site_web && (
                    <a
                      href={entreprise.site_web.startsWith('http') ? entreprise.site_web : `https://${entreprise.site_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-teal-600 hover:text-teal-800 hover:underline"
                    >
                      Visiter le site web
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  )}
                </div>
              )}

              {/* Apply Button Section */}
              <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-200 sticky top-4">
                {canApply() ? (
                  <button
                    onClick={handleOpenModal}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    <Send size={18} className="mr-2" />
                    Postuler maintenant
                  </button>
                ) : candidatureStatus ? (
                    <div className="text-center p-4 bg-green-50 rounded-md border border-green-200">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-green-800 mb-1">Vous avez déjà postulé</p>
                       <Link
                          to={`/candidatures/${candidatureStatus.candidature_id}`}
                          className="text-sm text-teal-600 hover:text-teal-800 underline"
                        >
                          Voir ma candidature
                       </Link>
                    </div>
                ) : !isAuthenticated ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-3 text-sm">Connectez-vous pour postuler.</p>
                      <Link
                        to={`/login?redirect=/offres/${id}`}
                        state={{ from: `/offres/${id}` }} // Pass redirect state
                        className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200"
                      >
                        Se connecter
                      </Link>
                    </div>
                ) : user?.role === 'entreprise' && offre?.entreprise?.user_id === user?.id ? (
                    <div className="text-center p-4 bg-blue-50 rounded-md border border-blue-200">
                        <Info className="mx-auto h-6 w-6 text-blue-500 mb-2" />
                         <p className="text-sm text-blue-800">Ceci est votre offre.</p>
                         <Link
                            to={`/entreprise/offres/${id}/candidatures`} // Example link to view applications for this job
                            className="text-sm text-teal-600 hover:text-teal-800 underline mt-1 inline-block"
                         >
                            Voir les candidatures
                        </Link>
                    </div>
                 ) : user?.role === 'entreprise' ? (
                     <div className="text-center p-4 bg-yellow-50 rounded-md border border-yellow-200">
                        <AlertTriangle className="mx-auto h-6 w-6 text-yellow-500 mb-2" />
                        <p className="text-sm text-yellow-800">Les comptes entreprise ne peuvent pas postuler.</p>
                    </div>
                ) : (
                   // Generic fallback if none of the above match
                   <div className="text-center p-4 bg-gray-100 rounded-md border border-gray-200">
                       <p className="text-sm text-gray-600">Action non disponible.</p>
                   </div>
                )}
              </div>
            </div> {/* End Sidebar */}
          </div> {/* End Grid */}

          {/* Similar Offers */}
          {similarOffres.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Offres similaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarOffres.map(simOffre => (
                  <Link
                    key={simOffre.id}
                    to={`/offres/${simOffre.id}`}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-5"
                  >
                    <div className="flex justify-between items-start mb-1">
                         <h3 className="font-semibold text-gray-900 group-hover:text-teal-600">{simOffre.titre}</h3>
                         <Badge color={getTypeColor(simOffre.type)}>{translateType(simOffre.type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{simOffre.entreprise?.nom_entreprise || 'Entreprise'}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin size={12} className="mr-1 flex-shrink-0" />
                      <span>{simOffre.localisation || 'Non spécifié'}</span>
                      <span className="mx-2 text-gray-300">•</span>
                       <Calendar size={12} className="mr-1 flex-shrink-0" />
                       <span>Publiée {formatDate(simOffre.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div> {/* End Container */}
      </div> {/* End Background */}

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-5">
                <h2 className="text-xl font-semibold text-gray-900">Postuler : <span className="font-bold">{offre.titre}</span></h2>
                <button
                  onClick={() => !submitting && setShowModal(false)} // Prevent closing while submitting/showing success
                  disabled={submitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 -mt-1 -mr-1 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  <X size={24} />
                </button>
              </div>

              {modalSuccess ? (
                  <Alert type="success" title="Candidature Envoyée !">
                      {modalSuccess}
                       {offre.test_requis && <p className="mt-2 text-sm">Vous allez être redirigé vers le test...</p>}
                  </Alert>
              ) : (
                <form onSubmit={handleSubmitCandidature} className="space-y-5">
                  {modalError && <Alert type="error" title="Erreur">{modalError}</Alert>}

                  <div>
                    <label htmlFor="lettre_motivation" className="block text-sm font-medium text-gray-700 mb-1">
                      Lettre de motivation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="lettre_motivation"
                      rows="8" // Reduced rows for modal context
                      value={lettreMotivation}
                      onChange={(e) => setLettreMotivation(e.target.value)}
                      placeholder="Rédigez ici votre lettre de motivation. Expliquez votre intérêt pour le poste et mettez en avant vos qualifications pertinentes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      required
                      minLength="100"
                    />
                    <p className={`text-xs mt-1 ${lettreMotivation.length < 100 ? 'text-red-500' : 'text-gray-500'}`}>
                      {lettreMotivation.length} / 100 caractères minimum
                    </p>
                  </div>

                  {offre.test_requis && (
                    <Alert type="warning" title="Test de Compétences Requis">
                      Après avoir soumis votre candidature, vous devrez compléter un test.
                    </Alert>
                  )}

                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || lettreMotivation.trim().length < 100}
                      className={`inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
      )} {/* End Modal */}

      {/* Add CSS for modal animation if not already globally defined */}
      <style jsx global>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>

    </MainLayout>
  );
};

export default JobDetail;