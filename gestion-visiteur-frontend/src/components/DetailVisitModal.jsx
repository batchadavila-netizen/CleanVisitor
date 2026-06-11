import React from 'react';
import { Calendar, Clock, Tag, FileText, X, RefreshCcw, AlertCircle } from 'lucide-react';

const DetailVisitModal = ({ visit, onClose, onReschedule }) => {
  if (!visit) return null;

  // Statut initial
  const s = visit.statut || visit.Statut;

  // Calcul de la date/heure de la visite
  const visitDateTime = new Date(`${visit.date}T${visit.heureArriver || visit.HeureArriver || "00:00"}`);
  const now = new Date();

  // 🔥 Règles dynamiques
  let statutEffectif = s;
  if (visitDateTime < now) {
    if (s === 2 || s === "Accepter") {
      statutEffectif = 3; // Terminé
    } else if (s === 1 || s === "En attente") {
      statutEffectif = 4; // Rejeté
    }
  }

  // Définition des états selon le statut effectif
  const isAcceptee = statutEffectif === 2 || statutEffectif === "Accepter";
  const isTerminee = statutEffectif === 3 || statutEffectif === "Terminé" || statutEffectif === "Terminee";
  const isRejetee = statutEffectif === 4 || statutEffectif === "Annulé" || statutEffectif === "Rejeter";

  // Règle : Autorisé si Accepté ou Rejeté, mais JAMAIS si déjà terminé
  // Remplace ta ligne 33 par celle-ci :
const canReschedule = [1, 2, 4, "En attente", "Accepter", "Annulé"].includes(statutEffectif);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header dynamique selon le statut */}
        <div className={`p-8 text-white relative ${isRejetee ? 'bg-red-500' : isTerminee ? 'bg-green-600' : 'bg-indigo-600'}`}>
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
             <h2 className="text-xl font-black uppercase tracking-tighter">
                {isRejetee ? 'Visite Rejetée' : isTerminee ? 'Visite Terminée' : 'Détails de la Visite'}
             </h2>
          </div>
          <p className="opacity-80 text-[10px] font-black uppercase tracking-widest">Référence : #VIS-{visit.id}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Alerte si rejetée */}
          {isRejetee && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <p>Cette demande a été refusée. Vous pouvez la reprogrammer pour proposer un nouveau créneau.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Date</p>
              <p className="font-bold text-slate-700">{new Date(visit.date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Heure</p>
              <p className="font-bold text-slate-700">{visit.heureArriver || visit.HeureArriver || '--:--'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Service</p>
            <p className="font-bold text-indigo-600">{visit.service || 'Non spécifié'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">Motif</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 italic">
              "{visit.motif}"
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {canReschedule ? (
              <button 
                onClick={() => onReschedule(visit)} 
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-white ${
                  isRejetee ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                <RefreshCcw size={18} /> Reprogrammer maintenant
              </button>
            ) : (
              <div className="text-center p-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase border border-dashed border-slate-200">
                {isTerminee ? "✅ Visite terminée" : isRejetee ? "❌ Visite rejetée" : "⏳ En attente de décision"}
              </div>
            )}

            <button onClick={onClose} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailVisitModal;