/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Smartphone,
  BarChart3,
  MapPin,
  Zap,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Play,
  Briefcase,
  Globe,
  Users,
  Layers,
  FileText,
  CreditCard,
  Mail,
  ChevronDown,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Star,
  Building2,
  TrendingUp,
  Layout
} from 'lucide-react';

import LeadFormModal from './LeadFormModal';

interface LandingPageProps {
  onEnterApp: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('General');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleOpenLeadForm = (plan: string = 'General') => {
    setSelectedPlan(plan);
    setShowLeadForm(true);
  };

  const handleLeadSubmitSuccess = () => {
    setShowLeadForm(false);
    onEnterApp();
  };

  const faqs = [
    { question: "L'application fonctionne-t-elle sans internet ?", answer: "Oui, absolument. L'application mobile est 'Offline-First'. Vos merchandisers peuvent travailler en sous-sol ou zone blanche, les données se synchronisent automatiquement dès que le réseau revient." },
    { question: "Puis-je gérer plusieurs clients avec un seul compte ?", answer: "Oui, la version 'Business' et 'Entreprise' permet de créer des espaces distincts par client ou par projet, idéal pour les agences d'externalisation commerciale." },
    { question: "Les photos sont-elles géolocalisées ?", answer: "Oui, chaque photo et chaque rapport est horodaté et géolocalisé. Nous empêchons également l'import de photos depuis la galerie pour garantir que la visite a bien eu lieu sur place." },
    { question: "Proposez-vous une formation ?", answer: "L'outil est conçu pour être pris en main en 5 minutes. Cependant, nous offrons une session d'onboarding personnalisée pour les plans Business et Entreprise." }
  ];

  return (
    <div className="font-sans text-slate-800 dark:text-slate-100 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <img src="/logo.png" alt="TradeX Insights" className="h-10 w-auto" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition">Fonctionnalités</a>
              <a href="#agencies" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition">Pour Agences</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-white transition">Tarifs</a>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Basculer le thème"
              >
                {darkMode ? <Zap size={18} className="text-yellow-400 fill-yellow-400" /> : <Zap size={18} className="text-gray-600" />}
              </button>

              <button
                onClick={onEnterApp}
                className="text-sm font-bold text-gray-700 dark:text-white hover:text-brand-600 transition"
              >
                Connexion
              </button>
              <button
                onClick={() => handleOpenLeadForm('General')}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-bold text-sm transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Essai Gratuit
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 dark:text-gray-400"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 absolute w-full shadow-2xl animate-fade-in-down">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Fonctionnalités</a>
              <a href="#agencies" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Pour Agences</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-4 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Tarifs</a>
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                <button
                  onClick={() => { onEnterApp(); setMobileMenuOpen(false); }}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-bold"
                >
                  Connexion
                </button>
                <button
                  onClick={() => { handleOpenLeadForm('General'); setMobileMenuOpen(false); }}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30"
                >
                  Démarrer l'essai gratuit
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-[120px] opacity-20 dark:opacity-30 w-[600px] h-[600px] bg-brand-500 rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-[120px] opacity-20 dark:opacity-30 w-[600px] h-[600px] bg-purple-500 rounded-full animate-pulse-slow delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 animate-fade-in-up hover:scale-105 transition cursor-default">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Nouvelle version 2.0 disponible
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.1] animate-fade-in-up delay-100">
            L'excellence opérationnelle <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-red-500 to-purple-600">en Temps Réel</span>
          </h1>

          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed animate-fade-in-up delay-200">
            La plateforme tout-en-un pour les <strong>Agences</strong> et les <strong>Marques</strong>.
            Pilotez vos équipes, analysez vos rayons et générez des rapports parfaits en un clic.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto animate-fade-in-up delay-300">
            <button
              onClick={() => handleOpenLeadForm('Hero CTA')}
              className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold text-lg shadow-xl shadow-gray-900/20 dark:shadow-white/10 hover:shadow-2xl hover:-translate-y-1 transition duration-200 flex items-center justify-center gap-2 group"
            >
              Essai Gratuit 7 jours <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </button>
            <button
              onClick={() => handleOpenLeadForm('Demo Request')}
              className="px-8 py-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 flex items-center justify-center gap-2"
            >
              <Play size={20} className="fill-current" /> Démo Live
            </button>
          </div>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center gap-6 sm:gap-12 animate-fade-in-up delay-400">
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Pas de carte requise</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Mise en place en 5 min</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> Support 7j/7</span>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 w-full max-w-6xl mx-auto relative group perspective-1000 animate-fade-in-up delay-500">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-purple-500 to-red-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            {/* Main Image Container */}
            <div className="relative rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl bg-gray-900 transform transition-transform duration-700 group-hover:rotate-x-2">
              <div className="absolute top-0 w-full h-8 bg-gray-800/50 backdrop-blur flex items-center px-4 gap-2 border-b border-white/10 z-10">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-4 px-3 py-1 bg-black/20 rounded-md text-xs text-gray-400 font-mono">app.tradex-insights.com/dashboard</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                alt="Dashboard Preview"
                className="w-full h-auto opacity-90 pt-8"
              />

