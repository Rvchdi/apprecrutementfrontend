import React, { useState } from 'react';
import { 
  Search, 
  Briefcase, 
  MapPin, 
  Clock, 
  Filter,
  ChevronRight,
  Star,
  BookOpen,
  Calendar,
  Tag,
  X,
  AlertCircle
} from 'lucide-react';

const OffresEtudiant = () => {
  // États pour gérer les filtres et les données
  const [searchQuery, setSearchQuery] = useState('');
  const [filtreActif, setFiltreActif] = useState(false);
  const [filtres, setFiltres] = useState({
    type: [],
    localisation: [],
    competences: []
  });
  
  // Données d'exemple pour les offres
  const offres = [
    {
      id: 1,
      titre: "Développeur Full Stack",
      entreprise: "Tech Innovations",
      logo: "/logo1.png",
      localisation: "Paris",
      type: "Stage",
      competences: ["React", "Laravel", "MySQL"],
      datePubliee: "2025-02-01",
      match: 92,
      testRequis: true,
      description: "Nous recherchons un développeur Full Stack pour rejoindre notre équipe dynamique. Vous serez responsable du développement de fonctionnalités front-end et back-end pour notre plateforme de gestion de projet."
    },
    {
      id: 2,
      titre: "UX/UI Designer",
      entreprise: "Digital Solutions",
      logo: "/logo2.png",
      localisation: "Lyon",
      type: "Alternance",
      competences: ["Figma", "Adobe XD", "UI Design", "Prototypage"],
      datePubliee: "2025-02-05",
      match: 85,
      testRequis: true,
      description: "Rejoignez notre équipe créative pour concevoir des interfaces utilisateur innovantes et intuitives. Vous travaillerez sur des projets variés pour nos clients dans différents secteurs."
    },
    {
      id: 3,
      titre: "Développeur Front-end React",
      entreprise: "Web Agency",
      logo: "/logo3.png",
      localisation: "Bordeaux",
      type: "Emploi",
      competences: ["React", "JavaScript", "Tailwind CSS", "Redux"],
      datePubliee: "2025-02-10",
      match: 78,
      testRequis: false,
      description: "Nous recherchons un développeur Front-end spécialisé en React pour travailler sur des projets web innovants. Vous serez responsable de l'implémentation des interfaces utilisateur réactives et performantes."
    },
    {
      id: 4,
      titre: "Développeur Back-end PHP",
      entreprise: "NextGen Tech",
      logo: "/logo4.png",
      localisation: "Paris",
      type: "Stage",
      competences: ["PHP", "Laravel", "MySQL", "API REST"],
      datePubliee: "2025-02-15",
      match: 65,
      testRequis: true,
      description: "Stage de 6 mois pour développer et maintenir des applications web PHP/Laravel. Vous travaillerez sur l'optimisation des performances et la sécurisation des API."
    },
    {
      id: 5,
      titre: "Développeur Mobile React Native",
      entreprise: "Innovative Apps",
      logo: "/logo5.png",
      localisation: "Toulouse",
      type: "Emploi",
      competences: ["React Native", "JavaScript", "Firebase", "Redux"],
      datePubliee: "2025-02-20",
      match: 88,
      testRequis: false,
      description: "Rejoignez notre équipe pour développer des applications mobiles innovantes avec React Native. Vous serez responsable du cycle complet de développement, du design à la publication."
    }
  ];
  
  // Options de filtre
  const optionsFiltres = {
    type: ["Stage", "Emploi", "Alternance"],
    localisation: ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse", "Nantes"],
    competences: ["React", "Laravel", "PHP", "JavaScript", "UX/UI", "MySQL", "React Native", "Figma", "Redux"]
  };
  
  // Gérer les changements de filtres
  const handleFiltreChange = (categorie, valeur) => {
    setFiltres(prevFiltres => {
      const nouveauxFiltres = { ...prevFiltres };
      
      if (nouveauxFiltres[categorie].includes(valeur)) {
        nouveauxFiltres[categorie] = nouveauxFiltres[categorie].filter(f => f !== valeur);
      } else {
        nouveauxFiltres[categorie] = [...nouveauxFiltres[categorie], valeur];
      }
      
      return nouveauxFiltres;
    });
  };
  
  // Réinitialiser tous les filtres
  const resetFiltres = () => {
    setFiltres({
      type: [],
      localisation: [],
      competences: []
    });
  };
  
  // Calculer le nombre total de filtres actifs
  const nombreFiltresActifs = 
    filtres.type.length + 
    filtres.localisation.length + 
    filtres.competences.length;
  
  // Filtrer les offres en fonction des critères
  const offresFiltrées = offres.filter(offre => {
    // Filtre par recherche textuelle
    if (searchQuery && !offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !offre.entreprise.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtre par type
    if (filtres.type.length > 0 && !filtres.type.includes(offre.type)) {
      return false;
    }
    
    // Filtre par localisation
    if (filtres.localisation.length > 0 && !filtres.localisation.includes(offre.localisation)) {
      return false;
    }
    
    // Filtre par compétences
    if (filtres.competences.length > 0 && !offre.competences.some(comp => filtres.competences.includes(comp))) {
      return false;
    }
    
    return true;
  });
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Calculer la fraîcheur de l'offre
  const getDateDifference = (dateString) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffTime = now - publishDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return "Aujourd'hui";
    if (diffDays <= 2) return "Hier";
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return formatDate(dateString);
  };
  
  // Style pour la couleur du match en fonction du pourcentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-50";
    if (percentage >= 75) return "text-teal-600 bg-teal-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };
  
  // Style pour le type d'offre
  const getTypeStyle = (type) => {
    switch(type) {
      case "Stage": return "text-purple-600 bg-purple-50";
      case "Emploi": return "text-blue-600 bg-blue-50";
      case "Alternance": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Section en-tête avec titre et description */}
      <div className="bg-white border-b border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Découvrez les opportunités</h1>
        <p className="text-gray-600 mt-1">Trouvez le stage, l'alternance ou l'emploi qui correspond à votre profil</p>
      </div>
      
      {/* Section principale avec filtres et liste d'offres */}
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Panneau de filtres (visible sur grands écrans ou quand activé) */}
          <div className={`bg-white rounded-lg shadow-sm p-4 md:p-5 md:w-72 ${filtreActif ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-800">Filtres</h2>
              {nombreFiltresActifs > 0 && (
                <button 
                  onClick={resetFiltres}
                  className="text-xs text-teal-600 hover:text-teal-700 flex items-center"
                >
                  Réinitialiser 
                  <X size={14} className="ml-1" />
                </button>
              )}
            </div>
            
            {/* Type d'offre */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Type d'offre</h3>
              <div className="space-y-2">
                {optionsFiltres.type.map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={filtres.type.includes(type)}
                      onChange={() => handleFiltreChange('type', type)}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Localisation */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Localisation</h3>
              <div className="space-y-2">
                {optionsFiltres.localisation.map((ville) => (
                  <div key={ville} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`ville-${ville}`}
                      checked={filtres.localisation.includes(ville)}
                      onChange={() => handleFiltreChange('localisation', ville)}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor={`ville-${ville}`} className="ml-2 text-sm text-gray-700">
                      {ville}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Compétences */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Compétences</h3>
              <div className="space-y-2">
                {optionsFiltres.competences.map((comp) => (
                  <div key={comp} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`comp-${comp}`}
                      checked={filtres.competences.includes(comp)}
                      onChange={() => handleFiltreChange('competences', comp)}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor={`comp-${comp}`} className="ml-2 text-sm text-gray-700">
                      {comp}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Liste des offres */}
          <div className="flex-1">
            {/* Barre de recherche et contrôles */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher par titre, entreprise..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <button 
                  className="md:hidden flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => setFiltreActif(!filtreActif)}
                >
                  <Filter size={18} className="mr-2 text-gray-500" />
                  Filtres
                  {nombreFiltresActifs > 0 && (
                    <span className="ml-2 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {nombreFiltresActifs}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Tags des filtres actifs */}
              {nombreFiltresActifs > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filtres.type.map(type => (
                    <div key={type} className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs flex items-center">
                      {type}
                      <button 
                        onClick={() => handleFiltreChange('type', type)}
                        className="ml-1 hover:text-teal-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {filtres.localisation.map(ville => (
                    <div key={ville} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center">
                      {ville}
                      <button 
                        onClick={() => handleFiltreChange('localisation', ville)}
                        className="ml-1 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {filtres.competences.map(comp => (
                    <div key={comp} className="bg-purple-50 text-purple-700 rounded-full px-3 py-1 text-xs flex items-center">
                      {comp}
                      <button 
                        onClick={() => handleFiltreChange('competences', comp)}
                        className="ml-1 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Résultats */}
            <div>
              <p className="text-sm text-gray-500 mb-3">{offresFiltrées.length} offres trouvées</p>
              
              {offresFiltrées.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">Aucune offre trouvée</h3>
                  <p className="text-gray-600">Essayez de modifier vos filtres ou votre recherche.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offresFiltrées.map(offre => (
                    <div key={offre.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* En-tête de l'offre avec logo et titres */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                            <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-medium">
                              {offre.entreprise.substring(0, 2)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">{offre.titre}</h3>
                            <p className="text-gray-600">{offre.entreprise}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getMatchColor(offre.match)}`}>
                              <Star size={12} className="mr-1 fill-current" /> {offre.match}% match
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Corps de l'offre avec détails */}
                      <div className="p-5">
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {offre.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin size={16} className="mr-1" /> {offre.localisation}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar size={16} className="mr-1" /> Publié le {formatDate(offre.datePubliee)}
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs flex items-center ${getTypeStyle(offre.type)}`}>
                              <Briefcase size={12} className="mr-1" /> {offre.type}
                            </span>
                          </div>
                          {offre.testRequis && (
                            <div className="flex items-center text-amber-600">
                              <BookOpen size={16} className="mr-1" /> Test requis
                            </div>
                          )}
                        </div>
                        
                        {/* Compétences requises */}
                        <div className="mb-4">
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <Tag size={16} className="mr-1" /> Compétences
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {offre.competences.map((comp, index) => (
                              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Pied de l'offre avec actions */}
                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            <Clock size={14} className="inline mr-1" /> {getDateDifference(offre.datePubliee)}
                          </div>
                          <div className="flex gap-2">
                            <button className="border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm flex items-center">
                              En savoir plus <ChevronRight size={16} className="ml-1" />
                            </button>
                            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 rounded-lg text-sm">
                              Postuler
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffresEtudiant;