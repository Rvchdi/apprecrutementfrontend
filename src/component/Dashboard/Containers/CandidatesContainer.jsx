import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Book, 
  Eye, 
  CheckCircle, 
  X, 
  MessageSquare,
  Download
} from 'lucide-react';

const CandidatesContainer = () => {
  const navigate = useNavigate();
  
  // États
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffre, setSelectedOffre] = useState('');
  const [filters, setFilters] = useState({
    statut: []
  });
  const [offres, setOffres] = useState([]);
  const [expandedCandidature, setExpandedCandidature] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Récupérer les candidatures
  useEffect(() => {
    const fetchCandidatures = async () => {
      try {
        setLoading(true);
        
        // Récupérer les candidatures
        const response = await axios.get('/api/entreprise/candidatures');
        console.log('Réponse candidatures:', response.data);
        
        if (response.data && response.data.candidatures) {
          setCandidatures(response.data.candidatures);
        } else {
          setCandidatures([]);
        }
        
        // Récupérer les offres pour le filtre
        const offresResponse = await axios.get('/api/entreprise/offres');
        if (offresResponse.data && offresResponse.data.offres) {
          setOffres(offresResponse.data.offres);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des candidatures:', err);
        setError('Une erreur est survenue lors du chargement des candidatures.');
        setLoading(false);
      }
    };
    
    fetchCandidatures();
  }, []);
  
  // Filtrer les candidatures
  const filteredCandidatures = candidatures.filter(candidature => {
    // Filtre de recherche
    const matchesSearch = searchQuery === '' || 
      candidature.etudiant?.user?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidature.etudiant?.user?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidature.offre?.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidature.lettre_motivation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par offre
    const matchesOffre = selectedOffre === '' || candidature.offre_id.toString() === selectedOffre;
    
    // Filtre par statut
    const matchesStatut = filters.statut.length === 0 || filters.statut.includes(candidature.statut);
    
    return matchesSearch && matchesOffre && matchesStatut;
  });
  
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Mettre à jour le statut d'une candidature
  const updateCandidatureStatus = async (candidatureId, newStatus) => {
    try {
      setUpdating(true);
      setUpdateSuccess(false);
      
      const response = await axios.put(`/api/entreprise/candidatures/${candidatureId}/status`, {
        statut: newStatus
      });
      
      // Mettre à jour la liste des candidatures
      setCandidatures(prevCandidatures => 
        prevCandidatures.map(candidature => 
          candidature.id === candidatureId 
            ? { ...candidature, statut: newStatus } 
            : candidature
        )
      );
      
      setUpdateSuccess(true);
      
      // Réinitialiser les indicateurs après 3 secondes
      setTimeout(() => {
        setUpdating(false);
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setUpdating(false);
      alert('Erreur lors de la mise à jour du statut de la candidature.');
    }
  };
  
  // Obtenir la couleur pour le statut
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      'en_attente': 'bg-blue-100 text-blue-800',
      'vue': 'bg-indigo-100 text-indigo-800',
      'entretien': 'bg-purple-100 text-purple-800',
      'acceptee': 'bg-green-100 text-green-800',
      'refusee': 'bg-red-100 text-red-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Traduire le statut
  const translateStatus = (status) => {
    if (!status) return 'Inconnu';
    
    const translations = {
      'en_attente': 'En attente',
      'vue': 'Vue',
      'entretien': 'Entretien',
      'acceptee': 'Acceptée',
      'refusee': 'Refusée'
    };
    
    return translations[status] || status;
  };
  
  // Gérer le clic sur une candidature
  const handleCandidatureClick = (candidature) => {
    // Si la candidature est déjà développée, la réduire
    if (expandedCandidature === candidature.id) {
      setExpandedCandidature(null);
      return;
    }
    
    // Sinon, développer la candidature
    setExpandedCandidature(candidature.id);
    
    // Si la candidature est en attente, la marquer comme vue
    if (candidature.statut === 'en_attente') {
      updateCandidatureStatus(candidature.id, 'vue');
    }
  };
  
  // Télécharger le CV d'un étudiant
  const downloadCV = (cvPath, nom, prenom) => {
    if (!cvPath) {
      alert('Aucun CV disponible pour cet étudiant.');
      return;
    }
    
    const link = document.createElement('a');
    link.href = `/storage/${cvPath}`;
    link.target = '_blank';
    link.download = `CV_${nom}_${prenom}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Affichage du chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Candidatures reçues</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Candidatures reçues</h2>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-800 mb-6">Candidatures reçues</h2>
      
      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, prénom, offre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedOffre}
            onChange={(e) => setSelectedOffre(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Toutes les offres</option>
            {offres.map(offre => (
              <option key={offre.id} value={offre.id.toString()}>
                {offre.titre}
              </option>
            ))}
          </select>
          
          <div className="relative">
            <button
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
              onClick={() => document.getElementById('status-filter').classList.toggle('hidden')}
            >
              <Filter size={16} className="mr-2 text-gray-500" />
              <span>Statut</span>
              {filters.statut.length > 0 && (
                <span className="ml-2 bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.statut.length}
                </span>
              )}
            </button>
            
            <div 
              id="status-filter" 
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 hidden"
            >
              <div className="p-2">
                {['en_attente', 'vue', 'entretien', 'acceptee', 'refusee'].map(statut => (
                  <div key={statut} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      id={`statut-${statut}`}
                      checked={filters.statut.includes(statut)}
                      onChange={() => {
                        setFilters(prev => {
                          const newStatuts = prev.statut.includes(statut)
                            ? prev.statut.filter(s => s !== statut)
                            : [...prev.statut, statut];
                          return { ...prev, statut: newStatuts };
                        });
                      }}
                      className="rounded text-teal-500 focus:ring-teal-500"
                    />
                    <label htmlFor={`statut-${statut}`} className="ml-2 text-sm text-gray-700">
                      {translateStatus(statut)}
                    </label>
                  </div>
                ))}
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, statut: [] }))}
                    className="text-xs text-teal-600 hover:text-teal-700 p-2"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des candidatures */}
      {filteredCandidatures.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucune candidature trouvée</p>
          <p className="text-gray-500 text-sm">
            Aucune candidature ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidatures.map(candidature => (
            <div 
              key={candidature.id} 
              className="border border-gray-200 rounded-lg hover:border-teal-300 transition-colors overflow-hidden"
            >
              {/* En-tête de la candidature */}
              <div 
                className={`p-4 cursor-pointer flex justify-between items-start ${
                  expandedCandidature === candidature.id ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => handleCandidatureClick(candidature)}
              >
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-3">
                    {candidature.etudiant?.user?.prenom?.charAt(0) || '?'}
                    {candidature.etudiant?.user?.nom?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {candidature.etudiant?.user?.prenom || 'Prénom'} {candidature.etudiant?.user?.nom || 'Nom'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Briefcase size={14} className="mr-1" />
                      <span>Candidature pour : {candidature.offre?.titre || 'Offre inconnue'}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar size={12} className="mr-1" />
                      <span>Postulé le {formatDate(candidature.date_candidature)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(candidature.statut)}`}>
                    {translateStatus(candidature.statut)}
                  </span>
                </div>
              </div>
              
              {/* Contenu détaillé (visible uniquement si développé) */}
              {expandedCandidature === candidature.id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Colonne gauche - Informations candidat */}
                    <div className="md:col-span-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Informations du candidat</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm">{candidature.etudiant?.user?.email || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Téléphone</p>
                          <p className="text-sm">{candidature.etudiant?.user?.telephone || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Niveau d'études</p>
                          <p className="text-sm">{candidature.etudiant?.niveau_etude || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">École</p>
                          <p className="text-sm">{candidature.etudiant?.ecole || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Filière</p>
                          <p className="text-sm">{candidature.etudiant?.filiere || 'Non renseigné'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Disponibilité</p>
                          <p className="text-sm">
                            {candidature.etudiant?.disponibilite === 'immédiate' ? 'Immédiate' :
                             candidature.etudiant?.disponibilite === '1_mois' ? 'Sous 1 mois' :
                             candidature.etudiant?.disponibilite === '3_mois' ? 'Sous 3 mois' :
                             candidature.etudiant?.disponibilite === '6_mois' ? 'Sous 6 mois' :
                             'Non renseignée'}
                          </p>
                        </div>
                        
                        {candidature.etudiant?.cv_file && (
                          <button
                            onClick={() => downloadCV(
                              candidature.etudiant.cv_file,
                              candidature.etudiant.user.nom,
                              candidature.etudiant.user.prenom
                            )}
                            className="w-full mt-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
                          >
                            <Download size={16} className="mr-2" />
                            Télécharger le CV
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Colonne droite - Lettre de motivation et actions */}
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Lettre de motivation</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
                        <p className="text-sm whitespace-pre-line">{candidature.lettre_motivation || 'Aucune lettre de motivation fournie.'}</p>
                      </div>
                      
                      {/* Résultats de test si applicable */}
                      {candidature.offre?.test_requis && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Test de compétences</h4>
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            {candidature.test_complete ? (
                              <div>
                                <div className="flex items-center text-green-600 mb-2">
                                  <CheckCircle size={16} className="mr-2" />
                                  <span>Test complété</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm mr-2">Score:</span>
                                  <span className="text-lg font-medium">{candidature.score_test}%</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center text-amber-600">
                                <AlertCircle size={16} className="mr-2" />
                                <span>Test non complété</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Mettre à jour le statut</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateCandidatureStatus(candidature.id, 'en_attente')}
                            disabled={candidature.statut === 'en_attente' || updating}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                              candidature.statut === 'en_attente' 
                                ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            <span>En attente</span>
                          </button>
                          
                          <button
                            onClick={() => updateCandidatureStatus(candidature.id, 'vue')}
                            disabled={candidature.statut === 'vue' || updating}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                              candidature.statut === 'vue' 
                                ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed' 
                                : 'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}
                          >
                            <Eye size={14} className="mr-1" />
                            <span>Vue</span>
                          </button>
                          
                          <button
                            onClick={() => updateCandidatureStatus(candidature.id, 'entretien')}
                            disabled={candidature.statut === 'entretien' || updating}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                              candidature.statut === 'entretien' 
                                ? 'bg-purple-100 text-purple-800 cursor-not-allowed' 
                                : 'bg-purple-500 text-white hover:bg-purple-600'
                            }`}
                          >
                            <User size={14} className="mr-1" />
                            <span>Entretien</span>
                          </button>
                          
                          <button
                            onClick={() => updateCandidatureStatus(candidature.id, 'acceptee')}
                            disabled={candidature.statut === 'acceptee' || updating}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                              candidature.statut === 'acceptee' 
                                ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            <CheckCircle size={14} className="mr-1" />
                            <span>Accepter</span>
                          </button>
                          
                          <button
                            onClick={() => updateCandidatureStatus(candidature.id, 'refusee')}
                            disabled={candidature.statut === 'refusee' || updating}
                            className={`px-3 py-2 rounded-lg text-sm flex items-center ${
                              candidature.statut === 'refusee' 
                                ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                          >
                            <X size={14} className="mr-1" />
                            <span>Refuser</span>
                          </button>
                        </div>
                        
                        {updateSuccess && candidature.id === expandedCandidature && (
                          <div className="mt-3 text-green-600 text-sm">
                            Statut mis à jour avec succès !
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidatesContainer;