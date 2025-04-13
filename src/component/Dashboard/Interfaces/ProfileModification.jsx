import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  FileText,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building,
  Clock
} from 'lucide-react';
import { useAuth } from '../../Authentication/AuthContext';
import CompetenceSelector from '../../Authentication/CompetenceSelector';

const ProfileModification = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCompetenceSelector, setShowCompetenceSelector] = useState(false);
  const [selectedCompetences, setSelectedCompetences] = useState([]);
  const [availableCompetences, setAvailableCompetences] = useState([]); // ✅ Added missing state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer les changements de fichiers
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (files && files[0]) {
      // Mettre à jour l'état du fichier dans formData
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Créer un aperçu du fichier
      const reader = new FileReader();
      reader.onload = (event) => {
        if (name === 'photo') {
          setFilePreview(prev => ({ ...prev, photo: event.target.result }));
        } else if (name === 'cv_file') {
          setFilePreview(prev => ({ ...prev, cv: event.target.result }));
        } else if (name === 'logo') {
          setFilePreview(prev => ({ ...prev, logo: event.target.result }));
        }
      };
      
      // Lecture différente selon le type de fichier
      if (name === 'cv_file' && files[0].type === 'application/pdf') {
        // Pour les PDF, on peut juste mettre un indicateur visuel
        setFilePreview(prev => ({ 
          ...prev, 
          cv: `Fichier sélectionné: ${files[0].name}` 
        }));
      } else {
        // Pour les images, on génère un aperçu
        reader.readAsDataURL(files[0]);
      }
      
      // Validation additionnelle selon le type de fichier
      if ((name === 'photo' || name === 'logo') && !files[0].type.startsWith('image/')) {
        setError(`Le fichier ${name === 'photo' ? 'photo' : 'logo'} doit être une image.`);
        
        // Réinitialiser le champ
        setFormData(prev => ({
          ...prev,
          [name]: null
        }));
        
        // Réinitialiser l'aperçu
        if (name === 'photo') {
          setFilePreview(prev => ({ ...prev, photo: null }));
        } else if (name === 'logo') {
          setFilePreview(prev => ({ ...prev, logo: null }));
        }
        
        return;
      }
      
      // Vérifier la taille du fichier
      const maxSize = name === 'cv_file' ? 5242880 : 2097152; // 5MB pour CV, 2MB pour images
      if (files[0].size > maxSize) {
        const fileType = name === 'cv_file' ? 'CV' : (name === 'photo' ? 'photo' : 'logo');
        const maxSizeMB = maxSize / (1024 * 1024);
        
        setError(`Le fichier ${fileType} ne doit pas dépasser ${maxSizeMB}MB.`);
        
        // Réinitialiser le champ
        setFormData(prev => ({
          ...prev,
          [name]: null
        }));
        
        // Réinitialiser l'aperçu correspondant
        setFilePreview(prev => ({ 
          ...prev, 
          [name === 'cv_file' ? 'cv' : (name === 'photo' ? 'photo' : 'logo')]: null 
        }));
      }
    }
  };
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    photo: null,
    date_naissance: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    niveau_etude: '',
    filiere: '',
    ecole: '',
    annee_diplome: '',
    disponibilite: 'immédiate',
    linkedin_url: '',
    portfolio_url: '',
    cv_file: null,
    nom_entreprise: '',
    description: '',
    secteur_activite: '',
    taille: '',
    site_web: '',
    logo: null,
  });
  
  const [filePreview, setFilePreview] = useState({
    photo: null,
    cv: null,
    logo: null
  });

  const isEtudiant = user?.role === 'etudiant';
  const isEntreprise = user?.role === 'entreprise';

  // ✅ Move fetchProfileData OUTSIDE useEffect
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const endpoint = isEtudiant ? '/api/etudiant/profile' : '/api/entreprise/profile';
      const response = await axios.get(endpoint);
      console.group('Récupération du profil');
      console.log('Type de profil:', isEtudiant ? 'Étudiant' : 'Entreprise');
      console.log('Endpoint utilisé:', endpoint);
      console.log('Réponse complète:', response.data);
      console.log('Clés de la réponse:', Object.keys(response.data));
      console.groupEnd();
      
      // Mettre à jour les informations de base de l'utilisateur
      if (response.data.user) {
        const userData = response.data.user;
        setFormData(prev => ({
          ...prev,
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          telephone: userData.telephone || '',
          photo: userData.photo || null
        }));
  
        // Aperçu de la photo
        if (userData.photo) {
          setFilePreview(prev => ({ ...prev, photo: userData.photo }));
        }
      }

      if (isEtudiant && response.data.etudiant) {
        const etudiantData = response.data.etudiant;
        
        // Mettre à jour tous les champs de l'étudiant
        setFormData(prev => ({
          ...prev,
          date_naissance: etudiantData.date_naissance 
            ? new Date(etudiantData.date_naissance).toISOString().split('T')[0] 
            : '',
          adresse: etudiantData.adresse || '',
          ville: etudiantData.ville || '',
          code_postal: etudiantData.code_postal || '',
          pays: etudiantData.pays || 'France',
          niveau_etude: etudiantData.niveau_etude || '',
          filiere: etudiantData.filiere || '',
          ecole: etudiantData.ecole || '',
          annee_diplome: etudiantData.annee_diplome || '',
          disponibilite: etudiantData.disponibilite || 'immédiate',
          linkedin_url: etudiantData.linkedin_url || '',
          portfolio_url: etudiantData.portfolio_url || '',
          cv_file: etudiantData.cv_file || null
        }));
      
        // Charger les compétences
        if (etudiantData.competences?.length) {
          const formatted = etudiantData.competences.map(comp => ({
            id: comp.id,
            nom: comp.nom,
            niveau: comp.pivot?.niveau || 'débutant',
            categorie: comp.categorie
          }));
          setSelectedCompetences(formatted);
        }
      
        // Aperçu du CV
        if (etudiantData.cv_url) {
          setFilePreview(prev => ({ ...prev, cv: etudiantData.cv_url }));
        }
      }

      if (isEntreprise && response.data.entreprise) {
        const entrepriseData = response.data.entreprise;
        const userData = response.data.user;
      
        setFormData(prev => ({
          ...prev,
          // Informations utilisateur
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
          telephone: userData.telephone || '',
      
          // Informations entreprise
          nom_entreprise: entrepriseData.nom_entreprise || '',
          description: entrepriseData.description || '',
          secteur_activite: entrepriseData.secteur_activite || '',
          taille: entrepriseData.taille || '',
          site_web: entrepriseData.site_web || '',
          adresse: entrepriseData.adresse || '',
          ville: entrepriseData.ville || '',
          code_postal: entrepriseData.code_postal || '',
          pays: entrepriseData.pays || 'France'
        }));
      
        // Gestion du logo
        if (entrepriseData.logo_url) {
          setFilePreview(prev => ({ 
            ...prev, 
            logo: entrepriseData.logo_url 
          }));
        }
      }
      setLoading(false);
    } catch (error) {
      
      console.error('Erreur lors de la récupération du profil:', error);
      if (error.response?.status === 401) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setError('Accès interdit.');
      } else if (error.response?.status === 404) {
        setError('Profil non trouvé.');
      } else {
        setError('Erreur lors du chargement du profil.');
      }
      setLoading(false);
    }
  };
  // Soumettre le formulaire
