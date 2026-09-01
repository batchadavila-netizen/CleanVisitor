import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { fetchWithAuth } from '../services/apiClient';
import { User, Mail, Phone, Shield, Loader2, Save, Sparkles, CheckCircle2, Lock, Clock } from 'lucide-react';

const Profile = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [user, setUser] = useState({ id: '', nom: '', prenom: '', email: '', telephone: '', role: '' });
    const [formData, setFormData] = useState({});

    const hasChanges = JSON.stringify(user) !== JSON.stringify(formData);

    const parseRole = (rawRole) => {
        if (rawRole === undefined || rawRole === null || rawRole === '') return 'Visiteur';
        const str = String(rawRole).toLowerCase().trim();
        if (str === '1' || str.includes('admin')) return 'Admin';
        if (str === '2' || str.includes('agent')) return 'Agent';
        return 'Visiteur';
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const localRole = localStorage.getItem('userRole');

            if (!userId) {
                setError("Session expirée. Veuillez vous reconnecter.");
                return;
            }

            // 🟢 Appel propre via fetchWithAuth sur la route profile
            const data = await fetchWithAuth(`/api/user/profile/${userId}`);
            
            const rawRoleFromApi = data?.roleName ?? data?.role ?? data?.Role ?? localRole;
            const cleanRole = parseRole(rawRoleFromApi);

            const fetchedUser = {
                id: data?.id || data?.userId || userId,
                nom: data?.nom || data?.lastName || '',
                prenom: data?.prenom || data?.firstName || '',
                email: data?.email || '',
                telephone: data?.telephone || data?.phoneNumber || data?.phone || '',
                role: cleanRole
            };

            setUser(fetchedUser);
            setFormData(fetchedUser);
        } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
            setError("Impossible de charger les données du profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
  if (!hasChanges) return;
  setIsSaving(true);
  
  try {
    const payload = {
      Id: parseInt(formData.id, 10),
      Nom: formData.nom,
      Prenom: formData.prenom,
      Email: formData.email,
      Telephone: formData.telephone // 🟢 On envoie explicitement 'Telephone'
    };

    const updatedResponse = await fetchWithAuth('/api/user', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    // 🟢 VÉRIFICATION CLEF : On extrait le téléphone quelle que soit la clé renvoyée
    const savedPhone = updatedResponse?.telephone 
      || updatedResponse?.phone 
      || updatedResponse?.phoneNumber 
      || formData.telephone;

    const updatedUser = {
      ...formData,
      telephone: savedPhone
    };

    // Synchronisation de l'état React et de la mémoire locale
    setUser(updatedUser);
    setFormData(updatedUser);

    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...cachedUser, ...updatedUser }));

    alert("Profil mis à jour avec succès !");

  } catch (error) {
    console.error("Erreur mise à jour profil :", error);
    alert("Erreur lors de la sauvegarde du profil.");
  } finally {
    setIsSaving(false);
  }
};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getRoleColor = (role) => {
        if (role === 'Admin') return 'bg-red-50 text-red-600 border-red-200';
        if (role === 'Agent') return 'bg-orange-50 text-orange-600 border-orange-200';
        return 'bg-blue-50 text-blue-600 border-blue-200';
    };

    const getInitials = () => {
        const p = formData.prenom?.charAt(0) || '';
        const n = formData.nom?.charAt(0) || '';
        return `${p}${n}`.toUpperCase();
    };

    if (loading) return <div className="flex min-h-screen bg-[#F4F7F9] items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (error) return <div className="flex min-h-screen bg-[#F4F7F9] items-center justify-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="flex min-h-screen bg-[#F4F7F9] font-sans selection:bg-blue-200">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} w-full p-6 md:p-10 flex flex-col`}>
                
                {/* EN-TÊTE PRINCIPAL */}
                <div className="w-full mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Paramètres du compte</h1>
                        <Sparkles size={24} className="text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-slate-500 text-sm md:text-base">Gérez vos informations personnelles, votre statut et vos préférences d'accès.</p>
                </div>

                <div className="w-full flex flex-col gap-8">
                    
                    {/* CARTE PRINCIPALE */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col w-full">
                        
                        <div className="h-44 bg-slate-900 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                        </div>

                        <div className="px-8 md:px-12 pb-10 relative text-center">
                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-36 h-36 bg-white rounded-full p-2 shadow-xl">
                                <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-black">
                                    {getInitials()}
                                </div>
                            </div>

                            <div className="pt-20 pb-6 border-b border-slate-100">
                                <h2 className="text-3xl font-black text-slate-800 mb-2">
                                    {formData.prenom} {formData.nom}
                                </h2>
                                
                                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold border ${getRoleColor(user.role)}`}>
                                    <Shield size={16} />
                                    <span>Compte {user.role}</span>
                                </div>
                            </div>

                            {/* FORMULAIRE DE MODIFICATION */}
                            <div className="pt-8 text-left">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <User size={20} className="text-blue-600" /> Informations Personnelles
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">Mettez à jour vos coordonnées ci-dessous</p>
                                    </div>
                                    <button 
                                        onClick={handleSaveProfile} 
                                        disabled={!hasChanges || isSaving} 
                                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-sm transition-all duration-300 ${
                                            hasChanges 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:-translate-y-1' 
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Prénom</label>
                                        <input 
                                            type="text" name="prenom" value={formData.prenom || ''} onChange={handleInputChange} 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 font-semibold transition-all" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nom</label>
                                        <input 
                                            type="text" name="nom" value={formData.nom || ''} onChange={handleInputChange} 
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 font-semibold transition-all" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Adresse email</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Mail size={18} className="text-slate-400" />
                                            </div>
                                            <input 
                                                type="email" name="email" value={formData.email || ''} onChange={handleInputChange} 
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 font-semibold transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Numéro de téléphone</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Phone size={18} className="text-slate-400" />
                                            </div>
                                            <input 
                                                type="tel" name="telephone" value={formData.telephone || ''} onChange={handleInputChange} 
                                                className="w-full pl-12 pr-28 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 font-semibold transition-all" 
                                            />
                                            {formData.telephone && (
                                                <div className="absolute inset-y-0 right-2 flex items-center">
                                                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 uppercase">
                                                        <CheckCircle2 size={12} /> Vérifié
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARTES STATUT */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut du compte</p>
                                <h4 className="text-lg font-bold text-slate-800">Actif & Vérifié</h4>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Niveau d'accès</p>
                                <h4 className="text-lg font-bold text-slate-800">Espace {user.role}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dernière activité</p>
                                <h4 className="text-lg font-bold text-slate-800">Aujourd'hui</h4>
                            </div>
                        </div>
                    </div>

                    {/* BANNIÈRE SÉCURITÉ */}
                    <div className="bg-slate-900 rounded-3xl p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden w-full">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                <Lock size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl">Sécurité et Mot de passe</h3>
                                <p className="text-sm text-slate-400 mt-1">Protégez votre compte en mettant régulièrement à jour votre mot de passe.</p>
                            </div>
                        </div>
                        <button className="relative z-10 w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300">
                            Changer de mot de passe
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Profile;