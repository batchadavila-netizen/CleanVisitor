import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import Sidebar from '../components/Sidebar';
import CreateVisitModal from './CreateVisitModal';
import DetailVisitModal from './DetailVisitModal';
import connection, { startSignalRConnection } from '../services/signalRService';
import toast, { Toaster } from 'react-hot-toast';

const VisiteurDashboard = () => {
  const [visitorInfo, setVisitorInfo] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const visitorId = localStorage.getItem('userId');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email;

  // CORRECTION : Calcul robuste du compteur
 const pendingVisitsList = visits.filter(v => Number(v.statut || v.Statut) === 1);

  const openDetails = (v) => {
    setSelectedVisit(v);
    setIsDetailModalOpen(true);
  };

  const loadData = async () => {
    const data = await visitService.getVisitorVisit(visitorId);
    if (data) {
        // Est-ce que tes visites sont ici ? 
        console.log("Données reçues :", data); 
        
        // .NET renvoie souvent les listes sous cette forme :
        const laVraieListe = data.listVisitClon?.$values || data.listVisitClon || [];
        setVisits(laVraieListe);
    }
};


  useEffect(() => {
    loadData();
    startSignalRConnection();

    const handleUpdate = (data) => {
      if (data.email === userEmail) {
        toast(data.message, {
          icon: '📩',
          duration: 6000,
          style: { borderRadius: '15px', background: '#4f46e5', color: '#fff', fontWeight: 'bold' }
        });
        loadData();
      }
    };

    connection.on("ReceiveStatusUpdate", handleUpdate);

    return () => {
      connection.off("ReceiveStatusUpdate", handleUpdate);
    };
  }, [visitorId, userEmail]);

  const handleCancel = async (visitId) => {
    if (window.confirm("Annuler ?")) {
        await visitService.updateStatus(visitId, 3);
        setVisits([]); // 1. On vide pour forcer React à remarquer le changement
        await loadData(); // 2. On recharge les nouvelles données du serveur
        toast.success("Visite annulée et compteur mis à jour");
    }
};
console.log("Mes visites actuelles :", visits);
console.log("Nombre en attente calculé :", pendingCount);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="bottom-center" />
      
      {/* CORRECTION : On passe le pendingCount à la Sidebar ici */}
      <Sidebar 
        role="Visiteur" 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingCount} 
      />

      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Mes Visites</h1>
            <p className="text-slate-400 text-sm font-medium">Suivi de vos demandes en temps réel</p>
          </div>
          <button 
            onClick={() => { setSelectedVisit(null); setIsModalOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <span>+</span> NOUVELLE VISITE
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
             <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
             <p className="text-slate-400 font-bold">Mise à jour de vos accès...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visits.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-300 font-bold italic">Aucune visite pour le moment</p>
                </div>
            ) : (
              visits.map((v, index) => {
                const s = Number(v.statut || v.Statut);
                const isPending = s === 1;
                const isApproved = s === 2;
                const isCancelled = s === 3;

                return (
                  <div key={v.id || index} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-2 h-full ${isPending ? 'bg-amber-400' : isApproved ? 'bg-emerald-400' : 'bg-red-400'}`}></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                            <span className="text-[16px] font-black">{v.date ? new Date(v.date).getDate() : '--'}</span>
                            <span className="text-[8px] uppercase font-bold opacity-50">
                                {v.date ? new Date(v.date).toLocaleString('default', { month: 'short' }) : '---'}
                            </span>
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{v.service || v.Service || "Service non défini"}</h3>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">ID: #V-{v.id || v.Id || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1.5 rounded-xl text-[8px] font-black border uppercase tracking-tighter ${
                        isPending ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {isPending ? '⏳ EN ATTENTE' : isApproved ? '✅ APPROUVÉE' : '❌ ANNULÉE'}
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-slate-500 text-xs font-medium leading-relaxed italic">
                        "{v.motif || v.Motif || "Aucun motif précisé"}"
                      </p>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => openDetails(v)}
                        className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
                      >
                        VOIR DÉTAILS
                      </button>
                      
                      {isPending && (
                         <button 
                            onClick={() => handleCancel(v.id || v.Id)}
                            className="bg-white border border-red-100 text-red-500 px-5 py-3.5 rounded-2xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                         >
                           ANNULER
                         </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modals */}
        {isDetailModalOpen && (
          <DetailVisitModal 
            visit={selectedVisit} 
            onClose={() => setIsDetailModalOpen(false)}
            onReschedule={() => {
                setIsDetailModalOpen(false);
                setIsModalOpen(true); 
            }}
          />
        )}

        {isModalOpen && (
          <CreateVisitModal 
            onClose={() => { setIsModalOpen(false); setSelectedVisit(null); }} 
            onSuccess={() => { setIsModalOpen(false); loadData(); }} 
            initialData={selectedVisit}
          />
        )}
      </main>
    </div>
  );
};

export default VisiteurDashboard;