const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError(null);
  setSuccess(null);
  
  try {
    // Préparer les données
    const formDataToSend = new FormData();
    
    // Ajouter les données communes
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('telephone', formData.telephone);
    
    // Ajouter la photo si modifiée
    if (formData.photo instanceof File) {
      formDataToSend.append('photo', formData.photo);
    }
    
    // Ajouter les données spécifiques à l'étudiant
    if (isEtudiant) {
      formDataToSend.append('date_naissance', formData.date_naissance);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('code_postal', formData.code_postal);
      formDataToSend.append('pays', formData.pays);
      formDataToSend.append('niveau_etude', formData.niveau_etude);
      formDataToSend.append('filiere', formData.filiere);
      formDataToSend.append('ecole', formData.ecole);
      formDataToSend.append('annee_diplome', formData.annee_diplome);
      formDataToSend.append('disponibilite', formData.disponibilite);
      formDataToSend.append('linkedin_url', formData.linkedin_url);
      formDataToSend.append('portfolio_url', formData.portfolio_url);
      
      // Ajouter le CV si modifié
      if (formData.cv_file instanceof File) {
        formDataToSend.append('cv_file', formData.cv_file);
      }
      
      // Ajouter les compétences
      if (selectedCompetences.length > 0) {
        formDataToSend.append('competences', JSON.stringify(selectedCompetences.map(comp => ({
          id: comp.id,
          niveau: comp.niveau || 'débutant'
        }))));
      }
    }
    
    // Ajouter les données spécifiques à l'entreprise
    if (isEntreprise) {
      formDataToSend.append('nom_entreprise', formData.nom_entreprise);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('secteur_activite', formData.secteur_activite);
      formDataToSend.append('taille', formData.taille);
      formDataToSend.append('site_web', formData.site_web);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('code_postal', formData.code_postal);
      formDataToSend.append('pays', formData.pays);
      
      // Ajouter le logo si modifié
      if (formData.logo instanceof File) {
        formDataToSend.append('logo', formData.logo);
      }
    }
    
    // Endpoint différent selon le rôle
    const endpoint = isEtudiant ? '/api/etudiant/profile' : '/api/entreprise/profile';
    
    // Envoyer la requête
    const response = await axios.post(endpoint, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Profil mis à jour:', response.data);
    
    setSuccess('Profil mis à jour avec succès !');
    
    // Nettoyer le cache du dashboard
    localStorage.removeItem('dashboard_data');
    
    // Rafraîchir les données utilisateur
    await checkAuth();
    
    // Rediriger vers le dashboard après un délai
    setTimeout(() => {
      navigate('/dashboard?refresh=true');
    }, 1500);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.response && error.response.data) {
      // Afficher des erreurs spécifiques si disponibles
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setError(errorMessages.join(' '));
      } else if (error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError(`Erreur ${error.response.status}: Veuillez vérifier vos informations.`);
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse
      setError('Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion internet.');
    } else {
      // Erreur lors de la configuration de la requête
      setError('Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.');
    }
  } finally {
    setSaving(false);
  }
  
};

