import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

const MinimalDashboard = () => {
  const [activeTab, setActiveTab] = useState('profil');
  
  // Données simplifiées
  const userData = {
    name: "Thomas Dupont",
    role: "Étudiant",
    education: "Master Informatique - ISMAGI",
    initials: "TD",
    email: "thomas.dupont@email.com",
    phone: "06 12 34 56 78",
    skills: ["React", "JavaScript", "Laravel", "UX/UI Design", "PHP"],
    notifications: 2
  };
  
  const applications = [
    { id: 1, company: "Tech Innovations", position: "Développeur Full Stack", status: "Entretien" },
    { id: 2, company: "Digital Solutions", position: "Concepteur UX/UI", status: "En attente" },
    { id: 3, company: "Web Agency", position: "Développeur Front-end", status: "Refusée" }
  ];
  
  const opportunities = [
    { id: 1, company: "NextGen Tech", position: "Développeur React Junior", match: 92 },
    { id: 2, company: "Agence Digitale", position: "UX/UI Designer", match: 85 }
  ];

  // Style pour le statut
  const getStatusStyle = (status) => {
    switch(status) {
      case "Entretien": return "text-green-500 bg-green-50";
      case "En attente": return "text-yellow-500 bg-yellow-50";
      case "Refusée": return "text-red-500 bg-red-50";
      default: return "text-gray-500 bg-gray-50";
    }
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
                <MessageSquare size={20} />
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
              <button className="w-full p-2 lg:px-3 lg:py-2 rounded-lg flex items-center justify-center lg:justify-start text-gray-500 hover:bg-gray-50">
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
              {userData.notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {userData.notifications}
                </span>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-medium">
              {userData.initials}
            </div>
          </div>
        </header>
        
        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Profil */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Carte profil */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-teal-500 text-white flex items-center justify-center text-xl font-semibold">
                      {userData.initials}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                      <p className="text-gray-500">{userData.education}</p>
                    </div>
                  </div>
                  <button className="text-teal-500 hover:text-teal-600 flex items-center text-sm">
                    <Edit size={16} className="mr-1" /> Modifier
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm uppercase text-gray-500 font-medium mb-3">Contact</h3>
                    <div className="space-y-2">
                      <p className="text-gray-800">{userData.email}</p>
                      <p className="text-gray-800">{userData.phone}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm uppercase text-gray-500 font-medium">Compétences</h3>
                      <button className="text-teal-500 hover:text-teal-600 text-xs">
                        <Edit size={12} className="inline mr-1" /> Éditer
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userData.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                          {skill}
                        </span>
                      ))}
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
                    <span className="text-gray-800 text-sm">CV_Thomas_Dupont.pdf</span>
                    <span className="text-gray-800 text-sm">portfolio.thomasdupont.com</span>
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
                  Thomas Dupont est un étudiant en Master Informatique à ISMAGI, avec des compétences en 
                  React, JavaScript, Laravel, UX/UI Design et PHP. Actuellement en recherche d'opportunités 
                  professionnelles, il est disponible immédiatement pour des stages, alternances ou emplois.
                </p>
                <div className="mt-4 flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Résumé optimisé pour le recrutement</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Candidatures */}
          {activeTab === 'candidatures' && (
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
                  {applications.map(app => (
                    <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">{app.position}</h4>
                        <p className="text-sm text-gray-500">{app.company}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                        <ChevronRight size={16} className="ml-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions rapides */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-800 mb-3">Actions recommandées</h3>
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-blue-50 rounded-md">
                    <Calendar className="text-blue-500 mr-2" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Entretien Tech Innovations - 20/02/2025</p>
                    </div>
                    <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Préparer</button>
                  </div>
                  <div className="flex items-center p-3 bg-amber-50 rounded-md">
                    <Book className="text-amber-500 mr-2" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Test technique à compléter - Digital Solutions</p>
                    </div>
                    <button className="text-xs bg-amber-500 text-white px-2 py-1 rounded">Commencer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Opportunités */}
          {activeTab === 'opportunites' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Opportunités recommandées</h3>
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
                  {opportunities.map(opp => (
                    <div key={opp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">{opp.position}</h4>
                        <p className="text-sm text-gray-500">{opp.company}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full flex items-center">
                          <Star size={12} className="mr-1 fill-current" /> {opp.match}%
                        </span>
                        <button className="ml-3 bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600">
                          Postuler
                        </button>
                      </div>
                    </div>
                  ))}
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
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-700">JavaScript</span>
                      <span className="text-teal-600 font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-700">Laravel</span>
                      <span className="text-teal-600 font-medium">65%</span>
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
          {activeTab === 'tests' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-medium text-gray-800">Tests techniques</h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Test UI/UX Designer</h4>
                    <p className="text-sm text-gray-500">Digital Solutions • 10 questions • 45 min</p>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-yellow-50 text-yellow-600 px-2 py-1 text-xs rounded-full mr-3">
                      En attente
                    </span>
                    <button className="bg-teal-500 text-white text-xs px-3 py-1 rounded hover:bg-teal-600">
                      Commencer
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Test Développeur Full Stack</h4>
                    <p className="text-sm text-gray-500">Tech Innovations • 15 questions • 60 min</p>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-50 text-green-600 px-2 py-1 text-xs rounded-full mr-3">
                      Complété - 85%
                    </span>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50">
                      Voir résultats
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-10rem)]">
              <div className="grid grid-cols-3 h-full">
                <div className="border-r border-gray-100 divide-y divide-gray-100">
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto h-[calc(100%-48px)]">
                    <div className="p-3 bg-teal-50 cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-medium">TI</div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-800">Tech Innovations</p>
                            <p className="text-xs text-gray-500">10:42</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">Bonjour Thomas, suite à votre entretien...</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">DS</div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-800">Digital Solutions</p>
                            <p className="text-xs text-gray-500">Hier</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">N'oubliez pas de compléter le test...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 flex flex-col">
                  <div className="p-3 border-b border-gray-100 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-medium">TI</div>
                    <p className="ml-3 text-sm font-medium text-gray-800">Tech Innovations</p>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    <div className="flex">
                      <div className="bg-gray-100 p-2 rounded-lg max-w-xs">
                        <p className="text-sm text-gray-800">Bonjour Thomas, nous aimerions vous inviter pour un second entretien avec notre CTO.</p>
                        <p className="text-xs text-gray-500 mt-1">10:16</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <div className="bg-teal-500 p-2 rounded-lg max-w-xs text-white">
                        <p className="text-sm">Bonjour, je suis très intéressé par cette opportunité et disponible pour un second entretien.</p>
                        <p className="text-xs text-teal-100 mt-1">10:30</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="bg-gray-100 p-2 rounded-lg max-w-xs">
                        <p className="text-sm text-gray-800">Parfait ! Seriez-vous disponible ce vendredi à 14h ?</p>
                        <p className="text-xs text-gray-500 mt-1">10:42</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-gray-100">
                    <div className="flex">
                      <input 
                        type="text" 
                        placeholder="Écrivez votre message..." 
                        className="flex-1 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      <button className="ml-2 bg-teal-500 text-white rounded-md px-3 py-1.5">
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-800 mb-4">Paramètres du compte</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
                  <input 
                    type="email" 
                    value={userData.email}
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