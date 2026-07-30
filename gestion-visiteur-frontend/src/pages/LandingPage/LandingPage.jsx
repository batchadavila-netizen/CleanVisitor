import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* NAVIGATION */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm">DE</div>
            <span className="text-base font-semibold tracking-tight">
              DAVILA <span className="text-blue-600">ENTREPRISE</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Sécurité</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
          {/* <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2">
              Se connecter
            </Link>
            <Link to="/Inscription" className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
              S'inscrire
            </Link>
          </div> */}
        </nav>
      </header>

      {/* HERO */}
      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-1.5 text-xs font-semibold">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Sécurisé et fiable
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
            Gérez vos <span className="text-blue-600">visiteurs</span> avec élégance
          </h1>

          <p className="text-base text-slate-500 leading-relaxed">
            La solution complète pour Davila Entreprise. Sécurisez vos accès, automatisez l'enregistrement et suivez vos flux de visiteurs en temps réel.
          </p>

          <ul className="space-y-3">
            {[
              "Enregistrement en 30 secondes",
              "Notification automatique par email",
              "Historique et rapports détaillés",
              "Validation des visites en temps réel"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 pt-2">
            <Link to="/Inscription" className="bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              Commencer gratuitement →
            </Link>
            <Link to="/login" className="bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              Se connecter
            </Link>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl">
            <img src="https://www.shutterstock.com/image-photo/portrait-smile-black-woman-office-260nw-2744135313.jpg"
                 alt="Accueil professionnel en entreprise"
                 className="w-full h-[420px] object-cover" />
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section id="features" className="bg-slate-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-2">Tout ce dont vous avez besoin</h2>
          <p className="text-sm text-slate-500 text-center mb-10">Une plateforme complète pour gérer vos visiteurs efficacement</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "👥", title: "Gestion des visiteurs", desc: "Enregistrez, suivez et gérez tous vos visiteurs depuis un seul endroit." },
              { icon: "🔔", title: "Notifications temps réel", desc: "Recevez des alertes instantanées par email et dans l'application." },
              { icon: "📊", title: "Statistiques avancées", desc: "Analysez les flux de visiteurs avec des rapports détaillés." },
              { icon: "✅", title: "Validation des visites", desc: "Acceptez, rejetez ou reprogrammez les visites en un clic." },
              { icon: "🔒", title: "Accès sécurisé", desc: "Authentification JWT et gestion des rôles Admin, Agent, Visiteur." },
              { icon: "📧", title: "Emails automatiques", desc: "Envoi automatique d'emails lors de chaque changement de statut." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-lg mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto bg-blue-600 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Prêt à simplifier la gestion de vos visiteurs ?</h2>
            <p className="text-sm text-blue-200">Créez votre compte gratuitement et commencez dès aujourd'hui.</p>
          </div>
          <Link to="/Inscription" className="bg-white text-blue-600 text-sm font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex-shrink-0">
            Créer un compte
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;