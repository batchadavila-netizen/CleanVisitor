import { fetchWithAuth } from './apiClient';

export const authService = {
  // INSCRIPTION : Route /api/auth/register
  Inscription: async (userData) => {
    return await fetchWithAuth('/api/auth/register', { 
      method: 'POST',
      body: JSON.stringify({
        Nom: userData.nom,
        Prenom: userData.prenom,
        Email: userData.email,
        Password: userData.password,
        Telephone: userData.telephone,
        Role: parseInt(userData.role, 10),
        Service: parseInt(userData.service || '5', 10)
      }),
    });
  },

  // CONNEXION : Route /api/auth/login
  login: async (email, password) => {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ Email: email, Password: password }),
    });

    const rolesMap = {
      1: 'Admin', '1': 'Admin', 'admin': 'Admin', 'Admin': 'Admin',
      2: 'Agent', '2': 'Agent', 'agent': 'Agent', 'Agent': 'Agent',
      3: 'Visiteur', '3': 'Visiteur', 'visiteur': 'Visiteur', 'Visiteur': 'Visiteur'
    };

    const rawRole = data.role ?? data.user?.role ?? data.Role;
    const roleText = rolesMap[rawRole] || rolesMap[String(rawRole).trim()] || 'Visiteur';
    const serviceCode = String(data.service || data.user?.service || '5');

    if (data.token) localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', roleText); 
    localStorage.setItem('userService', serviceCode);
    localStorage.setItem('userName', `${data.user?.prenom || ''} ${data.user?.nom || ''}`);
    
    const resolvedUserId = data.user?.id || data.user?.Id || data.id || data.Id;
    const resolvedVisitorId = data.user?.visitorId || data.user?.VisitorId || resolvedUserId;

    if (resolvedUserId) localStorage.setItem('userId', resolvedUserId);
    if (resolvedVisitorId) localStorage.setItem('visitorId', resolvedVisitorId);

    if (data.user) {
      const updatedUser = { ...data.user, id: resolvedUserId, role: roleText };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return { 
      role: roleText, 
      service: serviceCode, 
      user: data.user, 
      token: data.token 
    };
  },

  // 🟢 CONNEXION GOOGLE SSO (Synchronisation des identifiants SQL)
  loginWithGoogle: async (googleData) => {
    const data = await fetchWithAuth('/api/auth/google-login', { 
      method: 'POST',
      body: JSON.stringify({
        Email: googleData.email,
        Nom: googleData.nom || googleData.familyName,
        Prenom: googleData.prenom || googleData.givenName,
        Telephone: googleData.telephone || ''
      }),
    });

    const resolvedUserId = data.user?.id || data.user?.Id || data.userId || data.id;
    const resolvedVisitorId = data.user?.visitorId || data.visitorId || resolvedUserId;

    if (data.token) localStorage.setItem('token', data.token);
    if (resolvedUserId) localStorage.setItem('userId', resolvedUserId);
    if (resolvedVisitorId) localStorage.setItem('visitorId', resolvedVisitorId);
    
    localStorage.setItem('userRole', 'Visiteur');
    localStorage.setItem('userName', `${googleData.prenom || ''} ${googleData.nom || ''}`);
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify({ ...data.user, id: resolvedUserId }));
    }

    return data;
  },

  // 🟢 SYNCHRONISATION CLERK / GOOGLE SSO
  syncClerkUser: async (userData) => {
    const data = await fetchWithAuth('/api/user/sync', { 
      method: 'POST',
      body: JSON.stringify({
        Email: userData.email,
        Nom: userData.nom,
        Prenom: userData.prenom,
        Telephone: userData.telephone || '+237600000000'
      }),
    });

    const resolvedUserId = data.userId || data.user?.id || data.id;
    if (data.token) localStorage.setItem('token', data.token);
    if (resolvedUserId) {
      localStorage.setItem('userId', resolvedUserId);
      localStorage.setItem('visitorId', resolvedUserId);
    }
    
    localStorage.setItem('userRole', 'Visiteur');
    localStorage.setItem('userName', `${userData.prenom || ''} ${userData.nom || ''}`);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  },

  // PROFIL UTILISATEUR
  getProfile: async (userId) => {
    return await fetchWithAuth(`/api/user/profile/${userId}`);
  }
};