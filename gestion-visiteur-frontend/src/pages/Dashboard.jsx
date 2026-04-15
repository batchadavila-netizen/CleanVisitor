import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // ÉTAT POUR LE SIDEBAR
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await statsService.getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
         <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
         

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* TopBar */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="font-bold text-slate-800">Tableau de Bord Administratif</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Admin</span>
        </header>

       <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-10`}>
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900">Statistiques</h1>
              <p className="text-slate-500">Aperçu en temps réel d'Aigle Informatique.</p>
            </div>

            {/* --- SECTION VISITEURS (Individus uniques) --- */}
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Visiteurs Uniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Aujourd'hui" value={data?.visitors?.day} loading={loading} color="text-blue-600" />
              <StatCard title="Ce Mois" value={data?.visitors?.month} loading={loading} />
              <StatCard title="Cette Année" value={data?.visitors?.year} loading={loading} />
            </div>

            {/* --- SECTION VISITES (Flux total) --- */}
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Flux des Visites</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Visites / Jour" value={data?.visits?.day} loading={loading} color="text-emerald-600" />
              <StatCard title="Visites / Mois" value={data?.visits?.month} loading={loading} />
              <StatCard title="Visites / An" value={data?.visits?.year} loading={loading} />
            </div>

            {/* --- SECTION EN ATTENTE --- */}
            <div className="max-w-sm">
                <StatCard 
                  title="Visites en attente" 
                  value={data?.pending} 
                  loading={loading} 
                  color="text-orange-500"
                  pulse={true}
                />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// Composant Carte réutilisable
const StatCard = ({ title, value, loading, color = "text-slate-900", pulse = false }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
    <div>
      <p className="text-slate-400 font-bold text-xs uppercase mb-1">{title}</p>
      <span className={`text-4xl font-black ${color}`}>
        {loading ? "..." : value ?? 0}
      </span>
    </div>
    {pulse && <div className="h-4 w-4 bg-orange-500 rounded-full animate-pulse"></div>}
  </div>
);
export default Dashboard;