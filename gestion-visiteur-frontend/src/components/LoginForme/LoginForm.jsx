import React, { useState } from 'react';

const LoginForm = ({ onForgot, onSubmitLogin }) => {
  // 1. États pour les champs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Pour bloquer le bouton pendant l'appel

  // 2. Gestionnaire de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true); // Active l'état de chargement
    console.log("LoginForm : Tentative d'envoi des données au parent...");

    try {
      // On appelle la fonction passée par Login.jsx
      await onSubmitLogin(email, password);
    } catch (error) {
      console.error("Erreur lors de l'appel parent dans LoginForm:", error);
    } finally {
      setIsLoading(false); // Désactive le chargement quoi qu'il arrive
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 animate-in fade-in duration-300"
    >
      {/* Champ Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Adresse Email
        </label>
        <input 
          type="email" 
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" 
          placeholder="nom@exemple.com" 
        />
      </div>

      {/* Champ Mot de passe */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Mot de passe
        </label>
        <input 
          type="password" 
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" 
          placeholder="••••••••" 
        />
        <div className="mt-2 text-right">
          <button 
            type="button"
            onClick={onForgot} 
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </div>

      {/* Bouton de connexion avec état Loading */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" viewBox="0 0 24 24"></svg>
            Connexion en cours...
          </>
        ) : "Se connecter"}
      </button>

      {/* Séparateur visuel */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Sécurité Aigle</span></div>
      </div>
    </form>
  );
};

export default LoginForm;