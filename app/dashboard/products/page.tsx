'use client'

import React, { useState } from 'react';
import { Package, Plus, Search, FileSpreadsheet, Trash2, Filter } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/utils/mockData';
import { Product } from '@/utils/types';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalogue Produits</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gérez vos références, prix et stocks théoriques.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-500/20">
                        <FileSpreadsheet size={18} /> Import Excel
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
                        <Plus size={18} /> Nouveau Produit
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, marque ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <Filter size={18} /> Filtres
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">SKU</th>
                                <th className="px-6 py-3 whitespace-nowrap">Marque</th>
                                <th className="px-6 py-3 whitespace-nowrap">Nom du Produit</th>
                                <th className="px-6 py-3 whitespace-nowrap">Prix</th>
                                <th className="px-6 py-3 whitespace-nowrap">Stock Cible</th>
                                <th className="px-6 py-3 whitespace-nowrap">Facing</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">{product.sku}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.brand}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{product.price} DA</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{product.facing}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Aucun produit trouvé.
                    </div>
                )}
            </div>
        </div>
    );
}
