import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Clock, CheckCircle2, Users, CheckCircle, Hourglass } from 'lucide-react';

const AgentDashboard = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const agentName = localStorage.getItem('userName') || localStorage.getItem('userNom') || 'Finance fifa';
  const rawService = localStorage.getItem('userService') || '3';

  // Formatage du nom de service pour l'affichage
  const formatService = (service) => {
    if (service === '3' || service === 'Service Financier') return 'Service Financier';
    if (service === '2' || service === 'Service RH') return 'Service RH';
    if (service === '4' || service === 'Service Informatique') return 'Service Informatique';
    return service || 'Département';
  };

  const fetchTodayVisits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5283/api/Visit/agent-today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const list = data?.$values || data || [];
        setVisits(list);
      } else {
        console.error("Erreur réponse serveur :", response.status);
      }
    } catch (err) {
      console.error("Erreur chargement visites du jour :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayVisits();

    // Écouteur temps réel via SignalR
    if (window.signalRConnection) {
      window.signalRConnection.on("ReceiveVisitStatusUpdate", () => {
        fetchTodayVisits();
      });
    }
  }, []);

  // 🟢 HELPER UNIFIÉ DE DÉTECTION DU STATUT (1: Attendu, 2: Dans locaux, 3: Terminé, 4: Annulé)
  const getStatutType = (v) => {
    const raw = v.statut !== undefined ? v.statut : (v.Statut !== undefined ? v.Statut : 1);
    const s = String(raw).toLowerCase().trim();

    // STATUT 2 : DANS LES LOCAUX / VALIDÉ À L'ACCUEIL
    if (s === '2' || s.includes('accepte') || s.includes('accepté') || s.includes('valide') || s.includes('validé')) {
      return 2;
    }
    
    // STATUT 3 : TERMINÉ
    if (s === '3' || s.includes('termine') || s.includes('terminé') || s.includes('cloture')) {
      return 3;
    }

    // STATUT 4 : ANNULÉ
    if (s === '4' || s.includes('annule') || s.includes('annulé')) {
      return 4;
    }

    // STATUT 1 : EN ATTENTE D'ARRIVÉE À LA LOGE (Par défaut pour aujourd'hui)
    return 1;
  };

  // Helper pour extraire le nom complet du visiteur
  const getVisitorFullName = (v) => {
    const nom = v.nom_visitor || v.nomVisitor || v.Nom_Visitor || v.nom || v.visitor?.nom || v.Visitor?.nom || '';
    const prenom = v.prenom_visitor || v.prenomVisitor || v.Prenom_Visitor || v.prenom || v.visitor?.prenom || v.Visitor?.prenom || '';
    
    const fullName = `${nom} ${prenom}`.trim();
    return fullName !== '' ? fullName : 'Visiteur Inconnu';
  };

  // 🟢 CALCUL FILTRÉ PAR DATE DU JOUR (todayStr)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayVisits = useMemo(() => {
    return visits.filter(v => {
      const vDate = (v.date || v.Date || "").split('T')[0];
      // Si la date n'est pas précisée par l'endpoint (déjà filtré côté SQL), on l'inclus par défaut
      return !vDate || vDate === todayStr;
    });
  }, [visits, todayStr]);

  // Calcul dynamique des statistiques
  const totalAttendu = todayVisits.length;
  const visitesValidees = todayVisits.filter(v => getStatutType(v) === 2).length;
  const enAttente = todayVisits.filter(v => getStatutType(v) === 1).length;

  const filteredVisits = todayVisits.filter(v => {
    const fullName = getVisitorFullName(v).toLowerCase();
    const motif = (v.motif || v.Motif || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || motif.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        {/* BANNIÈRE EN-TÊTE */}
        <div className="bg-slate-900 px-8 pt-8 pb-16 relative overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto">
            <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30 inline-block mb-3">
              {formatService(rawService)}
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Espace Service — {agentName}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Visiteurs et rendez-vous programmés pour votre département aujourd'hui.
            </p>
          </div>
        </div>

        <div className="px-8 -mt-8 relative z-20 pb-12 max-w-6xl mx-auto space-y-6">
          
          {/* STATISTIQUES DES VISITES DU JOUR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={22} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Attendu</p>
                <h3 className="text-xl font-black text-slate-800">{totalAttendu}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Dans nos locaux (Validés)</p>
                <h3 className="text-xl font-black text-slate-800">{visitesValidees}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Hourglass size={22} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Attendus à l'accueil</p>
                <h3 className="text-xl font-black text-slate-800">{enAttente}</h3>
              </div>
            </div>
          </div>

          {/* TABLEAU DES RENDEZ-VOUS DU JOUR */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  Rendez-vous du jour
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Liste actualisée des accès visiteurs
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher nom ou motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs font-semibold text-slate-400">
                Chargement des visites en cours...
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="py-16 text-center text-xs font-semibold text-slate-400">
                Aucune visite programmée pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <th className="pb-3 px-4">Visiteur</th>
                      <th className="pb-3 px-4">Motif de la visite</th>
                      <th className="pb-3 px-4">Heure Arrivée</th>
                      <th className="pb-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                    {filteredVisits.map((v) => {
                      const visitorName = getVisitorFullName(v);
                      const rawHeure = v.heureArriver || v.HeureArriver || '--:--';
                      const heure = typeof rawHeure === 'string' ? rawHeure.substring(0, 5) : rawHeure;
                      const statutType = getStatutType(v);

                      return (
                        <tr key={v.id || v.Id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                                {visitorName.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900">{visitorName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {v.motif || v.Motif || 'Non renseigné'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/70 px-2.5 py-1 rounded-md">
                              <Clock size={12} className="text-blue-600" />
                              {heure}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {statutType === 2 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle2 size={12} /> Dans nos locaux
                              </span>
                            ) : statutType === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                <Hourglass size={12} /> En attente d'accueil
                              </span>
                            ) : statutType === 3 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Terminé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                Annulé
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;