import React from 'react';
import { Search } from 'lucide-react';

const DashboardHeader = ({ 
  activeTab, 
  searchQuery, 
  setSearchQuery,
  handleSearch 
}) => {
  // Helper pour obtenir le titre en fonction de l'onglet actif
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Tableau de bord';
      case 'profile': return 'Mon profil';
      case 'applications': return 'Mes candidatures';
      case 'tests': return 'Tests techniques';
      case 'messages': return 'Messages';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Paramètres';
      case 'offers': return 'Mes offres';
      case 'candidates': return 'Candidatures reçues';
      case 'create-offer': return 'Créer une offre';
      default: return 'Tableau de bord';
    }
  };

  // Déterminer si la barre de recherche doit être affichée
  const showSearchBar = ['applications', 'offers', 'candidates'].includes(activeTab);

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center">
      <h1 className="text-xl font-semibold text-gray-800">
        {getTabTitle()}
      </h1>
      
      {/* Barre de recherche (visible sur certains onglets) */}
      {showSearchBar && (
        <div className="ml-auto relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;