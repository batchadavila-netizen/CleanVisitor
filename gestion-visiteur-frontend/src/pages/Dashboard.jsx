import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';
import { visitService } from '../services/visitService';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // 1. On récupère les visites pour calculer les statistiques réelles
        const visits = await visitService.getAll();
        const visitsArray = Array.isArray(visits) ? visits : [];

        // --- LOGIQUE DE FILTRAGE MÉTIER ---
        
        // Une visite est comptabilisée dans le flux UNIQUEMENT si elle est terminée/effectuée
        const completedVisits = visitsArray.filter(v => {
          const s = String(v.statut || v.Statut || "").toLowerCase();
          return s.includes("terminé") || s.includes("termine") || s.includes("effectuée");
        });

        // Le compteur d'attente inclut les nouveaux et les reprogrammés
        const pending = visitsArray.filter(v => {
          const s = String(v.statut || v.Statut || "").toLowerCase();
          return s.includes("attente") || s.includes("reprogrammé") || s.includes("reprogramme");
        }).length;

        setPendingCount(pending);

        // 2. On récupère les stats de base (visiteurs uniques)
        const stats = await statsService.getDashboardStats();
        
        // On fusionne les données : Visiteurs de l'API + Flux calculé sur les visites réelles
        setData({
          ...stats,
          visits: {
            day: completedVisits.length, // Tu pourras affiner ici avec un filtre par date (v.dateVisite)
            month: completedVisits.length,
            year: completedVisits.length
          }
        });

      } catch (err) {
        console.error("Erreur Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingCount} 
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="font-bold text-slate-800">Tableau de Bord Administratif</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin</span>
        </header>

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-10`}>
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900">Statistiques</h1>
              <p className="text-slate-500">Aperçu du flux réel (Visites terminées uniquement).</p>
            </div>

            {/* SECTION VISITEURS UNIQUES */}
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Visiteurs Uniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Aujourd'hui" value={data?.visitors?.day} loading={loading} color="text-blue-600" />
              <StatCard title="Ce Mois" value={data?.visitors?.month} loading={loading} />
              <StatCard title="Cette Année" value={data?.visitors?.year} loading={loading} />
            </div>

            {/* SECTION FLUX (Calculé sur les visites validées et effectuées) */}
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Flux des Visites Effectuées</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Jour" value={data?.visits?.day} loading={loading} color="text-emerald-600" />
              <StatCard title="Total Mois" value={data?.visits?.month} loading={loading} />
              <StatCard title="Total An" value={data?.visits?.year} loading={loading} />
            </div>

            {/* SECTION ALERTES / ATTENTES */}
            <div className="max-w-sm">
                <StatCard 
                  title="Visites en attente / Reprogrammées" 
                  value={pendingCount} 
                  loading={loading} 
                  color="text-orange-500"
                  pulse={pendingCount > 0}
                />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, loading, color = "text-slate-900", pulse = false }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center transition-all hover:shadow-md">
    <div>
      <p className="text-slate-400 font-bold text-xs uppercase mb-1">{title}</p>
      <span className={`text-4xl font-black ${color}`}>
        {loading ? "..." : value ?? 0}
      </span>
    </div>
    {pulse && (
      <div className="relative flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
      </div>
    )}
  </div>
);

export default Dashboard;