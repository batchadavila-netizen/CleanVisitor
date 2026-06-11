import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import Sidebar from '../components/Sidebar';
import connection, { startSignalRConnection } from '../services/signalRService';
import toast, { Toaster } from 'react-hot-toast';

const SERVICE_NAMES = {
  1: { label: "Direction",            color: "bg-purple-100 text-purple-700 border-purple-200" },
  2: { label: "Service RH",           color: "bg-pink-100 text-pink-700 border-pink-200" },
  3: { label: "Service Financier",    color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  4: { label: "Service Informatique", color: "bg-blue-100 text-blue-700 border-blue-200" },
  5: { label: "Secrétariat",          color: "bg-slate-100 text-slate-700 border-slate-200" }
};

const resolveServiceId = (val) => {
  if (!val) return null;
  const num = parseInt(val, 10);
  if (!isNaN(num) && num > 0) return num;
  // 🔥 FIX : normalise aussi les underscores "Service_informatique"
  const normalized = String(val).toLowerCase().replace(/[\s_\-]/g, '');
  const entry = Object.entries(SERVICE_NAMES).find(
    ([, s]) => s.label.toLowerCase().replace(/[\s_\-]/g, '') === normalized
  );
  return entry ? parseInt(entry[0], 10) : null;
};

const AdminValidation = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getStatutValue = (v) => {
    const val = v.statut ?? v.Statut ?? v.status ?? v.Status;
    if (val === undefined || val === null) return 0;
    if (typeof val === 'string') {
      switch (val) {
        case "En_attente": return 1;
        case "Accepter":   return 2;
        case "Terminee":   return 3;
        case "Annulé":     return 4;
        default: break;
      }
    }
    return Number(val);
  };

  // 🔥 FIX : "date" minuscule en priorité car c'est ce que l'API renvoie
  const getVisitDate = (v) => {
    const d = v.date ?? v.Date ?? v.dateCreation ?? v.DateCreation;
    return d ? d.split('T')[0] : "";
  };

  const autoExpireVisits = async (data) => {
    const tomorrowStr = getTomorrow();
    const expired = data.filter(v => {
      const statut     = getStatutValue(v);
      const dateVisite = getVisitDate(v);
      return statut === 1 && dateVisite !== "" && dateVisite <= tomorrowStr;
    });

    if (expired.length === 0) return false;

    const results = await Promise.allSettled(
      expired.map(v => {
        const id = v.id ?? v.Id;
        return visitService.updateVisitStatus(id, 4);
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    if (successCount > 0) {
      toast(`${successCount} visite(s) expirée(s) rejetée(s)`, { icon: '🕐' });
    }
    return true;
  };

  const fetchVisits = async () => {
    const response = await visitService.getAll();
    let data = [];
    if (response?.$values) data = response.$values;
    else if (response?.value) data = response.value;
    else if (Array.isArray(response)) data = response;
    return data;
  };

  const loadVisits = async () => {
    try {
      setLoading(true);
      const cleanData = await fetchVisits();
      await autoExpireVisits(cleanData);
      // Recharge une seule fois après expiration
      const finalData = await fetchVisits();
      setVisits(finalData);
    } catch (err) {
      console.error("Erreur API:", err);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    startSignalRConnection();
    connection.on("ReceiveNewVisit", () => {
      toast.success("Nouvelle visite reçue !", { icon: '🔔' });
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
      await visitService.updateVisitStatus(id, newStatus);
      toast.success("Opération réussie");
      await loadVisits();
    } catch (err) {
      toast.error("Erreur de mise à jour");
    }
  };

  const pendingVisits   = visits.filter(v => getStatutValue(v) === 1);
  const historyVisits   = visits.filter(v => getStatutValue(v) > 1 && getVisitDate(v) === historyDate);
  const displayedVisits = activeTab === 'pending' ? pendingVisits : historyVisits;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" />

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pendingVisits={pendingVisits.length}
      />

      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>

        {/* HEADER */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-800">Gestion des Visites</h1>
            <p className="text-slate-400 text-xs font-medium">Validation en temps réel</p>
          </div>
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}
            >
              À TRAITER ({pendingVisits.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}
            >
              HISTORIQUE ({historyVisits.length})
            </button>
          </div>
        </header>

        {/* FILTRE DATE HISTORIQUE */}
        {activeTab === 'history' && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 w-fit">
            <span className="text-blue-600 text-xs font-black uppercase tracking-wider">📅 Date :</span>
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-white border-none rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm outline-none"
            />
          </div>
        )}

        {/* TABLEAU */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
              Chargement...
            </div>
          ) : displayedVisits.length === 0 ? (
            <div className="p-16 text-center text-slate-300 font-bold text-xs uppercase tracking-widest">
              {activeTab === 'pending' ? "✅ Aucune visite en attente" : `Aucun historique pour le ${historyDate}`}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Visiteur</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Motif</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Date / Heure</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Service</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Statut</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedVisits.map((v, index) => {
                  const sValue      = getStatutValue(v);
                  const rawService  = v.service ?? v.Service ?? v.serviceId ?? v.ServiceId;
                  const serviceId   = resolveServiceId(rawService);
                  const serviceInfo = SERVICE_NAMES[serviceId];
                  const vId         = v.id ?? v.Id;
                  const nomVisiteur = v.nom_visitor ?? v.Nom_visitor ?? v.nomVisitor ?? v.NomVisitor ?? "Inconnu";
                  const motif       = v.motif ?? v.Motif ?? "—";
                  const heure       = (v.heureArriver ?? v.HeureArriver ?? '').substring(0, 5);
                  const dateVisite  = getVisitDate(v);

                  return (
                    <tr key={vId || index} className="hover:bg-slate-50/80 transition-colors">

                      {/* VISITEUR */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                            {nomVisiteur.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{nomVisiteur}</span>
                        </div>
                      </td>

                      {/* MOTIF */}
                      <td className="px-5 py-3 max-w-[180px]">
                        <span className="text-xs text-slate-500 font-medium truncate block" title={motif}>
                          {motif}
                        </span>
                      </td>

                      {/* DATE / HEURE */}
                      <td className="px-5 py-3 text-center">
                        <div className="text-xs font-bold text-slate-600">{dateVisite || '—'}</div>
                        {heure && <div className="text-[10px] text-slate-400 font-medium">{heure}</div>}
                      </td>

                      {/* SERVICE */}
                      <td className="px-5 py-3 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase whitespace-nowrap ${serviceInfo?.color || "bg-orange-50 text-orange-400 border-orange-200"}`}>
                          {serviceInfo?.label || rawService || "Inconnu"}
                        </span>
                      </td>

                      {/* STATUT */}
                      <td className="px-5 py-3 text-center">
                        {sValue === 1 && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-lg whitespace-nowrap">⏳ EN ATTENTE</span>}
                        {sValue === 2 && <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-lg whitespace-nowrap">✅ ACCEPTÉ</span>}
                        {sValue === 3 && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-lg whitespace-nowrap">🏁 TERMINÉE</span>}
                        {sValue === 4 && <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-lg whitespace-nowrap">❌ ANNULÉ</span>}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-3 text-right">
                        {sValue === 1 ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleAction(vId, 2)}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all whitespace-nowrap"
                            >
                              ACCEPTER
                            </button>
                            <button
                              onClick={() => handleAction(vId, 4)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600 transition-all whitespace-nowrap"
                            >
                              REJETER
                            </button>
                            <button
                              onClick={() => navigate('/create-visit', { state: { reprogramData: v } })}
                              className="bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-slate-100 transition-all whitespace-nowrap"
                            >
                              🔁 REPROG.
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 italic">Traité</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminValidation;