import axios from 'axios';

const API_URL = 'http://localhost:5283/api/Dashboard'; 

export const statsService = {
  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      throw error;
    }
  }
};