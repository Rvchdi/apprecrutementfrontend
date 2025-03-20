import React, { useState } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SettingsWidget = ({ userData, loading }) => {
  const [formData, setFormData] = useState({
    email: userData?.email || '',
    notifyNewOffers: true,
    notifyCandidatureUpdates: true,
    notifyMessages: true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Soumettre les changements
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Simuler un appel API pour sauvegarder les préférences
      // En production, remplacez ceci par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Exemple d'appel API (à décommenter en production)
      /*
      await axios.put('/api/user/settings', {
        notification_preferences: {
          new_offers: formData.notifyNewOffers,
          candidature_updates: formData.notifyCandidatureUpdates,
          messages: formData.notifyMessages
        }
      });
      */
      
      setSaveSuccess(true);
      
      // Réinitialiser le statut de succès après 3 secondes
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setSaveError('Une erreur est survenue lors de la sauvegarde des paramètres.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Paramètres</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Settings size={18} className="text-teal-500 mr-2" />
        <h2 className="text-lg font-medium text-gray-800">Paramètres du compte</h2>
      </div>
      
      {saveSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <Save size={16} className="mr-2" />
          <span>Vos paramètres ont été sauvegardés avec succès.</span>
        </div>
      )}
      
      {saveError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={16} className="mr-2" />
          <span>{saveError}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Contactez le support pour modifier votre adresse email.</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Préférences de notification</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="notifyNewOffers" 
                name="notifyNewOffers"
                checked={formData.notifyNewOffers}
                onChange={handleChange}
                className="rounded text-teal-500 focus:ring-teal-500" 
              />
              <label htmlFor="notifyNewOffers" className="ml-2 text-sm text-gray-800">
                Nouvelles offres correspondant à mon profil
              </label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="notifyCandidatureUpdates" 
                name="notifyCandidatureUpdates"
                checked={formData.notifyCandidatureUpdates}
                onChange={handleChange}
                className="rounded text-teal-500 focus:ring-teal-500" 
              />
              <label htmlFor="notifyCandidatureUpdates" className="ml-2 text-sm text-gray-800">
                Mises à jour sur mes candidatures
              </label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="notifyMessages" 
                name="notifyMessages"
                checked={formData.notifyMessages}
                onChange={handleChange}
                className="rounded text-teal-500 focus:ring-teal-500" 
              />
              <label htmlFor="notifyMessages" className="ml-2 text-sm text-gray-800">
                Messages des recruteurs
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSaving}
            className={`bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-colors flex items-center ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde en cours...
              </>
            ) : (
              'Sauvegarder les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsWidget;