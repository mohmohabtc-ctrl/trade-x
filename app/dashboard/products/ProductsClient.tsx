'use client'

import React, { useState } from 'react';
import { Package, Search, Filter, Download, Plus, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Product } from '@/utils/types';
import { createClient } from '@/utils/supabase/client';

interface ProductsClientProps {
    initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);

    const refreshProducts = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error refreshing products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Produits</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérez votre catalogue produits.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => alert("L'import Excel sera disponible prochainement !")}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <Download size={18} /> Import Excel
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20">
                        <Plus size={18} /> Nouveau Produit
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, SKU ou marque..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <Filter size={18} /> Filtres
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Chargement...</p>
                </div>
            )}

            {/* Products Table */}
            {!loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Produit</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">SKU</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Marque</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Prix</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="p-4 font-medium text-gray-500 dark:text-gray-400"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.facing} facings</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 font-mono text-sm">{product.sku}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{product.brand}</td>
                                        <td className="p-4 text-gray-900 dark:text-white font-medium">{product.price} MAD</td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}>
                                                {product.stock > 10 ? 'En Stock' : 'Stock Faible'}
                                                <span className="text-gray-500 dark:text-gray-400 ml-1">({product.stock})</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">
                                                Actif
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Package size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun produit trouvé</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Commencez par ajouter des produits à votre catalogue.'}
                    </p>
                    {!searchTerm && (
                        <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            <Plus size={18} /> Ajouter un Produit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
