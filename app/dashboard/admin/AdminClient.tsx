'use client'

import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Filter, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Visit, MerchandiserProfile, Store, VisitStatus, AdminReport } from '@/utils/types';
import * as XLSX from 'xlsx';

interface AdminClientProps {
    visits: Visit[];
    merchandisers: MerchandiserProfile[];
    stores: Store[];
}

export function AdminClient({ visits, merchandisers, stores }: AdminClientProps) {
    const [filterName, setFilterName] = useState('Tous');
    const [filterStatus, setFilterStatus] = useState('Tous');

    // Transform Visits into Reports
    const reports: AdminReport[] = visits.map(v => {
        const merch = merchandisers.find(m => m.id === v.merchandiserId);
        // If store is already joined (v.store), use it, otherwise find in stores list
        const store = v.store || stores.find(s => s.id === v.storeId);

        let progress = 0;
        if (v.tasks && v.tasks.length > 0) {
            const completed = v.tasks.filter(t => t.completed).length;
            progress = Math.round((completed / v.tasks.length) * 100);
        } else if (v.status === VisitStatus.COMPLETED) {
            progress = 100;
        }

        let statusLabel = 'À faire';
        if (v.status === VisitStatus.IN_PROGRESS) statusLabel = 'En cours';
        if (v.status === VisitStatus.COMPLETED) statusLabel = 'Terminé';
        if (v.status === VisitStatus.LATE) statusLabel = 'En retard';

        return {
            id: v.id,
            merch: merch?.name || 'Inconnu',
            store: store?.name || 'Inconnu',
            ville: store?.address?.split(',').pop()?.trim() || 'Inconnu',
            dlc: v.dlc || '',
            veille: v.veille || '',
            rupture: v.rupture || 'Non',
            status: statusLabel,
            date: new Date(v.scheduledStart).toLocaleDateString(),
            progress: progress
        };
    });

    const filteredReports = reports.filter(r => {
        const matchName = filterName === 'Tous' || r.merch === filterName;
        const matchStatus = filterStatus === 'Tous' || r.status === filterStatus;
        return matchName && matchStatus;
    });

    const handleExport = () => {
        const dataToExport = filteredReports.map(r => ({
            ID: r.id,
            Merchandiser: r.merch,
            Magasin: r.store,
            Ville: r.ville,
            DLC: r.dlc,
            Veille: r.veille,
            Rupture: r.rupture,
            Statut: r.status,
            Date: r.date,
            Progression: `${r.progress}%`
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rapport_Merch");
        XLSX.writeFile(wb, `Rapport_Merch_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const allMerchs = Array.from(new Set(merchandisers.map(m => m.name)));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports & Administration</h1>
                    <p className="text-gray-500 dark:text-gray-400">Analysez les données terrain et exportez vos rapports.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-500/20"
                >
                    <FileSpreadsheet size={18} /> Exporter Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Merchandiser</label>
                    <select
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-full md:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tous">Tous</option>
                        {allMerchs.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Statut</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full md:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tous">Tous</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                    </select>
                </div>
                <div className="flex-1 text-right text-sm text-gray-500 dark:text-gray-400 pb-2">
                    {filteredReports.length} rapports trouvés
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                                <th className="px-6 py-3 whitespace-nowrap">Merch</th>
                                <th className="px-6 py-3 whitespace-nowrap">Magasin</th>
                                <th className="px-6 py-3 whitespace-nowrap">Ville</th>
                                <th className="px-6 py-3 whitespace-nowrap">Rupture</th>
                                <th className="px-6 py-3 whitespace-nowrap">Statut</th>
                                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                <th className="px-6 py-3 whitespace-nowrap">Progression</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 font-mono text-xs">{String(report.id).slice(0, 6)}...</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{report.merch}</td>
                                    <td className="px-6 py-4">{report.store}</td>
                                    <td className="px-6 py-4">{report.ville}</td>
                                    <td className="px-6 py-4">
                                        {report.rupture === 'Oui' ? (
                                            <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium">
                                                <AlertTriangle size={12} /> Oui
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.status === 'Terminé' ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                <CheckCircle size={14} /> Terminé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                                <Clock size={14} /> En cours
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{report.date}</td>
                                    <td className="px-6 py-4 w-32">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${report.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${report.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1 block text-right">{report.progress}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-400 hover:text-blue-600 transition p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
