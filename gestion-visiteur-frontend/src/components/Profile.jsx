import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, Shield, Loader2, BookmarkCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Ajout pour gérer l'erreur 500
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

                // Action: On utilise 'user' au singulier pour correspondre au UserController C#
                const response = await fetch(`http://localhost:5283/api/user/profile/${userId}`, { 
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // On mappe les données en gérant les noms de propriétés de ton DTO C#
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
                    setError(`Erreur serveur (${response.status}). Demandez à votre partenaire de vérifier le Handler.`);
                }
            } catch (error) {
                console.error("Erreur de connexion au serveur:", error);
                setError("Impossible de contacter le serveur. Vérifiez que l'API est lancée.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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

    // Affichage en cas d'erreur 500 ou autre
    if (error) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className={`flex-1 p-8 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center max-w-md">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={50} />
                        <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Erreur de Profil</h2>
                        <p className="text-slate-500 text-sm mb-6">{error}</p>
                        <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
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
                    
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Mon Profil</h1>
                            <p className="text-slate-500 font-medium">Gestionnaire de compte | Système de Gestion des Visiteurs</p>
                        </div>
                        <div className="hidden md:block">
                            <BookmarkCheck size={40} className="text-blue-600 opacity-20" />
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 border border-slate-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                                
                                <div className="w-24 h-24 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg border-4 border-white transform -rotate-2">
                                    {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                                </div>

                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                                    {user.prenom} {user.nom}
                                </h2>
                                
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase mt-3 tracking-widest border border-blue-100">
                                    <Shield size={12} />
                                    {user.role}
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-slate-50 space-y-5 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email professionnel</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{user.email || 'Email non disponible'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact direct</p>
                                            <p className="text-sm font-bold text-slate-700">{user.telephone || 'Non renseigné'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
                                        <User size={20}/>
                                    </div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Fiche d'identification</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nom</label>
                                        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm shadow-inner min-h-[56px] flex items-center">
                                            {user.nom || "En attente..."}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Prénom</label>
                                        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm shadow-inner min-h-[56px] flex items-center">
                                            {user.prenom || "En attente..."}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identifiant Téléphonique</label>
                                        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-sm flex items-center justify-between shadow-inner">
                                            <span className="flex items-center gap-3">
                                                <Phone size={14} className="text-slate-400" />
                                                {user.telephone || 'Aucun numéro enregistré'}
                                            </span>
                                            {user.telephone && (
                                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-100">
                                                    <CheckCircle2 size={12} />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Vérifié</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-300 border border-slate-800 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-500"></div>
                                
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="p-4 bg-blue-600 text-white rounded-[1.25rem] shadow-lg shadow-blue-900/20">
                                        <Shield size={26}/>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white tracking-tight text-lg uppercase">Sécurité du système</h3>
                                        <p className="text-xs text-slate-400 font-medium italic">Accès restreint aux données des visiteurs</p>
                                    </div>
                                </div>
                                
                                <button className="mt-6 md:mt-0 relative z-10 bg-white/5 text-white border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all duration-300">
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