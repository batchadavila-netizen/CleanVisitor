import { fetchWithAuth } from './apiClient';

export const statsService = {
  getDashboardStats: async () => {
    try {
      // 🟢 Route corrigée avec le préfixe /api
      return await fetchWithAuth('/api/Dashboard/stats');
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      throw error;
    }
  }
};