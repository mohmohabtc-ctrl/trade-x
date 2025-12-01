'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Timer, CheckCircle, ChevronRight } from 'lucide-react';
import { Visit, VisitStatus } from '@/utils/types';

interface VisitListProps {
    visits: Visit[];
}

export function VisitList({ visits }: VisitListProps) {

    const formatTime = (isoDate?: string) => {
        if (!isoDate) return "--:--";
        return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const durationMins = Math.round((endTime - startTime) / 60000);
        return durationMins;
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ma Tournée</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{visits.length} visites</span>
            </div>

            {visits.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <div className="mb-4 bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <MapPin className="text-gray-400" size={32} />
                    </div>
                    <p>Aucune visite prévue pour aujourd'hui.</p>
                </div>
            )}

            <div className="space-y-4 pb-20">
                {visits.map((visit) => {
                    const city = visit.store?.address?.split(',').pop()?.trim() || "Ville inconnue";
                    const duration = calculateDuration(visit.checkInTime, visit.checkOutTime);

                    return (
                        <Link
                            href={`/app/visit/${visit.id}`}
                            key={visit.id}
                            className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden active:scale-[0.98] transition-transform"
                        >
                            {/* Header: Store & Status */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-brand-600 dark:text-brand-400">#{visit.id.slice(0, 4)}</span>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{visit.store?.name || 'Magasin'}</h3>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mt-1">
                                        <MapPin size={14} />
                                        <span className="truncate max-w-[200px]">{city}</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-400" size={20} />
                            </div>

                            {/* Time Info */}
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs">
                                {visit.status === VisitStatus.TODO && (
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock size={14} /> Prévu: {formatTime(visit.scheduledStart)}
                                    </span>
                                )}
                                {visit.status === VisitStatus.IN_PROGRESS && (
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                        <Timer size={14} /> En cours depuis {formatTime(visit.checkInTime)}
                                    </span>
                                )}
                                {visit.status === VisitStatus.COMPLETED && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                            <CheckCircle size={14} className="text-green-500" /> Terminé
                                        </span>
                                        {duration !== null && (
                                            <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <Timer size={10} /> {duration} min
                                            </span>
                                        )}
                                    </div>
                                )}

                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${visit.status === VisitStatus.COMPLETED ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        visit.status === VisitStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {visit.status === VisitStatus.TODO ? 'A FAIRE' :
                                        visit.status === VisitStatus.IN_PROGRESS ? 'EN COURS' : 'TERMINÉ'}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
