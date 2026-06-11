import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification';
import Sidebar from '../components/Sidebar';
import CreateVisitModal from '../components/CreateVisitModal';
import DetailVisitModal from '../components/DetailVisitModal';
import connection, { startSignalRConnection } from '../services/signalRService';
import toast, { Toaster } from 'react-hot-toast';
import { History, Clock, Calendar, ChevronRight, Plus, RefreshCw, Bell } from 'lucide-react';

const VisiteurDashboard = () => {
  const navigate = useNavigate();
  
  // 1. Récupération des données utilisateur
  const visitorId = localStorage.getItem('userId');
  const userNom = localStorage.getItem('userNom') || 'Visiteur';
  const userEmail = localStorage.getItem('userEmail');

  // 2. Utilisation du Hook de notifications
  // On récupère notifications, loading et la fonction refresh
  console.log("Type de visitorId:", typeof visitorId, "Valeur:", visitorId);
  const { notifications, loading: loadingNotifs, refresh: refreshNotifs } = useNotification(Number(visitorId), 'Visiteur');

  // 3. États du dashboard
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const enumToCode = { "En_attente": 1, "Accepter": 2, "Terminee": 3, "Annulé": 4 };

  // Logique de calcul du statut effectif
  const getEffectiveStatus = (v) => {
    const s = v.statut || v.Statut;
    const code = enumToCode[s] ?? Number(s);
    const dateStr = (v.date || v.Date || "").split('T')[0];
    const heureStr = v.heureArriver || v.HeureArriver || "00:00";
    const visitDateTime = dateStr ? new Date(`${dateStr}T${heureStr}`) : null;
    const now = new Date();

    if (visitDateTime && visitDateTime < now) {
      if (code === 2) return 3;
      if (code === 1) return 4;
    }
    return code;
  };

  const getStatusLabel = (code) => {
    const mapping = { 1: "⏳ En attente", 2: "✅ Acceptée", 3: "🏁 Terminée", 4: "❌ Annulée" };
    return mapping[code] || `❓ ${code}`;
  };

  const getStatusColor = (label) => {
    if (label.includes("attente")) return "bg-amber-100 text-amber-600 border-amber-200";
    if (label.includes("Accept"))  return "bg-emerald-100 text-emerald-600 border-emerald-200";
    if (label.includes("Termin"))  return "bg-blue-100 text-blue-600 border-blue-200";
    if (label.includes("Annul"))   return "bg-red-100 text-red-600 border-red-200";
    return "bg-slate-100 text-slate-400 border-slate-200";
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await visitService.getVisitorVisit(visitorId);
      const laListe = response.listVisitClon?.$values || response.$values || (Array.isArray(response) ? response : []);
      setVisits(laListe);
    } catch (error) {
      console.error("Erreur chargement visites:", error);
      toast.error("Erreur de récupération des visites");
    } finally {
      setLoading(false);
    }
  };

  // 4. Gestion du temps réel via SignalR
  useEffect(() => {
    loadData();
    startSignalRConnection();

    const handleReceiveUpdate = (data) => {
      // Vérification flexible de l'ID (chaîne ou nombre)
      if (data.email === userEmail || Number(data.visitorId) === Number(visitorId)) {
        toast.success(data.message || data.Message, { icon: '🔔', duration: 5000 });
        loadData();
        if (refreshNotifs) refreshNotifs();
      }
    };

    connection.on("ReceiveStatusUpdate", handleReceiveUpdate);
    return () => connection.off("ReceiveStatusUpdate", handleReceiveUpdate);
  }, [visitorId, userEmail, refreshNotifs]);

  const pendingCount = visits.filter(v => getStatusLabel(getEffectiveStatus(v)).includes('attente')).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      <Sidebar 
        role="Visiteur" 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingCount} 
      />

      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Mon Espace</h1>
            <p className="text-slate-500 mt-1">Heureux de vous revoir, <span className="text-blue-600 font-bold">{userNom}</span>.</p>
          </div>
          <button 
            onClick={() => { setSelectedVisit(null); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={20} /> Nouvelle Visite
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard icon={<History size={32}/>} title="Total Visites" value={visits.length} color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={<Clock size={32}/>} title="En Attente" value={pendingCount} color="text-amber-600" bgColor="bg-amber-50" />

            <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Mes Demandes</h3>
                    <RefreshCw 
                      size={18} 
                      className={`text-slate-300 cursor-pointer ${loading ? 'animate-spin' : ''}`} 
                      onClick={() => { loadData(); if(refreshNotifs) refreshNotifs(); }} 
                    />
                </div>
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                    {loading ? (
                      <div className="p-10 text-center text-slate-400 italic">Chargement des visites...</div>
                    ) : visits.length === 0 ? (
                      <div className="p-10 text-center text-slate-400">Aucune visite enregistrée.</div>
                    ) : visits.map((v, index) => (
                        <div key={v.id || v.Id || index} className="p-6 hover:bg-slate-50/50 flex items-center justify-between group transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Calendar size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{v.motif || v.Motif || 'Visite standard'}</h4>
                                    <p className="text-xs text-slate-400">
                                      {(v.date || v.Date) ? new Date(v.date || v.Date).toLocaleDateString('fr-FR') : '--'} à {v.heureArriver || v.HeureArriver || '--:--'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${getStatusColor(getStatusLabel(getEffectiveStatus(v)))}`}>
                                    {getStatusLabel(getEffectiveStatus(v))}
                                </div>
                                <button onClick={() => { setSelectedVisit(v); setIsDetailModalOpen(true); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><ChevronRight size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* SECTION NOTIFICATIONS - RENDU ROBUSTE */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Bell size={20}/></div>
                <h3 className="text-xl font-bold text-slate-800">Notifications</h3>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {loadingNotifs ? (
                  <p className="text-slate-400 text-sm text-center">Mise à jour...</p>
                ) : !notifications || notifications.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-10 italic">Aucune notification</p>
                ) : (
                    notifications.map((n, index) => (
  <div key={n.id || index} className="p-3 border-b hover:bg-gray-50">
    <p className="text-sm text-gray-800">{n.message || n.Message}</p>
    <span className="text-[10px] text-gray-500">
      {new Date(n.dateEnvoi || n.DateEnvoi).toLocaleString()}
    </span>
  </div>
))
                )}
            </div>
          </div>
        </div>

        {/* MODALS */}
        {isDetailModalOpen && (
          <DetailVisitModal 
            visit={selectedVisit} 
            onClose={() => setIsDetailModalOpen(false)}
            onReschedule={(v) => { setIsDetailModalOpen(false); navigate('/create-visit', { state: { initialData: v } }); }}
          />
        )}

        {isModalOpen && (
          <CreateVisitModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); loadData(); if(refreshNotifs) refreshNotifs(); }} 
          />
        )}
      </main>
    </div>
  );
}

const StatCard = ({ icon, title, value, color, bgColor }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
    <div className={`w-16 h-16 ${bgColor} ${color} rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

export default VisiteurDashboard;