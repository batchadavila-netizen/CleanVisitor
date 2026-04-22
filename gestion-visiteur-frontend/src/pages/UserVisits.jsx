import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { visitService } from '../services/visitService';
import DetailVisitModal from '../components/DetailVisitModal'; // Assure-toi que le fichier existe
import { 
  Loader2, 
  Calendar, 
  Clock, 
  History, 
  ChevronRight 
} from 'lucide-react';

const UserVisits = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [visites, setVisites] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États pour la gestion de la modale de détails
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const userNom = localStorage.getItem('userNom') || 'Visiteur';

    useEffect(() => {
        const loadVisits = async () => {
            try {
                const data = await visitService.getAll(); 
                setVisites(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erreur chargement visites:", error);
                setVisites([]);
            } finally {
                setLoading(false);
            }
        };
        loadVisits();
    }, []);

    // Fonction pour ouvrir les détails
    const handleOpenDetails = (visite) => {
        setSelectedVisit(visite);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <main className={`flex-1 p-8 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Mon Espace</h2>
                        <p className="text-slate-500 mt-1">Bienvenue {userNom}. Gérez vos visites chez AIGLE INFORMATIQUE.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/create-visit')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Calendar size={20} />
                        Demander une visite
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <History size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Visites</p>
                            <h3 className="text-2xl font-black text-slate-800">{visites.length}</h3>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">En attente</p>
                            <h3 className="text-2xl font-black text-slate-800">
                                {visites.filter(v => v.statut !== 'Terminé').length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-slate-800 text-lg">Historique récent</h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Mise à jour en direct</span>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                        {visites.length > 0 ? (
                            visites.map((visite, index) => (
                                <div 
                                    key={visite.id ? `visit-${visite.id}` : `idx-${index}`} 
                                    className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                    onClick={() => handleOpenDetails(visite)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <Calendar size={22} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{visite.motif || 'Motif non précisé'}</p>
                                            <p className="text-sm text-slate-400">
                                                Visite le {visite.date || 'Date inconnue'} • {visite.agent || 'Aucun agent'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            visite.statut === 'Terminé' 
                                                ? 'bg-emerald-100 text-emerald-600' 
                                                : 'bg-amber-100 text-amber-600'
                                        }`}>
                                            {visite.statut || 'En attente'}
                                        </span>
                                        
                                        {/* Bouton Plus de détails */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Empêche le clic sur la ligne parente
                                                handleOpenDetails(visite);
                                            }}
                                            className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2"
                                        >
                                            Détails
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center">
                                <p className="text-slate-400 font-medium">Vous n'avez pas encore effectué de visite.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de Détails */}
                {isDetailModalOpen && (
                    <DetailVisitModal 
                        visit={selectedVisit} 
                        onClose={() => setIsDetailModalOpen(false)}
                        onReschedule={() => {
                            setIsDetailModalOpen(false);
                            // Redirection vers la page de création avec les données actuelles
                            navigate('/create-visit', { state: { initialData: selectedVisit } });
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default UserVisits;