import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Briefcase, 
  MapPin, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Award, 
  CheckCircle,
  Building,
  Globe,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const MultiStepRegistration = () => {
  // État pour suivre l'étape actuelle (0, 1, 2)
  const [currentStep, setCurrentStep] = useState(0);
  
  // État pour suivre la direction de l'animation (1 pour avant, -1 pour arrière)
  const [direction, setDirection] = useState(1);

  // État pour le type de compte (étudiant ou entreprise)
  const [accountType, setAccountType] = useState('etudiant');

  // État pour les erreurs d'inscription
  const [errors, setErrors] = useState({});
  
  // État pour le message de succès
  const [successMessage, setSuccessMessage] = useState('');

  // État pour indiquer si le formulaire est en cours d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour stocker toutes les données du formulaire
  const [formData, setFormData] = useState({
    // Étape 1: Informations de base (compte)
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'etudiant',
    
    // Étape 2: Informations personnelles (étudiant)
    date_naissance: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    
    // Étape 2 alternatif: Informations entreprise
    nom_entreprise: '',
    description: '',
    secteur_activite: '',
    taille: '',
    site_web: '',
    
    // Étape 3: Informations professionnelles (étudiant)
    niveau_etude: '',
    filiere: '',
    ecole: '',
    annee_diplome: '',
    disponibilite: 'immédiate',
    competences: '',
    cv_file: null
  });

  useEffect(() => {
    // Mettre à jour le rôle dans formData lorsque accountType change
    setFormData(prev => ({
      ...prev,
      role: accountType
    }));
  }, [accountType]);

  // Fonction pour vérifier si les champs de l'étape actuelle sont remplis
  const isCurrentStepValid = () => {
    if (currentStep === 0) {
      const { nom, prenom, email, password, password_confirmation } = formData;
      return (
        nom.trim() !== '' && 
        prenom.trim() !== '' && 
        email.trim() !== '' && 
        password.trim() !== '' && 
        password_confirmation.trim() !== '' &&
        password === password_confirmation
      );
    } else if (currentStep === 1) {
      if (accountType === 'etudiant') {
        const { date_naissance, telephone, ville } = formData;
        return (
          date_naissance.trim() !== '' && 
          telephone.trim() !== '' && 
          ville.trim() !== ''
        );
      } else {
        const { nom_entreprise, secteur_activite, ville } = formData;
        return (
          nom_entreprise.trim() !== '' && 
          secteur_activite.trim() !== '' && 
          ville.trim() !== ''
        );
      }
    } else if (currentStep === 2 && accountType === 'etudiant') {
      const { niveau_etude, filiere, ecole } = formData;
      return (
        niveau_etude.trim() !== '' && 
        filiere.trim() !== '' && 
        ecole.trim() !== ''
      );
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur de ce champ s'il y en avait une
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      cv_file: e.target.files[0]
    }));
  };

  const nextStep = () => {
    if (currentStep < 2 && isCurrentStepValid()) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((currentStep === 2 || (currentStep === 1 && accountType === 'entreprise')) && isCurrentStepValid()) {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        // Obtenir le cookie CSRF d'abord
          
        // Préparer les données à envoyer
        const dataToSend = new FormData();
        
        // Ajouter toutes les données du formulaire
        Object.keys(formData).forEach(key => {
          if (key === 'competences' && formData[key]) {
            // Convertir la chaîne de compétences séparées par des virgules en tableau
            const competencesArray = formData[key].split(',').map(comp => comp.trim());
            dataToSend.append('competences', JSON.stringify(competencesArray));
          } else if (key === 'cv_file' && formData[key]) {
            dataToSend.append('cv_file', formData[key]);
          } else if (formData[key] !== null && formData[key] !== undefined) {
            dataToSend.append(key, formData[key]);
          }
        });
        
        // Envoyer la requête au backend
        const response = await axios.post('http://localhost:8000/api/auth/register', dataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest' // Important pour Sanctum
          },
          withCredentials: true
        });
        
        // Gérer la réponse réussie
        setSuccessMessage('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.');
        
        // Réinitialiser le formulaire après un délai
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } catch (error) {
        // Afficher les erreurs de validation
        if (error.response && error.response.status === 422) {
          console.log('Erreurs de validation:', error.response.data.errors);
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: 'Une erreur est survenue lors de l\'inscription.' });
        }
      }}
  };

  // Variants pour les animations
  const slideVariants = {
    enterRight: {
      x: 300,
      opacity: 0
    },
    enterLeft: {
      x: -300,
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    exitRight: {
      x: 300,
      opacity: 0
    },
    exitLeft: {
      x: -300,
      opacity: 0
    }
  };

  // Informations pour chaque étape
  const getStepInfo = () => {
    const baseSteps = [
      {
        title: "Créer un Compte",
        subtitle: "Commencez votre inscription",
        progress: 33
      }
    ];
    
    if (accountType === 'etudiant') {
      return [
        ...baseSteps,
        {
          title: "Informations Personnelles",
          subtitle: "Parlez-nous de vous",
          progress: 66
        },
        {
          title: "Profil Étudiant",
          subtitle: "Complétez votre profil académique",
          progress: 100
        }
      ];
    } else {
      return [
        ...baseSteps,
        {
          title: "Informations Entreprise",
          subtitle: "Détails de votre organisation",
          progress: 100
        }
      ];
    }
  };
  
  const steps = getStepInfo();

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Entête avec progression */}
      <div className="bg-gradient-to-br from-teal-500 to-sky-400 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">{steps[currentStep].title}</h2>
        <p className="text-teal-50 mb-4">{steps[currentStep].subtitle}</p>
        
        {/* Barre de progression */}
        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${steps[currentStep].progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Indicateurs d'étapes */}
        <div className="flex justify-between mt-4">
          {steps.map((_, index) => (
            <motion.div 
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index === currentStep 
                  ? 'bg-white text-teal-500' 
                  : index < currentStep 
                    ? 'bg-teal-300 text-white' 
                    : 'bg-white/30 text-white'
              }`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {index < currentStep ? <CheckCircle size={16} /> : index + 1}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Corps du formulaire */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Erreur générale */}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errors.general}</span>
          </div>
        )}
        
        {/* Sélection du type de compte (uniquement à l'étape 0) */}
        {currentStep === 0 && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 text-sm">Type de compte</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAccountType('etudiant')}
                className={`p-3 rounded-lg border flex items-center justify-center transition-colors duration-300 ${
                  accountType === 'etudiant' 
                    ? 'border-teal-500 bg-teal-50 text-teal-600' 
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <GraduationCap size={20} className="mr-2" />
                Étudiant
              </button>
              <button
                type="button"
                onClick={() => setAccountType('entreprise')}
                className={`p-3 rounded-lg border flex items-center justify-center transition-colors duration-300 ${
                  accountType === 'entreprise' 
                    ? 'border-teal-500 bg-teal-50 text-teal-600' 
                    : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Building size={20} className="mr-2" />
                Entreprise
              </button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial={direction > 0 ? "enterRight" : "enterLeft"}
            animate="center"
            exit={direction > 0 ? "exitLeft" : "exitRight"}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Étape 1: Informations de compte */}
            {currentStep === 0 && (
              <>
                <div className="space-y-4 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-gray-700 mb-2 text-sm">Nom</label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          name="nom"
                          placeholder="Votre nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                            errors.nom ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                          }`}
                          required
                        />
                      </div>
                      {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                    </div>
                    
                    <div className="relative">
                      <label className="block text-gray-700 mb-2 text-sm">Prénom</label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                          <User size={16} />
                        </div>
                        <input
                          type="text"
                          name="prenom"
                          placeholder="Votre prénom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                            errors.prenom ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                          }`}
                          required
                        />
                      </div>
                      {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 mb-2 text-sm">Adresse Email</label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Entrez votre email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                          errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 mb-2 text-sm">Mot de Passe</label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        name="password"
                        placeholder="Créez un mot de passe (6 caractères min.)"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                          errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                        }`}
                        required
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  
                  <div className="relative">
                    <label className="block text-gray-700 mb-2 text-sm">Confirmez le Mot de Passe</label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        name="password_confirmation"
                        placeholder="Confirmez votre mot de passe"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                          formData.password !== formData.password_confirmation ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                        }`}
                        required
                      />
                    </div>
                    {formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation && (
                      <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Étape 2: Informations personnelles (étudiant) */}
            {currentStep === 1 && accountType === 'etudiant' && (
              <>
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Date de naissance</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.date_naissance ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.date_naissance && <p className="text-red-500 text-xs mt-1">{errors.date_naissance}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Téléphone</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Votre numéro de téléphone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.telephone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Adresse</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="adresse"
                      placeholder="Votre adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.adresse ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    />
                  </div>
                  {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Ville</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="ville"
                      placeholder="Votre ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.ville ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Code Postal</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="code_postal"
                      placeholder="Code postal"
                      value={formData.code_postal}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.code_postal ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    />
                  </div>
                  {errors.code_postal && <p className="text-red-500 text-xs mt-1">{errors.code_postal}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Pays</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Globe size={16} />
                    </div>
                    <select
                      name="pays"
                      value={formData.pays}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.pays ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                      <option value="Maroc">Maroc</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  {errors.pays && <p className="text-red-500 text-xs mt-1">{errors.pays}</p>}
                </div>
              </>
            )}
            
            {/* Étape 2: Informations entreprise */}
            {currentStep === 1 && accountType === 'entreprise' && (
              <>
                <div className="relative md:col-span-2">
                  <label className="block text-gray-700 mb-2 text-sm">Nom de l'entreprise</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Building size={16} />
                    </div>
                    <input
                      type="text"
                      name="nom_entreprise"
                      placeholder="Nom de votre entreprise"
                      value={formData.nom_entreprise}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.nom_entreprise ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.nom_entreprise && <p className="text-red-500 text-xs mt-1">{errors.nom_entreprise}</p>}
                </div>
                
                <div className="relative md:col-span-2">
                  <label className="block text-gray-700 mb-2 text-sm">Description</label>
                  <div className="relative group">
                    <textarea
                      name="description"
                      placeholder="Description de votre entreprise"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    />
                  </div>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Secteur d'activité</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Briefcase size={16} />
                    </div>
                    <select
                      name="secteur_activite"
                      value={formData.secteur_activite}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.secteur_activite ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez un secteur</option>
                      <option value="Technologie">Technologie</option>
                      <option value="Finance">Finance</option>
                      <option value="Santé">Santé</option>
                      <option value="Éducation">Éducation</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Communication">Communication</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  {errors.secteur_activite && <p className="text-red-500 text-xs mt-1">{errors.secteur_activite}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Taille de l'entreprise</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <User size={16} />
                    </div>
                    <select
                      name="taille"
                      value={formData.taille}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.taille ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    >
                      <option value="">Sélectionnez la taille</option>
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-500">201-500 employés</option>
                      <option value="501+">Plus de 500 employés</option>
                    </select>
                  </div>
                  {errors.taille && <p className="text-red-500 text-xs mt-1">{errors.taille}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Site web</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      name="site_web"
                      placeholder="https://www.exemple.com"
                      value={formData.site_web}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.site_web ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    />
                  </div>
                  {errors.site_web && <p className="text-red-500 text-xs mt-1">{errors.site_web}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Téléphone</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="Numéro de téléphone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.telephone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Ville</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="ville"
                      placeholder="Ville"
                      value={formData.ville}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.ville ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.ville && <p className="text-red-500 text-xs mt-1">{errors.ville}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Code postal</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      name="code_postal"
                      placeholder="Code postal"
                      value={formData.code_postal}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.code_postal ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    />
                  </div>
                  {errors.code_postal && <p className="text-red-500 text-xs mt-1">{errors.code_postal}</p>}
                </div>
              </>
            )}
            
            {/* Étape 3: Informations professionnelles (étudiant) */}
            {currentStep === 2 && accountType === 'etudiant' && (
              <>
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Niveau d'études</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <GraduationCap size={16} />
                    </div>
                    <select
                      name="niveau_etude"
                      value={formData.niveau_etude}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.niveau_etude ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez votre niveau</option>
                      <option value="Bac">Bac</option>
                      <option value="Bac+1">Bac+1</option>
                      <option value="Bac+2">Bac+2</option>
                      <option value="Bac+3">Bac+3</option>
                      <option value="Bac+4">Bac+4</option>
                      <option value="Bac+5">Bac+5</option>
                      <option value="Doctorat">Doctorat</option>
                    </select>
                  </div>
                  {errors.niveau_etude && <p className="text-red-500 text-xs mt-1">{errors.niveau_etude}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Filière</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <GraduationCap size={16} />
                    </div>
                    <input
                      type="text"
                      name="filiere"
                      placeholder="Votre filière d'études"
                      value={formData.filiere}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.filiere ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.filiere && <p className="text-red-500 text-xs mt-1">{errors.filiere}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">École/Université</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Award size={16} />
                    </div>
                    <input
                      type="text"
                      name="ecole"
                      placeholder="Nom de votre école"
                      value={formData.ecole}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.ecole ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.ecole && <p className="text-red-500 text-xs mt-1">{errors.ecole}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Année d'obtention du diplôme</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Calendar size={16} />
                    </div>
                    <select
                      name="annee_diplome"
                      value={formData.annee_diplome}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.annee_diplome ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    >
                      <option value="">Sélectionnez l'année</option>
                      {[...Array(10)].map((_, i) => {
                        const year = new Date().getFullYear() + i - 4;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.annee_diplome && <p className="text-red-500 text-xs mt-1">{errors.annee_diplome}</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-gray-700 mb-2 text-sm">Disponibilité</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Calendar size={16} />
                    </div>
                    <select
                      name="disponibilite"
                      value={formData.disponibilite}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none bg-white ${
                        errors.disponibilite ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                    >
                      <option value="immédiate">Immédiate</option>
                      <option value="1_mois">Dans 1 mois</option>
                      <option value="3_mois">Dans 3 mois</option>
                      <option value="6_mois">Dans 6 mois</option>
                    </select>
                  </div>
                  {errors.disponibilite && <p className="text-red-500 text-xs mt-1">{errors.disponibilite}</p>}
                </div>
                
                <div className="relative md:col-span-2">
                  <label className="block text-gray-700 mb-2 text-sm">Compétences</label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3 top-8 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                      <Award size={16} />
                    </div>
                    <textarea
                      name="competences"
                      placeholder="Listez vos compétences principales (séparées par des virgules)"
                      value={formData.competences}
                      onChange={handleInputChange}
                      className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.competences ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                      }`}
                      rows="3"
                    />
                  </div>
                  {errors.competences && <p className="text-red-500 text-xs mt-1">{errors.competences}</p>}
                </div>
                
                <div className="relative md:col-span-2">
                  <label className="block text-gray-700 mb-2 text-sm">CV (PDF)</label>
                  <div className="relative flex items-center group">
                    <div className="relative w-full flex items-center">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300">
                        <FileText size={16} />
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className={`w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                          errors.cv_file ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-teal-300'
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Téléchargez votre CV au format PDF (taille max: 5MB)</p>
                  {errors.cv_file && <p className="text-red-500 text-xs mt-1">{errors.cv_file}</p>}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Boutons de navigation */}
        <div className="flex justify-between mt-8">
          <motion.button
            type="button"
            onClick={prevStep}
            className={`px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={currentStep === 0}
            whileHover={{ scale: currentStep === 0 ? 1 : 1.05 }}
            whileTap={{ scale: currentStep === 0 ? 1 : 0.95 }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Précédent
          </motion.button>
          
          <motion.button
            type={
              (currentStep === 2 && accountType === 'etudiant') || 
              (currentStep === 1 && accountType === 'entreprise') 
                ? "submit" 
                : "button"
            }
            onClick={
              !((currentStep === 2 && accountType === 'etudiant') || 
              (currentStep === 1 && accountType === 'entreprise')) 
                ? nextStep 
                : undefined
            }
            disabled={!isCurrentStepValid() || isSubmitting}
            className={`px-6 py-3 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isCurrentStepValid() && !isSubmitting
                ? 'bg-teal-500 text-white hover:bg-teal-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={{ scale: isCurrentStepValid() && !isSubmitting ? 1.05 : 1 }}
            whileTap={{ scale: isCurrentStepValid() && !isSubmitting ? 0.95 : 1 }}
          >
            {isSubmitting ? (
              <span>Traitement en cours...</span>
            ) : (
              <>
                {(currentStep === 2 && accountType === 'etudiant') || 
                 (currentStep === 1 && accountType === 'entreprise') 
                  ? 'Finaliser' 
                  : 'Suivant'}
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default MultiStepRegistration;