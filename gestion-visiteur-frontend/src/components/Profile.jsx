import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, Shield, Loader2, BookmarkCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({
        id: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');

                if (!userId || !token) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5283/api/user/profile/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser({
                        id: data.id || data.userId || '',
                        nom: data.nom || data.lastName || '',
                        prenom: data.prenom || data.firstName || '',
                        email: data.email || '',
                        telephone: data.telephone || data.phoneNumber || '',
                        role: data.roleName || data.role || 'Utilisateur'
                    });
                } else {
                    const errorData = await response.text();
                    console.error("Erreur Backend:", response.status, errorData);
                    setError(`Erreur serveur (${response.status}).`);
                }
            } catch (error) {
                console.error("Erreur de connexion au serveur:", error);
                setError("Impossible de contacter le serveur.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const getRoleColor = (role) => {
        if (role === 'Admin') return 'bg-red-50 text-red-700 border-red-100';
        if (role === 'Agent') return 'bg-orange-50 text-orange-700 border-orange-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    const getInitials = () => {
        const n = user.nom?.charAt(0) || '';
        const p = user.prenom?.charAt(0) || '';
        return `${p}${n}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="text-slate-500 font-bold animate-pulse">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className={`flex-1 p-8 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={50} />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Erreur de Profil</h2>
                        <p className="text-slate-500 text-sm mb-6">{error}</p>
                        <button onClick={() => window.location.reload()}
                            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                            Réessayer
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`flex-1 p-8 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-4xl mx-auto">

                    {/* HEADER */}
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">Mon Profil</h1>
                            <p className="text-sm text-slate-500">Système de Gestion des Visiteurs — Davila Entreprise</p>
                        </div>
                        <BookmarkCheck size={36} className="text-blue-600 opacity-20 hidden md:block" />
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* CARTE GAUCHE */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                {/* Bande couleur en haut */}
                                <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />

                                <div className="px-6 pb-6">
                                    {/* Avatar */}
                                    <div className="flex justify-center -mt-10 mb-4">
                                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                                            {getInitials()}
                                        </div>
                                    </div>

                                    <div className="text-center mb-5">
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            {user.prenom} {user.nom}
                                        </h2>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold mt-2 border ${getRoleColor(user.role)}`}>
                                            <Shield size={11} />
                                            {user.role}
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-slate-100 pt-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                <Mail size={15} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                                                <p className="text-sm font-medium text-slate-700 truncate">{user.email || 'Non renseigné'}</p>
                                            </div>
                                        </div>

                                        {/* Téléphone — affiché seulement si disponible */}
                                        {user.telephone && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <Phone size={15} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Téléphone</p>
                                                    <p className="text-sm font-medium text-slate-700">{user.telephone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARTE DROITE */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* FICHE D'IDENTIFICATION */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-2.5 mb-6">
                                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                                        <User size={16} className="text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 text-sm">Fiche d'identification</h3>
                                </div>

                                {/* NOM ET PRÉNOM — même largeur grâce à grid */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nom</label>
                                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm">
                                            {user.nom || "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prénom</label>
                                        <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm">
                                            {user.prenom || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adresse email</label>
                                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm flex items-center gap-2">
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email || "—"}
                                    </div>
                                </div>

                                {/* Téléphone — affiché seulement si disponible, sinon message informatif */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-slate-800 font-medium">
                                            <Phone size={14} className="text-slate-400" />
                                            {user.telephone || 'Non renseigné'}
                                        </span>
                                        {user.telephone && (
                                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs font-semibold">
                                                <CheckCircle2 size={11} />
                                                Vérifié
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SÉCURITÉ */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                        <Lock size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-base">Sécurité du système</h3>
                                        <p className="text-xs text-slate-400">Accès restreint aux données des visiteurs</p>
                                    </div>
                                </div>
                                <button className="relative z-10 bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-slate-900 transition-all">
                                    Gérer les accès
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;