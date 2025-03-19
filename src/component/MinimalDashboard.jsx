import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Search,
  Edit,
  Upload,
  Star,
  CheckCircle,
  Calendar,
  Book,
  MessageSquare,
  ChevronRight,
  Loader,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const MinimalDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // États
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [offres, setOffres] = useState([]);
  const [tests, setTests] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userSkills, setUserSkills] = useState([]);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editedSkillLevel, setEditedSkillLevel] = useState('');

  // Charger les données en fonction de l'onglet actif
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Configuration de l'en-tête d'authentification
        const token = localStorage.getItem('auth_token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        if (activeTab === 'profil' && user?.role === 'etudiant') {
          // Récupérer les compétences de l'étudiant
          const skillsResponse = await axios.get('/api/etudiant/competences');
          setUserSkills(skillsResponse.data.competences || []);
        } 
        else if (activeTab === 'candidatures' && user?.role === 'etudiant') {
          // Récupérer les candidatures de l'étudiant
          const candidaturesResponse = await axios.get('/api/etudiant/candidatures');
          setCandidatures(candidaturesResponse.data.candidatures || []);
        }
        else if (activeTab === 'opportunites' && user?.role === 'etudiant') {
          // Récupérer les offres recommandées pour l'étudiant
          const offresResponse = await axios.get('/api/offres', {
            params: {
              per_page: 10,
              sort_by: 'created_at',
              sort_dir: 'desc'
            }
          });
          setOffres(offresResponse.data.offres.data || []);
        }
        else if (activeTab === 'tests' && user?.role === 'etudiant') {
          // Récupérer les tests disponibles pour l'étudiant
          const testsResponse = await axios.get('/api/etudiant/tests');
          setTests(testsResponse.data.tests || []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.response?.data?.message || 'Une erreur est survenue lors du chargement des données.');
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, navigate, user]);

  // Charger le nombre de notifications non lues et messages non lus
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Récupérer le nombre de notifications non lues
        const notifResponse = await axios.get('/api/notifications/unread-count');
        setNotificationCount(notifResponse.data.count || 0);
        
        // Récupérer le nombre de messages non lus
        const messageResponse = await axios.get('/api/messages/unread-count');
        setMessageCount(messageResponse.data.count || 0);
      } catch (err) {
        console.error('Erreur lors du chargement des compteurs:', err);
      }
    };

    fetchCounts();
    
    // Mettre à jour les compteurs toutes les 60 secondes
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mettre à jour une compétence
  const updateSkill = async (skillId, level) => {
    try {
      setError(null);
      await axios.put(`/api/etudiant/competences/${skillId}`, { niveau: level });
      
      // Mettre à jour les compétences localement
      setUserSkills(userSkills.map(skill => {
        if (skill.id === skillId) {
          return { ...skill, pivot: { ...skill.pivot, niveau: level } };
        }
        return skill;
      }));
      
      setEditingSkill(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la compétence:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour de la compétence.');
    }
  };

  // Supprimer une compétence
  const removeSkill = async (skillId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      return;
    }
    
    try {
      setError(null);
      await axios.delete(`/api/etudiant/competences/${skillId}`);
      
      // Mettre à jour les compétences localement
      setUserSkills(userSkills.filter(skill => skill.id !== skillId));
    } catch (err) {
      console.error('Erreur lors de la suppression de la compétence:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la suppression de la compétence.');
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Une erreur est survenue lors de la déconnexion.');
    }
  };

  // Style pour le statut
  const getStatusStyle = (status) => {
    switch(status) {
      case "entretien": return "text-green-500 bg-green-50";
      case "en_attente": return "text-yellow-500 bg-yellow-50";
      case "refusee": return "text-red-500 bg-red-50";
      case "vue": return "text-blue-500 bg-blue-50";
      case "acceptee": return "text-green-500 bg-green-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  // Formater le statut pour l'affichage
  const formatStatus = (status) => {
    const statusMapping = {
      "en_attente": "En attente",
      "vue": "Vue",
      "entretien": "Entretien",
      "acceptee": "Acceptée",
      "refusee": "Refusée"
    };
    
    return statusMapping[status] || status;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar minimaliste */}
      <div className="w-16 lg:w-56 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b border-gray-100">
          <Briefcase className="text-teal-500" size={24} />
          <span className="ml-3 font-semibold text-teal-600 hidden lg:block">JobConnect</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-2">
            <li>
              <button
                onClick={() => setActiveTab('profil')}
                className={`w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start ${
                  activeTab === 'profil' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <User size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Profil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('candidatures')}
                className={`w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start ${
                  activeTab === 'candidatures' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FileText size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Candidatures</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('opportunites')}
                className={`w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start ${
                  activeTab === 'opportunites' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Briefcase size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Opportunités</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('tests')}
                className={`w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start ${
                  activeTab === 'tests' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Book size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Tests</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start ${
                  activeTab === 'messages' ? 'bg-teal-50 text-teal-600' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <MessageSquare size={20} />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {messageCount}
                    </span>
                  )}
                </div>
                <span className="ml-3 text-sm font-medium hidden lg:block">Messages</span>
              </button>
            </li>
          </ul>
          
          <div className="px-2 mt-8">
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveTab('settings')}
                className="w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start text-gray-500 hover:bg-gray-50"
              >
                <Settings size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Paramètres</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start text-gray-500 hover:bg-gray-50"
              >
                <LogOut size={20} />
                <span className="ml-3 text-sm font-medium hidden lg:block">Déconnexion</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeTab === 'profil' && 'Mon Profil'}
            {activeTab === 'candidatures' && 'Candidatures'}
            {activeTab === 'opportunites' && 'Opportunités'}
            {activeTab === 'tests' && 'Tests Techniques'}
            {activeTab === 'messages' && 'Messages'}
            {activeTab === 'settings' && 'Paramètres'}
          </h1>
          
          <div className="flex items-center">
            <div className="relative mr-2">
              <Bell size={20} className="text-gray-500" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
          </div>
        </header>
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-2 mt-0.5" size={16} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          )}
          
          {/* Profil */}
          {!loading && activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Carte profil */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-semibold">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-800">{user?.prenom} {user?.nom}</h2>
                      <p className="text-gray-500">{user?.etudiant?.niveau_etude} - {user?.etudiant?.filiere}</p>
                    </div>
                  </div>
                  <Link to="/profile/edit" className="text-teal-500 hover:text-teal-600 flex items-center text-sm">
                    <Edit size={16} className="mr-1" /> Modifier
                  </Link>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm uppercase text-gray-500 font-medium mb-3">Contact</h3>
                    <div className="space-y-2">
                      <p className="text-gray-800">{user?.email}</p>
                      <p className="text-gray-800">{user?.telephone || 'Téléphone non renseigné'}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm uppercase text-gray-500 font-medium">Compétences</h3>
                      <Link to="/skills" className="text-teal-500 hover:text-teal-600 text-xs">
                        <Edit size={12} className="inline mr-1" /> Éditer
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userSkills.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucune compétence ajoutée</p>
                      ) : (
                        userSkills.map((skill) => (
                          <div 
                            key={skill.id} 
                            className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700 flex items-center"
                          >
                            {skill.nom}
                            <span className="ml-1 text-xs text-teal-600">
                              ({skill.pivot?.niveau || 'débutant'})
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm uppercase text-gray-500 font-medium">CV et Portfolio</h3>
                    <button className="text-teal-500 hover:text-teal-600 text-xs flex items-center">
                      <Upload size={12} className="mr-1" /> Mettre à jour
                    </button>
                  </div>
                  <div className="flex gap-4">
                    {user?.etudiant?.cv_file ? (
                      <a href={`/storage/${user.etudiant.cv_file}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm underline">
                        Voir mon CV
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">Aucun CV téléchargé</span>
                    )}
                    
                    {user?.etudiant?.portfolio_url ? (
                      <a href={user.etudiant.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 text-sm underline">
                        Voir mon portfolio
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">Aucun portfolio renseigné</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Résumé IA */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-gray-800">Résumé généré par IA</h3>
                  <button className="text-teal-500 hover:text-teal-600 text-xs flex items-center">
                    <Edit size={12} className="mr-1" /> Personnaliser
                  </button>
                </div>
                <p className="text-gray-700 text-sm">
                  {user?.etudiant?.cv_resume || 
                    `${user?.prenom} ${user?.nom} est un(e) étudiant(e) en ${user?.etudiant?.niveau_etude || 'formation supérieure'} 
                    ${user?.etudiant?.filiere ? `dans le domaine ${user?.etudiant?.filiere}` : ''}.
                    ${userSkills.length > 0 ? `Ses compétences incluent ${userSkills.map(s => s.nom).join(', ')}.` : ''}
                    ${user?.etudiant?.disponibilite ? `Disponibilité: ${user?.etudiant?.disponibilite}.` : ''}`
                  }
                </p>
                <div className="mt-4 flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Résumé optimisé pour le recrutement</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Candidatures */}
          {!loading && activeTab === 'candidatures' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Mes candidatures</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      className="pl-8 pr-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {candidatures.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Vous n'avez pas encore postulé à des offres.
                    </div>
                  ) : (
                    candidatures.map(candidature => (
                      <div key={candidature.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-800">{candidature.offre?.titre}</h4>
                          <p className="text-sm text-gray-500">{candidature.offre?.entreprise?.nom_entreprise}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(candidature.statut)}`}>
                            {formatStatus(candidature.statut)}
                          </span>
                          <Link 
                            to={`/candidatures/${candidature.id}`}
                            className="ml-3 text-gray-400 hover:text-gray-600"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Actions rapides */}
              {candidatures.some(c => c.statut === 'entretien') && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Actions recommandées</h3>
                  <div className="space-y-2">
                    {candidatures
                      .filter(c => c.statut === 'entretien')
                      .map(candidature => (
                        <div key={candidature.id} className="flex items-center p-3 bg-blue-50 rounded-md">
                          <Calendar className="text-blue-500 mr-2" size={16} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Entretien {candidature.offre?.entreprise?.nom_entreprise} - {formatDate(candidature.updated_at)}</p>
                          </div>
                          <Link
                            to={`/candidatures/${candidature.id}`}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                          >
                            Préparer
                          </Link>
                        </div>
                      ))
                    }
                    
                    {candidatures
                      .filter(c => c.offre?.test_requis && !c.test_complete)
                      .map(candidature => (
                        <div key={`test-${candidature.id}`} className="flex items-center p-3 bg-amber-50 rounded-md">
                          <Book className="text-amber-500 mr-2" size={16} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Test technique à compléter - {candidature.offre?.entreprise?.nom_entreprise}</p>
                          </div>
                          <Link
                            to={`/tests/${candidature.offre?.test?.id}/candidatures/${candidature.id}`}
                            className="text-xs bg-amber-500 text-white px-2 py-1 rounded"
                          >
                            Commencer
                          </Link>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Opportunités */}
          {!loading && activeTab === 'opportunites' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Opportunités recommandées</h3>
                  <Link 
                    to="/offres"
                    className="text-teal-500 hover:text-teal-600 text-sm"
                  >
                    Voir toutes les offres
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {offres.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Aucune opportunité disponible pour le moment.
                    </div>
                  ) : (
                    offres.map(offre => (
                      <div key={offre.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-800">{offre.titre}</h4>
                          <p className="text-sm text-gray-500">{offre.entreprise?.nom_entreprise}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full flex items-center mr-3">
                            <Star size={12} className="mr-1 fill-current" /> Recommandé
                          </span>
                          <Link 
                            to={`/offres/${offre.id}`}
                            className="bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600"
                          >
                            Postuler
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Compétences recherchées */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-800 mb-3">Compétences en demande</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-700">React</span>
                      <span className="text-teal-600 font-medium">87%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tests */}
          {!loading && activeTab === 'tests' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800">Tests techniques</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {tests.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Vous n'avez pas encore de tests à compléter.
                  </div>
                ) : (
                  tests.map(test => (
                    <div key={test.candidature_id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">{test.test.titre}</h4>
                        <p className="text-sm text-gray-500">{test.entreprise.nom} • {test.test.duree_minutes} min</p>
                      </div>
                      <div className="flex items-center">
                        {test.completed ? (
                          <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full mr-3">
                            Complété - {test.score}%
                          </span>
                        ) : (
                          <span className="bg-yellow-50 text-yellow-600 px-2 py-1 text-xs rounded-full mr-3">
                            En attente
                          </span>
                        )}
                        
                        {test.completed ? (
                          <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50">
                            Voir résultats
                          </button>
                        ) : (
                          <Link 
                            to={`/tests/${test.test.id}/candidatures/${test.candidature_id}`}
                            className="bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600"
                          >
                            Commencer
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Messages */}
          {!loading && activeTab === 'messages' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-800">Messagerie</h3>
                <Link 
                  to="/messages"
                  className="text-teal-500 hover:text-teal-600 text-sm"
                >
                  Voir tous les messages
                </Link>
              </div>
              
              <div className="p-6 text-center text-gray-500">
                <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="mb-4">Vos conversations s'afficheront ici</p>
                <Link 
                  to="/messages"
                  className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Accéder à la messagerie
                </Link>
              </div>
            </div>
          )}
          
          {/* Settings */}
          {!loading && activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-800 mb-4">Paramètres du compte</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    readOnly
                    className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Préférences de notification</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="notif1" className="rounded text-teal-500 focus:ring-teal-500" />
                      <label htmlFor="notif1" className="ml-2 text-sm text-gray-800">Nouvelles offres correspondant à mon profil</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="notif2" className="rounded text-teal-500 focus:ring-teal-500" />
                      <label htmlFor="notif2" className="ml-2 text-sm text-gray-800">Mises à jour sur mes candidatures</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="notif3" className="rounded text-teal-500 focus:ring-teal-500" />
                      <label htmlFor="notif3" className="ml-2 text-sm text-gray-800">Messages des recruteurs</label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">
                    Sauvegarder les modifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MinimalDashboard;