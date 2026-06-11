import React from 'react';
import { Link } from 'react-router-dom'; // <--- TRÈS IMPORTANT

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* 1. BARRE DE NAVIGATION */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
              DE
            </div>
            <span className="text-xl font-bold tracking-tight">
              DAVILA <span className="text-blue-600">ENTREPRISE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600">Fonctionnalités</a>
            <a href="#" className="hover:text-blue-600">Sécurité</a>
            <a href="#" className="hover:text-blue-600">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            {/* BOUTON SE CONNECTER */}
            <Link 
              to="/login" 
              className="font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Se connecter
            </Link>

            {/* BOUTON INSCRIPTION */}
            <Link 
              to="/Inscription" 
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-md"
            >
              Inscription
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. SECTION PRINCIPALE (HERO) */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-950 leading-tight">
            Gérez vos <span className="text-blue-600">visiteurs</span> avec élégance.
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed">
            La solution complète pour **AIGLE INFORMATIQUE**. 
            Sécurisez vos accès, automatisez l'enregistrement et suivez vos flux de visiteurs en temps réel.
          </p>

          <ul className="space-y-3">
            <li className="flex items-center gap-3 font-medium">
              <span className="text-green-500 font-bold">✓</span> Enregistrement en 30 secondes
            </li>
            <li className="flex items-center gap-3 font-medium">
              <span className="text-green-500 font-bold">✓</span> Notification automatique de l'hôte
            </li>
            <li className="flex items-center gap-3 font-medium">
              <span className="text-green-500 font-bold">✓</span> Historique et rapports détaillés
            </li>
          </ul>

          <div className="flex gap-4">
            {/* BOUTON ESSAYER (Redirige vers inscription) */}
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg transition text-center"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>

        {/* VISUEL DROITE */}
        <div className="relative">
          <div className="bg-blue-50 rounded-3xl p-8 relative overflow-hidden border border-blue-100 shadow-inner">
            <div className="bg-white rounded-xl shadow-2xl p-4 min-h-[300px] border border-slate-100">
                <div className="h-4 w-1/3 bg-slate-100 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-12 w-full bg-slate-50 rounded-lg border border-slate-100 flex items-center px-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full mr-3"></div>
                    <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                  </div>
                </div>
            </div>
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg border border-blue-100 animate-bounce">
              <span className="text-sm font-bold text-blue-600">Nouveau visiteur !</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;