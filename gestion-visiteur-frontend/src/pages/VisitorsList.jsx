import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { visitorService } from '../services/visitorService';
import { statsService } from '../services/statsService';
import CreateVisit from '../components/CreateVisit'; 
import { Search, Plus, Calendar, Edit3, Trash2, RotateCcw, UserCheck, UserX, UserCheck2 } from 'lucide-react';

const VisitorsList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedVisitor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");

  const loadVisitors = async () => {
    try {
      setLoading(true);
      let activeList = [];
      let deletedList = [];

      try { activeList = await visitorService.getAll(); } catch (e) { console.error(e); }
      try { deletedList = await visitorService.getDeleted(); } catch (e) { console.warn(e); }

      const fullList = [
        ...(Array.isArray(activeList) ? activeList : []).map(v => ({ ...v, isDeleted: false })),
        ...(Array.isArray(deletedList) ? deletedList : []).map(v => ({ ...v, isDeleted: true }))
      ];

      setVisitors(fullList);

      const statsData = await statsService.getDashboardStats();
      setStats(statsData?.visitors || null);

    } catch (err) {
      console.error("Erreur générale :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const handleOpenVisitModal = (visitor) => {
    navigate('/create-visit', { state: { selectedVisitor: visitor } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Envoyer ce visiteur à la corbeille ?")) {
      try {
        await visitorService.delete(id);
        await loadVisitors();
      } catch { alert("Erreur lors de la suppression"); }
    }
  };

  const handleRestore = async (id) => {
    try {
      await visitorService.restore(id);
      await loadVisitors();
    } catch { alert("Erreur lors de la restauration"); }
  };

  const filteredVisitors = visitors.filter(v => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      v.nom?.toLowerCase().includes(search) || 
      v.email?.toLowerCase().includes(search) ||
      v.telephone?.includes(search);
    
    const matchesStatus = filterStatus === "active" ? !v.isDeleted : v.isDeleted;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        
        {/* EN-TÊTE PAGE */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Visiteurs</h1>
            <p className="text-slate-500 text-sm">Annuaire et statistiques d'affluence.</p>
          </div>
          
          <button 
            onClick={() => navigate('/Inscription')}
            className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Nouveau Visiteur</span>
          </button>
        </div>

        {/* CARTES STATISTIQUES VISITEURS UNIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <VisitorStatCard title="Aujourd'hui" value={stats?.day} color="text-blue-600" bgColor="bg-blue-50" />
          <VisitorStatCard title="Ce Mois" value={stats?.month} color="text-violet-600" bgColor="bg-violet-50" />
          <VisitorStatCard title="Cette Année" value={stats?.year} color="text-indigo-600" bgColor="bg-indigo-50" />
        </div>

        {/* BARRE DE RECHERCHE ET FILTRE */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou téléphone..." 
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative flex items-center">
            <select 
              className="bg-slate-50 border border-slate-200 pl-4 pr-10 py-3 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="active">Visiteurs Actifs</option>
              <option value="deleted">Corbeille</option>
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              {filterStatus === 'active' ? <UserCheck2 size={16} className="text-emerald-500" /> : <UserX size={16} className="text-red-500" />}
            </div>
          </div>
        </div>

        {/* TABLEAU DES VISITEURS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 font-bold text-slate-400 text-sm">Chargement des visiteurs...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6 font-bold text-slate-600 text-xs uppercase tracking-wider">Visiteur</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Contact</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Date Inscription</th>
                  <th className="p-4 pr-6 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{visitor.nom}</div>
                      <div className="text-xs text-slate-400">{visitor.email}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{visitor.telephone}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                        {visitor.dateEnregistrement ? new Date(visitor.dateEnregistrement).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-center gap-2">
                        {filterStatus === "active" ? (
                          <>
                            <button 
                              onClick={() => handleOpenVisitModal(visitor)}
                              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors"
                              title="Programmer une visite"
                            >
                              <Calendar size={18} />
                            </button>

                            <button 
                              onClick={() => navigate('/Inscription', { state: { visitorToEdit: visitor } })}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                              title="Modifier"
                            >
                              <Edit3 size={18} />
                            </button>

                            <button 
                              onClick={() => handleDelete(visitor.id)} 
                              className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRestore(visitor.id)}
                            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            <RotateCcw size={14} /> Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredVisitors.length === 0 && (
            <div className="p-16 text-center text-slate-400 text-sm italic">
              Aucun visiteur trouvé.
            </div>
          )}
        </div>

        {isVisitModalOpen && (
          <CreateVisit
            onClose={() => setIsVisitModalOpen(false)} 
            onSuccess={() => setIsVisitModalOpen(false)}
            initialData={{ idVisitor: selectedVisitor?.id, nom: selectedVisitor?.nom }}
          />
        )}
      </main>
    </div>
  );
};

const VisitorStatCard = ({ title, value, color, bgColor }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center shrink-0`}>
      <UserCheck size={22} />
    </div>
    <div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{title}</p>
      <span className={`text-2xl font-black ${color}`}>{value ?? 0}</span>
    </div>
  </div>
);

export default VisitorsList;