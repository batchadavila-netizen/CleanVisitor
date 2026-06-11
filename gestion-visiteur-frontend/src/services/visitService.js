import axios from 'axios';

const API_URL = 'http://localhost:5283/api'; 

// Helper pour récupérer le token
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const visitService = {
    // 1. Créer une visite
    create: async (visitData) => {
        const response = await axios.post(`${API_URL}/Visit`, visitData, getAuthHeader());
        return response.data;
    },

    // 2. Récupérer toutes les visites
    getAll: async () => {
        const response = await axios.get(`${API_URL}/Visit`, getAuthHeader()); 
        // Gestion du format $values de .NET si présent
        return response.data?.$values || response.data;
    },

    // 3. Récupérer les visites d'un utilisateur
    getVisitorVisit: async (userId) => {
        const response = await axios.get(`${API_URL}/Visit/user/${userId}`, getAuthHeader());
        return response.data?.$values || response.data;
    },

    // 4. Mise à jour complète (Reprogrammation)
    // Si PUT `${API_URL}/Visit/${id}` donne une erreur 405 :
    // Vérifie si ton API n'attend pas simplement `${API_URL}/Visit` (sans ID dans l'URL)
    // Assure-toi que l'ID est bien passé dans l'URL
updateVisit: async (id, data) => { // On peut garder 'id' en argument pour la clarté
    try {
        // CORRECTION : L'URL est simplement ${API_URL}/Visit
        // Les données (data) contiennent déjà l'ID nécessaire pour le Handler
        const response = await axios.put(`${API_URL}/Visit`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Erreur PUT:", error.response);
        throw error;
    }
},

    // 5. MAJ du statut (Patch)
     updateVisitStatus: async (id, newStatus) => {
        try {
            // Utilisation de axios.patch pour correspondre à [HttpPatch]
            // On envoie { statut: newStatus } car le backend utilise request.Statut
            const response = await axios.patch(`${API_URL}/Visit/${id}/status`, {
                statut: parseInt(newStatus)
            }, getAuthHeader());
            
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut :", error);
            throw error;
        }
    },

    // 6. Récupérer par date (pour les créneaux)
    getByDate: async (date) => {
        const response = await axios.get(`${API_URL}/Visit/${date}`, getAuthHeader());
        const data = response.data;
        return data?.$values || data?.value || (Array.isArray(data) ? data : []);
    },
};