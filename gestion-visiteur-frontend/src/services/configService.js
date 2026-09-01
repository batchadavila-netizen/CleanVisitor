import { fetchWithAuth } from './apiClient';

export const configService = {
  // 1. Récupération des données
  getConfig: async () => {
    try {
      // 🟢 Chemin corrigé : /api/SystemConfig
      const data = await fetchWithAuth('/api/SystemConfig');

      // Synchronisation synchrone du cache local
      if (data?.companyName) localStorage.setItem('companyName', data.companyName);
      if (data?.companyServices) localStorage.setItem('companyServices', JSON.stringify(data.companyServices));
      
      return data;
    } catch (error) {
      console.warn("API non joignable, bascule sur le cache local", error);
      return {
        companyName: localStorage.getItem('companyName') || "Davila Entreprise",
        contactEmail: "contact@davila.com",
        passValidityHours: 2,
        maxConcurrentVisitors: 50,
        autoExpireHours: 24,
        enableEmailNotifs: true,
        companyServices: JSON.parse(localStorage.getItem('companyServices') || '["Direction","RH","Finance"]')
      };
    }
  },

  // 2. Enregistrement en Base de Données
  saveConfig: async (newConfig) => {
    try {
      // 🟢 Chemin corrigé : /api/SystemConfig
      const updatedData = await fetchWithAuth('/api/SystemConfig', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      });

      // Mise à jour du cache local et émission de l'événement
      if (updatedData?.companyName) localStorage.setItem('companyName', updatedData.companyName);
      if (updatedData?.companyServices) localStorage.setItem('companyServices', JSON.stringify(updatedData.companyServices));
      
      window.dispatchEvent(new Event('configUpdated'));

      return updatedData;
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      throw error;
    }
  }
};