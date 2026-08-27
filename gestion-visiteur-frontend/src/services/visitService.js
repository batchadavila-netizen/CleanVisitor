import axios from 'axios';

const API_URL = "http://localhost:5283/api/Visit";

// Helper pour récupérer le token
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const visitService = {
    // 1. Créer une visite
    create: async (visitData) => {
        const response = await axios.post(API_URL, visitData, getAuthHeader());
        return response.data;
    },

    // 2. Récupérer toutes les visites
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthHeader()); 
        return response.data?.$values || response.data;
    },

    // 3. Récupérer les visites d'un utilisateur (🟢 URL CORRIGÉE)
    getVisitorVisit: async (userId) => {
        const response = await axios.get(`${API_URL}/user/${userId}`, getAuthHeader());
        return response.data?.$values || response.data;
    },

    // 4. Mise à jour complète (Reprogrammation)
    updateVisit: async (id, data) => {
        try {
            const response = await axios.put(API_URL, data, getAuthHeader());
            return response.data;
        } catch (error) {
            console.error("Erreur PUT:", error.response);
            throw error;
        }
    },

    // 5. MAJ du statut (Patch)
    updateVisitStatus: async (id, newStatus) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, {
                statut: parseInt(newStatus, 10)
            }, getAuthHeader());
            
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut :", error);
            throw error;
        }
    },

    // 6. Récupérer par date (pour les créneaux)
    getByDate: async (date) => {
        const response = await axios.get(`${API_URL}/${date}`, getAuthHeader());
        const data = response.data;
        return data?.$values || data?.value || (Array.isArray(data) ? data : []);
    },

    // 7. Récupérer les visites d'un service
    getMyServiceVisits: async () => {
        const token = localStorage.getItem('token');
        const userService = localStorage.getItem('userService') || '5';

        try {
            const response = await fetch(`${API_URL}/service/${userService}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error("Erreur d'accès à l'API service :", error);
        }

        // Fallback sur la liste globale si l'endpoint échoue
        const fallbackResponse = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!fallbackResponse.ok) return [];
        
        const allVisits = await fallbackResponse.json();

        if (userService !== '5') {
            return allVisits.filter(visit => 
                String(visit.serviceId || visit.service || visit.hostService) === String(userService)
            );
        }

        return allVisits;
    }
};