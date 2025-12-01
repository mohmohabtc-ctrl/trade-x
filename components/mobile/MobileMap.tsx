'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Visit } from '@/utils/types';

interface MobileMapProps {
    visits: Visit[];
}

export function MobileMap({ visits }: MobileMapProps) {
    const openMaps = (address: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ma Carte</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Vos points de vente à visiter.</p>
            </div>

            <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {/* Simulated Map */}
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
                    className="w-full h-full object-cover opacity-20 dark:invert dark:opacity-10"
                    alt="Map Background"
                />

                {/* Fake Markers based on index to simulate scatter */}
                <div className="absolute inset-0">
                    {visits.map((visit, i) => (
                        <div
                            key={visit.id}
                            onClick={() => openMaps(visit.store?.address || '')}
                            className="absolute flex flex-col items-center cursor-pointer transform hover:scale-110 transition"
                            style={{ top: `${30 + (i * 15)}%`, left: `${20 + (i * 20)}%` }}
                        >
                            <MapPin size={40} className={`drop-shadow-lg ${visit.status === 'COMPLETED' ? 'text-green-500 fill-green-100' : 'text-brand-600 fill-brand-100'}`} />
                            <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap mt-[-5px] z-10">
                                {visit.store?.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* GPS FAB */}
                <div className="absolute bottom-6 right-6">
                    <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center">
                        <Navigation size={24} />
                    </button>
                </div>
            </div>

            {/* List Overlay */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto pb-20">
                {visits.map(visit => (
                    <div key={visit.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${visit.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                <MapPin size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{visit.store?.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-48">{visit.store?.address}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openMaps(visit.store?.address || '')}
                            className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        >
                            <Navigation size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
