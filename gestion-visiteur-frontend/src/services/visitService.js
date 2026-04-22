import axios from 'axios';

// Vérifie bien que ton backend tourne sur ce port
const API_URL = 'http://localhost:5283/api'; 

export const visitService = {
    // 1. Créer une visite (Visiteur)
    create: async (visitData) => {
        const token = localStorage.getItem('token');
        // Utilisation du pluriel /Visits pour correspondre au standard
        const response = await axios.post(`${API_URL}/Visit`, visitData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // 2. Récupérer toutes les visites (Admin)
    getAll: async () => {
        const response = await axios.get(`${API_URL}/Visit`); 
        return response.data;
    },

    // 3. Récupérer les visites spécifiques d'un utilisateur
    getVisitorVisit: async (userId) => {
        try {
            // Correspond à ta route [HttpGet("user/{userId}")] du Controller
            const response = await axios.get(`${API_URL}/Visit/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des visites du visiteur", error);
            throw error;
        }
    },
    update: async (id, visitData) => {
        const token = localStorage.getItem('token');
        // On utilise PUT pour la modification complète
        const response = await axios.put(`${API_URL}/Visit/${id}`, visitData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // 4. MAJ du statut (Accepter/Refuser)
    updateStatus: async (id, newStatus) => {
        try {
            // L'URL doit être /api/Visits/{id}/status
            const response = await axios.patch(`${API_URL}/Visit/${id}/status`, { 
                statut: parseInt(newStatus) 
            });
            
            // On retourne la data (le message de succès du backend)
            return response.data; 
        } catch (error) {
            console.error("Erreur lors de l'update status:", error);
            // On renvoie l'erreur pour que le composant React puisse l'afficher
            throw error; 
        }
    }
};