useEffect(() => {
  if (user && (isEtudiant || isEntreprise)) {
    fetchProfileData();
  } else if (user && !isEtudiant && !isEntreprise) {
    setError('Type de profil non pris en charge.');
    setLoading(false);
  }
}, [user, isEtudiant, isEntreprise, navigate]);


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
              Modifier mon profil
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Mettez à jour vos informations personnelles et professionnelles
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
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Informations personnelles
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Photo de profil */}
              <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-24 h-24 relative">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {filePreview.photo ? (
                      <img 
                        src={filePreview.photo} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover"
                      />
                    ) : user?.photo ? (
                      <img 
                        src={user.photo} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo de profil
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou GIF. Taille maximale de 2Mo.
                  </p>
                </div>
              </div>
              
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Contactez le support pour modifier votre adresse email.
                </p>
              </div>
              
              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations d'adresse */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Adresse
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Adresse */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              {/* Code postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              {/* Pays */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Maroc">Maroc</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Informations étudiant */}
          {isEtudiant && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Informations académiques
                </h2>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Date de naissance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Calendar size={16} />
                      </div>
                      <input
                        type="date"
                        name="date_naissance"
                        value={formData.date_naissance}
                        onChange={handleChange}
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Niveau d'études */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau d'études
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <GraduationCap size={16} />
                      </div>
                      <select
                        name="niveau_etude"
                        value={formData.niveau_etude}
                        onChange={handleChange}
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Sélectionnez</option>
                        <option value="Bac">Bac</option>
                        <option value="Bac+1">Bac+1</option>
                        <option value="Bac+2">Bac+2</option>
                        <option value="Bac+3">Bac+3</option>
                        <option value="Bac+4">Bac+4</option>
                        <option value="Bac+5">Bac+5</option>
                        <option value="Doctorat">Doctorat</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Filière */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filière
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <GraduationCap size={16} />
                      </div>
                      <input
                        type="text"
                        name="filiere"
                        value={formData.filiere}
                        onChange={handleChange}
                        placeholder="Ex: Informatique, Commerce..."
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* École */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      École/Université
                    </label>
                    <input
                      type="text"
                      name="ecole"
                      value={formData.ecole}
                      onChange={handleChange}
                      placeholder="Nom de votre établissement"
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  {/* Année diplôme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année d'obtention du diplôme
                    </label>
                    <select
                      name="annee_diplome"
                      value={formData.annee_diplome}
                      onChange={handleChange}
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Sélectionnez</option>
                      {[...Array(10)].map((_, i) => {
                        const year = new Date().getFullYear() + i - 5;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {/* Disponibilité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disponibilité
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Clock size={16} />
                      </div>
                      <select
                        name="disponibilite"
                        value={formData.disponibilite}
                        onChange={handleChange}
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="immédiate">Immédiate</option>
                        <option value="1_mois">Dans 1 mois</option>
                        <option value="3_mois">Dans 3 mois</option>
                        <option value="6_mois">Dans 6 mois</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Liens et Compétences
                </h2>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Globe size={16} />
                      </div>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/votre-profil"
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Portfolio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site personnel / Portfolio
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Globe size={16} />
                      </div>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                        placeholder="https://votresite.com"
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  {/* Compétences */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compétences
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCompetenceSelector(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">
                        {selectedCompetences.length === 0 
                          ? 'Cliquez pour sélectionner vos compétences' 
                          : `${selectedCompetences.length} compétence(s) sélectionnée(s)`}
                      </span>
                      <span className="text-teal-500">Modifier</span>
                    </button>
                    
                    {selectedCompetences.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCompetences.map(comp => (
                          <span 
                            key={comp.id} 
                            className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs flex items-center"
                          >
                            {comp.nom}
                            {comp.niveau && <span className="ml-1 text-teal-500">• {comp.niveau}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* CV */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CV (PDF)
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <FileText size={16} />
                      </div>
                      <input
                        type="file"
                        name="cv_file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Format PDF uniquement. Taille maximale de 5Mo.
                    </p>
                    
                    {filePreview.cv && (
                      <div className="mt-2 flex items-center text-sm text-teal-600">
                        <CheckCircle size={16} className="mr-1" />
                        CV actuel disponible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Informations entreprise */}
          {isEntreprise && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Informations de l'entreprise
              </h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Logo */}
                <div className="md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <div className="w-full h-full rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                      {filePreview.logo ? (
                        <img 
                          src={filePreview.logo} 
                          alt="Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building size={32} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo de l'entreprise
                    </label>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF. Taille maximale de 2Mo.
                    </p>
                  </div>
                </div>
                
                {/* Nom entreprise */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Building size={16} />
                    </div>
                    <input
                      type="text"
                      name="nom_entreprise"
                      value={formData.nom_entreprise}
                      onChange={handleChange}
                      className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description }
                    onChange={handleChange}
                    rows="4"
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>
                
                {/* Secteur d'activité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secteur d'activité
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Briefcase size={16} />
                    </div>
                    <select
                      name="secteur_activite"
                      value={formData.secteur_activite}
                      onChange={handleChange}
                      className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Finance">Finance</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Industrie">Industrie</option>
                      <option value="Santé">Santé</option>
                      <option value="Communication">Communication</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
                
                {/* Taille */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taille de l'entreprise
                  </label>
                  <select
                    name="taille"
                    value={formData.taille}
                    onChange={handleChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="1-10">1-10 employés</option>
                    <option value="11-50">11-50 employés</option>
                    <option value="51-200">51-200 employés</option>
                    <option value="201-500">201-500 employés</option>
                    <option value="501+">Plus de 500 employés</option>
                  </select>
                </div>
                
                {/* Site web */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      name="site_web"
                      value={formData.site_web}
                      onChange={handleChange}
                      placeholder="https://entreprise.com"
                      className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
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
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Sélecteur de compétences (Modal) */}
      {showCompetenceSelector && (
        <CompetenceSelector
          selectedCompetences={selectedCompetences}
          onCompetencesChange={setSelectedCompetences}
          onClose={() => setShowCompetenceSelector(false)}
        />
      )}
    </div>
  );
};

export default ProfileModification;