const API_URL = "http://localhost:5283/api/auth";

export const authService = {
  // INSCRIPTION
  Inscription: async (userData) => {
    const response = await fetch(`${API_URL}/register`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nom: userData.nom,
        Prenom: userData.prenom,
        Email: userData.email,
        Password: userData.password,
        Telephone: userData.telephone,
        Role: parseInt(userData.role, 10),
        Service: parseInt(userData.service || '5', 10) // 🟢 Transmission du service (5 par défaut)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de l'inscription");
    }
    
    return response.status === 201 ? { success: true } : await response.json();
  },

  // CONNEXION
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Password: password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Identifiants invalides");
    }

    const data = await response.json();
    
    // 🟢 MAPPING RÔLE ET SERVICE
    const rolesMap = {
      1: 'Admin', 'Admin': 'Admin',
      2: 'Agent', 'Agent': 'Agent',
      3: 'Visiteur', 'Visiteur': 'Visiteur'
    };

    const roleText = rolesMap[data.role || data.user?.role] || 'Visiteur';
    
    // Extraction du code de service (par l'API directe ou dans user, "5" par défaut)
    const serviceCode = String(data.service || data.user?.service || '5');

    console.log("🔍 Rôle décodé:", roleText, "| Service décodé:", serviceCode);

    // 🟢 STOCKAGE LOCALSTORAGE
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', roleText); 
    localStorage.setItem('userService', serviceCode); // 👈 Sauvegarde clé du service !
    localStorage.setItem('userName', `${data.user?.prenom || ''} ${data.user?.nom || ''}`);
    localStorage.setItem('user', JSON.stringify(data.user));

    // IDs utilisateur & visiteur
    localStorage.setItem('userId', data.user?.id || data.id);
    const vId = data.user?.visitorId || data.user?.idVisitor || data.user?.id; 
    localStorage.setItem('visitorId', vId);

    // Retour de l'objet complet avec service
    return { 
      role: roleText, 
      service: serviceCode, 
      user: data.user, 
      token: data.token 
    };
  },

  // PROFIL UTILISATEUR
  getProfile: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5283/api/users/profile/${userId}`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });
    return await response.json();
  }
};