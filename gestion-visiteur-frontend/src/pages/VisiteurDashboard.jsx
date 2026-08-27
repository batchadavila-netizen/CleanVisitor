import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification';
import Sidebar from '../components/Sidebar';
import CreateVisitModal from '../components/CreateVisitModal';
import DetailVisitModal from '../components/DetailVisitModal';
import DigitalBadge from '../components/DigitalBadge';
import connection, { startSignalRConnection } from '../services/signalRService';
import toast, { Toaster } from 'react-hot-toast';
import { 
  History, Clock, Calendar, ChevronRight, Plus, RefreshCw, Bell, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle2, QrCode 
} from 'lucide-react';

const VisiteurDashboard = () => {
  const navigate = useNavigate();
  
  const rawVisitorId = localStorage.getItem('visitorId') || localStorage.getItem('userId');
  const visitorIdNum = rawVisitorId ? Number(rawVisitorId) : null;

  const userNom = localStorage.getItem('userNom') || localStorage.getItem('userName') || 'Visiteur';
  const userEmail = localStorage.getItem('userEmail');
  const userId = localStorage.getItem('userId');

  const { notifications, loading: loadingNotifs, refresh: refreshNotifs } = useNotification(visitorIdNum, 'Visiteur');

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  
  // État pour la modale du Badge Numérique
  const [selectedBadgeVisit, setSelectedBadgeVisit] = useState(null);

  const [showAllVisits, setShowAllVisits] = useState(false);
  const [showAllNotifs, setShowAllNotifs] = useState(false);

  const enumToCode = { "En_attente": 1, "Accepter": 2, "Terminee": 3, "Annulé": 4 };

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

  const renderStatusBadge = (code) => {
    const configs = {
      1: { label: "En attente", style: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500" },
      2: { label: "Acceptée", style: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
      3: { label: "Terminée", style: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
      4: { label: "Annulée", style: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" }
    };
    const badge = configs[code] || { label: `Inconnu`, style: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-500" };
    
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${badge.style} whitespace-nowrap`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${code === 1 ? 'animate-pulse' : ''} ${badge.dot}`}></span>
        <span className="text-[10px] font-bold uppercase tracking-wider">{badge.label}</span>
      </div>
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await visitService.getVisitorVisit(userId);
      const laListe = response?.listVisitClon?.$values || response?.$values || (Array.isArray(response) ? response : []);
      
      const sorted = [...laListe].sort((a, b) => {
        const dateA = new Date(a.date || a.Date || 0);
        const dateB = new Date(b.date || b.Date || 0);
        return dateB - dateA;
      });
      setVisits(sorted);
    } catch (error) {
      toast.error("Erreur de récupération des visites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    startSignalRConnection();
    const handleReceiveUpdate = (data) => {
      if (data.email === userEmail || Number(data.visitorId) === Number(visitorIdNum)) {
        toast.success(data.message || data.Message, { icon: <Bell size={18} className="text-blue-600" />, duration: 5000 });
        loadData();
        if (refreshNotifs) refreshNotifs();
      }
    };
    connection.on("ReceiveStatusUpdate", handleReceiveUpdate);
    return () => connection.off("ReceiveStatusUpdate", handleReceiveUpdate);
  }, [visitorIdNum, userEmail, refreshNotifs]);

  const sortedNotifications = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.dateEnvoi || a.DateEnvoi || 0);
      const dateB = new Date(b.dateEnvoi || b.DateEnvoi || 0);
      return dateB - dateA;
    });
  }, [notifications]);

  const pendingCount = visits.filter(v => getEffectiveStatus(v) === 1).length;
  const displayedVisits = showAllVisits ? visits : visits.slice(0, 10);
  const displayedNotifs = showAllNotifs ? sortedNotifications : sortedNotifications.slice(0, 10);

  const handleOpenDetail = (v) => {
    setSelectedVisit(v);
    setIsDetailModalOpen(true);
  };

  const hour = new Date().getHours();
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir";

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans selection:bg-blue-200">
      
      <Toaster position="top-right" toastOptions={{ className: 'rounded-2xl font-semibold text-sm' }} />
      
      <Sidebar 
        role="Visiteur" 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingCount} 
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} w-full flex flex-col`}>
        
        {/* BANNIÈRE */}
        <div className="bg-slate-900 px-8 pt-10 pb-20 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{greeting}, {userNom}</h1>
                <Sparkles size={24} className="text-blue-400 animate-pulse" />
              </div>
              <p className="text-slate-400 text-sm md:text-base max-w-xl">
                Bienvenue sur votre espace personnel. Gérez vos rendez-vous, suivez vos demandes et consultez vos notifications en temps réel.
              </p>
            </div>
            
            <button 
              onClick={() => { setSelectedVisit(null); setIsModalOpen(true); }}
              className="group relative bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/40 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 active:scale-95 border border-blue-500 shrink-0"
            >
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                <Plus size={18} className="text-white" />
              </div>
              <span>Nouvelle Visite</span>
            </button>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="px-8 -mt-10 relative z-20 pb-12 flex-1 flex flex-col">
          
          {/* CARTES STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 w-full">
            <StatCard icon={<History size={28}/>} title="Total Visites" value={visits.length} color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={<Clock size={28}/>} title="En Attente" value={pendingCount} color="text-amber-600" bgColor="bg-amber-50" />
          </div>

          {/* GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[500px] w-full">

            {/* BLOC 1 : MES DEMANDES */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Mes Demandes</h3>
                    <p className="text-xs text-slate-400">Historique de vos rendez-vous</p>
                  </div>
                </div>
                <button onClick={() => { loadData(); if(refreshNotifs) refreshNotifs(); }} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors group">
                  <RefreshCw size={18} className={`text-slate-500 group-hover:text-blue-600 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              <div className="divide-y divide-slate-50 p-2 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full p-12 text-slate-400 font-medium animate-pulse">Chargement de vos visites...</div>
                ) : displayedVisits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 gap-3">
                    <Calendar size={32} className="text-slate-200" />
                    <p>Aucune visite enregistrée pour le moment.</p>
                  </div>
                ) : (
                  <div>
                    {displayedVisits.map((v, index) => {
                      const effectiveStatus = getEffectiveStatus(v);
                      return (
                        <div key={v.id || v.Id || index} onClick={() => handleOpenDetail(v)}
                          className="p-4 mx-4 my-2 rounded-2xl hover:bg-[#F8FAFC] flex items-center justify-between group transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                              <Calendar size={20} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-base truncate group-hover:text-blue-700 transition-colors">
                                {v.motif || v.Motif || 'Visite standard'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock size={12} className="text-slate-400 shrink-0" />
                                <p className="text-xs text-slate-500 font-medium truncate">
                                  {(v.date || v.Date) ? new Date(v.date || v.Date).toLocaleDateString('fr-FR') : '--'} à {v.heureArriver || v.HeureArriver || '--:--'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pl-4">
                            {/* BOUTON BOUTON PASS NUMÉRIQUE SI ACCEPTÉE */}
                            {effectiveStatus === 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBadgeVisit(v);
                                }}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
                                title="Afficher le Pass d'accès Numérique"
                              >
                                <QrCode size={14} />
                                <span className="hidden sm:inline">Mon Pass</span>
                              </button>
                            )}

                            {renderStatusBadge(effectiveStatus)}

                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors shrink-0 hidden sm:flex">
                              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600"/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {visits.length > 10 && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 shrink-0">
                  <button 
                    onClick={() => setShowAllVisits(!showAllVisits)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                  >
                    {showAllVisits ? <><ChevronUp size={18} /> Réduire la liste</> : <><ChevronDown size={18} /> Voir tout l'historique ({visits.length})</>}
                  </button>
                </div>
              )}
            </div>

            {/* BLOC 2 : NOTIFICATIONS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
                      <Bell size={18} />
                    </div>
                    {sortedNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Activité</h3>
                    <p className="text-xs text-slate-400">Vos alertes récentes</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-50 p-2 flex-1 overflow-y-auto">
                {loadingNotifs ? (
                  <div className="flex items-center justify-center h-full p-10 text-slate-400 text-sm">Mise à jour...</div>
                ) : sortedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 gap-3">
                    <CheckCircle2 size={32} className="text-emerald-200" />
                    <p className="text-sm">Vous êtes à jour !</p>
                  </div>
                ) : (
                  <div>
                    {displayedNotifs.map((n, index) => (
                      <div key={n.id || n.Id || index} className="p-4 mx-4 my-2 hover:bg-[#F8FAFC] rounded-2xl border border-transparent hover:border-slate-100 transition-colors group">
                        <p className="text-sm font-semibold text-slate-700 leading-snug">
                          {n.message || n.Message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                          <Clock size={10} />
                          {(n.dateEnvoi || n.DateEnvoi) ? new Date(n.dateEnvoi || n.DateEnvoi).toLocaleString('fr-FR', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          }) : "Maintenant"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(sortedNotifications.length > 10) && (
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 shrink-0">
                  <button 
                    onClick={() => setShowAllNotifs(!showAllNotifs)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
                  >
                    {showAllNotifs ? <><ChevronUp size={18} /> Masquer les anciennes</> : <><ChevronDown size={18} /> Voir toutes les notifications ({sortedNotifications.length})</>}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MODALE DETAILS SOUHAITÉE */}
        {isDetailModalOpen && (
          <DetailVisitModal visit={selectedVisit} onClose={() => setIsDetailModalOpen(false)} onReschedule={(v) => { setIsDetailModalOpen(false); navigate('/create-visit', { state: { initialData: v } }); }} />
        )}

        {/* MODALE CRÉATION */}
        {isModalOpen && (
          <CreateVisitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); loadData(); if(refreshNotifs) refreshNotifs(); }} />
        )}

        {/* MODALE BADGE NUMÉRIQUE PASS */}
        {selectedBadgeVisit && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm">
              <button 
                onClick={() => setSelectedBadgeVisit(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white font-bold text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
              >
                Fermer ✕
              </button>
              <DigitalBadge 
                visit={selectedBadgeVisit} 
                visitorName={userNom} 
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, bgColor }) => (
  <div className="bg-white w-full p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:-translate-y-1 hover:shadow-lg duration-300">
    <div className={`w-16 h-16 ${bgColor} ${color} rounded-2xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest truncate mb-1">{title}</p>
      <h3 className="text-4xl md:text-5xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

export default VisiteurDashboard;