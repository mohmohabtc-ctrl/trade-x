'use client'

import React, { useState } from 'react';
import { Users, UserPlus, Search, Phone, Mail, MapPin, Shield, MoreHorizontal } from 'lucide-react';
import { MOCK_MERCHANDISERS } from '@/utils/mockData';
import { MerchandiserProfile } from '@/utils/types';
import { AddMerchandiserModal } from '@/components/dashboard/AddMerchandiserModal';

export default function TeamPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [merchandisers, setMerchandisers] = useState<MerchandiserProfile[]>(MOCK_MERCHANDISERS);
    const [showAddModal, setShowAddModal] = useState(false);

    const filteredTeam = merchandisers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion d'Équipe</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérez vos merchandisers et superviseurs.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                >
                    <UserPlus size={18} /> Nouveau Membre
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeam.map(member => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold border-2 border-white dark:border-gray-800 shadow-sm">
                                    {member.name.charAt(0)}
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                                <Shield size={14} />
                                <span>Merchandiser</span>
                            </div>

                            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="shrink-0" />
                                    <span className="truncate">{member.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="shrink-0" />
                                    <span>{member.phone || 'Non renseigné'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={16} className="shrink-0" />
                                    <span>{member.zone || 'Zone Globale'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span>ID: {member.id.slice(0, 8)}</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Actif</span>
                        </div>
                    </div>
                ))}
            </div>

            <AddMerchandiserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    // TODO: Refresh merchandisers list from Supabase
                    setShowAddModal(false);
                }}
            />
        </div>
    );
}
