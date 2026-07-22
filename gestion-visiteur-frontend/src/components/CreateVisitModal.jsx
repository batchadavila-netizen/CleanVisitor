import React, { useEffect } from 'react';
import { visitService } from '../services/visitService';
import toast, { Toaster } from 'react-hot-toast';
import { X, Send, User, Calendar, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    date: z.string().min(1, "La date est obligatoire"),
    heureArriver: z.string().min(1, "L'heure est obligatoire"),
    service: z.string().min(1, "Le service est obligatoire"),
    motif: z.string().min(3, "Le motif doit contenir au moins 6 caractères"),
});

const Field = ({ label, icon, error, children }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {icon} {label}
        </label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠️</span> {error}
            </p>
        )}
    </div>
);

const CreateVisitModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const storedVisitorId = localStorage.getItem('visitorId');
    const storedVisitorName = localStorage.getItem('userName') || "Visiteur";
    const isEditMode = !!initialData;

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            service: '1',
            motif: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                reset({
                    motif: initialData.motif || initialData.Motif || '',
                    service: String(initialData.service || initialData.Service || 1),
                    heureArriver: (initialData.heureArriver || initialData.HeureArriver || '').substring(0, 5),
                    date: (initialData.date || initialData.Date || '').split('T')[0]
                });
            } else {
                reset({
                    motif: '',
                    service: '1',
                    heureArriver: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [isOpen, isEditMode, initialData, reset]);

    const onSubmit = async (data) => {
        if (!storedVisitorId) {
            toast.error("Profil visiteur non trouvé. Veuillez vous reconnecter.");
            return;
        }
        const fromInitialData = initialData?.idVisitor || initialData?.IdVisitor;
        const resolvedVisitorId = (fromInitialData && fromInitialData !== 0) ? fromInitialData : parseInt(storedVisitorId, 10);

        const payload = {
            motif: data.motif,
            idVisitor: resolvedVisitorId,
            service: parseInt(data.service, 10),
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
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Erreur API:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Échec de l'opération");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <Toaster position="top-right" />
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {isEditMode ? "Modifier la visite" : "Nouvelle demande"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-8 space-y-5 overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <User size={13} className="text-blue-500" /> Identité du demandeur
                        </label>
                        <div className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium text-sm">
                            {storedVisitorName}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Date" icon={<Calendar size={13} className="text-blue-500" />} error={errors.date?.message}>
                            <input
                                {...register('date')}
                                type="date"
                                className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${errors.date ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                            />
                        </Field>

                        <Field label="Heure" icon={<Clock size={13} className="text-blue-500" />} error={errors.heureArriver?.message}>
                            <input
                                {...register('heureArriver')}
                                type="time"
                                className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${errors.heureArriver ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                            />
                        </Field>
                    </div>

                    <Field label="Service concerné" error={errors.service?.message}>
                        <select
                            {...register('service')}
                            className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${errors.service ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                        >
                            <option value="1">Direction</option>
                            <option value="2">Service RH</option>
                            <option value="3">Service Financier</option>
                            <option value="4">Service Informatique</option>
                            <option value="5">Secrétariat</option>
                        </select>
                    </Field>

                    <Field label="Motif" error={errors.motif?.message}>
                        <textarea
                            {...register('motif')}
                            placeholder="Ex: Entretien, réunion..."
                            className={`w-full bg-white border-2 rounded-xl px-4 py-3 h-24 resize-none text-slate-800 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors placeholder:text-slate-400 ${errors.motif ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                        />
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 font-semibold text-slate-500 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all text-sm">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-200 disabled:opacity-60">
                            <Send size={15} />
                            {isSubmitting ? "Chargement..." : isEditMode ? "Modifier" : "Valider"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVisitModal;