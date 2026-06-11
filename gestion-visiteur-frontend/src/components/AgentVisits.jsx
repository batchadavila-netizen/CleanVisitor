import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitorService } from '../services/visitorService'; // On utilise le service visiteur
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Edit, CalendarPlus, Trash2 } from 'lucide-react';

const AgentVisits = () => {
    const [visitors, setVisitors] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

   const loadData = async () => {
    try {
        const data = await visitorService.getAll();
        console.log("🔍 Visiteurs reçus:", data);
        // Gère tous les formats possibles
        const liste = data?.$values || data?.value || (Array.isArray(data) ? data : []);
        setVisitors(liste);
    } catch (error) {
        toast.error("Erreur de chargement");
    }
};

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce visiteur ?")) {
            try {
                await visitorService.delete(id);
                toast.success("Supprimé");
                loadData();
            } catch (error) { toast.error("Erreur"); }
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Toaster position="top-right" />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase italic italic">Gestion des Visiteurs</h1>
                    </div>
                    <button onClick={() => navigate('/register-visitor')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                        <Plus size={20} /> NOUVEAU VISITEUR
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400">
                                <th className="p-6">Visiteur</th>
                                <th className="p-6">Contact</th>
                                <th className="p-6">Date Inscription</th>
                                <th className="p-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {visitors.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-6 font-bold text-slate-700">{v.nom} {v.prenom}</td>
                                    <td className="p-6 text-slate-500 font-medium">{v.telephone || v.email}</td>
                                    <td className="p-6">
                                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '17/04/2026'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-4">
                                            {/* CALENDRIER : Créer une visite pour LUI */}
                                           <button 
    onClick={() => {
        console.log("🔍 Clic calendrier, visiteur:", v);
        navigate('/create-visit', { state: { selectedVisitor: v } });
    }}
    className="text-blue-500 hover:scale-125 transition-transform"
    title="Planifier une visite"
>
    <CalendarPlus size={22} />
</button>
                                            {/* CRAYON : Modifier ses infos perso */}
                                            <button 
                                                onClick={() => navigate('/register-visitor', { state: { visitorToEdit: v } })}
                                                className="text-orange-500 hover:scale-125 transition-transform"
                                                title="Modifier le profil"
                                            >
                                                <Edit size={22} />
                                            </button>

                                            {/* POUBELLE */}
                                            <button 
                                                onClick={() => handleDelete(v.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={22} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};
export default AgentVisits;