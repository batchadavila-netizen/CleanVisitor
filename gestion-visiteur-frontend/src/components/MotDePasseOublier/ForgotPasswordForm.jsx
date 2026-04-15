import React from 'react';

const ForgotPasswordForm = ({ onBack }) => {
  return (
    <form className="space-y-6 animate-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse Email</label>
        <input 
          type="email" 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition" 
          placeholder="votre@email.com" 
        />
      </div>
      <button type="button" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100">
        Envoyer le lien
      </button>
      <div className="text-center">
        <button 
          type="button"
          onClick={onBack} // Utilise la fonction reçue en "props"
          className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
        >
          ← Retour à la connexion
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;