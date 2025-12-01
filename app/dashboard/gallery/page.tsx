'use client'

import React, { useState } from 'react';
import { Image as ImageIcon, Download, Filter, MapPin, Calendar, User } from 'lucide-react';
import { MOCK_VISITS, MOCK_MERCHANDISERS, MOCK_STORES } from '@/utils/mockData';
import { PhotoItem } from '@/utils/types';
import JSZip from 'jszip';

export default function GalleryPage() {
    const [filterStore, setFilterStore] = useState('Tous');
    const [filterAnomaly, setFilterAnomaly] = useState('Tous');
    const [downloading, setDownloading] = useState(false);

    // Mock Data
    const visits = MOCK_VISITS;
    const merchandisers = MOCK_MERCHANDISERS;
    const stores = MOCK_STORES;

    // Generate Photo List
    const realPhotos: PhotoItem[] = [];
    visits.forEach(v => {
        const merchName = merchandisers.find(m => m.id === v.merchandiserId)?.name || 'Inconnu';
        const storeName = stores.find(s => s.id === v.storeId)?.name || 'Inconnu';
        const dateStr = new Date(v.scheduledStart).toLocaleDateString();

        if (v.photoAvant) {
            realPhotos.push({
                id: `${v.id}-avant`,
                url: v.photoAvant,
                merch: merchName,
                store: storeName,
                date: dateStr,
                anomalyType: 'Avant',
                comment: 'Photo AVANT'
            });
        }
        if (v.photoApres) {
            realPhotos.push({
                id: `${v.id}-apres`,
                url: v.photoApres,
                merch: merchName,
                store: storeName,
                date: dateStr,
                anomalyType: 'Après',
                comment: 'Photo APRÈS'
            });
        }
    });

    const filteredPhotos = realPhotos.filter(p => {
        const matchStore = filterStore === 'Tous' || p.store === filterStore;
        const matchAnomaly = filterAnomaly === 'Tous' ||
            (filterAnomaly === 'Avant/Après' && (p.anomalyType === 'Avant' || p.anomalyType === 'Après')) ||
            p.anomalyType === filterAnomaly;
        return matchStore && matchAnomaly;
    });

    const handleDownloadAll = async () => {
        setDownloading(true);
        const zip = new JSZip();
        const folder = zip.folder("TradeX_Photos");

        // Simulate downloading images (in real app, fetch blobs)
        // For mock data (placeholders), we can't really download them as blobs easily without CORS issues
        // So we'll just create text files as placeholders for this demo
        filteredPhotos.forEach(photo => {
            folder?.file(`${photo.store}_${photo.anomalyType}_${photo.id}.txt`, `Image URL: ${photo.url}\nComment: ${photo.comment}`);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `TradeX_Photos_${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        setDownloading(false);
    };

    const allStores = Array.from(new Set(realPhotos.map(p => p.store)));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Galerie Photos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Preuves de passage et audits visuels.</p>
                </div>
                <button
                    onClick={handleDownloadAll}
                    disabled={downloading || filteredPhotos.length === 0}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                        <Download size={18} />
                    )}
                    {downloading ? 'Téléchargement...' : 'Tout Télécharger (.zip)'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Magasin</label>
                    <select
                        value={filterStore}
                        onChange={(e) => setFilterStore(e.target.value)}
                        className="w-full md:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tous">Tous</option>
                        {allStores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="w-full md:w-auto">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <select
                        value={filterAnomaly}
                        onChange={(e) => setFilterAnomaly(e.target.value)}
                        className="w-full md:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tous">Tous</option>
                        <option value="Avant/Après">Avant / Après</option>
                        <option value="Rupture">Rupture</option>
                        <option value="Promotion">Promotion</option>
                    </select>
                </div>
                <div className="flex-1 text-right text-sm text-gray-500 dark:text-gray-400 pb-2">
                    {filteredPhotos.length} photos trouvées
                </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map(photo => (
                    <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition">
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <img
                                src={photo.url}
                                alt={photo.comment}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {photo.anomalyType}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{photo.store}</h3>
                            <div className="space-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <User size={12} /> {photo.merch}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} /> {photo.date}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredPhotos.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune photo ne correspond à vos filtres.</p>
                </div>
            )}
        </div>
    );
}
