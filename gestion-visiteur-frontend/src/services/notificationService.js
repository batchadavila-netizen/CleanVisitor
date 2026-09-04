import { fetchWithAuth } from './apiClient';

export const notificationService = {
  getByVisitor: async (visitorId) => {
    try {
      // 🟢 Chemin corrigé avec '/' au début pour éviter la collision avec l'URL de base
      const data = await fetchWithAuth(`/api/Notifications/visitor/${visitorId}`);
      return data?.$values || data;
    } catch (error) {
      console.error("Erreur notificationService (GetByVisitor):", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      // 🟢 Chemin corrigé avec '/' au début
      const data = await fetchWithAuth('/api/Notifications/admin');
      return data?.$values || data?.value || data || [];
    } catch (error) {
      console.error("Erreur notificationService (GetAll):", error);
      throw error;
    }
  },
};