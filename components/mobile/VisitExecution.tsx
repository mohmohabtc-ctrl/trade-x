'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Camera, Save, Play, CheckSquare, Loader2, ChevronLeft, AlertCircle } from 'lucide-react';
import { Visit, VisitStatus, Product } from '@/utils/types';
import { createClient } from '@/utils/supabase/client';

interface VisitExecutionProps {
    visit: Visit;
    products: Product[];
}

export function VisitExecution({ visit: initialVisit, products }: VisitExecutionProps) {
    const router = useRouter();
    const [visit, setVisit] = useState<Visit>(initialVisit);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    const updateVisitInDb = async (updates: Partial<Visit>) => {
        try {
            const { error } = await supabase
                .from('visits')
                .update(updates)
                .eq('id', visit.id);

            if (error) throw error;

            setVisit(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Error updating visit:', error);
            alert('Erreur lors de la mise à jour.');
        }
    };

    const handleStatusChange = async (newStatus: VisitStatus) => {
        const now = new Date().toISOString();
        let updates: Partial<Visit> = { status: newStatus };

        if (newStatus === VisitStatus.IN_PROGRESS) {
            updates.checkInTime = now;
        } else if (newStatus === VisitStatus.COMPLETED) {
            updates.checkOutTime = now;
        }

        await updateVisitInDb(updates);
    };

    const handleFieldChange = (field: 'dlc' | 'veille', value: string) => {
        setVisit(prev => ({ ...prev, [field]: value }));
    };

    const handleRuptureChange = (productId: string, checked: boolean) => {
        const currentItems = visit.ruptureItems || [];
        let newItems;
        if (checked) {
            newItems = [...currentItems, productId];
        } else {
            newItems = currentItems.filter(id => id !== productId);
        }

        const hasRupture = newItems.length > 0 ? 'Oui' : 'Non';
        setVisit(prev => ({ ...prev, ruptureItems: newItems, rupture: hasRupture }));
    };

    const handleFileChange = async (type: 'photoAvant' | 'photoApres', file: File | null) => {
        if (file) {
            setUploadingId(type);
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${visit.id}_${type}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('photos')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('photos')
                    .getPublicUrl(filePath);

                const publicUrl = data.publicUrl;
                await updateVisitInDb({ [type]: publicUrl });

            } catch (error) {
                console.error("Erreur d'upload:", error);
                alert("Erreur lors de l'envoi de la photo.");
            } finally {
                setUploadingId(null);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        await updateVisitInDb({
            dlc: visit.dlc,
            veille: visit.veille,
            rupture: visit.rupture,
            ruptureItems: visit.ruptureItems
        });
        setSaving(false);
        router.push('/app/visits');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">{visit.store?.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin size={12} /> {visit.store?.address}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Status Actions */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex gap-3">
                        {visit.status === VisitStatus.TODO && (
                            <button
                                onClick={() => handleStatusChange(VisitStatus.IN_PROGRESS)}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition"
                            >
                                <Play size={20} className="fill-current" /> COMMENCER LA VISITE
                            </button>
                        )}
                        {visit.status === VisitStatus.IN_PROGRESS && (
                            <button
                                onClick={() => handleStatusChange(VisitStatus.COMPLETED)}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-500/30 transition"
                            >
                                <CheckSquare size={20} /> TERMINER LA VISITE
                            </button>
                        )}
                        {visit.status === VisitStatus.COMPLETED && (
                            <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                                <CheckSquare size={20} /> VISITE TERMINÉE
                            </div>
                        )}
                    </div>
                </div>

                {/* Forms */}
                <div className={`space-y-6 transition-opacity ${visit.status === VisitStatus.TODO ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>

                    {/* Photos */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Avant */}
                        <label className="flex flex-col cursor-pointer group">
                            <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-32 transition ${visit.photoAvant ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                {uploadingId === 'photoAvant' ? (
                                    <Loader2 size={24} className="animate-spin text-brand-600" />
                                ) : visit.photoAvant ? (
                                    <div className="relative w-full h-full">
                                        <img src={visit.photoAvant} alt="Avant" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                            <span className="text-white text-xs font-bold">Modifier</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <Camera size={24} className="mb-2" />
                                        <span className="text-xs font-bold">PHOTO AVANT</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange('photoAvant', e.target.files?.[0] || null)} className="hidden" />
                        </label>

                        {/* Apres */}
                        <label className="flex flex-col cursor-pointer group">
                            <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-32 transition ${visit.photoApres ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                {uploadingId === 'photoApres' ? (
                                    <Loader2 size={24} className="animate-spin text-green-600" />
                                ) : visit.photoApres ? (
                                    <div className="relative w-full h-full">
                                        <img src={visit.photoApres} alt="Après" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                            <span className="text-white text-xs font-bold">Modifier</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <Camera size={24} className="mb-2" />
                                        <span className="text-xs font-bold">PHOTO APRÈS</span>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange('photoApres', e.target.files?.[0] || null)} className="hidden" />
                        </label>
                    </div>

                    {/* DLC & Veille */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">DLC Courte</label>
                            <input
                                type="text"
                                value={visit.dlc || ''}
                                onChange={(e) => handleFieldChange('dlc', e.target.value)}
                                placeholder="Saisir les produits..."
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Veille Concurrentielle</label>
                            <input
                                type="text"
                                value={visit.veille || ''}
                                onChange={(e) => handleFieldChange('veille', e.target.value)}
                                placeholder="Promotions, prix..."
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Ruptures */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 block">Ruptures (Cochez les produits)</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {products.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Aucun produit dans le catalogue.</p>
                            ) : (
                                products.map(product => {
                                    const isChecked = (visit.ruptureItems || []).includes(product.id);
                                    return (
                                        <label key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handleRuptureChange(product.id, e.target.checked)}
                                                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{product.sku}</p>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        ENREGISTRER
                    </button>
                </div>
            </div>
        </div>
    );
}
