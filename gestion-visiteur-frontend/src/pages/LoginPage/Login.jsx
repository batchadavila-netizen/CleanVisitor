import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ForgotPasswordForm from '../../components/MotDePasseOublier/ForgotPasswordForm';
import { authService } from '../../services/authService';
import { configService } from '../../services/configService';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [companyName, setCompanyName] = useState(
    localStorage.getItem('companyName') || 'Davila Entreprise'
  );

  useEffect(() => {
    configService.getConfig().then((data) => {
      if (data && data.companyName) setCompanyName(data.companyName);
    });

    const handleUpdate = () => {
      const updatedName = localStorage.getItem('companyName');
      if (updatedName) setCompanyName(updatedName);
    };

    window.addEventListener('configUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('configUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'DE';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const data = await authService.login(email, password);

      if (data) {
        // Normalisation de la casse pour éviter les erreurs de correspondance
        const rawRole = String(data.role || data.user?.role || '').toLowerCase();
        const rawService = String(data.service || data.user?.service || '5').toLowerCase();

        // Stockage dans le localStorage
        localStorage.setItem('userRole', data.role || data.user?.role);
        localStorage.setItem('userService', rawService);
        if (data.user?.nom || data.user?.prenom) {
          localStorage.setItem('userName', `${data.user?.nom || ''} ${data.user?.prenom || ''}`);
        }

        // 1. Administrateur -> Dashboard Global
        if (rawRole === 'admin' || rawRole === '1') {
          navigate('/dashboard');
        } 
        // 2. Agent -> Routage selon le service d'affectation
        else if (rawRole === 'agent' || rawRole === '2') {
          // '5' ou 'secretariat' = Poste d'Accueil Général -> Dashboard Global
          if (rawService === '5' || rawService === 'secretariat') {
            navigate('/dashboard');
          } else {
            // Tout autre service (RH, Finance, IT, Direction) -> Espace Service restreint
            navigate('/agent-dashboard');
          }
        } 
        // 3. Visiteur -> Espace Personnel
        else {
          navigate('/mon-espace');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Identifiants incorrects.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-[#F4F7F9]">
      
      {/* PANNEAU GAUCHE : BRANDING SOMBRE */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-lg p-12 text-left">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-8 shadow-lg shadow-blue-600/30">
            {getInitials(companyName)}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Bienvenue sur <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {companyName}
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Connectez-vous pour accéder à votre espace de gestion des visites, consulter vos autorisations d'accès et suivre l'activité en temps réel.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
              <Shield size={16} className="text-blue-400" /> Accès sécurisé
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
              <Sparkles size={16} className="text-indigo-400" /> Gestion fluide
            </div>
          </div>
        </div>
      </div>

      {/* PANNEAU DROIT : FORMULAIRE CENTRÉ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">

          {/* En-tête mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/30">
              {getInitials(companyName)}
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[26px] font-black text-slate-900 mb-1.5 tracking-tight">
              {view === 'login' ? 'Bon retour !' : 'Récupération'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {view === 'login' ? 'Connectez-vous à votre espace personnel' : 'Entrez votre email pour réinitialiser le mot de passe'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <ForgotPasswordForm onBack={() => setView('login')} />
          )}

          {view === 'login' && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs font-bold text-slate-400 uppercase">ou</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <p className="text-center text-sm font-medium text-slate-600">
                Pas encore de compte ?{' '}
                <Link to="/Inscription" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                  S'inscrire
                </Link>
              </p>
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;