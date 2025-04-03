import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, MapPin, Users, Eye, Edit, Trash2, AlertCircle, Filter, Search } from 'lucide-react';
import axios from 'axios';

const OpportunitiesWidget = ({ offres: initialOffres, loading: initialLoading }) => {
  const navigate = useNavigate();
  const [offres, setOffres] = useState(initialOffres || []);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    statut: ''
  });

  // Récupérer les offres de l'entreprise si elles ne sont pas fournies via les props
  useEffect(() => {
    if (initialOffres) {
      setOffres(initialOffres);
      setLoading(false);
      return;
    }

    const fetchOffres = async () => {
      try {
        setLoading(true);
        console.log("Tentative de récupération des offres de l'entreprise...");
        
        const response = await axios.get('/api/entreprise/offres');
        console.log("Réponse de l'API:", response.data);
        
        if (response.data && response.data.offres) {
          setOffres(response.data.offres);
        } else {
          console.error("Format de réponse inattendu:", response.data);
          setOffres([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
        setError("Une erreur est survenue lors du chargement des offres.");
        setLoading(false);
      }
    };

    fetchOffres();
  }, [initialOffres]);

  // Filtrer les offres
  const filteredOffres = offres.filter(offre => {
    // Recherche textuelle
    const matchesSearch = searchQuery === '' || 
      offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offre.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offre.localisation.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtres
    const matchesType = filters.type === '' || offre.type === filters.type;
    const matchesStatut = filters.statut === '' || offre.statut === filters.statut;
    
    return matchesSearch && matchesType && matchesStatut;
  });

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Badge de statut
  const StatusBadge = ({ statut }) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    if (statut === 'active') bgColor = 'bg-green-100 text-green-800';
    if (statut === 'inactive') bgColor = 'bg-yellow-100 text-yellow-800';
    if (statut === 'cloturee') bgColor = 'bg-red-100 text-red-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
        {statut === 'active' ? 'Active' : 
         statut === 'inactive' ? 'Inactive' : 
         statut === 'cloturee' ? 'Clôturée' : statut}
      </span>
    );
  };

  // Supprimer une offre
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) {
      try {
        await axios.delete(`/api/offres/${id}`);
        setOffres(offres.filter(offre => offre.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Une erreur est survenue lors de la suppression de l'offre.");
      }
    }
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
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
        <h2 className="text-lg font-medium text-gray-800 mb-4">Mes offres publiées</h2>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Mes offres publiées</h2>
        <button
          onClick={() => navigate('/create-offer')}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
        >
          <PlusCircle size={16} className="mr-2" />
          Publier une offre
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une offre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Tous les types</option>
            <option value="stage">Stage</option>
            <option value="emploi">Emploi</option>
            <option value="alternance">Alternance</option>
          </select>
          
          <select 
            value={filters.statut}
            onChange={(e) => setFilters({...filters, statut: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="cloturee">Clôturée</option>
          </select>
        </div>
      </div>

      {/* Liste des offres */}
      {filteredOffres.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-2">Aucune offre publiée</p>
          <p className="text-gray-500 text-sm mb-4">
            Vous n'avez pas encore publié d'offres ou aucune offre ne correspond à vos critères de recherche.
          </p>
          <button
            onClick={() => navigate('/create-offer')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors inline-flex items-center"
          >
            <PlusCircle size={16} className="mr-2" />
            Publier votre première offre
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidatures</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffres.map((offre) => (
                <tr key={offre.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{offre.titre}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin size={12} className="mr-1" />
                        {offre.localisation}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {offre.type === 'stage' ? 'Stage' : 
                       offre.type === 'emploi' ? 'Emploi' : 'Alternance'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-gray-400" />
                      {formatDate(offre.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users size={14} className="mr-1 text-gray-400" />
                      {offre.candidatures_count || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge statut={offre.statut} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link to={`/offres/${offre.id}`} className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/offres/${offre.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(offre.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesWidget;