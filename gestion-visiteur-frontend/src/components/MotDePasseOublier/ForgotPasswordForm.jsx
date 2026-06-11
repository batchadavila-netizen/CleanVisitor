import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5283/api/auth/forgot-password', { email });
      setSent(true);
      toast.success("Email envoyé !");
    } catch {
      toast.error("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <Toaster position="top-right" />

      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✅
          </div>
          <h3 className="font-black text-slate-800 text-lg">Email envoyé !</h3>
          <p className="text-slate-500 text-sm">
            Si <strong>{email}</strong> est associé à un compte, vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
          <p className="text-slate-400 text-xs">Le lien expire dans 1 heure.</p>
          <button
            onClick={onBack}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            ← Retour à la connexion
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 transition"
              placeholder="votre@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-60"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
            >
              ← Retour à la connexion
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;