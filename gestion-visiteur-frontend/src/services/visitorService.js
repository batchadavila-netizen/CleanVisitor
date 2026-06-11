import axios from 'axios';

const API_URL = 'http://localhost:5283/api/Visitor'; // Vérifie ton port (5283 ou 5000)

export const visitorService = {
  // Récupérer tous les visiteurs
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getDeleted: async () => {
    // Cette route doit correspondre à ton [HttpGet("deleted")] côté C#
    const response = await axios.get(`${API_URL}/deleted`); 
    return response.data;
  },

  // Supprimer (Soft Delete)
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Restaurer
  restore: async (id) => {
    await axios.put(`${API_URL}/restore/${id}`);
  },

  // Ajouter un visiteur
  create: async (visitorData) => {
    const response = await axios.post(API_URL, visitorData);
    return response.data;
  },

  // 🔥 Récupérer un visiteur par son ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  // Dans visitorService.js, modifie cette fonction :
getByEmail: async (email) => {
  // On utilise API_URL pour rester cohérent avec le port 5283
  const response = await axios.get(`http://localhost:5283/api/User/email/${email}`);
  return response.data;
}
};