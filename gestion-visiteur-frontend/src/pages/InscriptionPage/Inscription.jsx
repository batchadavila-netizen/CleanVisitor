import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const Inscription = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '', // 1. Ajout du champ dans l'état initial
        password: '',
        role: '3' // Par défaut Visiteur
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Le formData contient maintenant le téléphone
            await authService.Inscription(formData);
            
            alert("Inscription réussie !");
            navigate('/login'); 
        } catch (err) {
            console.error("Erreur d'inscription:", err);
            alert(err.message); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-900">DAVILA ENTREPRISE</h1>
                    <p className="text-slate-500">Créez votre compte visiteur</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nom</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Prénom</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* 2. NOUVEAU : Champ Téléphone */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Téléphone</label>
                        <input 
                            type="tel" 
                            required
                            placeholder="+237 6XX XX XX XX"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                            onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Mot de passe</label>
                        <input 
                            type="password" 
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Type de compte</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="3">Visiteur</option>
                            <option value="2">Agent</option>
                            <option value="1">Administrateur</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all mt-4"
                    >
                        S'inscrire
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-6 text-sm">
                    Déjà un compte ? <Link to="/login" className="text-blue-600 font-bold">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Inscription;