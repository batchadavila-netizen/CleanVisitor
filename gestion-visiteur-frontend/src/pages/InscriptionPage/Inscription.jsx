import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const Inscription = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        role: '3' // Par défaut Visiteur
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.Inscription(formData);
            alert("Inscription réussie !");
            navigate('/login');
        } catch (err) {
            console.error("Erreur d'inscription:", err);
            alert(err.message);
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
                    <h2 className="text-[26px] font-semibold text-slate-900 mb-1.5">Créer un compte</h2>
                    <p className="text-sm text-slate-500">Remplissez le formulaire pour vous inscrire</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Nom</label>
                            <input
                                type="text"
                                required
                                placeholder="Dupont"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Prénom</label>
                            <input
                                type="text"
                                required
                                placeholder="Jean"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Téléphone</label>
                        <input
                            type="tel"
                            required
                            placeholder="+237 6XX XX XX XX"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="nom@exemple.com"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Type de compte</label>
                        <select
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="3">Visiteur</option>
                            <option value="2">Agent</option>
                            <option value="1">Administrateur</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors text-[16px]"
                    >
                        Créer mon compte
                    </button>
                </form>

                <div className="flex items-center gap-3.5 my-7">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">ou</span>
                    <div className="flex-1 h-px bg-slate-200" />
                </div>

                <p className="text-center text-[15px] text-slate-600">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Inscription;