import { fetchWithAuth } from './apiClient';

export const visitorService = {
  // 🟢 Récupération dynamique selon le rôle connecté
  getAll: async () => {
    try {
      const usersData = await fetchWithAuth('/api/user');
      const list = Array.isArray(usersData) ? usersData : (usersData?.$values || []);
      const userRole = localStorage.getItem('userRole');

      // 🟢 Admin : Récupère TOUS les comptes. Agent : Visiteurs uniquement.
      const filteredList = (userRole === 'Admin' || userRole === '1') 
        ? list 
        : list.filter(u => String(u.role) === '3' || String(u.role).toLowerCase() === 'visiteur');

      return filteredList.map(u => ({
        id: u.id || u.Id,
        nom: u.nom || u.Nom,
        prenom: u.prenom || u.Prenom,
        email: u.email || u.Email,
        telephone: u.telephone || u.Telephone || u.phoneNumber || u.Phone || 'N/A',
        createdAt: u.createdAt || u.CreatedAt,
        role: u.role || u.Role,
        service: u.service || u.Service || ''
      }));
    } catch (error) {
      console.error("Erreur getAll visitors:", error);
      return [];
    }
  },

  // 🟢 Récupération d'un utilisateur / visiteur par son ID (Correction 404)
  getById: async (id) => {
    try {
      return await fetchWithAuth(`/api/user/${id}`);
    } catch {
      // Fallback au cas où l'ancienne route /api/Visitor/ est encore active côté C#
      return fetchWithAuth(`/api/Visitor/${id}`).catch(() => null);
    }
  },

  // 🟢 Mise à jour générale d'un profil (Règle l'erreur update is not a function)
  update: async (id, userData) => {
    const payload = {
      id: parseInt(id || userData.id || userData.Id, 10),
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      telephone: userData.telephone,
      role: parseInt(userData.role ?? 3, 10),
      service: userData.service ? String(userData.service) : null,
      isActive: true
    };

    // 🟢 Envoi direct sur /api/user sans l'ID dans l'URL
    return fetchWithAuth('/api/user', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // 🟢 Mise à jour spécifique Rôle et Service par l'Admin
  updateRoleAndService: async (userData) => {
    return fetchWithAuth('/api/user', {
      method: 'PUT',
      body: JSON.stringify({
        id: parseInt(userData.id || userData.Id, 10),
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        telephone: userData.telephone,
        role: parseInt(userData.role, 10),
        service: String(userData.service || ''), 
        isActive: true
      })
    });
  },
  // 🟢 Corbeille, Suppression, Restauration et Création
  getDeleted: () => fetchWithAuth('/api/Visitor/deleted').catch(() => []),
  delete: (id) => fetchWithAuth(`/api/user/${id}`, { method: 'DELETE' }).catch(() => fetchWithAuth(`/api/Visitor/${id}`, { method: 'DELETE' })),
  restore: (id) => fetchWithAuth(`/api/user/restore/${id}`, { method: 'POST' }).catch(() => fetchWithAuth(`/api/Visitor/restore/${id}`, { method: 'POST' })),
  create: (visitorData) => fetchWithAuth('/api/Visitor', {
    method: 'POST',
    body: JSON.stringify(visitorData)
  }),

  // 🟢 Statistiques d'affluence
  getStatJour: () => fetchWithAuth('/api/Visitor/stat_jour').catch(() => 0),
  getStatMois: () => fetchWithAuth('/api/Visitor/stat_mois').catch(() => 0),
  getStatAnnee: () => fetchWithAuth('/api/Visitor/stat_annee').catch(() => 0)
};