import React, { useState, useEffect } from 'react';
import { 
  CogIcon, 
  SaveIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  ServerIcon,
  BellIcon,
  MailIcon,
  ExclamationIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import axios from 'axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_registrations: true,
    auto_approve_companies: false,
    email_notifications: {
      new_user: true,
      new_offer: true,
      new_application: true
    },
    max_file_size: 5, // En MB
    max_offers_per_company: 20
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Charger les paramètres
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/settings');
        setSettings(response.data.settings);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres:', err);
        setError('Impossible de charger les paramètres. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Gérer les changements des paramètres
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Gestion des champs imbriqués (comme email_notifications.new_user)
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Gestion des champs simples
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseInt(value, 10) : value
      }));
    }
  };

  // Enregistrer les paramètres
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSuccess(false);
      setError(null);
      
      const response = await axios.put('/api/admin/settings', settings);
      
      setSuccess(true);
      setSaving(false);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement des paramètres:', err);
      setError('Une erreur est survenue lors de l\'enregistrement des paramètres.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Paramètres du système</h2>
        <p className="text-gray-600">Configuration de la plateforme</p>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <ExclamationIcon className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
            <p className="text-green-600">Paramètres enregistrés avec succès</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paramètres du site */}
          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <div className="flex items-center mb-4">
              <ServerIcon className="h-6 w-6 text-teal-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800">Paramètres du site</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenance_mode"
                    name="maintenance_mode"
                    type="checkbox"
                    checked={settings.maintenance_mode}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenance_mode" className="font-medium text-gray-700">Mode maintenance</label>
                  <p className="text-gray-500">Activez pour rendre le site inaccessible temporairement (sauf pour les administrateurs)</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allow_registrations"
                    name="allow_registrations"
                    type="checkbox"
                    checked={settings.allow_registrations}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allow_registrations" className="font-medium text-gray-700">Autoriser les inscriptions</label>
                  <p className="text-gray-500">Permettre aux nouveaux utilisateurs de s'inscrire sur la plateforme</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="auto_approve_companies"
                    name="auto_approve_companies"
                    type="checkbox"
                    checked={settings.auto_approve_companies}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="auto_approve_companies" className="font-medium text-gray-700">Approbation automatique des entreprises</label>
                  <p className="text-gray-500">Valider automatiquement les inscriptions d'entreprises sans vérification</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Limites et quotas */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DatabaseIcon className="h-6 w-6 text-teal-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800">Limites et quotas</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="max_file_size" className="block text-sm font-medium text-gray-700">
                  Taille maximale des fichiers (Mo)
                </label>
                <input
                  type="number"
                  id="max_file_size"
                  name="max_file_size"
                  min="1"
                  max="20"
                  value={settings.max_file_size}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Limite pour l'upload de CV, images, etc.
                </p>
              </div>
              
              <div>
                <label htmlFor="max_offers_per_company" className="block text-sm font-medium text-gray-700">
                  Maximum d'offres par entreprise
                </label>
                <input
                  type="number"
                  id="max_offers_per_company"
                  name="max_offers_per_company"
                  min="1"
                  value={settings.max_offers_per_company}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nombre maximum d'offres qu'une entreprise peut publier
                </p>
              </div>
            </div>
          </div>
          
          {/* Notifications par email */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MailIcon className="h-6 w-6 text-teal-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800">Notifications par email</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_new_user"
                    name="email_notifications.new_user"
                    type="checkbox"
                    checked={settings.email_notifications.new_user}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_new_user" className="font-medium text-gray-700">Nouvelle inscription</label>
                  <p className="text-gray-500">Recevoir une notification lors de l'inscription d'un nouvel utilisateur</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_new_offer"
                    name="email_notifications.new_offer"
                    type="checkbox"
                    checked={settings.email_notifications.new_offer}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_new_offer" className="font-medium text-gray-700">Nouvelle offre</label>
                  <p className="text-gray-500">Recevoir une notification lors de la publication d'une nouvelle offre</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email_new_application"
                    name="email_notifications.new_application"
                    type="checkbox"
                    checked={settings.email_notifications.new_application}
                    onChange={handleChange}
                    className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email_new_application" className="font-medium text-gray-700">Nouvelle candidature</label>
                  <p className="text-gray-500">Recevoir une notification lors d'une nouvelle candidature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bouton de soumission */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <SaveIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Enregistrer les paramètres
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;