'use client'

import React, { useState, useEffect } from 'react';
import { Zap, Moon, Sun, ArrowRight, CheckCircle, BarChart3, Users, Store, ShieldCheck, Smartphone, Globe, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from "next-themes";
import LeadFormModal from '@/components/LeadFormModal';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  if (!mounted) return null;

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
              <Image
                src="/tradex-logo.png"
                alt="TradeX Logo"
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm font-semibold border border-brand-100 dark:border-brand-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Nouvelle Version 2.0
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Dominez le <span className="text-brand-600 dark:text-brand-500">Terrain</span> avec Précision.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
            La solution ultime pour les agences de trade marketing. Suivez vos merchandisers, analysez les rayons et boostez vos ventes en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-[#15398c] hover:bg-[#102a6b] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
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
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/20 to-brand-500/20 rounded-full blur-3xl transform scale-90"></div>
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500">
            <Image
              src="/dashboard-preview.png"
              alt="TradeX Dashboard Preview"
              width={800}
              height={450}
              className="w-full h-auto object-cover"
            />
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
            { icon: <Clock className="text-brand-500" />, title: "Gain de Temps", desc: "Automatisez les rapports et réduisez le temps administratif de 50%." }
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
            <Image
              src="/tradex-logo.png"
              alt="TradeX Logo"
              width={100}
              height={32}
              className="h-8 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
            />
          </div>
          <div className="text-sm text-gray-500">
            © 2024 TradeX Inc. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
