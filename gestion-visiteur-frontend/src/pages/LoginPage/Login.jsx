import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        const rawRole = data.role;
        localStorage.setItem('userRole', rawRole);

        // 🟢 Utilisation du OU (||)
if (rawRole === 'Admin' || rawRole === 'Agent') {
  navigate('/dashboard');
}
        else {
          navigate('/mon-espace');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Identifiants incorrects.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-10">
      <div className="w-full max-w-[480px]">

        <div className="text-center mb-9">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-[46px] h-[46px] bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              DE
            </div>
            <span className="text-lg font-semibold text-slate-900">Davila Entreprise</span>
          </div>
          <h2 className="text-[26px] font-semibold text-slate-900 mb-1.5">
            {view === 'login' ? 'Bon retour' : 'Récupération'}
          </h2>
          <p className="text-sm text-slate-500">
            {view === 'login' ? 'Connectez-vous à votre espace' : 'Entrez votre email pour réinitialiser'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded">
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
          <>
            <div className="flex items-center gap-3.5 my-7">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <p className="text-center text-[15px] text-slate-600">
              Pas encore de compte ?{' '}
              <Link to="/Inscription" className="font-semibold text-blue-600 hover:underline">
                S'inscrire
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;