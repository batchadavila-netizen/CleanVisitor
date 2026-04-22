
const API_URL = "http://localhost:5283/api/auth"; // Ajuste le port de ton API

export const authService = {
  Inscription: async (userData) => {
    // ON CHANGE "Inscription" PAR "register" ICI :
    const response = await fetch(`${API_URL}/register`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // authService.js
body: JSON.stringify({
    Nom: userData.nom,
    Prenom: userData.prenom,
    Email: userData.email,
    Password: userData.password,
    Telephone: userData.telephone, // <--- AJOUT ICI (Nommé exactement comme en C#)
    Role: parseInt(userData.role)
}),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de l'inscription");
    }
    
    // Le CreatedAtAction renvoie souvent un contenu vide ou l'ID
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
    
    const rawRole = data.user.role; 

    const rolesMap = {
        1: 'Admin', '1': 'Admin', 'Admin': 'Admin',
        2: 'Agent', '2': 'Agent', 'Agent': 'Agent',
        3: 'Visiteur', '3': 'Visiteur', 'Visiteur': 'Visiteur'
    };

    const roleText = rolesMap[rawRole] || 'Visiteur';

    // --- STOCKAGE ---
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userRole', roleText); 
    localStorage.setItem('userName', `${data.user.prenom} ${data.user.nom}`);
    
    // AJOUT CRUCIAL : On stocke l'objet user en JSON pour récupérer l'email plus tard
    localStorage.setItem('user', JSON.stringify(data.user));

    return { role: roleText, user: data.user };
},
  // AJOUTER CECI DANS authService
// Action: Correct the endpoint in the service
getProfile: async (userId) => {
    const token = localStorage.getItem('token');
    // On change /api/auth par /api/users
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