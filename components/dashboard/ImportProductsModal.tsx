'use client'

import { useState, useRef } from 'react'
import { X, Loader2, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import * as XLSX from 'xlsx'

interface ImportProductsModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ImportProductsModal({ isOpen, onClose, onSuccess }: ImportProductsModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setError('')
            setSuccess('')
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier Excel (.xlsx, .xls)')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data)
            const worksheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[worksheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length === 0) {
                throw new Error('Le fichier est vide')
            }

            // Validate and transform data
            const productsToInsert = jsonData.map((row: any) => ({
                name: row['Nom'] || row['name'] || row['Produit'],
                sku: String(row['SKU'] || row['sku'] || row['Code'] || Math.random().toString(36).substr(2, 9)),
                brand: row['Marque'] || row['brand'] || 'Générique',
                price: Number(row['Prix'] || row['price'] || 0),
                stock: Number(row['Stock'] || row['stock'] || 0),
                facing: Number(row['Facing'] || row['facing'] || 1)
            })).filter(p => p.name) // Ensure name exists

            if (productsToInsert.length === 0) {
                throw new Error('Aucun produit valide trouvé. Vérifiez les colonnes (Nom, SKU, Marque, Prix, Stock).')
            }

            const supabase = createClient()

            // Insert into Supabase
            const { error: insertError } = await supabase
                .from('products')
                .upsert(productsToInsert, { onConflict: 'sku' }) // Upsert based on SKU

            if (insertError) throw insertError

            setSuccess(`${productsToInsert.length} produits importés avec succès !`)
            setTimeout(() => {
                onSuccess()
                onClose()
                setFile(null)
                setSuccess('')
            }, 2000)

        } catch (err: any) {
            console.error('Import error:', err)
            setError(err.message || 'Erreur lors de l\'importation')
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
                        Importer Produits
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    <div
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 transition cursor-pointer bg-gray-50 dark:bg-gray-700/50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <FileSpreadsheet size={48} />
                                <span className="font-medium">{file.name}</span>
                                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                <Upload size={48} />
                                <span className="font-medium">Cliquez pour sélectionner un fichier Excel</span>
                                <span className="text-xs">Colonnes requises : Nom, SKU, Marque, Prix, Stock</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={loading || !file}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Importation...' : 'Importer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
