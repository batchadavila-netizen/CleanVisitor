import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification';
import { Bell, Users, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🟢 MODIFICATION 1 : Stocker le rôle de l'utilisateur (valeur par défaut : 'Agent')
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'Agent');

  // 🟢 MODIFICATION 2 : On passe dynamiquement le "userRole" au service de notifications
  const { notifications, loading: loadingNotifs } = useNotification(null, userRole);

  useEffect(() => {
    // 🟢 MODIFICATION 3 : S'assurer de récupérer le rôle au montage du composant
    const role = localStorage.getItem('userRole') || 'Agent';
    setUserRole(role);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const visits = await visitService.getAll();
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

        // Construction du graphique des 7 derniers jours
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d;
        });

        const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        const weekly = last7Days.map(day => {
          const dayStr = day.toDateString();
          const count = visitsArray.filter(v => {
            const visitDate = v.date || v.Date;
            if (!visitDate) return false;
            return new Date(visitDate).toDateString() === dayStr;
          }).length;
          return { name: dayLabels[day.getDay()], visites: count };
        });

        setWeeklyVisits(weekly);
        const stats = await statsService.getDashboardStats();
        setData({ ...stats, completedVisitsCount: completedVisits.length });

      } catch (err) {
        console.error("Erreur Dashboard:", err);
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
        
        {/* HEADER */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800">
              {/* 🟢 MODIFICATION 4 : Titre dynamique selon le rôle */}
              {userRole === 'Admin' ? 'Tableau de Bord Administratif' : 'Espace Agent - Accueil'}
            </h2>
          </div>
          {/* 🟢 MODIFICATION 5 : Badge de rôle dynamique */}
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${userRole === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {userRole === 'Admin' ? 'Accès Total' : 'Accès Limité'}
          </span>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="p-8 w-full">
          <div className="max-w-7xl mx-auto">

            {/* TITRE DE LA PAGE */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Statistiques Globales</h1>
              <p className="text-slate-500">Surveillance des flux de visiteurs.</p>
            </div>

            {/* SECTION VISITEURS */}
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-slate-400"/>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visiteurs Uniques</h3>
            </div>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <StatCard title="Aujourd'hui" value={data?.visitors?.day} loading={loading} color="text-blue-600" bgColor="bg-blue-50" icon="👤" />
              <StatCard title="Ce Mois" value={data?.visitors?.month} loading={loading} color="text-violet-600" bgColor="bg-violet-50" icon="📅" />
              <StatCard title="Cette Année" value={data?.visitors?.year} loading={loading} color="text-indigo-600" bgColor="bg-indigo-50" icon="📆" />
            </div>

            {/* SECTION FLUX VISITES */}
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={14} className="text-slate-400"/>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Flux des Visites</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <StatCard title="Visites Terminées" value={data?.completedVisitsCount} loading={loading} color="text-emerald-600" bgColor="bg-emerald-50" icon="✅" />
              <StatCard title="En Attente" value={pendingCount} loading={loading} color="text-orange-500" bgColor="bg-orange-50" icon="⏳" pulse={pendingCount > 0} />
            </div>

            {/* 🟢 MODIFICATION 6 : Condition d'affichage des notifications */}
            {/* Si l'utilisateur est 'Admin', on affiche tout le bloc. S'il est 'Agent', le bloc n'est pas généré. */}
            {userRole === 'Admin' && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <Bell size={20}/>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Historique des Notifications</h3>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {loadingNotifs ? (
                    <div className="py-10 text-center text-slate-400 animate-pulse italic">
                      Récupération des logs...
                    </div>
                  ) : !notifications || notifications.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-sm italic">
                      Aucune notification enregistrée dans le système.
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => {
                      const message = notif.message || notif.Message;
                      const type = notif.type || notif.Type || 'SYSTEM';
                      const date = notif.dateEnvoi || notif.DateEnvoi;
                      const id = notif.id || notif.Id;

                      return (
                        <div key={id} className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-all group">
                          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${type.includes('VISIT') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {type.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 font-semibold group-hover:text-blue-700 transition-colors truncate">
                              {message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                              {date ? new Date(date).toLocaleString('fr-FR', { 
                                day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' 
                              }) : "Date inconnue"}
                            </p>
                          </div>
                          <div className="shrink-0 text-[9px] font-black tracking-tighter px-2 py-1 bg-slate-100 text-slate-500 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {type}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, loading, color = "text-slate-900", bgColor = "bg-slate-50", icon, pulse = false }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4 h-32 hover:scale-[1.02] hover:shadow-lg transition-all group">
    <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1 group-hover:text-blue-500 transition-colors truncate">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-3xl font-black ${color} tracking-tighter`}>
          {loading ? "..." : value ?? 0}
        </span>
        {pulse && (
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;