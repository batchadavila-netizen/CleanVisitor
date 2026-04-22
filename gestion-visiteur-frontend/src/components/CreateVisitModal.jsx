import React, { useState, useEffect } from 'react';
import { visitService } from '../services/visitService';

const CreateVisitModal = ({ onClose, onSuccess, initialData }) => {
  // --- ÉTAT DU FORMULAIRE ---
  const [formData, setFormData] = useState({
    idVisitor: '', 
    motif: '',
    service: 1, 
    heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
    date: new Date().toISOString().split('T')[0]
  });

  // --- PRÉ-REMPLISSAGE ---
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        idVisitor: initialData.id || initialData.idVisitor || '', 
        motif: initialData.motif || '' 
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Vérification de sécurité avant envoi
      if (!formData.idVisitor) {
          alert("Veuillez sélectionner un visiteur");
          return;
      }
  
      const payload = {
          motif: formData.motif,
          idVisitor: Number(formData.idVisitor), // Forcer le nombre
          service: Number(formData.service),     // Forcer le nombre
          heureArriver: formData.heureArriver,
          date: formData.date, // Vérifie si ton backend veut "2026-04-18"
          statut: 1,
          isDeleted: false,
          heureArriver: formData.heureArriver.length === 5 
                    ? `${formData.heureArriver}:00` 
                    : formData.heureArriver,
      };
  
      console.log("Données envoyées :", payload); // Regarde ceci dans la console
  
      try {
          await visitService.create(payload);
          alert("Succès !");
      } catch (err) {
          // Affiche l'erreur détaillée du backend si possible
          console.error("Détails de l'erreur 400:", err.response?.data);
          alert("Erreur 400 : Regarde la console pour les détails");
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            {initialData ? `Visite : ${initialData.nom} ${initialData.prenom || ''}` : "Nouvelle Visite"}
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Enregistrement manuel par l'agent
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ID Visiteur - Masqué si on a déjà l'info via initialData */}
          {!initialData && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ID Visiteur</label>
              <input 
                type="number" 
                required
                value={formData.idVisitor}
                placeholder="Entrez l'identifiant"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-2 ring-blue-500/20 outline-none transition-all font-bold text-slate-700"
                onChange={(e) => setFormData({...formData, idVisitor: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-600 focus:ring-2 ring-blue-500/20"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Heure d'arrivée</label>
                <input 
                  type="time"
                  value={formData.heureArriver}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-600 focus:ring-2 ring-blue-500/20"
                  onChange={(e) => setFormData({...formData, heureArriver: e.target.value})}
                />
             </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Service à visiter</label>
            <select 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 ring-blue-500/20"
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
            >
              <option value={1}>Direction</option>
              <option value={2}>Service RH</option>
              <option value={3}>Service Financier</option>
              <option value={4}>Service Informatique</option>
              <option value={5}>Secrétariat</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motif de la visite</label>
            <textarea 
              required
              placeholder="Ex: Entretien professionnel..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none h-28 resize-none font-medium text-slate-600 focus:ring-2 ring-blue-500/20 transition-all"
              value={formData.motif}
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all"
            >
              ANNULER
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              ENREGISTRER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVisitModal;