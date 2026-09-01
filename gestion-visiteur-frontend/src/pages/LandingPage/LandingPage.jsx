import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { 
  ArrowRight, 
  Users, 
  Bell, 
  BarChart3, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem('companyName') || 'DAVILA ENTREPRISE'
  );

  // 🟢 Redirection automatique si la session est active
  useEffect(() => {
    const localRole = localStorage.getItem('userRole');
    if (isSignedIn || localRole) {
      navigate('/mon-espace', { replace: true });
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    const handleConfigChange = () => {
      const updatedName = localStorage.getItem('companyName') || 'DAVILA ENTREPRISE';
      setCompanyName(updatedName);
    };

    window.addEventListener('configUpdated', handleConfigChange);
    return () => window.removeEventListener('configUpdated', handleConfigChange);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'DE';
    const words = name.trim().split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* NAVIGATION */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">
              {getInitials(companyName)}
            </div>
            <span className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {companyName}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-blue-400 transition-colors">Fonctionnalités</a>
            <a href="#security" className="hover:text-blue-400 transition-colors">Sécurité</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <SignedOut>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Se connecter
              </Link>

              <Link 
                to="/Inscription" 
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30"
              >
                Créer un compte
              </Link>
            </SignedOut>

            <SignedIn>
              <Link 
                to="/mon-espace" 
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                <LayoutDashboard size={14} />
                Mon Espace
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={14} className="text-blue-400" />
            Solution de gestion des visites nouvelle génération
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Gérez vos <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">visiteurs</span> avec élégance & sécurité
          </h1>

          <p className="text-base text-slate-400 leading-relaxed">
            La plateforme intelligente pour <strong className="text-slate-200">{companyName}</strong>. Sécurisez vos accès, automatisez l'enregistrement et suivez le flux de vos visiteurs en temps réel.
          </p>

          <ul className="space-y-3.5">
            {[
              "Connexion ultra-rapide avec Google ou Email",
              "Enregistrement des visites en moins de 30 secondes",
              "Notification instantanée et confirmation automatique",
              "Validation et créneaux horaires sécurisés de 2h"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  ✓
                </div>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4 pt-2">
            <SignedOut>
              <Link 
                to="/Inscription" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-7 py-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-600/25 flex items-center gap-2 group"
              >
                Commencer immédiatement
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/login" 
                className="bg-slate-800 text-slate-200 text-sm font-semibold px-7 py-4 rounded-xl border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
              >
                Se connecter
              </Link>
            </SignedOut>

            <SignedIn>
              <Link 
                to="/mon-espace" 
                className="bg-blue-600 text-white text-sm font-bold px-8 py-4 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                Accéder à mon tableau de bord
                <ArrowRight size={16} />
              </Link>
            </SignedIn>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-30"></div>
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
              alt="Accueil professionnel moderne"
              className="w-full h-[450px] object-cover opacity-90 hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Système d'accès actif</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-1 rounded">SSL 256-bit</span>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section id="features" className="bg-slate-950 py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Une suite complète pour votre accueil</h2>
            <p className="text-sm text-slate-400">Tout ce dont vous avez besoin pour moderniser l'expérience de vos visiteurs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Gestion des visiteurs", desc: "Enregistrez, suivez et gérez tous vos visiteurs depuis un tableau de bord unique." },
              { icon: Bell, title: "Notifications instantanées", desc: "Avertissez vos agents et hôtes automatiquement lors de chaque arrivée." },
              { icon: BarChart3, title: "Statistiques & Flux", desc: "Analysez les pics de visites avec des rapports visuels clairs." },
              { icon: CheckCircle2, title: "Validation des créneaux", desc: "Garantissez la disponibilité des créneaux de 2 heures sans chevauchement." },
              { icon: Lock, title: "Authentification Clerk", desc: "Connexion sécurisée par Google et Email avec gestion avancée des rôles." },
              { icon: Mail, title: "Emails automatiques", desc: "Confirmation et pass de visite envoyés directement par email." },
            ].map((f, i) => {
              const IconComp = f.icon;
              return (
                <div key={i} className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 p-6 rounded-2xl transition-all group">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <IconComp size={22} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;