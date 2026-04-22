import React from 'react';

const DetailVisitModal = ({ visit, onClose, onReschedule }) => {
  // Sécurité : si aucune visite n'est sélectionnée, on n'affiche rien
  if (!visit) return null;

  // Vérifier si la date est passée ou aujourd'hui pour autoriser la reprogrammation
  const canReschedule = new Date(visit.date).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header de la Modal */}
        <div className="bg-indigo-600 p-8 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 hover:rotate-90 transition-transform p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Détails de la Visite</h2>
          <p className="opacity-80 text-xs font-bold mt-1">Référence du ticket : #VIS-{visit.id}</p>
        </div>

        {/* Corps de la Modal */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Date prévue</p>
              <p className="font-bold text-slate-700">
                {new Date(visit.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase">Heure d'arrivée</p>
              <p className="font-bold text-slate-700">{visit.heureArriver || '--:--'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Service à visiter</p>
            <p className="font-bold text-indigo-600">{visit.service || 'Non spécifié'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">Motif de la visite</p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-600 italic">
              "{visit.motif}"
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex flex-col gap-3">
            {/* On ne peut reprogrammer que si la visite n'est pas passée (statut différent de 3 / Terminé) */}
            {canReschedule && visit.statut !== 3 ? (
              <button 
                onClick={() => onReschedule(visit)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                🔄 Reprogrammer la visite
              </button>
            ) : (
              <div className="text-center p-3 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase border border-dashed border-slate-200">
                Reprogrammation non disponible
              </div>
            )}

            <button 
              onClick={onClose}
              className="w-full py-4 text-slate-400 text-[10px] font-black uppercase hover:text-slate-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailVisitModal;