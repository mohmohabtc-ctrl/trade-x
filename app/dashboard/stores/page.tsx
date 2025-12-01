'use client'

import React, { useState } from 'react';
import { Store as StoreIcon, MapPin, Phone, Plus, Search, Trash2, Edit } from 'lucide-react';
import { MOCK_STORES } from '@/utils/mockData';
import { Store } from '@/utils/types';

export default function StoresPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock Data
    const [stores, setStores] = useState<Store[]>(MOCK_STORES);

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Magasins & Points de Vente</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérez votre base de données de magasins.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} /> Ajouter un Magasin
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un magasin par nom ou adresse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map(store => (
                    <div key={store.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <StoreIcon size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-500 transition">
                                    <Edit size={18} />
                                </button>
                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-500 transition">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{store.name}</h3>

                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>{store.address}</span>
                            </div>
                            {store.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{store.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {store.type || 'Supermarché'}
                            </span>
                            <span className="text-xs text-gray-400">ID: {store.id.slice(0, 8)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStores.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Aucun magasin trouvé pour "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
}
