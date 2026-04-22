import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import Sidebar from '../components/Sidebar';
import connection, { startSignalRConnection } from '../services/signalRService';
import toast, { Toaster } from 'react-hot-toast';

const SERVICE_NAMES = {
  1: { label: "Direction", color: "bg-purple-100 text-purple-700 border-purple-200" },
  2: { label: "Service RH", color: "bg-pink-100 text-pink-700 border-pink-200" },
  3: { label: "Service Financier", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  4: { label: "Service Informatique", color: "bg-blue-100 text-blue-700 border-blue-200" },
  5: { label: "Secrétariat", color: "bg-slate-100 text-slate-700 border-slate-200" }
};

const AdminValidation = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const response = await visitService.getAll();
      
      let cleanData = [];
      if (response?.$values) cleanData = response.$values;
      else if (response?.value) cleanData = response.value;
      else if (Array.isArray(response)) cleanData = response;

      console.log("Données reçues pour affichage:", cleanData);
      setVisits(cleanData);
    } catch (err) {
      console.error("Erreur API:", err);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    startSignalRConnection();

    connection.on("ReceiveNewVisit", () => {
      toast.success(`Nouveau passage détecté !`, { icon: '🔔' });
      loadVisits();
    });

    connection.on("ReceiveStatusUpdate", () => loadVisits());

    return () => {
      connection.off("ReceiveNewVisit");
      connection.off("ReceiveStatusUpdate");
    };
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await visitService.updateStatus(id, newStatus);
      toast.success(`Opération réussie`);
      loadVisits();
    } catch (err) {
      toast.error("Erreur de mise à jour");
    }
  };

  // --- LOGIQUE DE FILTRAGE CORRIGÉE ---
  
  // --- LOGIQUE DE FILTRAGE MISE À JOUR ---
  
  const pendingVisits = visits.filter(v => {
    // On récupère la valeur du statut (on teste plusieurs noms de champs possibles)
    const s = v.statut ?? v.Statut ?? v.status ?? v.Status ?? "";
    
    // On affiche dans "À Traiter" si c'est 1 ou le texte "EnAttente"
    return s === 1 || s === "1" || s === "EnAttente";
  });

  const historyVisits = visits.filter(v => {
    const s = v.statut ?? v.Statut ?? v.status ?? v.Status ?? "";
    
    // On affiche dans "Historique" si c'est 2, 3 ou "Terminé", "Accepte", "Refuse"
    const isProcessed = 
      s === 2 || s === "2" || s === "Accepte" ||
      s === 3 || s === "3" || s === "Refuse" ||
      s === "Terminé" || s === "Termine";

    // Pour le test, on désactive temporairement le filtre de date
    // pour être sûr de voir tes 7 visites "Terminé"
    return isProcessed;
  });

  const displayedVisits = activeTab === 'pending' ? pendingVisits : historyVisits;
  console.log("DEBUG FILTRE - Total:", visits.length, "Exemple Statut:", visits[0]?.Statut, "ou", visits[0]?.statut);
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        pendingVisits={pendingVisits.length} 
      />

      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Validation des Entrées</h1>
            <p className="text-slate-500 text-sm font-medium">Gestion en temps réel (SignalR)</p>
          </div>
          
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              À TRAITER ({pendingVisits.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              HISTORIQUE
            </button>
          </div>
        </header>

        {activeTab === 'history' && (
          <div className="mb-6 flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 w-fit">
            <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">📅 Filtrer par jour :</span>
            <input 
              type="date" 
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-white border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Mise à jour...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Visiteur / Motif</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Service Destination</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">État</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayedVisits.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                        {activeTab === 'pending' ? "Aucun visiteur en attente de validation" : "Aucun historique trouvé pour cette date"}
                      </td>
                    </tr>
                  ) : (
                    displayedVisits.map((v, index) => {
                      const sValue = Number(v.Statut ?? v.statut ?? 0);
                      const serviceId = v.ServiceId ?? v.serviceId ?? v.idService ?? 1;
                      const vId = v.Id ?? v.id;
                      const nomVisiteur = v.Nom_visitor || v.nom_visitor || `Visiteur #${v.IdVisitor || v.idVisitor}`;

                      return (
                        <tr key={vId || index} className="group hover:bg-slate-50/50 transition-all">
                          <td className="p-6">
                            <div className="font-bold text-slate-700">{nomVisiteur}</div>
                            <div className="text-[10px] text-slate-400 mt-1 italic">
                               <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                 📝 {v.Motif || v.motif || "Pas de motif précisé"}
                               </span>
                            </div>
                          </td>
                          <td className="p-6 text-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${SERVICE_NAMES[serviceId]?.color || "bg-gray-50 text-gray-400"}`}>
                              {SERVICE_NAMES[serviceId]?.label || "Inconnu"}
                            </span>
                          </td>
                          <td className="p-6 text-center">
                            {sValue === 1 && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1 rounded-lg">EN ATTENTE</span>}
                            {sValue === 2 && <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-3 py-1 rounded-lg">ACCEPTÉ</span>}
                            {sValue === 3 && <span className="bg-red-100 text-red-700 text-[9px] font-black px-3 py-1 rounded-lg">REFUSÉ</span>}
                          </td>
                          <td className="p-6 text-right">
                            {sValue === 1 ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleAction(vId, 2)} 
                                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all shadow-md"
                                >
                                  APPROUVER
                                </button>
                                <button 
                                  onClick={() => handleAction(vId, 3)} 
                                  className="bg-white border border-slate-200 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black hover:text-red-600 hover:border-red-200 transition-all"
                                >
                                  REFUSER
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-3 py-1 rounded-lg italic">Demande traitée</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminValidation;