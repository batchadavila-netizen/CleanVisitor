
const API_URL = "http://localhost:5283/api/auth"; // Ajuste le port de ton API

export const authService = {
  // INSCRIPTION
  register: async (userData) => {
    const response = await fetch(`${API_URL}/Inscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Nom: userData.nom,
        Prenom: userData.prenom,
        Email: userData.email,
        Password: userData.password,
        Role: parseInt(userData.role) // On s'assure que c'est un entier pour l'Enum C#
      }),
    });
    if (!response.ok) throw new Error("Erreur lors de l'inscription");
    return response; 
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
    
    // Mapping de l'Enum C# vers du texte pour React
    const rolesMap = { 1: 'Admin', 2: 'Agent', 3: 'Visiteur' };
    const roleText = rolesMap[data.user.role] || 'Visiteur';

    // Stockage des infos
    localStorage.setItem('token', data.token);
    localStorage.setItem('userRole', roleText); 
    localStorage.setItem('userName', `${data.user.prenom} ${data.user.nom}`);

    return { role: roleText, user: data.user };
  }
};