'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Camera, Save, Play, CheckSquare, Loader2, ChevronLeft, AlertCircle, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [expandedTask, setExpandedTask] = useState<string | null>('task1'); // Default open first task

    const supabase = createClient();

    // --- Task Logic ---
    const tasks = [
        {
            id: 'task1',
            title: 'Photo Avant',
            description: 'Prendre une photo du rayon avant intervention',
            isDone: !!visit.photoAvant,
            icon: <Camera size={20} />
        },
        {
            id: 'task2',
            title: 'Ruptures & Rayon',
            description: 'Signaler les produits manquants',
            isDone: (visit.ruptureItems && visit.ruptureItems.length > 0) || visit.rupture === 'Non', // Simple logic: considered done if items checked OR explicitly marked 'Non' (we might need a "No Rupture" button)
            icon: <AlertCircle size={20} />
        },
        {
            id: 'task3',
            title: 'Relevés (DLC/Veille)',
            description: 'Noter les dates courtes et infos concurrents',
            isDone: !!visit.dlc || !!visit.veille, // Considered done if either is filled
            icon: <Clock size={20} />
        },
        {
            id: 'task4',
            title: 'Photo Après',
            description: 'Prendre une photo du rayon après intervention',
            isDone: !!visit.photoApres,
            icon: <Camera size={20} />
        }
    ];

    const completedTasksCount = tasks.filter(t => t.isDone).length;
    const progress = Math.round((completedTasksCount / tasks.length) * 100);

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

    const toggleTask = (taskId: string) => {
        if (expandedTask === taskId) {
            setExpandedTask(null);
        } else {
            setExpandedTask(taskId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{visit.store?.name}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin size={12} /> {visit.store?.address}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Progression</span>
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">{progress}%</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {/* Status Actions */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {visit.status === VisitStatus.TODO && (
                        <button
                            onClick={() => handleStatusChange(VisitStatus.IN_PROGRESS)}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition animate-pulse"
                        >
                            <Play size={20} className="fill-current" /> COMMENCER LA VISITE
                        </button>
                    )}
                    {visit.status === VisitStatus.IN_PROGRESS && (
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Visite en cours... Complétez les tâches ci-dessous.</p>
                            <button
                                onClick={() => handleStatusChange(VisitStatus.COMPLETED)}
                                disabled={progress < 100} // Optional: Force completion of tasks? Let's keep it flexible but visual
                                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${progress === 100 ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            >
                                <CheckSquare size={20} /> TERMINER LA VISITE
                            </button>
                        </div>
                    )}
                    {visit.status === VisitStatus.COMPLETED && (
                        <div className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                            <CheckCircle2 size={20} /> VISITE TERMINÉE
                        </div>
                    )}
                </div>

                {/* Task List */}
                <div className={`space-y-4 transition-opacity duration-300 ${visit.status === VisitStatus.TODO ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>

                    {/* Task 1: Photo Avant */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button onClick={() => toggleTask('task1')} className="w-full p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-3">
                                {tasks[0].isDone ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
                                <div className="text-left">
                                    <h3 className={`font-bold ${tasks[0].isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>1. Photo Avant</h3>
                                    <p className="text-xs text-gray-500">Preuve de passage initiale</p>
                                </div>
                            </div>
                            {expandedTask === 'task1' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>
                        {expandedTask === 'task1' && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-slide-in">
                                <label className="flex flex-col cursor-pointer group">
                                    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-48 transition ${visit.photoAvant ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
                                        {uploadingId === 'photoAvant' ? (
                                            <Loader2 size={32} className="animate-spin text-brand-600" />
                                        ) : visit.photoAvant ? (
                                            <div className="relative w-full h-full">
                                                <img src={visit.photoAvant} alt="Avant" className="w-full h-full object-cover rounded-xl" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                                    <span className="text-white font-bold flex items-center gap-2"><Camera size={16} /> Modifier</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mb-2">
                                                    <Camera size={24} className="text-brand-600" />
                                                </div>
                                                <span className="text-sm font-bold">Prendre photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange('photoAvant', e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Task 2: Ruptures */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button onClick={() => toggleTask('task2')} className="w-full p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-3">
                                {tasks[1].isDone ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
                                <div className="text-left">
                                    <h3 className={`font-bold ${tasks[1].isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>2. Ruptures & Rayon</h3>
                                    <p className="text-xs text-gray-500">Vérification des stocks</p>
                                </div>
                            </div>
                            {expandedTask === 'task2' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>
                        {expandedTask === 'task2' && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-slide-in">
                                <div className="mb-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Produits manquants :</span>
                                    <button
                                        onClick={() => {
                                            setVisit(prev => ({ ...prev, ruptureItems: [], rupture: 'Non' }));
                                            handleSave(); // Auto save to confirm "No Rupture"
                                        }}
                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
                                    >
                                        Aucune rupture
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {products.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">Aucun produit dans le catalogue.</p>
                                    ) : (
                                        products.map(product => {
                                            const isChecked = (visit.ruptureItems || []).includes(product.id);
                                            return (
                                                <label key={product.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${isChecked ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900' : 'bg-gray-50 border-transparent dark:bg-gray-700/50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => handleRuptureChange(product.id, e.target.checked)}
                                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${isChecked ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>{product.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{product.sku}</p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                                <button onClick={handleSave} className="mt-4 w-full bg-gray-900 dark:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold">Valider Ruptures</button>
                            </div>
                        )}
                    </div>

                    {/* Task 3: Relevés */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button onClick={() => toggleTask('task3')} className="w-full p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-3">
                                {tasks[2].isDone ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
                                <div className="text-left">
                                    <h3 className={`font-bold ${tasks[2].isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>3. Relevés (DLC/Veille)</h3>
                                    <p className="text-xs text-gray-500">Dates courtes & Concurrence</p>
                                </div>
                            </div>
                            {expandedTask === 'task3' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>
                        {expandedTask === 'task3' && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-slide-in space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">DLC Courte</label>
                                    <textarea
                                        rows={2}
                                        value={visit.dlc || ''}
                                        onChange={(e) => handleFieldChange('dlc', e.target.value)}
                                        placeholder="Ex: 3x Yaourts Fraise (12/12)..."
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Veille Concurrentielle</label>
                                    <textarea
                                        rows={2}
                                        value={visit.veille || ''}
                                        onChange={(e) => handleFieldChange('veille', e.target.value)}
                                        placeholder="Ex: Promo Danone -20%..."
                                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-500 outline-none transition text-sm"
                                    />
                                </div>
                                <button onClick={handleSave} className="w-full bg-gray-900 dark:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold">Sauvegarder Relevés</button>
                            </div>
                        )}
                    </div>

                    {/* Task 4: Photo Après */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <button onClick={() => toggleTask('task4')} className="w-full p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <div className="flex items-center gap-3">
                                {tasks[3].isDone ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-gray-300" size={24} />}
                                <div className="text-left">
                                    <h3 className={`font-bold ${tasks[3].isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>4. Photo Après</h3>
                                    <p className="text-xs text-gray-500">Preuve de travail fini</p>
                                </div>
                            </div>
                            {expandedTask === 'task4' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>
                        {expandedTask === 'task4' && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-slide-in">
                                <label className="flex flex-col cursor-pointer group">
                                    <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-48 transition ${visit.photoApres ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'}`}>
                                        {uploadingId === 'photoApres' ? (
                                            <Loader2 size={32} className="animate-spin text-green-600" />
                                        ) : visit.photoApres ? (
                                            <div className="relative w-full h-full">
                                                <img src={visit.photoApres} alt="Après" className="w-full h-full object-cover rounded-xl" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-xl">
                                                    <span className="text-white font-bold flex items-center gap-2"><Camera size={16} /> Modifier</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mb-2">
                                                    <Camera size={24} className="text-green-600" />
                                                </div>
                                                <span className="text-sm font-bold">Prendre photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange('photoApres', e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
