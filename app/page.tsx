'use client'

import React, { useState, useEffect } from 'react';
import { Zap, Moon, Sun, ArrowRight, CheckCircle, BarChart3, Users, Store, ShieldCheck, Smartphone, Globe, Clock } from 'lucide-react';
import Link from 'next/link';
import LeadFormModal from '@/components/LeadFormModal';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      <LeadFormModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmitSuccess={() => { }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white p-1.5 rounded-lg shadow-lg shadow-red-500/20">
                <Zap size={24} className="fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">TradeX <span className="text-red-600">Insights</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link href="/login" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full font-medium hover:opacity-90 transition shadow-lg shadow-gray-500/20">
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold border border-red-100 dark:border-red-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Nouvelle Version 2.0
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Dominez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Terrain</span> avec Précision.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
            La solution ultime pour les agences de trade marketing. Suivez vos merchandisers, analysez les rayons et boostez vos ventes en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-red-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Commencer l'essai gratuit <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 rounded-full font-bold text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2">
              <Smartphone size={20} /> Télécharger l'App
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> Pas de carte requise</div>
            <div className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> Installation en 2 min</div>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-orange-500/20 rounded-full blur-3xl transform scale-90"></div>
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-2 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500">
            {/* Mockup Image Placeholder - In real app use Next Image */}
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
              <span className="text-lg font-medium">Dashboard Preview</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">GlobalBrands</span>
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">FastRetail</span>
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">AgencyOne</span>
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">SuperMarket</span>
            <span className="text-xl font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">CorpGroup</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Une suite complète d'outils pour gérer vos équipes terrain et optimiser votre présence en magasin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Users className="text-blue-500" />, title: "Gestion d'Équipe", desc: "Suivez vos merchandisers en temps réel. Planning, check-in/out et géolocalisation." },
            { icon: <BarChart3 className="text-purple-500" />, title: "Rapports Intelligents", desc: "Analysez les ruptures, parts de linéaire et prix avec des graphiques interactifs." },
            { icon: <Store className="text-orange-500" />, title: "Audit Magasin", desc: "Relevés précis avec photos avant/après certifiées et horodatées." },
            { icon: <ShieldCheck className="text-green-500" />, title: "Données Sécurisées", desc: "Vos données sont cryptées et sauvegardées automatiquement dans le cloud." },
            { icon: <Globe className="text-cyan-500" />, title: "Mode Hors-Ligne", desc: "L'application mobile fonctionne parfaitement même sans connexion internet." },
            { icon: <Clock className="text-red-500" />, title: "Gain de Temps", desc: "Automatisez les rapports et réduisez le temps administratif de 50%." }
          ].map((feature, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 group">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition">
                {React.cloneElement(feature.icon as any, { size: 24 })}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 dark:bg-gray-800 p-1.5 rounded-lg">
              <Zap size={20} className="fill-gray-500 text-gray-500" />
            </div>
            <span className="font-bold text-gray-500">TradeX Insights</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 TradeX Inc. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
