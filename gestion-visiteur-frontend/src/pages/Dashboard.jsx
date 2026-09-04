import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { statsService } from '../services/statsService';
import { visitService } from '../services/visitService';
import { useNotification } from '../services/useNotification';
import { 
  Bell, CheckCircle2, Clock, CalendarCheck, Sparkles, 
  Search, LogIn, UserCheck, ShieldCheck, Building2, User, Eye, XCircle
} from 'lucide-react';

const SERVICE_LABELS = {
  '1': 'Direction',
  'Direction': 'Direction',
  '2': 'Service RH',
  'Service_RH': 'Service RH',
  '3': 'Service Financier',
  'Service_Financier': 'Service Financier',
  '4': 'Service Informatique',
  'Service_Informatique': 'Service Informatique',
  '5': 'Secrétariat',
  'Secretariat': 'Secrétariat'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [allVisits, setAllVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchAgent, setSearchAgent] = useState("");
  const [selectedVisitDetail, setSelectedVisitDetail] = useState(null);

  // Récupération des infos utilisateur
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'Agent');
  const [userService, setUserService] = useState(() => localStorage.getItem('userService') || localStorage.getItem('userDepartment') || '');

  const { notifications, loading: loadingNotifs } = useNotification(null, userRole);

  const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === '1';
  const isAgent = userRole === 'Agent' || userRole === 'agent' || userRole === '2';
  const isServiceHead = !isAdmin && !isAgent;

  // Enum C# VisitStatut : 1=En_attente (Attendu à la loge), 2=Accepter (Dans les locaux), 3=Terminee, 4=Annulé
  const enumToCode = { "En_attente": 1, "Accepter": 2, "Terminee": 3, "Annulé": 4 };

  const parseRawStatus = (v) => {
    const s = v.statut ?? v.Statut;
    if (typeof s === 'number') return s;
    return enumToCode[s] ?? 1;
  };

  const formatServiceName = (rawService) => {
    if (!rawService) return 'Non spécifié';
    const str = String(rawService).trim();
    return SERVICE_LABELS[str] || str.replace(/_/g, ' ');
  };

  const getHostFullName = (v) => {
    const nom = v.nom_Host || v.Nom_Host || v.nom_host || v.Nom_host || '';
    const prenom = v.prenom_Host || v.Prenom_Host || v.prenom_host || v.Prenom_host || '';
    const fallback = v.hote || v.Hote || v.agentAviser || v.AgentAviser || '';
    
    const fullName = `${prenom} ${nom}`.trim();
    return fullName || fallback || "Tout le service";
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const visits = await visitService.getAll();
      const visitsArray = Array.isArray(visits) ? visits : (visits?.$values || []);
      setAllVisits(visitsArray);

      const todayStr = new Date().toISOString().split('T')[0];

      // Visites complétées (3)
      const systemCompletedVisits = visitsArray.filter(v => parseRawStatus(v) === 3).length;

      const todayCompletedVisitsAgent = visitsArray.filter(v => {
        const vDate = (v.date || v.Date || "").split('T')[0];
        return vDate === todayStr && parseRawStatus(v) === 3;
      }).length;

      const todayCompletedVisitsService = visitsArray.filter(v => {
        const vDate = (v.date || v.Date || "").split('T')[0];
        const vService = String(v.service || v.Service || "").toLowerCase();
        return vDate === todayStr && parseRawStatus(v) === 3 && vService.includes(userService.toLowerCase());
      }).length;

      // 🟢 COMPTAGE DES VISITES EN ATTENTE DU JOUR MÊME (STATUT 1 = PROGRAMMÉES / ATTENDUES À LA LOGE)
      const pendingToday = visitsArray.filter(v => {
        const statusCode = parseRawStatus(v);
        const vDate = (v.date || v.Date || "").split('T')[0];
        const isToday = vDate === todayStr;

        if (isServiceHead && userService) {
          const vService = String(v.service || v.Service || "").toLowerCase();
          return isToday && statusCode === 1 && vService.includes(userService.toLowerCase());
        }
        return isToday && statusCode === 1;
      }).length;

      setPendingCount(pendingToday);

      const stats = await statsService.getDashboardStats();

      let displayCompletedCount = systemCompletedVisits;
      if (isAgent) displayCompletedCount = todayCompletedVisitsAgent;
      if (isServiceHead) displayCompletedCount = todayCompletedVisitsService;

      setData({ 
        ...stats, 
        completedVisitsCount: displayCompletedCount, 
        totalVisitsCount: visitsArray.length 
      });

    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'Agent';
    const dept = localStorage.getItem('userService') || localStorage.getItem('userDepartment') || '';
    setUserRole(role);
    setUserService(dept);
    loadDashboardData();
  }, []);

  const sortedNotifications = useMemo(() => {
    if (!notifications || !Array.isArray(notifications)) return [];
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.dateEnvoi || a.DateEnvoi || 0);
      const dateB = new Date(b.dateEnvoi || b.DateEnvoi || 0);
      return dateB - dateA;
    });
  }, [notifications]);

  // Filtrage des visites du jour qui sont "ACCEPTÉES / EN COURS DANS LES LOCAUX" (2) OU "EN ATTENTE D'ARRIVÉE" (1)
  const todayVisits = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return allVisits.filter(v => {
      const vDate = (v.date || v.Date || "").split('T')[0];
      const statusCode = parseRawStatus(v);

      const visitorName = (v.nom_visitor || v.Nom_visitor || v.nom || "").toLowerCase();
      const accessCode = (v.accessCode || v.AccessCode || "").toLowerCase();
      const serviceName = formatServiceName(v.service || v.Service).toLowerCase();
      const hostName = getHostFullName(v).toLowerCase();
      const search = searchAgent.toLowerCase();

      const matchesSearch = 
        visitorName.includes(search) || 
        accessCode.includes(search) || 
        serviceName.includes(search) || 
        hostName.includes(search);

      const isForToday = vDate === todayStr;
      
      // On affiche les visites programmées/attendues (1) ou déjà entrées (2)
      const isValidStatus = statusCode === 1 || statusCode === 2;

      if (isServiceHead && userService) {
        return isForToday && matchesSearch && isValidStatus && serviceName.includes(userService.toLowerCase());
      }

      return isForToday && matchesSearch && isValidStatus;
    });
  }, [allVisits, searchAgent, isServiceHead, userService]);

  const handleUpdateStatus = async (visitId, newStatus) => {
    try {
      await visitService.updateVisitStatus(Number(visitId), Number(newStatus));
      await loadDashboardData();
      setSelectedVisitDetail(null);
    } catch (err) {
      console.error("Erreur UpdateStatus:", err);
      alert("Erreur lors de la mise à jour du statut dans le serveur.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pendingVisits={pendingCount}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        {/* BANNIÈRE HEADER */}
        <div className="bg-slate-900 px-8 pt-8 pb-16 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {isAdmin ? 'Centre de Contrôle des Visites' : isServiceHead ? `Rendez-vous Service ${userService}` : 'Poste d\'Accueil & Orientation'}
                </h1>
                <Sparkles size={20} className="text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm">
                {isAdmin ? 'Surveillance globale et système d\'alertes.' : 'Vérification du Pass d\'accès, enregistrement et contrôle des arrivées.'}
              </p>
            </div>

            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              isAdmin ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            }`}>
              {isAdmin ? 'ADMINISTRATEUR' : isServiceHead ? `SERVICE : ${userService.toUpperCase()}` : 'AGENT D\'ACCUEIL'}
            </span>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <main className="px-8 -mt-8 relative z-20 pb-12 flex-1">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* CARTES STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Attendus à l'Accueil (Aujourd'hui)" 
                value={pendingCount} 
                loading={loading} 
                color="text-amber-600" 
                bgColor="bg-amber-50" 
                icon={<Clock size={24} />} 
                pulse={pendingCount > 0} 
              />
              <StatCard 
                title={isAdmin ? "Visites Terminées (Système)" : "Visites Terminées (Aujourd'hui)"} 
                value={data?.completedVisitsCount} 
                loading={loading} 
                color="text-emerald-600" 
                bgColor="bg-emerald-50" 
                icon={<CheckCircle2 size={24} />} 
              />
              <StatCard 
                title="Total Enregistré" 
                value={data?.totalVisitsCount} 
                loading={loading} 
                color="text-blue-600" 
                bgColor="bg-blue-50" 
                icon={<CalendarCheck size={24} />} 
              />
            </div>

            {/* VUE AGENT / SERVICE : REGISTRE DÉTAILLÉ DE LA JOURNÉE */}
            {!isAdmin && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <UserCheck size={20}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {isServiceHead ? `Rendez-vous du jour - Service ${userService}` : 'Rendez-vous de la Journée'}
                      </h3>
                      <p className="text-xs text-slate-400">Cliquez sur l'œil pour vérifier la fiche et badger l'entrée</p>
                    </div>
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Pass, Visiteur, Service ou Hôte..."
                      value={searchAgent}
                      onChange={(e) => setSearchAgent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all uppercase placeholder:normal-case"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-50 overflow-x-auto">
                  {loading ? (
                    <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Chargement du registre...</div>
                  ) : todayVisits.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm italic">
                      Aucun rendez-vous programmé pour aujourd'hui ne correspond à votre recherche.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-4 pl-6">Visiteur</th>
                          <th className="p-4">Pass d'Accès</th>
                          <th className="p-4">Heure Prévue</th>
                          <th className="p-4">Personne / Service</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 text-center">Vérification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-medium">
                        {todayVisits.map((v) => {
                          const visitorNom = v.nom_visitor || v.Nom_visitor || v.nom || 'Visiteur';
                          const formattedService = formatServiceName(v.service || v.Service);
                          const hoteFull = getHostFullName(v);
                          const passCode = v.accessCode || v.AccessCode || `V-${v.id || v.Id}`;
                          const statusCode = parseRawStatus(v);

                          return (
                            <tr key={v.id || v.Id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 pl-6">
                                <div className="font-bold text-slate-800">{visitorNom}</div>
                                <div className="text-[11px] text-slate-400">{v.email_visitor || v.Email_visitor || ''}</div>
                              </td>

                              <td className="p-4">
                                <span className="font-mono font-bold text-xs bg-slate-100 text-blue-700 px-2.5 py-1 rounded-lg border border-slate-200">
                                  {passCode}
                                </span>
                              </td>

                              <td className="p-4 text-slate-600">
                                <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700">
                                  <Clock size={12} className="text-slate-400" />
                                  {v.heureArriver || v.HeureArriver || '--:--'}
                                </span>
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                                  <User size={13} className="text-blue-500" />
                                  <span>{hoteFull}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                  <Building2 size={12} />
                                  <span>{formattedService}</span>
                                </div>
                              </td>

                              <td className="p-4">
                                {statusCode === 2 ? (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    DANS LES LOCAUX
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                    EN ATTENTE ACCUEIL
                                  </span>
                                )}
                              </td>

                              <td className="p-4 text-center">
                                {statusCode === 1 ? (
                                  <button 
                                    onClick={() => setSelectedVisitDetail(v)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-all border border-blue-100"
                                    title="Ouvrir la fiche pour valider le passage"
                                  >
                                    <Eye size={15} /> Inspecter & Badger
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleUpdateStatus(v.id || v.Id, 3)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                                    title="Clôturer le rendez-vous / Enregistrer la sortie"
                                  >
                                    Badger Sortie
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* VUE ADMIN : HISTORIQUE NOTIFICATIONS */}
            {isAdmin && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                      <Bell size={20}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Historique des Activités</h3>
                      <p className="text-xs text-slate-400">Flux d'alertes trié par ordre chronologique</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {sortedNotifications.length} alerte(s)
                  </span>
                </div>
                
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="py-12 text-center text-slate-400 animate-pulse text-sm">Chargement des événements...</div>
                  ) : sortedNotifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm italic">Aucune notification enregistrée dans le système.</div>
                  ) : (
                    sortedNotifications.map((notif, index) => {
                      const message = notif.message || notif.Message || "";
                      const type = notif.type || notif.Type || 'SYSTEM';
                      const date = notif.dateEnvoi || notif.DateEnvoi;
                      const id = notif.id || notif.Id || index;

                      return (
                        <div key={id} className="flex items-center gap-4 p-5 hover:bg-slate-50/80 transition-all group">
                          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${type.includes('VISIT') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {type.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">{message}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                              {date ? new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Date inconnue"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {type}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </main>

        {/* MODALE DE VÉRIFICATION */}
        {selectedVisitDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
              
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Fiche de Confirmation</h3>
                  <p className="text-[11px] text-blue-600 font-mono font-bold uppercase tracking-wider mt-0.5">
                    Pass : {selectedVisitDetail.accessCode || selectedVisitDetail.AccessCode || `V-${selectedVisitDetail.id || selectedVisitDetail.Id}`}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedVisitDetail(null)} 
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm mb-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visiteur Titulaire</p>
                  <p className="font-bold text-slate-800 text-base">
                    {selectedVisitDetail.nom_visitor || selectedVisitDetail.Nom_visitor || selectedVisitDetail.nom || 'Visiteur'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Personne Visitée</p>
                    <p className="font-bold text-blue-700">
                      {getHostFullName(selectedVisitDetail)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Service Target</p>
                    <p className="font-bold text-slate-700">
                      {formatServiceName(selectedVisitDetail.service || selectedVisitDetail.Service)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Motif Déclaré</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl mt-1 text-xs font-medium border border-slate-100">
                    {selectedVisitDetail.motif || selectedVisitDetail.Motif || 'Aucun motif renseigné'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleUpdateStatus(selectedVisitDetail.id || selectedVisitDetail.Id, 2)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-1.5"
                >
                  <LogIn size={16} /> Badger Entrée
                </button>

                <button 
                  onClick={() => handleUpdateStatus(selectedVisitDetail.id || selectedVisitDetail.Id, 4)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3.5 py-3.5 rounded-2xl text-xs transition-all flex items-center gap-1.5"
                  title="Marquer le visiteur comme absent / non venu"
                >
                  <XCircle size={16} /> Absent
                </button>

                <button 
                  onClick={() => setSelectedVisitDetail(null)} 
                  className="px-4 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-2xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Fermer
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard = ({ title, value, loading, color, bgColor, icon, pulse = false }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 h-28 hover:-translate-y-0.5 transition-all">
    <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mb-0.5 truncate">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <span className={`text-3xl font-black ${color} tracking-tight`}>
          {loading ? "..." : value ?? 0}
        </span>
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;