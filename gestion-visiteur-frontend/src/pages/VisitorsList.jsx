import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { visitorService } from '../services/visitorService';
import CreateVisitModal from '../components/CreateVisitModal'; // Assure-toi que le chemin est correct


const VisitorsList = () => {
  // --- ÉTATS DE L'INTERFACE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const navigate = useNavigate();
  
  
  // --- ÉTATS DES DONNÉES ---
  const [visitors, setVisitors] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null); // Pour stocker le visiteur choisi
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  

  // --- CHARGEMENT DES DONNÉES ---
  const loadVisitors = async () => {
    try {
      setLoading(true);
      let activeList = [];
      let deletedList = [];

      try {
        activeList = await visitorService.getAll();
      } catch (e) {
        console.error("Erreur sur les actifs :", e);
      }

      try {
        deletedList = await visitorService.getDeleted();
      } catch (e) {
        console.warn("Erreur sur la corbeille :", e);
      }

      const fullList = [
        ...(Array.isArray(activeList) ? activeList : []).map(v => ({ ...v, isDeleted: false })),
        ...(Array.isArray(deletedList) ? deletedList : []).map(v => ({ ...v, isDeleted: true }))
      ];

      setVisitors(fullList);
    } catch (err) {
      console.error("Erreur générale :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  // --- ACTIONS ---
  const handleOpenVisitModal = (visitor) => {
    setSelectedVisitor(visitor); // On mémorise quel visiteur a été cliqué
    setIsVisitModalOpen(true);    // On ouvre la modale
  };

  const handleDelete = async (id) => {
    if (window.confirm("Envoyer ce visiteur à la corbeille ?")) {
      try {
        await visitorService.delete(id);
        await loadVisitors();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await visitorService.restore(id);
      await loadVisitors();
    } catch (err) {
      alert("Erreur lors de la restauration");
    }
  };

  // --- FILTRAGE ---
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
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-10`}>
        
        {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Gestion des Visiteurs</h1>
        <p className="text-slate-500 text-sm">Gestion des accès - Aigle Informatique</p>
      </div>
      
      {/* 3. Ajoute le onClick avec navigate */}
     <button 
  onClick={() => navigate('/Inscription')} // Majuscule ici pour correspondre à ta route
  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
>
  + Ajouter un visiteur
</button>
    </div>

        {/* Barre de Recherche et Sélecteur */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Rechercher par nom, email ou téléphone..." 
              className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-600 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="active">🟢 Visiteurs Actifs</option>
            <option value="deleted">🔴 Corbeille</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 font-bold text-slate-400">Chargement des données...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Visiteur</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Contact</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="p-4 font-bold text-slate-600 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-700">{visitor.nom}</div>
                      <div className="text-xs text-slate-400">{visitor.email}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{visitor.telephone}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                        {visitor.dateEnregistrement ? new Date(visitor.dateEnregistrement).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {filterStatus === "active" ? (
                          <>
                            {/* BOUTON CRÉER VISITE (📅) */}
                            <button 
                              onClick={() => handleOpenVisitModal(visitor)}
                              className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                              title="Enregistrer une visite pour ce visiteur"
                            >
                              📅
                            </button>
                            <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">✏️</button>
                            <button onClick={() => handleDelete(visitor.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">🗑️</button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRestore(visitor.id)}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-emerald-100"
                          >
                            🔄 Restaurer
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
            <div className="p-20 text-center text-slate-400 italic">
              Aucun visiteur dans cette section.
            </div>
          )}
        </div>

        {/* MODALE DE CRÉATION DE VISITE */}
        {isVisitModalOpen && (
          <CreateVisitModal 
            onClose={() => setIsVisitModalOpen(false)} 
            onSuccess={() => {
              setIsVisitModalOpen(false);
              // Optionnel : recharger une liste si nécessaire
            }}
            // On envoie les infos du visiteur à la modale
            initialData={{ 
              idVisitor: selectedVisitor?.id, 
              nom: selectedVisitor?.nom 
            }}
          />
        )}
      </main>
    </div>
  );
};

export default VisitorsList;