import React, { useState, useEffect, useCallback } from 'react';
import { visitService } from '../services/visitService';
import toast, { Toaster } from 'react-hot-toast';
import { X, Send, User, Calendar, Clock, Building2, AlignLeft, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useServices } from '../hooks/useServices';

const schema = z.object({
  date: z.string().min(1, "La date est obligatoire"),
  heureArriver: z.string().min(1, "L'heure est obligatoire"),
  service: z.string().min(1, "Le service est obligatoire"),
  userId: z.string().optional(),
  motif: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
});

const CreateVisitModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const availableServices = useServices();
  const [serviceAgents, setServiceAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [visitorDisplayName, setVisitorDisplayName] = useState("Visiteur");

  const getResolvedVisitorId = useCallback(() => {
    const vId = localStorage.getItem('visitorId');
    const uId = localStorage.getItem('userId');
    const uJson = localStorage.getItem('user');

    if (vId && vId !== 'undefined' && vId !== 'null') return parseInt(vId, 10);
    if (uId && uId !== 'undefined' && uId !== 'null') return parseInt(uId, 10);
    
    if (uJson) {
      try {
        const parsed = JSON.parse(uJson);
        const candidate = parsed.id || parsed.Id || parsed.visitorId || parsed.VisitorId;
        if (candidate) return parseInt(candidate, 10);
      } catch (e) { console.error(e); }
    }
    return 0;
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setVisitorDisplayName(name);
  }, [isOpen]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      service: availableServices[0]?.id || '1',
      userId: '',
      motif: ''
    }
  });

  const selectedService = watch('service');

  useEffect(() => {
    if (!isOpen || !selectedService) {
      setServiceAgents([]);
      return;
    }

    const fetchAgentsForService = async () => {
      setLoadingAgents(true);
      try {
        const token = localStorage.getItem('token');
        const encodedService = encodeURIComponent(selectedService);

        const response = await fetch(`http://localhost:5283/api/User/agents-by-service/${encodedService}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setServiceAgents(data?.$values || data || []);
        } else {
          setServiceAgents([]);
        }
      } catch (error) {
        console.error("Erreur récupération des agents :", error);
        setServiceAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgentsForService();
  }, [selectedService, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        reset({
          motif: initialData.motif || initialData.Motif || '',
          service: String(initialData.service || initialData.Service || availableServices[0]?.id || '1'),
          userId: String(initialData.userId || initialData.UserId || ''),
          heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
          date: (initialData.date || initialData.Date || '').split('T')[0]
        });
      } else {
        reset({
          motif: '',
          service: availableServices[0]?.id || '1',
          userId: '',
          heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, isEditMode, initialData, reset, availableServices]);

  const onSubmit = async (data) => {
    const finalVisitorId = getResolvedVisitorId();

    if (!finalVisitorId) {
      toast.error("Profil non identifié. Veuillez vous reconnecter.");
      return;
    }

    const serviceId = parseInt(data.service, 10) || 1;
    const parsedUserId = data.userId ? parseInt(data.userId, 10) : null;

    const payload = {
      motif: data.motif,
      idVisitor: finalVisitorId,
      service: serviceId,
      userId: (parsedUserId && !isNaN(parsedUserId)) ? parsedUserId : null,
      heureArriver: data.heureArriver.length === 5 ? `${data.heureArriver}:00` : data.heureArriver,
      date: data.date,
      statut: 1,
      isDeleted: false,
      updatedByRole: localStorage.getItem('userRole') || "Visiteur"
    };

    try {
      if (isEditMode) {
        const visitId = initialData?.id || initialData?.Id;
        await visitService.updateVisit(visitId, payload);
        toast.success("Visite mise à jour !");
      } else {
        await visitService.create(payload);
        toast.success("Demande envoyée avec succès !");
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Erreur API:", err);

      const serverMessage = 
        err.response?.data?.message || 
        err.response?.data?.Message || 
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        err.message || 
        "Échec de l'opération : Le créneau est peut-être déjà occupé.";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 font-sans">
      <Toaster position="top-right" />
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-5 bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {isEditMode ? "Modifier la visite" : "Nouvelle demande de visite"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Renseignez les détails de votre rendez-vous</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-blue-600" /> Identité du demandeur
            </label>
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 font-bold text-xs">
              {visitorDisplayName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600" /> Date
              </label>
              <input
                {...register('date')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.date && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-blue-600" /> Heure
              </label>
              <input
                {...register('heureArriver')}
                type="time"
                className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.heureArriver ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.heureArriver && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.heureArriver.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 size={13} className="text-blue-600" /> Service concerné
            </label>
            <select
              {...register('service')}
              onChange={(e) => {
                setValue('service', e.target.value);
                setValue('userId', '');
              }}
              className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${
                errors.service ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
              }`}
            >
              {availableServices.map((srv) => (
                <option key={srv.id} value={srv.id}>{srv.label}</option>
              ))}
            </select>
            {errors.service && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.service.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserCheck size={13} className="text-blue-600" /> Personne à visiter (Hôte)
            </label>
            <select
              {...register('userId')}
              disabled={loadingAgents}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 font-semibold text-xs outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <option value="">
                {loadingAgents ? "Chargement des hôtes..." : "-- Tout le département / Aucun hôte spécifique --"}
              </option>
              {serviceAgents.map(agent => (
                <option key={agent.id || agent.Id} value={agent.id || agent.Id}>
                  {agent.prenom || agent.Prenom} {agent.nom || agent.Nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={13} className="text-blue-600" /> Motif de la visite
            </label>
            <textarea
              {...register('motif')}
              rows="3"
              placeholder="Ex: Entretien professionnel, livraison, réunion d'affaires..."
              className={`w-full bg-slate-50 border rounded-2xl p-3.5 text-slate-800 font-medium text-xs resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 ${
                errors.motif ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
              }`}
            />
            {errors.motif && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠️ {errors.motif.message}</p>}
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors text-xs"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-blue-200 disabled:opacity-60"
            >
              <Send size={14} />
              {isSubmitting ? "Envoi en cours..." : isEditMode ? "Enregistrer les modifications" : "Confirmer la demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVisitModal;