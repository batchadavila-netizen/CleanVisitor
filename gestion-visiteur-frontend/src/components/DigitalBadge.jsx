import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Calendar, Clock, User, Building2 } from 'lucide-react';

// 🟢 MAPPING UNIVERSEL DES SERVICES POUR UN AFFICHAGE PROPRE
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

const formatServiceLabel = (rawService) => {
  if (!rawService) return 'Accueil';
  const key = String(rawService).trim().toLowerCase();
  return SERVICE_MAP[key] || String(rawService).replace('_', ' ');
};

const DigitalBadge = ({ visit, visitorName }) => {
  if (!visit) return null;

  // 🟢 1. EXTRACTION DE L'HÔTE (Dapper + DTO Formats)
  const nomHost = visit.nom_Host || visit.Nom_Host || visit.nomHost || visit.nom_host || '';
  const prenomHost = visit.prenom_Host || visit.Prenom_Host || visit.prenomHost || visit.prenom_host || '';
  
  let hoteFormatted = `${prenomHost} ${nomHost}`.trim();
  
  // Alternative si l'objet contient directement une propriété "hote" ou "agentAviser"
  if (!hoteFormatted) {
    hoteFormatted = visit.hote || visit.Hote || visit.agentAviser || visit.AgentAviser || visit.hostName || '-- Non spécifié --';
  }

  // 🟢 2. EXTRACTION ET FORMATAGE DU SERVICE
  const rawService = visit.service ?? visit.Service;
  const serviceFormatted = formatServiceLabel(rawService);

  // 🟢 3. AUTRES CHAMPS
  const accessCode = visit.accessCode || visit.AccessCode || `V-${visit.id || visit.Id || '000'}`;
  const dateVal = visit.date || visit.Date;
  const dateFormatted = dateVal ? new Date(dateVal).toLocaleDateString('fr-FR') : 'Aujourd\'hui';
  
  const heureRaw = visit.heureArriver || visit.HeureArriver || '--:--';
  const heureFormatted = heureRaw.length >= 5 ? heureRaw.substring(0, 5) : heureRaw;
  
  const nomVisiteur = visitorName || visit.nom_visitor || visit.Nom_visitor || visit.nom || 'Visiteur';

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-800 relative overflow-hidden font-sans my-2">
      {/* Halo lumineux de fond */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />

      {/* EN-TÊTE DU BADGE */}
      <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Pass Autorisé
            </span>
          </div>
          <h3 className="font-black text-lg text-white mt-0.5 tracking-tight">DAVILA ENTREPRISE</h3>
        </div>
        <div className="bg-blue-600/20 text-blue-400 p-2 rounded-2xl border border-blue-500/30">
          <ShieldCheck size={22} />
        </div>
      </div>

      {/* IDENTITÉ DU VISITEUR */}
      <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-lg text-white shadow-lg shrink-0">
          {nomVisiteur.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visiteur Titulaire</p>
          <h4 className="font-bold text-white text-base truncate">{nomVisiteur}</h4>
        </div>
      </div>

      {/* DÉTAILS DU RENDEZ-VOUS */}
      <div className="space-y-3 mb-6 text-xs font-medium">
        <div className="flex justify-between items-center bg-slate-800/30 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <User size={14} className="text-blue-400" /> Personne visitée :
          </span>
          <span className="font-bold text-white">{hoteFormatted}</span>
        </div>

        <div className="flex justify-between items-center bg-slate-800/30 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Building2 size={14} className="text-blue-400" /> Service :
          </span>
          <span className="font-bold text-slate-200">{serviceFormatted}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <Calendar size={14} className="text-blue-400 shrink-0" />
            <span className="font-bold text-slate-200 truncate">{dateFormatted}</span>
          </div>
          <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <Clock size={14} className="text-blue-400 shrink-0" />
            <span className="font-bold text-slate-200">{heureFormatted}</span>
          </div>
        </div>
      </div>

      {/* BLOC QR CODE & CODE TEXTE */}
      <div className="bg-white text-slate-900 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div>
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Code d'Émargement</p>
          <p className="text-xl font-black text-blue-700 tracking-wider mt-0.5">{accessCode}</p>
          <p className="text-[9px] text-slate-500 font-semibold mt-1">À présenter à l'accueil</p>
        </div>

        <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
          <QRCodeSVG value={accessCode} size={65} />
        </div>
      </div>
    </div>
  );
};

export default DigitalBadge;