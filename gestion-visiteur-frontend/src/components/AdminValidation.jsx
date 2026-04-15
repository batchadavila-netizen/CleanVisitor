import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';
import Sidebar from '../components/Sidebar';

// Helpers pour l'affichage des Enums avec couleurs adaptées
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

  // Charger les visites depuis le service
  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await visitService.getAll();
      
      // Sécurité : on s'assure que data est bien un tableau avant de trier
      const visitsArray = Array.isArray(data) ? data : [];
      
      // Tri : Statut 1 (En attente) en premier
      const sorted = [...visitsArray].sort((a, b) => {
        const statusA = a.statut || a.Statut || 0;
        const statusB = b.statut || b.Statut || 0;
        return statusA - statusB;
      });
      
      setVisits(sorted);
    } catch (err) {
      console.error("Erreur chargement visites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  // Action de validation ou de refus
  const handleAction = async (id, newStatus) => {
    const actionName = newStatus === 2 ? "valider" : "refuser";
    if (window.confirm(`Voulez-vous vraiment ${actionName} cette visite ?`)) {
      try {
        await visitService.updateStatus(id, newStatus);
        await loadVisits(); // Recharger la liste pour voir les changements
      } catch (err) {
        alert("Erreur lors de la mise à jour du statut");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Barre latérale dynamique */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Contenu Principal */}
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Validation des Visites</h1>
          <p className="text-slate-500 text-sm font-medium">Gestion des accès et flux de visiteurs en temps réel.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400 font-bold">Récupération des données...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase text-slate-500">Visiteur</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500">Service</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500">Motif</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 text-center">Statut</th>
                    <th className="p-4 text-xs font-black uppercase text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visits.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-400 italic">Aucune visite à afficher.</td>
                    </tr>
                  ) : (
                    visits.map((v) => {
                      // Normalisation des clés (Gestion Majuscules/Minuscules du Backend)
                      const id = v.id || v.Id;
                      const serviceId = v.service || v.Service;
                      const statutId = v.statut || v.Statut;
                      const nom = v.nom || v.Nom || "Inconnu";
                      const email = v.email || v.Email || "Pas d'email";
                      const motif = v.motif || v.Motif;
                      const heure = v.heureArriver || v.HeureArriver;

                      return (
                        <tr key={id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-slate-700">{nom}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{email}</div>
                            <div className="text-[10px] text-blue-500 font-mono mt-1">{heure}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${SERVICE_NAMES[serviceId]?.color}`}>
                              {SERVICE_NAMES[serviceId]?.label || "N/A"}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600 italic line-clamp-1" title={motif}>
                              "{motif}"
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            {statutId === 1 && <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">⏳ Attente</span>}
                            {statutId === 2 && <span className="inline-flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">✅ Validée</span>}
                            {statutId === 3 && <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-black uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">❌ Refusée</span>}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {statutId === 1 ? (
                                <>
                                  <button 
                                    onClick={() => handleAction(id, 2)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
                                  >
                                    ACCEPTER
                                  </button>
                                  <button 
                                    onClick={() => handleAction(id, 3)}
                                    className="bg-white border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95"
                                  >
                                    REFUSER
                                  </button>
                                </>
                              ) : (
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">Traitée</span>
                              )}
                            </div>
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