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
    try {
        const data = await authService.login(email, password); 
        
        if (data) {
            const rawRole = data.role; // C'est le rôle transformé par ton authService (Admin, Agent ou Visiteur)

            console.log("Rôle final après traitement service :", rawRole);

            // 1. On stocke le rôle tel quel (il est déjà bien formaté par authService)
            localStorage.setItem('userRole', rawRole);

            // 2. REDIRECTION BASÉE UNIQUEMENT SUR LE RÔLE
            if (rawRole === 'Admin') {
                navigate('/dashboard');
            } 
            else if (rawRole === 'Agent') {
                navigate('/visitors');
            } 
            else {
                // Pour les Visiteurs (rôle 3)
                navigate('/mon-espace');
            }
        }
    } catch (err) {
        setErrorMessage(err.message || "Identifiants incorrects.");
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