import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification'; 
import { Bell, Activity, Users, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Utilisation du Hook : On passe 'Admin' pour déclencher la route /api/Notifications/admin
  const { notifications, loading: loadingNotifs } = useNotification(null, 'Admin');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Récupération des visites
        const visits = await visitService.getAll();
        // Gestion robuste du format .NET ($values)
        const visitsArray = Array.isArray(visits) ? visits : (visits?.$values || []);

        const completedVisits = visitsArray.filter(v => {
          const s = String(v.statut || v.Statut || "").toLowerCase();
          return s.includes("termin") || s.includes("effectu");
        });

        const pending = visitsArray.filter(v => {
          const s = String(v.statut || v.Statut || "").toLowerCase();
          return s.includes("attente") || s.includes("reprogramm");
        }).length;

        setPendingCount(pending);

        // 2. Stats via statsService
        const stats = await statsService.getDashboardStats();

        setData({
          ...stats,
          completedVisitsCount: completedVisits.length
        });

      } catch (err) {
        console.error("Erreur Dashboard Admin:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingCount} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <Activity className="text-blue-600" size={20} />
             <h2 className="font-bold text-slate-800">Tableau de Bord Administratif</h2>
          </div>
          <div className="flex items-center gap-4">
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter">Accès Total</span>
          </div>
        </header>

        <main className="p-10">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Statistiques Globales</h1>
              <p className="text-slate-500">Surveillance des flux de visiteurs et des notifications.</p>
            </div>

            {/* CARDS STATISTIQUES */}
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Users size={14}/> Visiteurs Uniques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Aujourd'hui" value={data?.visitors?.day} loading={loading} color="text-blue-600" />
              <StatCard title="Ce Mois" value={data?.visitors?.month} loading={loading} />
              <StatCard title="Cette Année" value={data?.visitors?.year} loading={loading} />
            </div>

            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <CheckCircle size={14}/> Flux des Rendez-vous
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Visites Terminées" value={data?.completedVisitsCount} loading={loading} color="text-emerald-600" />
              <StatCard title="En attente" value={pendingCount} loading={loading} color="text-orange-500" pulse={pendingCount > 0} />
              <StatCard 
                title="Taux de conversion" 
                value={data?.visitors?.day > 0 ? Math.round((data?.completedVisitsCount / data?.visitors?.day) * 100) + "%" : "100%"} 
                loading={loading} 
                color="text-purple-600" 
              />
            </div>

            {/* SECTION LOGS DE NOTIFICATIONS CORRIGÉE */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Bell size={20}/></div>
                        <h3 className="font-bold text-slate-800 text-lg">Historique des Notifications</h3>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {loadingNotifs ? (
                        <div className="py-10 text-center text-slate-400 animate-pulse italic">Récupération des logs...</div>
                    ) : (
                        notifications.slice(0, 10).map(notif => {
                            // SÉCURITÉ : On gère les deux types de casse (Pascal et camel)
                            const message = notif.message || notif.Message;
                            const type = notif.type || notif.Type || 'SYSTEM';
                            const date = notif.dateEnvoi || notif.DateEnvoi;
                            const id = notif.id || notif.Id;

                            return (
                                <div key={id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${type.includes('VISIT') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {type.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 font-semibold group-hover:text-blue-700 transition-colors">
                                            {message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                            {date ? new Date(date).toLocaleString('fr-FR', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            }) : "Date inconnue"}
                                        </p>
                                    </div>
                                    <div className="text-[9px] font-black tracking-tighter px-2 py-1 bg-slate-100 text-slate-500 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {type}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {!loadingNotifs && notifications.length === 0 && (
                        <div className="py-10 text-center text-slate-400 text-sm italic">
                            Aucune notification enregistrée dans le système.
                        </div>
                    )}
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, loading, color = "text-slate-900", pulse = false }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex justify-between items-center transition-all hover:scale-[1.02] hover:shadow-lg group">
    <div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 group-hover:text-blue-500 transition-colors">{title}</p>
      <span className={`text-4xl font-black ${color} tracking-tighter`}>
        {loading ? "..." : value ?? 0}
      </span>
    </div>
    {pulse && (
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
      </div>
    )}
  </div>
);

export default Dashboard;