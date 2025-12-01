'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Loader2, ChevronLeft } from 'lucide-react';
import { Store, VisitStatus } from '@/utils/types';
import { createClient } from '@/utils/supabase/client';

interface AddMissionFormProps {
    stores: Store[];
    userId: string;
}

export function AddMissionForm({ stores, userId }: AddMissionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeId: '',
    });

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

            const { error } = await supabase
                .from('visits')
                .insert({
                    merchandiser_id: userId,
                    store_id: formData.storeId,
                    scheduled_start: now.toISOString(),
                    scheduled_end: end.toISOString(),
                    status: VisitStatus.TODO,
                    tasks: [] // Default empty tasks
                });

            if (error) throw error;

            router.push('/app/visits');
            router.refresh();
        } catch (error) {
            console.error('Error creating visit:', error);
            alert('Erreur lors de la création de la mission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouvelle Mission</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm uppercase tracking-wider">
                        <MapPin size={16} className="mr-2 text-brand-500" /> Localisation
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Magasin <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formData.storeId}
                            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Sélectionner un magasin</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name} - {store.address}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.storeId}
                    className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition flex justify-center items-center active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="flex items-center">
                            <Loader2 size={20} className="animate-spin mr-2" />
                            Création...
                        </div>
                    ) : (
                        <>
                            <Plus size={20} className="mr-2" /> AJOUTER A LA TOURNÉE
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