              {/* Floating Elements */}
              <div className="absolute top-1/4 right-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transform translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition duration-500 delay-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Performance</p>
                    <p className="font-bold text-gray-900 dark:text-white">+24% vs N-1</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 left-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transform -translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition duration-500 delay-200">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Équipe Terrain</p>
                    <p className="font-bold text-gray-900 dark:text-white">12 Actifs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* --- AGENCIES VS BRANDS --- */}
      <section id="agencies" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brand-600 dark:text-brand-400 font-bold tracking-wide uppercase text-sm mb-3">Une solution, deux usages</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white">Adapté à votre structure</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Card Agence */}
            <div className="group relative bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 lg:p-12 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900 transition duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                <Briefcase size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Agences</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Gérez plusieurs clients simultanément avec une <strong>isolation stricte</strong> des données. Offrez à vos clients une transparence totale avec des accès "Guest" et des rapports en marque blanche.
                </p>
                <ul className="space-y-3 mb-8">
                  <CheckItem text="Multi-Clients & Multi-Projets" />
                  <CheckItem text="Rapports Marque Blanche" />
                  <CheckItem text="Accès Guest pour vos clients" />
                </ul>
                <button onClick={() => handleOpenLeadForm('Agency Offer')} className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition">Découvrir l'offre Agence <ArrowRight size={18} /></button>
              </div>
            </div>

            {/* Card Marque */}
            <div className="group relative bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 lg:p-12 border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-900 transition duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                <Building2 size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                  <Building2 size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pour les Marques</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Reprenez le contrôle de votre distribution. Assurez-vous que vos plansogrammes sont respectés et que vos promotions sont bien en place dans chaque point de vente.
                </p>
                <ul className="space-y-3 mb-8">
                  <CheckItem text="Contrôle Planogramme" />
                  <CheckItem text="Relevé de Prix & Veille" />
                  <CheckItem text="Analyse de Part de Linéaire" />
                </ul>
                <button onClick={() => handleOpenLeadForm('Brand Offer')} className="text-purple-600 font-bold flex items-center gap-2 hover:gap-3 transition">Découvrir l'offre Marque <ArrowRight size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Tout pour le terrain</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Une suite d'outils complète conçue pour maximiser la productivité de vos équipes mobiles.
              </p>
            </div>
            <button onClick={() => handleOpenLeadForm('Features Section')} className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
              Voir toutes les fonctionnalités
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem
              icon={<Smartphone />}
              title="App Mobile Offline"
              desc="Fonctionne même sans réseau. Synchronisation auto dès le retour de la connexion."
              color="blue"
            />
            <FeatureItem
              icon={<MapPin />}
              title="Géolocalisation GPS"
              desc="Check-in/out obligatoire pour valider la présence réelle en magasin."
              color="green"
            />
            <FeatureItem
              icon={<ShieldCheck />}
              title="Photos Anti-Fraude"
              desc="Interdiction d'upload galerie. Photos prises en direct uniquement."
              color="red"
            />
            <FeatureItem
              icon={<Layout />}
              title="Rapports Structurés"
              desc="Questionnaires optimisés pour la rapidité : Prix, Facings, Ruptures, PLV."
              color="purple"
            />
            <FeatureItem
              icon={<Briefcase />}
              title="Gestion de Stock"
              desc="Suivi des stocks théoriques vs réels et commandes suggérées."
              color="orange"
            />
            <FeatureItem
              icon={<BarChart3 />}
              title="Business Intelligence"
              desc="Dashboards dynamiques et courbes de tendances par enseigne."
              color="indigo"
            />
            <FeatureItem
              icon={<Zap />}
              title="Analyse Ruptures"
              desc="Détection automatique des ruptures et suggestions d'actions correctives."
              color="pink"
            />
            <FeatureItem
              icon={<Users />}
              title="Gestion d'Équipe"
              desc="Vue centralisée de vos merchandisers, plannings et performances."
              color="teal"
            />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Des tarifs transparents</h2>
            <p className="text-gray-600 dark:text-gray-400">Pas de frais cachés. Changez de plan à tout moment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* STARTER */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Starter</h3>
              <p className="text-sm text-gray-500 mb-6">Pour démarrer.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">1.900 DA</span>
                <span className="text-gray-500"> /JOURS /agent</span>
              </div>
              <button onClick={() => handleOpenLeadForm('Starter')} className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold mb-8 hover:bg-gray-200 transition">Commencer</button>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <CheckItem text="Jusqu'à 5 utilisateurs" />
                <CheckItem text="Application Mobile" />
                <CheckItem text="Rapports PDF simples" />
                <CheckItem text="Support Email" />
              </ul>
            </div>

            {/* PRO (Highlighted) */}
            <div className="bg-gray-900 dark:bg-white rounded-3xl p-8 shadow-2xl flex flex-col transform md:scale-110 relative z-10">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-500 to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl">POPULAIRE</div>
              <h3 className="text-xl font-bold text-white dark:text-gray-900">Business</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Pour les pros.</p>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-white dark:text-gray-900">2.500 DA</span>
                <span className="text-gray-400 dark:text-gray-500"> /JOURS /agent</span>
              </div>
              <button onClick={() => handleOpenLeadForm('Business')} className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold mb-8 hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">Essayer Gratuitement</button>
              <ul className="space-y-4 text-sm text-gray-300 dark:text-gray-600 flex-1">
                <CheckItem text="Utilisateurs illimités" />
                <CheckItem text="Tableau de bord Avancé" />
                <CheckItem text="Export Excel & API" />
                <CheckItem text="Support Prioritaire" />
                <CheckItem text="Accès Client (Guest)" />
              </ul>
            </div>

            {/* ENTERPRISE */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Entreprise</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les grands comptes.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">Sur Mesure</span>
              </div>
              <button onClick={() => handleOpenLeadForm('Enterprise')} className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold mb-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Contacter Ventes</button>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300 flex-1">
                <CheckItem text="Tout du pack Business" />
                <CheckItem text="Marque Blanche (Logo/URL)" />
                <CheckItem text="Intégration ERP (SAP, Sage)" />
                <CheckItem text="SLA & Chef de projet dédié" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Questions Fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <span className="font-bold text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown className={`transform transition-transform duration-300 text-gray-400 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 text-gray-600 dark:text-gray-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-950"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à transformer votre exécution terrain ?</h2>
          <p className="text-xl text-gray-400 mb-10">Rejoignez TradeX Insights au quotidien. Better Insights. Better Trade.</p>
          <button
            onClick={() => handleOpenLeadForm('Bottom CTA')}
            className="px-10 py-5 bg-white text-brand-900 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition duration-200"
          >
            Commencer maintenant
          </button>
          <p className="mt-6 text-sm text-gray-500">Aucune carte de crédit requise • Annulation à tout moment</p>
        </div>
      </section>

      {/* --- DOWNLOAD SECTION --- */}
      <section id="download" className="py-20 bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Téléchargez l'application mobile</h2>
          <p className="text-xl text-brand-100 mb-12 max-w-2xl mx-auto">
            Disponible pour Android et iOS. Installez l'application pour vos merchandisers et commencez à remonter des données terrain dès aujourd'hui.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            {/* Android APK */}
            <a
              href="/app-release.apk"
              download
              className="flex items-center gap-4 bg-white text-brand-900 px-8 py-4 rounded-2xl hover:bg-gray-50 transition shadow-lg group"
            >
              <Smartphone size={32} className="text-green-600" />
              <div className="text-left">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Android</div>
                <div className="text-lg font-bold">Télécharger l'APK</div>
              </div>
            </a>

            {/* iOS PWA */}
            <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl">
              <Smartphone size={32} className="text-white" />
              <div className="text-left">
                <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">iOS (iPhone)</div>
                <div className="text-lg font-bold">Ajouter à l'écran d'accueil</div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-brand-200">
            * Pour iOS : Ouvrez ce site dans Safari, touchez le bouton "Partager" <span className="inline-block px-2 py-1 bg-white/20 rounded mx-1">⎋</span> puis "Sur l'écran d'accueil".
          </p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white dark:bg-gray-950 pt-16 pb-8 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="TradeX Insights" className="h-8 w-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                La solution de référence pour le merchandising terrain et la veille concurrentielle en Algérie et en Afrique.
              </p>
              <div className="flex gap-4">
                <SocialIcon Icon={Facebook} />
                <SocialIcon Icon={Twitter} />
                <SocialIcon Icon={Linkedin} />
                <SocialIcon Icon={Instagram} />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6">Produit</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-brand-600 transition">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Tarifs</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Témoignages</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6">Entreprise</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-brand-600 transition">À propos</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Carrières</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Blog</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-6">Légal</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-brand-600 transition">Confidentialité</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">CGU</a></li>
                <li><a href="#" className="hover:text-brand-600 transition">Sécurité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 TradeX Insights. Tous droits réservés.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-brand-600">Privacy Policy</a>
              <a href="#" className="hover:text-brand-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}
      <LeadFormModal
        isOpen={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        onSubmitSuccess={handleLeadSubmitSuccess}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

// --- Sub Components ---

const FeatureItem = ({ icon, title, desc, color = "blue" }: { icon: any, title: string, desc: string, color?: string }) => {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
  };

  return (
    <div className="flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-900 transition duration-300 group">
      <div className={`mb-4 p-3 rounded-xl transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

const CheckItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
    </div>
    <span className="text-inherit">{text}</span>
  </li>
);

const SocialIcon = ({ Icon }: { Icon: any }) => (
  <a href="#" className="bg-gray-100 dark:bg-gray-900 p-2.5 rounded-full hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition text-gray-500 dark:text-gray-400">
    <Icon size={18} />
  </a>
);

export default LandingPage;