'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { MerchandiserProfile, Store, VisitStatus } from '@/utils/types'

interface AddVisitModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    merchandisers: MerchandiserProfile[]
    stores: Store[]
}

export function AddVisitModal({ isOpen, onClose, onSuccess, merchandisers, stores }: AddVisitModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        merchandiserId: '',
        storeId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            // Combine date and time for timestamps
            const scheduledStart = new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
            const scheduledEnd = new Date(`${formData.date}T${formData.endTime}:00`).toISOString()

            const { error: insertError } = await supabase
                .from('visits')
                .insert([
                    {
                        merchandiser_id: formData.merchandiserId,
                        store_id: formData.storeId,
                        scheduled_start: scheduledStart,
                        scheduled_end: scheduledEnd,
                        status: VisitStatus.TODO
                    }
                ])

            if (insertError) throw insertError

            onSuccess()
            onClose()

            // Reset form (keep date for convenience)
            setFormData(prev => ({
                ...prev,
                merchandiserId: '',
                storeId: ''
            }))

        } catch (err: any) {
            console.error('Error creating visit:', err)
            setError(err.message || 'Erreur lors de la création de la visite')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Nouvelle Visite
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Merchandiser Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Merchandiser *
                        </label>
                        <select
                            required
                            value={formData.merchandiserId}
                            onChange={(e) => setFormData({ ...formData, merchandiserId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Sélectionner un merchandiser</option>
                            {merchandisers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Store Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Magasin *
                        </label>
                        <select
                            required
                            value={formData.storeId}
                            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Sélectionner un magasin</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - {s.address}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date *
                        </label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Début *
                            </label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fin *
                            </label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="time"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Création...' : 'Créer Visite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
