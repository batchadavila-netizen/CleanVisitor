import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../../components/LoginForme/LoginForm';
import ForgotPasswordForm from '../../components/MotDePasseOublier/ForgotPasswordForm'; 
import { authService } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('login'); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (email, password) => {
    setErrorMessage('');
    console.log("1. Login.jsx : Tentative de connexion pour", email);

    try {
      // 1. Appel au service d'authentification
      const data = await authService.login(email, password); 
      console.log("2. Login.jsx : Réponse brute de l'API ->", data);
      
// Dans handleLoginSubmit (Login.jsx)
if (data) {
  // 1. On récupère ce que l'API nous donne
  const rawRole = data.role; // ex: "Visiteur"
  const userEmail = email.toLowerCase();

  console.log("Analyse du rôle reçu :", rawRole);

  // 2. LOGIQUE DE REDIRECTION INTELLIGENTE
  // On force l'admin si le rôle est 'Admin', '1' 
  // OU si c'est ton email de test (pour te débloquer)
  if (rawRole === 'Admin' || rawRole === '1' || userEmail === 'batchadavila81@gmail.com') {
    
    console.log("🚀 Accès Admin accordé !");
    localStorage.setItem('userRole', 'Admin'); // On stocke 'Admin' proprement
    localStorage.setItem('token', data.token || 'bypass-token');
    
    navigate('/dashboard');
  } 
  else if (rawRole === 'Agent' || rawRole === '2') {
    localStorage.setItem('userRole', 'Agent');
    navigate('/visitors');
  } 
  else {
    localStorage.setItem('userRole', 'Visiteur');
    navigate('/my-visits');
  }
}
    } catch (err) {
      console.error("ERREUR lors de la connexion :", err);
      // On affiche un message plus précis si possible
      setErrorMessage(err.message || "Identifiants incorrects ou serveur indisponible.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-block bg-blue-600 text-white w-12 h-12 rounded-xl mb-4 flex items-center justify-center font-bold text-2xl mx-auto">
            AI
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {view === 'login' ? 'Bon retour !' : 'Récupération'}
          </h2>
          <p className="text-slate-500 mt-2">
            {view === 'login' ? 'Connectez-vous à votre espace' : 'Entrez votre email pour réinitialiser'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-pulse">
            ⚠️ {errorMessage}
          </div>
        )}

        {view === 'login' ? (
          <LoginForm 
            onSubmitLogin={handleLoginSubmit} 
            onForgot={() => setView('forgot')} 
          />
        ) : (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}

        {view === 'login' && (
          <p className="text-center mt-8 text-slate-600 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/Inscription" className="font-bold text-blue-600 hover:underline">S'inscrire</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;