import axios from 'axios';

const API_URL = 'http://localhost:5283/api/Notifications';

export const notificationService = {
  // Récupérer les notifications d'un visiteur spécifique
  getByVisitor: async (visitorId) => {
    try {
      const response = await axios.get(`${API_URL}/visitor/${visitorId}`);
      // On gère le format $values de l'API .NET si nécessaire
      return response.data.$values || response.data;
    } catch (error) {
      console.error("Erreur notificationService (GetByVisitor):", error);
      throw error;
    }
  },

    getAll: async () => {
        try {
            // AJOUTE /admin à la fin de l'URL
            const response = await axios.get('http://localhost:5283/api/Notifications/admin');
            return response.data;
        } catch (error) {
            console.error("Erreur notificationService (GetAll):", error);
            throw error;
        }
    },
    
};