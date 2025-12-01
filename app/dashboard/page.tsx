'use client'

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Zap, X, ClipboardCheck, CheckCircle, Clock } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { KPICard } from '@/components/dashboard/KPICard';
import { MOCK_VISITS, MOCK_MERCHANDISERS } from '@/utils/mockData';
import { VisitStatus } from '@/utils/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardPage() {
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    // Use Mock Data for now (will replace with Supabase fetch later)
    const visits = MOCK_VISITS;
    const merchandisers = MOCK_MERCHANDISERS;

    // --- REAL-TIME CALCULATION ---
    const totalMissions = visits.length;
    const completed = visits.filter(v => v.status === VisitStatus.COMPLETED).length;
    const inProgress = visits.filter(v => v.status === VisitStatus.IN_PROGRESS).length;
    const todo = visits.filter(v => v.status === VisitStatus.TODO || v.status === VisitStatus.LATE).length;

    // Execution Rate
    const executionRate = totalMissions > 0 ? Math.round((completed / totalMissions) * 100) : 0;

    // Presence Rate (Started vs Total)
    const started = completed + inProgress;
    const presenceRate = totalMissions > 0 ? Math.round((started / totalMissions) * 100) : 0;

    // Average Visit Time
    let totalDuration = 0;
    let timedVisits = 0;
    visits.forEach(v => {
        if (v.status === VisitStatus.COMPLETED && v.checkInTime && v.checkOutTime) {
            const start = new Date(v.checkInTime).getTime();
            const end = new Date(v.checkOutTime).getTime();
            const durationMins = (end - start) / 60000;
            if (durationMins > 0) {
                totalDuration += durationMins;
                timedVisits++;
            }
        }
    });
    const avgTime = timedVisits > 0 ? Math.round(totalDuration / timedVisits) : 0;

    // Task Completion Rate (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVisits = visits.filter(v => {
        const visitDate = new Date(v.scheduledStart);
        return visitDate >= sevenDaysAgo && visitDate <= new Date();
    });
    let totalTasks7d = 0;
    let completedTasks7d = 0;
    recentVisits.forEach(v => {
        if (v.tasks) {
            totalTasks7d += v.tasks.length;
            completedTasks7d += v.tasks.filter(t => t.completed).length;
        }
    });
    const taskCompletionRate = totalTasks7d > 0
        ? Math.round((completedTasks7d / totalTasks7d) * 100)
        : 0;

    // Dynamic Merchandiser Progress
    const merchProgressData = merchandisers.map(merch => {
        const mVisits = visits.filter(v => v.merchandiserId === merch.id);
        const mTotal = mVisits.length;
        const mDone = mVisits.filter(v => v.status === VisitStatus.COMPLETED).length;
        const mProgress = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
        return {
            name: merch.name,
            progress: mProgress
        };
    }).filter(d => d.name);

    const missionDistributionData = [
        { name: 'Terminées', value: completed, color: '#10b981' },
        { name: 'En cours', value: inProgress, color: '#3b82f6' },
        { name: 'Non commencées', value: todo, color: '#9ca3af' },
    ];

    return (
        <div className="space-y-8 relative animate-fade-in">
            {/* Header Section with AI Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
                    <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble de l'activité terrain.</p>
                </div>
                <button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition hover:scale-105 animate-pulse-slow"
                >
                    <Sparkles size={18} className="fill-white/20" />
                    AI Copilot
                </button>
            </div>

            {/* AI Assistant Panel (Collapsible) */}
            {showAIAssistant && (
                <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl shadow-xl overflow-hidden animate-slide-in">
                    <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 font-bold">
                            <Sparkles size={20} />
                            <span>Analyse Intelligente</span>
                        </div>
                        <button onClick={() => setShowAIAssistant(false)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"><X size={20} /></button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" /> Anomalies Critiques Détectées
                            </h3>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">🚨 Ruptures détectées : {visits.filter(v => v.rupture === 'Oui').length}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Actions recommandées : Vérifier stocks entrepôt ou contacter les chefs de rayon.</p>
                                <div className="mt-3 flex gap-2">
                                    <button className="text-xs bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900 transition">Notifier Logistique</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Zap size={18} className="text-blue-500" /> Performance d'Équipe
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Taux Global : {executionRate}%</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{completed} visites terminées sur {totalMissions}.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Map Widget Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-64 relative group">
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 shadow border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Map
                </div>
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
                    className="w-full h-full object-cover opacity-30 bg-slate-50 dark:bg-slate-900 dark:invert"
                    alt="World Map"
                />
                {/* Fake Pins */}
                <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition duration-300">
                    <div className="relative">
                        <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white text-xs font-bold">A</div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
                    </div>
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Ali (En cours)</div>
                </div>
            </div>

            {/* Volume Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <MetricCard label="Total Missions" value={totalMissions} icon={<ClipboardCheck size={24} className="text-purple-500" />} color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900" />
                <MetricCard label="Terminées" value={completed} icon={<CheckCircle size={24} className="text-green-500" />} color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900" />
                <MetricCard label="En cours" value={inProgress} icon={<Clock size={24} className="text-blue-500" />} color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900" />
                <MetricCard label="Non commencées" value={todo} icon={<AlertTriangle size={24} className="text-gray-400" />} color="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <KPICard title="Taux d'exécution" value={`${executionRate}%`} desc="Efficacité réalisation missions" trend="neutral" />
                <KPICard title="Taux de présence" value={`${presenceRate}%`} desc="Temps terrain vs total" trend="neutral" />
                <KPICard title="Temps moyen visite" value={`${avgTime} min`} desc="Efficacité merchandising" trend="neutral" />
                <KPICard title="Taux Tâches (7j)" value={`${taskCompletionRate}%`} desc="Complétion tâches globale" trend="neutral" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merchandiser Progress Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Progression par Merchandiser</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={merchProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="progress" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20}>
                                    {merchProgressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : entry.progress > 0 ? '#0ea5e9' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Mission Distribution Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Répartition des Missions</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={missionDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {missionDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
