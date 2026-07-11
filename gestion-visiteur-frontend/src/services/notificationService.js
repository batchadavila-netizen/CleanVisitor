import axios from 'axios';

const API_URL = 'http://localhost:5283/api/Notifications';

// 🔥 Helper pour le token — comme dans visitService.js
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const notificationService = {
  getByVisitor: async (visitorId) => {
    try {
      const response = await axios.get(`${API_URL}/visitor/${visitorId}`, getAuthHeader());
      return response.data.$values || response.data;
    } catch (error) {
      console.error("Erreur notificationService (GetByVisitor):", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin`, getAuthHeader()); // 🔥 token ajouté
      return response.data?.$values || response.data?.value || response.data || [];
    } catch (error) {
      console.error("Erreur notificationService (GetAll):", error);
      throw error;
    }
  },
};