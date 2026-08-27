// src/services/configService.js
const API_BASE_URL = 'http://localhost:5283/api/SystemConfig';

export const configService = {
  // 1. Récupération des données depuis SQL Server via l'API C#
  getConfig: async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Erreur de réponse du serveur");
      
      const data = await response.json();

      // Synchronisation synchrone du cache local
      localStorage.setItem('companyName', data.companyName);
      localStorage.setItem('companyServices', JSON.stringify(data.companyServices));
      
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

  // 2. Enregistrement direct en Base de Données SQL Server
  saveConfig: async (newConfig) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newConfig)
      });

      if (!response.ok) throw new Error("Erreur de sauvegarde backend");

      const updatedData = await response.json();

      // Mise à jour immédiate du cache local et émission de l'événement
      localStorage.setItem('companyName', updatedData.companyName);
      localStorage.setItem('companyServices', JSON.stringify(updatedData.companyServices));
      
      // Notifie la Sidebar et l'ensemble de l'application
      window.dispatchEvent(new Event('configUpdated'));

      return updatedData;
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      throw error;
    }
  }
};