import React from 'react';
import { X, MapPin, Calendar, User, Package, Clock, Camera, AlertTriangle } from 'lucide-react';
import { AdminReport } from '@/utils/types';
import { Visit } from '@/utils/types';

interface VisitDetailsModalProps {
    visit: Visit | null;
    report: AdminReport | null; // We might need both or just one depending on how we structure it. Let's use the full Visit object if possible, or the Report + extra data.
    onClose: () => void;
}

// We'll use the full Visit object for details as it has the raw data (photos, arrays, etc.)
// The AdminReport is a summarized version.
// Let's adjust the props to take the full Visit object.

interface Props {
    visit: Visit;
    onClose: () => void;
}

export function VisitDetailsModal({ visit, onClose }: Props) {
    if (!visit) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Détails de la visite</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><User size={14} /> {visit.merchandiserId}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {visit.store?.name}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(visit.scheduledStart).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Photos Section */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Camera className="text-blue-500" size={20} /> Photos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avant</span>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center relative group">
                                    {visit.photoAvant ? (
                                        <img src={visit.photoAvant} alt="Avant" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-sm">Aucune photo</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Après</span>
                                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center relative group">
                                    {visit.photoApres ? (
                                        <img src={visit.photoApres} alt="Après" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-sm">Aucune photo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Ruptures Section */}
                        <section className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/30">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} /> Ruptures Signalées
                            </h3>
                            {visit.ruptureItems && visit.ruptureItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {visit.ruptureItems.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-red-800 dark:text-red-300 bg-white dark:bg-gray-800 p-2 rounded border border-red-100 dark:border-red-900/30 shadow-sm text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Produit ID: {item} {/* Ideally we'd map this to a name if we had the product list here, but ID is a start */}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucune rupture signalée.</p>
                            )}
                        </section>

                        {/* Relevés Section */}
                        <section className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
                            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                                <Clock size={20} /> Relevés & Infos
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">DLC Courtes</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-900/30 min-h-[60px]">
                                        {visit.dlc || <span className="text-gray-400 italic">Rien à signaler</span>}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Veille Concurrentielle</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-900/30 min-h-[60px]">
                                        {visit.veille || <span className="text-gray-400 italic">Rien à signaler</span>}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
