import React, { useState } from 'react';
import { visitService } from '../services/visitService';

const CreateVisitModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    idVisitor: '', // Sera probablement un Select si le visiteur existe déjà
    motif: '',
    service: 1, // Direction par défaut
    heureArriver: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      statut: 1, // "En attente" par défaut
      isDeleted: false,
      heureDepart: null // Rempli lors de la sortie
    };

    try {
      await visitService.create(payload);
      onSuccess();
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
        <h2 className="text-xl font-black text-slate-800 mb-6">Enregistrer une visite</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du Visiteur */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">ID Visiteur</label>
            <input 
              type="number" required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, idVisitor: e.target.value})}
            />
          </div>

          {/* Sélection du Service (Enum) */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Service à visiter</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: parseInt(e.target.value)})}
            >
              <option value={1}>Direction</option>
              <option value={2}>Service RH</option>
              <option value={3}>Service Financier</option>
              <option value={4}>Service Informatique</option>
              <option value={5}>Secrétariat</option>
            </select>
          </div>

          {/* Motif */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Motif de la visite</label>
            <textarea 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none h-24"
              onChange={(e) => setFormData({...formData, motif: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVisitModal;