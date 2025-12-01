'use client'

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, Search, Filter, MoreVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { MOCK_VISITS, MOCK_MERCHANDISERS, MOCK_STORES } from '@/utils/mockData';
import { VisitStatus } from '@/utils/types';

export default function DispatchingPage() {
    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    // Mock Data
    const visits = MOCK_VISITS;
    const merchandisers = MOCK_MERCHANDISERS;
    const stores = MOCK_STORES;

    const filteredVisits = visits.filter(v => v.scheduledStart.startsWith(filterDate));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatching & Planning</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérez les plannings de vos équipes terrain.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <Filter size={18} /> Filtres
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-500/20">
                        <Plus size={18} /> Nouvelle Visite
                    </button>
                </div>
            </div>

            {/* Calendar / List Toggle & Date Picker */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('LIST')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'LIST' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Liste
                    </button>
                    <button
                        onClick={() => setViewMode('CALENDAR')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'CALENDAR' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Calendrier
                    </button>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <CalendarIcon size={18} className="text-gray-500" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-auto"
                    />
                </div>
            </div>

            {/* Visits List */}
            <div className="grid gap-4">
                {filteredVisits.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune visite prévue</h3>
                        <p className="text-gray-500 dark:text-gray-400">Il n'y a pas de visites programmées pour cette date.</p>
                    </div>
                ) : (
                    filteredVisits.map(visit => {
                        const merch = merchandisers.find(m => m.id === visit.merchandiserId);
                        const store = stores.find(s => s.id === visit.storeId);

                        return (
                            <div key={visit.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${visit.status === VisitStatus.COMPLETED ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                            visit.status === VisitStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                        }`}>
                                        {visit.status === VisitStatus.COMPLETED ? <CheckCircle size={24} /> : <Clock size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{store?.name || 'Magasin Inconnu'}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {store?.address || 'Adresse Inconnue'}</span>
                                            <span className="flex items-center gap-1"><User size={14} /> {merch?.name || 'Non assigné'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {new Date(visit.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${visit.status === VisitStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                visit.status === VisitStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            {visit.status}
                                        </span>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
