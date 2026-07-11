import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification';
import { Bell, Activity, Users, CheckCircleIcon, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { notifications, loading: loadingNotifs } = useNotification(null, 'Admin');

  useEffect(() => {
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
            <h2 className="font-semibold text-slate-800">Tableau de Bord Administratif</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-tight">Accès Total</span>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-6xl mx-auto">

            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-900">Statistiques globales</h1>
              <p className="text-sm text-slate-500">Surveillance des flux de visiteurs et des notifications</p>
            </div>

            {/* SECTION VISITEURS */}
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-slate-500" />
              <span className="text-[13px] font-medium text-slate-500">Visiteurs uniques</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <StatCard title="Aujourd'hui" value={data?.visitors?.day} loading={loading} color="text-blue-600" />
              <StatCard title="Ce mois" value={data?.visitors?.month} loading={loading} />
              <StatCard title="Cette année" value={data?.visitors?.year} loading={loading} />
            </div>

            {/* SECTION VISITES */}
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-slate-500" />
              <span className="text-[13px] font-medium text-slate-500">Flux des visites</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <StatCard title="Terminées" value={data?.completedVisitsCount} loading={loading} color="text-emerald-600" />
              <StatCard title="En attente" value={pendingCount} loading={loading} color="text-orange-500" pulse={pendingCount > 0} />
            </div>

            {/* GRAPHIQUE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <p className="text-sm font-medium text-slate-800 mb-4">Visites des 7 derniers jours</p>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={weeklyVisits}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="visites" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-slate-500" />
                <h3 className="font-medium text-slate-800 text-[15px]">Historique des notifications</h3>
              </div>

              <div>
                {loadingNotifs ? (
                  <div className="py-10 text-center text-slate-400 italic text-sm">Récupération des logs...</div>
                ) : (
                  notifications.slice(0, 10).map(notif => {
                    const message = notif.message || notif.Message;
                    const type = notif.type || notif.Type || 'SYSTEM';
                    const date = notif.dateEnvoi || notif.DateEnvoi;
                    const id = notif.id || notif.Id;

                    return (
                      <div key={id} className="flex items-start gap-3 py-3 border-t border-slate-100 first:border-t-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-medium text-xs flex-shrink-0 ${type.includes('VISIT') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {type.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {date ? new Date(date).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : "Date inconnue"}
                          </p>
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
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative">
    <div>
      <p className="text-slate-500 text-xs mb-2">{title}</p>
      <span className={`text-2xl font-semibold ${color}`}>
        {loading ? "..." : value ?? 0}
      </span>
    </div>
    {pulse && (
      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500"></span>
    )}
  </div>
);

export default Dashboard;