'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ChevronLeft, Navigation, Sun, Moon, LogOut } from 'lucide-react';
import { MerchandiserProfile, Visit, VisitStatus } from '@/utils/types';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface MobileHomeProps {
    user: MerchandiserProfile | null;
    visits: Visit[];
}

export function MobileHome({ user, visits }: MobileHomeProps) {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    // Filter visits for today and this user
    const today = new Date().toISOString().split('T')[0];
    const myVisits = visits.filter(v =>
        v.merchandiserId === user?.id &&
        v.scheduledStart.startsWith(today)
    );

    const completedCount = myVisits.filter(v => v.status === VisitStatus.COMPLETED).length;
    const totalCount = myVisits.length;

    // Find next visit (first non-completed)
    const nextVisit = myVisits.find(v => v.status !== VisitStatus.COMPLETED);
    const nextVisitTime = nextVisit
        ? new Date(nextVisit.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-brand-700 dark:bg-brand-900 text-white p-4 flex justify-between items-center shadow-md z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="TradeX Logo" className="h-8 w-auto object-contain" />
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={toggleDarkMode} className="p-1">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} className="p-1" title="Déconnexion">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Welcome Card */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bonjour, {user?.name || 'Merchandiser'}</h2>
                    <p className="text-gray-500 dark:text-gray-400 capitalize">{todayDate}</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{completedCount}/{totalCount}</span>
                        <span className="text-sm text-blue-600 dark:text-blue-300">Visites terminées</span>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-orange-700 dark:text-orange-400">{nextVisitTime}</span>
                        <span className="text-sm text-orange-600 dark:text-orange-300">Prochaine visite</span>
                    </div>
                </div>

                {/* Quick Action: Add Mission */}
                <Link href="/app/add" className="block w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:scale-95 transition">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full text-brand-600 dark:text-brand-400">
                            <Plus size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-800 dark:text-white">Ajouter une mission</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Créer une visite spontanée</p>
                        </div>
                    </div>
                    <ChevronLeft size={20} className="transform rotate-180 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                </Link>

                {/* Route Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                        {/* Fake Map Placeholder */}
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <MapPin className="text-slate-400" size={48} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {nextVisit && (
                                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                                    <Navigation size={16} className="text-blue-600 dark:text-blue-400" />
                                    Vers {nextVisit.store?.name || 'Prochain magasin'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-4">
                        <Link href="/app/visits" className="block w-full text-center bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition">
                            Voir ma tournée
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
