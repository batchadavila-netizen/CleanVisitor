import { fetchWithAuth } from './apiClient';

export const visitService = {
    // 🟢 1. Création de visite (/api/Visit)
    create: (visitData) => fetchWithAuth('/api/Visit', {
        method: 'POST',
        body: JSON.stringify(visitData)
    }),

    // 🟢 2. Récupération globale (/api/Visit)
    getAll: async () => {
        const data = await fetchWithAuth('/api/Visit');
        return data?.$values || data;
    },

    // 🟢 3. Visites d'un visiteur spécifique (/api/Visit/user/{userId})
    getVisitorVisit: async (userId) => {
        const data = await fetchWithAuth(`/api/Visit/user/${userId}`);
        return data?.$values || data;
    },

    // 🟢 4. Mise à jour d'une visite (/api/Visit)
    updateVisit: async (id, data) => {
        try {
            return await fetchWithAuth('/api/Visit', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error("Erreur PUT:", error);
            throw error;
        }
    },

    // 🟢 5. Changement de statut (/api/Visit/{id}/status)
    updateVisitStatus: async (id, newStatus) => {
        try {
            return await fetchWithAuth(`/api/Visit/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ statut: parseInt(newStatus, 10) })
            });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut :", error);
            throw error;
        }
    },

    // 🟢 6. Visites par date (/api/Visit/{date})
    getByDate: async (date) => {
        const data = await fetchWithAuth(`/api/Visit/${date}`);
        return data?.$values || data?.value || (Array.isArray(data) ? data : []);
    },

    // 🟢 7. Visites par service (/api/Visit/service/{service})
    getMyServiceVisits: async () => {
        const userService = localStorage.getItem('userService') || '5';

        try {
            return await fetchWithAuth(`/api/Visit/service/${userService}`);
        } catch (error) {
            console.error("Erreur d'accès à l'API service, bascule sur la liste globale:", error);
        }

        try {
            const allVisits = await fetchWithAuth('/api/Visit');
            const visitsArray = allVisits?.$values || allVisits || [];

            if (userService !== '5') {
                return visitsArray.filter(visit => 
                    String(visit.serviceId || visit.service || visit.hostService) === String(userService)
                );
            }
            return visitsArray;
        } catch (fallbackError) {
            console.error("Erreur fallback:", fallbackError);
            return [];
        }
    }
};