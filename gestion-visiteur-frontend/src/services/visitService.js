import axios from 'axios';

const API_URL = 'http://localhost:5283/api/Visit'; // Vérifie ton port !

export const visitService = {
    // Créer une visite
    create: async (visitData) => {
        const response = await axios.post(API_URL, visitData);
        return response.data;
    },
    getAll: async () => {
        try {
            // On appelle explicitement ton nouveau endpoint C#
            const response = await axios.get(`${API_URL}/details`);
            console.log("Données reçues de l'API:", response.data); // Pour debugger dans la console F12
            return response.data;
        } catch (error) {
            console.error("Erreur API Details:", error);
            return []; // Retourne un tableau vide pour éviter que le .map() plante
        }
    },

    // Récupérer toutes les visites (pour l'admin)
   getAll: async () => {
        try {
            const response = await axios.get(`${API_URL}/details`);
            return response.data;
        } catch (error) {
            console.error("Erreur dans getAll (details):", error);
            throw error;
        }
    },

    // MAJ du statut (Validé = 2, Annulé = 3)
    updateStatus: async (id, status) => {
        return await axios.put(`${API_URL}/${id}/status`, { status });
    }
};