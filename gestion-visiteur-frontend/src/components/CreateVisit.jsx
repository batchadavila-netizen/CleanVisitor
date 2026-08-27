import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { visitService } from '../services/visitService';
import { visitorService } from '../services/visitorService';
import Sidebar from '../components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Send, User, Clock, Info, Calendar, Building2, AlignLeft, AlertCircle, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const DEFAULT_SERVICES = ['Direction', 'Service RH', 'Service Financier', 'Service Informatique', 'Secrétariat'];

const SERVICE_MAP = {
  '1': 'Direction',
  'direction': 'Direction',
  
  '2': 'Service RH',
  'service_rh': 'Service RH',
  'servicerh': 'Service RH',
  'service rh': 'Service RH',
  
  '3': 'Service Financier',
  'service_financier': 'Service Financier',
  'servicefinancier': 'Service Financier',
  'service financier': 'Service Financier',
  
  '4': 'Service Informatique',
  'service_informatique': 'Service Informatique',
  'serviceinformatique': 'Service Informatique',
  'service informatique': 'Service Informatique',
  
  '5': 'Secrétariat',
  'secrétariat': 'Secrétariat',
  'secretariat': 'Secrétariat'
};

const SERVICE_ID_MAP = {
  'Direction': 1,
  'Service RH': 2,
  'Service Financier': 3,
  'Service Informatique': 4,
  'Secrétariat': 5
};

const normalizeServiceKey = (val) => {
  if (!val) return '';
  return String(val).trim().toLowerCase();
};

const schema = z.object({
  idVisitor: z.any().optional(),
  service: z.string().min(1, "Le service est obligatoire"),
  userId: z.string().optional(),
  date: z.string().min(1, "La date est obligatoire"),
  heureArriver: z.string().min(1, "L'heure est obligatoire"),
  motif: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
});

const Field = ({ label, icon, error, children }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
        {icon} {label}
      </label>
    )}
    {children}
    {error && (
      <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
        <AlertCircle size={13} /> {error}
      </p>
    )}
  </div>
);

const CreateVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.initialData || location.state?.reprogramData || null;
  const selectedFromList = location.state?.selectedVisitor || null;
  const isReprogramMode = !!initialData;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [serviceAgents, setServiceAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [currentVisitorName, setCurrentVisitorName] = useState('');
  const userRole = localStorage.getItem('userRole');

  const [dynamicServices] = useState(() => {
    const saved = localStorage.getItem('companyServices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_SERVICES;
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      idVisitor: '',
      service: '',
      userId: '',
      date: new Date().toISOString().split('T')[0],
      heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      motif: ''
    }
  });

  const fetchAgentsByServiceName = useCallback(async (serviceName, targetUserId = null) => {
    if (!serviceName) return;
    setLoadingAgents(true);
    try {
      const token = localStorage.getItem('token');
      const encodedService = encodeURIComponent(serviceName);
      const response = await fetch(`http://localhost:5283/api/User/agents-by-service/${encodedService}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const agents = data?.$values || data || [];
        setServiceAgents(agents);

        if (targetUserId) {
          const targetStr = String(targetUserId);
          setTimeout(() => {
            setValue('userId', targetStr);
          }, 100);
        }
      } else {
        setServiceAgents([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des agents :", error);
      setServiceAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (userRole !== 'Visiteur') {
      visitorService.getAll().then(setVisitors).catch(console.error);
    }
  }, [userRole]);

  // INITIALISATION EN MODE REPROGRAMMATION OU CREATION
  useEffect(() => {
    const initReprogram = async () => {
      if (isReprogramMode && initialData) {
        let visitData = initialData;

        const hasHostId = initialData.userId || initialData.UserId || initialData.idUser || initialData.IdUser || initialData.hostId;
        const visitId = initialData.id || initialData.Id;

        // Si l'hôte est absent de l'objet transmis, interroger le Backend
        if (!hasHostId && visitId) {
          try {
            const token = localStorage.getItem('token');
            let res = await fetch(`http://localhost:5283/api/Visit/${visitId}`, {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            
            if (!res.ok) {
              res = await fetch(`http://localhost:5283/api/Visits/${visitId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
              });
            }

            if (res.ok) {
              const fetched = await res.json();
              if (fetched) visitData = fetched;
            }
          } catch (err) {
            console.error("Erreur de récupération HTTP directe :", err);
          }
        }

        const visitorIdFound = visitData.idVisitor || visitData.IdVisitor || visitData.visitorId || visitData.VisitorId || localStorage.getItem('visitorId');
        
        const rawService = visitData.service ?? visitData.Service;
        const key = normalizeServiceKey(rawService);
        const normalizedService = SERVICE_MAP[key] || SERVICE_MAP[String(rawService)] || String(rawService || dynamicServices[0]);

        const hostIdFound = 
          visitData.userId ?? 
          visitData.UserId ?? 
          visitData.idUser ?? 
          visitData.IdUser ?? 
          visitData.idAgent ?? 
          visitData.IdAgent ?? 
          visitData.hostId ?? 
          visitData.HostId ?? 
          visitData.hoteId ?? 
          visitData.HoteId ?? 
          '';

        reset({
          motif: visitData.motif || visitData.Motif || '',
          service: normalizedService,
          userId: String(hostIdFound),
          heureArriver: (visitData.heureArriver || visitData.HeureArriver || '').substring(0, 5),
          date: (visitData.date || visitData.Date || '').split('T')[0],
          idVisitor: String(visitorIdFound || '')
        });

        fetchAgentsByServiceName(normalizedService, hostIdFound);

        const nomVisitor = visitData.nom_visitor || visitData.Nom_visitor || visitData.nomVisitor;
        const prenomVisitor = visitData.prenom_visitor || visitData.Prenom_visitor || visitData.prenomVisitor || '';
        
        if (nomVisitor) {
          setCurrentVisitorName(`${nomVisitor} ${prenomVisitor}`.trim());
        } else {
          const storedName = localStorage.getItem('userName') || localStorage.getItem('userNom');
          setCurrentVisitorName(storedName || (visitorIdFound ? `Visiteur N° ${visitorIdFound}` : "Visiteur"));
        }
      } else if (selectedFromList) {
        setValue('idVisitor', String(selectedFromList.id));
      } else {
        const defaultService = dynamicServices[0] || '';
        setValue('service', defaultService);
        fetchAgentsByServiceName(defaultService);
      }
    };

    initReprogram();
  }, [isReprogramMode, initialData, selectedFromList, dynamicServices, reset, setValue, fetchAgentsByServiceName]);

  const onSubmit = async (data) => {
    const visitId = initialData?.id || initialData?.Id;
    const serviceId = SERVICE_ID_MAP[data.service] || parseInt(data.service, 10) || 1;

    const payload = {
      Id: Number(visitId),
      Motif: data.motif,
      Service: serviceId,
      UserId: data.userId ? parseInt(data.userId, 10) : null,
      Date: data.date,
      HeureArriver: data.heureArriver.length === 5 ? `${data.heureArriver}:00` : data.heureArriver,
      Statut: isReprogramMode ? 2 : 1,
      IdVisitor: parseInt(data.idVisitor, 10) || 0,
      UpdatedByRole: userRole || "Admin"
    };

    try {
      if (isReprogramMode) {
        await visitService.updateVisit(visitId, payload);
        toast.success("Visite reprogrammée avec succès !");
      } else {
        await visitService.create(payload);
        toast.success("Visite créée !");
      }
      if (userRole === 'Visiteur') navigate('/mon-espace', { replace: true });
      else if (userRole === 'Agent') navigate('/visitors', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Erreur réservation/reprogrammation :", err);

      // ATTRAPAGE ET AFFICHAGE DU MESSAGE BACKEND (Créneau occupé ou visite terminée)
      const serverMessage = 
        err.response?.data?.message || 
        err.response?.data?.Message || 
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message || 
        "Opération impossible : Vérifiez la disponibilité du créneau.";

      toast.error(serverMessage, {
        duration: 6000,
        style: {
          border: '1px solid #FECDD3',
          padding: '12px',
          color: '#9F1239',
          background: '#FFF1F2',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9] font-sans">
      <Toaster position="top-right" />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        
        <div className="bg-slate-900 px-8 pt-8 pb-14 relative overflow-hidden shrink-0">
          <div className="relative z-10 max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-1.5 text-slate-400 hover:text-white mb-3 text-xs font-bold transition-colors bg-slate-800 px-3 py-1.5 rounded-xl w-fit"
              >
                <ArrowLeft size={14} /> Retour
              </button>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {isReprogramMode ? "Reprogrammation de la Visite" : "Nouvelle Demande de Visite"}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Renseignez les informations pour enregistrer le rendez-vous dans le système.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 -mt-6 relative z-20 pb-12 flex-1">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              
              {isReprogramMode && userRole !== 'Visiteur' && (
                <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex gap-3 items-center">
                  <Info className="text-blue-600 shrink-0" size={18} />
                  <p className="text-blue-900 text-xs font-medium leading-relaxed">
                    Cette action reprogrammera la visite et la marquera automatiquement comme <span className="font-bold">Validée</span>.
                  </p>
                </div>
              )}

              {/* VISITEUR CONCERNÉ */}
              <Field label="Visiteur concerné" icon={<User size={14} className="text-blue-600" />} error={errors.idVisitor?.message}>
                {isReprogramMode ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 text-xs">
                    {currentVisitorName || 'Chargement...'}
                  </div>
                ) : userRole !== 'Visiteur' ? (
                  <select 
                    {...register('idVisitor')}
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.idVisitor ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                    }`}
                  >
                    <option value="">-- Sélectionnez un visiteur dans la liste --</option>
                    {visitors.map(v => (
                      <option key={v.id || v.Id} value={String(v.id || v.Id)}>{v.nom || v.Nom} {v.prenom || v.Prenom}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 text-xs">
                    {currentVisitorName || 'Chargement...'}
                  </div>
                )}
              </Field>

              {/* SERVICE DYNAMIQUE & HÔTE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Service à visiter" icon={<Building2 size={14} className="text-blue-600" />} error={errors.service?.message}>
                  <select 
                    {...register('service')} 
                    disabled={isReprogramMode}
                    onChange={(e) => {
                      setValue('service', e.target.value);
                      setValue('userId', '');
                      fetchAgentsByServiceName(e.target.value);
                    }}
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all ${
                      isReprogramMode 
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                        : errors.service 
                          ? 'border-rose-400 bg-rose-50 text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    {dynamicServices.map((srv, idx) => (
                      <option key={idx} value={srv}>{srv}</option>
                    ))}
                  </select>
                </Field>

                {/* SÉLECTEUR DE L'HÔTE */}
                <Field label="Personne à visiter (Hôte)" icon={<UserCheck size={14} className="text-blue-600" />} error={errors.userId?.message}>
                  <select 
                    {...register('userId')} 
                    disabled={isReprogramMode}
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none transition-all ${
                      isReprogramMode 
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <option value="">
                      {loadingAgents ? "Chargement des hôtes..." : "-- Tout le département / Aucun hôte spécifique --"}
                    </option>
                    {serviceAgents.map(agent => {
                      const agentId = String(agent.id ?? agent.Id ?? '');
                      const agentNom = agent.nom ?? agent.Nom ?? '';
                      const agentPrenom = agent.prenom ?? agent.Prenom ?? '';
                      return (
                        <option key={agentId} value={agentId}>
                          {agentPrenom} {agentNom}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              {/* DATE ET HEURE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Date prévue" icon={<Calendar size={14} className="text-blue-600" />} error={errors.date?.message}>
                  <input 
                    {...register('date')} 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                    }`} 
                  />
                </Field>

                <Field label="Heure d'arrivée" icon={<Clock size={14} className="text-blue-600" />} error={errors.heureArriver?.message}>
                  <input 
                    {...register('heureArriver')} 
                    type="time"
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                      errors.heureArriver ? 'border-rose-400 bg-rose-50 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`} 
                  />
                </Field>
              </div>

              {/* MOTIF DE LA VISITE */}
              <Field label="Motif de la visite" icon={<AlignLeft size={14} className="text-blue-600" />} error={errors.motif?.message}>
                <textarea 
                  {...register('motif')}
                  rows="3"
                  placeholder="Ex: Entretien d'embauche, signature de contrat..."
                  readOnly={isReprogramMode}
                  className={`w-full border rounded-2xl p-4 text-xs font-medium resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 ${
                    isReprogramMode 
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                      : errors.motif 
                        ? 'border-rose-400 bg-rose-50 text-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`} 
                />
              </Field>

              {/* BOUTON DE SOUMISSION */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 disabled:opacity-60"
                >
                  <Send size={15} />
                  {isSubmitting ? "Traitement en cours..." : isReprogramMode ? "Confirmer la reprogrammation" : "Enregistrer la demande"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateVisit;