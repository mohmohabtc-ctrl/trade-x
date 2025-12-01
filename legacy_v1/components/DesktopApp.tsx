/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Calendar, Settings, Bell, Search, ChevronDown, Sparkles, FileText, FileSpreadsheet, Download, Filter, ClipboardCheck, Clock, Users, TrendingUp, X, AlertTriangle, Zap, MessageSquare, Send, UserPlus, Mail, MapPin, Phone, Image as ImageIcon, User, Map, MapPinned, CalendarPlus, CheckCircle, ArrowRight, Plus, Trash2, Shield, Briefcase, ListChecks, Archive, Sun, Moon, Package, ShoppingBag, Tag, Camera, Menu } from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { KPI, AdminReport, MerchandiserProfile, PhotoItem, Store, Visit, VisitStatus, UserRole, ManagerProfile, Product } from '../types';
import { MOCK_KPIS, MOCK_PHOTOS } from '../mockData';

interface DesktopAppProps {
    onLogout: () => void;
    userRole: UserRole;
    currentUser: MerchandiserProfile | ManagerProfile | null;
    merchandisers: MerchandiserProfile[];
    onAddMerchandiser: (m: MerchandiserProfile) => void;
    managers: ManagerProfile[];
    onAddManager: (m: ManagerProfile) => void;
    stores: Store[];
    onAddStore: (s: Store) => void;
    onDeleteStore: (id: string) => void;
    visits: Visit[];
    onAddVisit: (v: Visit) => void;
    products: Product[];
    onAddProduct: (p: Product) => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DesktopApp: React.FC<DesktopAppProps> = ({
    onLogout,
    userRole,
    currentUser,
    merchandisers,
    onAddMerchandiser,
    managers,
    onAddManager,
    stores,
    onAddStore,
    onDeleteStore,
    visits,
    onAddVisit,
    products,
    onAddProduct,
    isDarkMode,
    toggleDarkMode
}) => {
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ADMIN' | 'TEAM' | 'GALLERY' | 'STORES' | 'DISPATCH' | 'PRODUCTS'>('DASHBOARD');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar
    const isAdmin = userRole === UserRole.ADMIN;

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 flex justify-between md:justify-center border-b border-gray-100 dark:border-gray-700 items-center gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="TradeX Logo" className="h-10 w-auto object-contain" />
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={closeSidebar} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Tableau de Bord" active={activeTab === 'DASHBOARD'} onClick={() => { setActiveTab('DASHBOARD'); closeSidebar(); }} />
                    <SidebarItem icon={<CalendarPlus size={20} />} label="Dispatching" active={activeTab === 'DISPATCH'} onClick={() => { setActiveTab('DISPATCH'); closeSidebar(); }} />
                    <SidebarItem icon={<MapPinned size={20} />} label="Magasins & GPS" active={activeTab === 'STORES'} onClick={() => { setActiveTab('STORES'); closeSidebar(); }} />
                    <SidebarItem icon={<Package size={20} />} label="Produits" active={activeTab === 'PRODUCTS'} onClick={() => { setActiveTab('PRODUCTS'); closeSidebar(); }} />

                    <div className="pt-6 pb-2">
                        <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Gestion</p>
                    </div>
                    <SidebarItem icon={<Users size={20} />} label={isAdmin ? "Gestion Équipes (Admin)" : "Mon Équipe"} active={activeTab === 'TEAM'} onClick={() => { setActiveTab('TEAM'); closeSidebar(); }} />
                    <SidebarItem icon={<FileText size={20} />} label="Rapports Admin" active={activeTab === 'ADMIN'} onClick={() => { setActiveTab('ADMIN'); closeSidebar(); }} />
                    <SidebarItem icon={<ImageIcon size={20} />} label="Galerie Photos" active={activeTab === 'GALLERY'} onClick={() => { setActiveTab('GALLERY'); closeSidebar(); }} />
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <button onClick={toggleDarkMode} className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 w-full p-2 rounded transition font-medium">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 w-full p-2 rounded transition font-medium">
                        <Settings size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 shadow-sm z-20 transition-colors duration-300 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-96">
                            <Search size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
                            <input type="text" placeholder="Rechercher..." className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow ${isAdmin ? 'bg-red-700' : 'bg-brand-600'}`}>
                                {currentUser?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-gray-800 dark:text-white">{currentUser?.name || 'Administrateur'}</p>
                                <p className={`text-xs font-bold ${isAdmin ? 'text-red-600 dark:text-red-400' : 'text-brand-600 dark:text-brand-400'}`}>
                                    {isAdmin ? 'ADMINISTRATEUR' : 'SUPERVISEUR'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Body */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 w-full">
                    {activeTab === 'DASHBOARD' && <DashboardView visits={visits} merchandisers={merchandisers} />}
                    {activeTab === 'ADMIN' && <AdminView merchandisers={merchandisers} visits={visits} stores={stores} />}
                    {activeTab === 'GALLERY' && <PhotoGalleryView visits={visits} merchandisers={merchandisers} stores={stores} />}
                    {activeTab === 'TEAM' && <TeamView isAdmin={isAdmin} merchandisers={merchandisers} onAddMerchandiser={onAddMerchandiser} managers={managers} onAddManager={onAddManager} />}
                    {activeTab === 'STORES' && <StoresView stores={stores} onAddStore={onAddStore} onDeleteStore={onDeleteStore} currentUser={currentUser} />}
                    {activeTab === 'DISPATCH' && <DispatchingView merchandisers={merchandisers} stores={stores} visits={visits} onAddVisit={onAddVisit} />}
                    {activeTab === 'PRODUCTS' && <ProductsView products={products} onAddProduct={onAddProduct} currentUser={currentUser} />}
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        {icon}
        {label}
    </button>
);

/* --- VIEWS --- */

const ProductsView = ({ products, onAddProduct, currentUser }: { products: Product[], onAddProduct: (p: Product) => void, currentUser: MerchandiserProfile | ManagerProfile | null }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        brand: '',
        sku: '',
        name: '',
        price: '',
        stock: '',
        facing: ''
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Expected columns: SKU, Brand, Name, Price, Stock, Facing
            data.forEach((row: any) => {
                const product: Product = {
                    id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    sku: row['SKU'] || row['sku'] || `GEN-${Date.now()}`,
                    brand: row['Brand'] || row['brand'] || 'Inconnu',
                    name: row['Name'] || row['name'] || 'Produit Inconnu',
                    price: parseFloat(row['Price'] || row['price'] || '0'),
                    stock: parseInt(row['Stock'] || row['stock'] || '0'),
                    facing: parseInt(row['Facing'] || row['facing'] || '0')
                };
                onAddProduct(product);
            });
            alert(`${data.length} produits importés avec succès !`);
        };
        reader.readAsBinaryString(file);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: `p-${Date.now()}`,
            brand: newProduct.brand,
            sku: newProduct.sku,
            name: newProduct.name,
            price: parseFloat(newProduct.price),
            stock: parseInt(newProduct.stock),
            facing: parseInt(newProduct.facing),
            owner_id: currentUser?.id
        };
        onAddProduct(product);
        setShowAddModal(false);
        setNewProduct({ brand: '', sku: '', name: '', price: '', stock: '', facing: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Gestion des Produits</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm text-sm md:text-base"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">Ajouter un Produit</span>
                    <span className="md:hidden">Ajouter</span>
                </button>
                <button
                    onClick={triggerFileUpload}
                    className="ml-2 bg-green-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-sm text-sm md:text-base"
                >
                    <FileSpreadsheet size={18} />
                    <span className="hidden md:inline">Importer Excel</span>
                    <span className="md:hidden">Import</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx, .xls"
                    className="hidden"
                />
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 mb-6 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Nouveau Produit</h3>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marque (Brand)</label>
                            <input required value={newProduct.brand} onChange={(e: any) => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: Coca-Cola" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU / Référence</label>
                            <input required value={newProduct.sku} onChange={(e: any) => setNewProduct({ ...newProduct, sku: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: COCA-1.5L" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Produit</label>
                            <input required value={newProduct.name} onChange={(e: any) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: Bouteille 1.5L Original" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (DA)</label>
                            <input required type="number" value={newProduct.price} onChange={(e: any) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="120" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Cible / Théorique</label>
                            <input required type="number" value={newProduct.stock} onChange={(e: any) => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objectif Facing</label>
                            <input required type="number" value={newProduct.facing} onChange={(e: any) => setNewProduct({ ...newProduct, facing: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="4" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Ajouter Produit</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">SKU</th>
                                <th className="px-6 py-3 whitespace-nowrap">Marque</th>
                                <th className="px-6 py-3 whitespace-nowrap">Nom</th>
                                <th className="px-6 py-3 whitespace-nowrap">Prix</th>
                                <th className="px-6 py-3 whitespace-nowrap">Stock</th>
                                <th className="px-6 py-3 whitespace-nowrap">Facing</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-mono text-xs font-bold">{product.sku}</td>
                                    <td className="px-6 py-4">{product.brand}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white min-w-[200px]">{product.name}</td>
                                    <td className="px-6 py-4 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">{product.price} DA</td>
                                    <td className="px-6 py-4">{product.stock}</td>
                                    <td className="px-6 py-4">{product.facing}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DashboardView = ({ visits, merchandisers }: { visits: Visit[], merchandisers: MerchandiserProfile[] }) => {
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    // --- REAL-TIME CALCULATION ---
    const totalMissions = visits.length;
    const completed = visits.filter(v => v.status === VisitStatus.COMPLETED).length;
    const inProgress = visits.filter(v => v.status === VisitStatus.IN_PROGRESS).length;
    const todo = visits.filter(v => v.status === VisitStatus.TODO || v.status === VisitStatus.LATE).length;

    // Execution Rate
    const executionRate = totalMissions > 0 ? Math.round((completed / totalMissions) * 100) : 0;

    // Presence Rate (Started vs Total)
    const started = completed + inProgress;
    const presenceRate = totalMissions > 0 ? Math.round((started / totalMissions) * 100) : 0;

    // Average Visit Time
    let totalDuration = 0;
    let timedVisits = 0;
    visits.forEach(v => {
        if (v.status === VisitStatus.COMPLETED && v.checkInTime && v.checkOutTime) {
            const start = new Date(v.checkInTime).getTime();
            const end = new Date(v.checkOutTime).getTime();
            const durationMins = (end - start) / 60000;
            if (durationMins > 0) {
                totalDuration += durationMins;
                timedVisits++;
            }
        }
    });
    const avgTime = timedVisits > 0 ? Math.round(totalDuration / timedVisits) : 0;

    // Task Completion Rate (7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVisits = visits.filter(v => {
        const visitDate = new Date(v.scheduledStart);
        return visitDate >= sevenDaysAgo && visitDate <= new Date();
    });
    let totalTasks7d = 0;
    let completedTasks7d = 0;
    recentVisits.forEach(v => {
        if (v.tasks) {
            totalTasks7d += v.tasks.length;
            completedTasks7d += v.tasks.filter(t => t.completed).length;
        }
    });
    const taskCompletionRate = totalTasks7d > 0
        ? Math.round((completedTasks7d / totalTasks7d) * 100)
        : 0;

    // Dynamic Merchandiser Progress
    const merchProgressData = merchandisers.map(merch => {
        const mVisits = visits.filter(v => v.merchandiserId === merch.id);
        const mTotal = mVisits.length;
        const mDone = mVisits.filter(v => v.status === VisitStatus.COMPLETED).length;
        const mProgress = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
        return {
            name: merch.name,
            progress: mProgress
        };
    }).filter(d => d.name); // Filter out undefined names if any

    const missionDistributionData = [
        { name: 'Terminées', value: completed, color: '#10b981' },
        { name: 'En cours', value: inProgress, color: '#3b82f6' },
        { name: 'Non commencées', value: todo, color: '#9ca3af' },
    ];

    return (
        <div className="space-y-8 relative">
            {/* Header Section with AI Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
                    <p className="text-gray-500 dark:text-gray-400">Vue d'ensemble de l'activité terrain.</p>
                </div>
                <button
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition hover:scale-105 animate-pulse-slow"
                >
                    <Sparkles size={18} className="fill-white/20" />
                    AI Copilot
                </button>
            </div>

            {/* AI Assistant Panel (Collapsible) */}
            {showAIAssistant && (
                <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 rounded-2xl shadow-xl overflow-hidden animate-slide-in">
                    <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 font-bold">
                            <Sparkles size={20} />
                            <span>Analyse Intelligente</span>
                        </div>
                        <button onClick={() => setShowAIAssistant(false)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300"><X size={20} /></button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" /> Anomalies Critiques Détectées
                            </h3>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
                                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">🚨 Ruptures détectées : {visits.filter(v => v.rupture === 'Oui').length}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Actions recommandées : Vérifier stocks entrepôt ou contacter les chefs de rayon.</p>
                                <div className="mt-3 flex gap-2">
                                    <button className="text-xs bg-white dark:bg-gray-700 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-3 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900 transition">Notifier Logistique</button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Zap size={18} className="text-blue-500" /> Performance d'Équipe
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Taux Global : {executionRate}%</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{completed} visites terminées sur {totalMissions}.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Map Widget */}
            <LiveMapWidget />

            {/* Volume Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <MetricCard label="Total Missions" value={totalMissions} icon={<ClipboardCheck size={24} className="text-purple-500" />} color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900" />
                <MetricCard label="Terminées" value={completed} icon={<CheckCircle size={24} className="text-green-500" />} color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900" />
                <MetricCard label="En cours" value={inProgress} icon={<Clock size={24} className="text-blue-500" />} color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900" />
                <MetricCard label="Non commencées" value={todo} icon={<AlertTriangle size={24} className="text-gray-400" />} color="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700" />
            </div>

            {/* Performance Metrics - Expanded to 4 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <KPICard title="Taux d'exécution" value={`${executionRate}%`} desc="Efficacité réalisation missions" trend="neutral" />
                <KPICard title="Taux de présence" value={`${presenceRate}%`} desc="Temps terrain vs total" trend="neutral" />
                <KPICard title="Temps moyen visite" value={`${avgTime} min`} desc="Efficacité merchandising" trend="neutral" />
                <KPICard
                    title="Taux Tâches (7j)"
                    value={`${taskCompletionRate}%`}
                    desc="Complétion tâches globale"
                    trend="neutral"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merchandiser Progress Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Progression par Merchandiser</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={merchProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1f2937', color: '#f3f4f6' }}
                                />
                                <Bar dataKey="progress" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20}>
                                    {merchProgressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : entry.progress > 0 ? '#0ea5e9' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Mission Distribution Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Répartition des Missions</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={missionDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {missionDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LiveMapWidget = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-64 relative group">
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 shadow border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Map
            </div>
            {/* Placeholder for Map */}
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
                className="w-full h-full object-cover opacity-30 bg-slate-50 dark:bg-slate-900 dark:invert"
                alt="World Map"
            />

            {/* Fake Pins */}
            <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition duration-300">
                <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white text-xs font-bold">A</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
                </div>
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Ali (En cours)</div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition duration-300">
                <div className="relative">
                    <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white text-xs font-bold">D</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45"></div>
                </div>
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Djamel (Terminé)</div>
            </div>
        </div>
    )
}

const MetricCard = ({ label, value, icon, color }: any) => (
    <div className={`p-4 rounded-xl border ${color} flex items-center justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
            {icon}
        </div>
    </div>
)

const KPICard = ({ title, value, desc, trend }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
            {trend === 'up' && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full flex items-center">↗</span>}
            {trend === 'down' && <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs px-2 py-1 rounded-full flex items-center">↘</span>}
        </div>
        <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{desc}</p>
    </div>
)

const AdminView = ({ merchandisers, visits, stores }: { merchandisers: MerchandiserProfile[], visits: Visit[], stores: Store[] }) => {
    const [filterName, setFilterName] = useState('Tous');
    const [filterStatus, setFilterStatus] = useState('Tous');

    // Transform Real Visits into Reports dynamically
    const reports: AdminReport[] = visits.map(v => {
        const merch = merchandisers.find(m => m.id === v.merchandiserId);
        const store = v.store || stores.find(s => s.id === v.storeId);

        let progress = 0;
        if (v.tasks && v.tasks.length > 0) {
            const completed = v.tasks.filter(t => t.completed).length;
            progress = Math.round((completed / v.tasks.length) * 100);
        } else if (v.status === 'COMPLETED') {
            progress = 100;
        }

        let statusLabel = 'À faire';
        if (v.status === 'IN_PROGRESS') statusLabel = 'En cours';
        if (v.status === 'COMPLETED') statusLabel = 'Terminé';
        if (v.status === 'LATE') statusLabel = 'En retard';

        return {
            id: v.id,
            merch: merch?.name || 'Inconnu',
            store: store?.name || 'Inconnu',
            ville: store?.address?.split(',').pop()?.trim() || 'Inconnu',
            dlc: v.dlc || '',
            veille: v.veille || '',
            rupture: v.rupture || 'Non',
            status: statusLabel,
            date: new Date(v.scheduledStart).toLocaleDateString(),
            progress: progress
        };
    });

    const filteredReports = reports.filter(r => {
        const matchName = filterName === 'Tous' || r.merch === filterName;
        const matchStatus = filterStatus === 'Tous' || r.status === filterStatus;
        return matchName && matchStatus;
    });

    const handleExport = () => {
        // Define the worksheet content based on filtered data
        const dataToExport = filteredReports.map(r => ({
            ID: r.id,
            Merchandiser: r.merch,
            Magasin: r.store,
            Ville: r.ville,
            DLC: r.dlc,
            Veille: r.veille,
            Rupture: r.rupture,
            Statut: r.status,
            Date: r.date,
            Progression: `${r.progress}%`
        }));

        // Create a worksheet
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rapport_Merch");

        // Generate Excel file and trigger download
        const fileName = `Rapport_Merch_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Use props for unique merchs list plus existing report authors
    const reportMerchs = Array.from(new Set(reports.map(r => r.merch)));
    const allMerchs = Array.from(new Set([...reportMerchs, ...merchandisers.map(m => m.name)]));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Administration & Rapports</h2>
                <button
                    onClick={handleExport}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition shadow-sm w-full md:w-auto justify-center"
                >
                    <FileSpreadsheet size={18} />
                    Exporter Excel (.xlsx)
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 md:items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Merchandiser</label>
                    <select
                        value={filterName}
                        onChange={(e) => setFilterName((e.target as HTMLSelectElement).value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-48 p-2.5"
                    >
                        <option value="Tous">Tous</option>
                        {allMerchs.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Statut</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-48 p-2.5"
                    >
                        <option value="Tous">Tous</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                    </select>
                </div>
                <div className="flex-1 md:text-right text-sm text-gray-500 dark:text-gray-400 pb-3">
                    {filteredReports.length} résultats trouvés
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                                <th className="px-6 py-3 whitespace-nowrap">Merch</th>
                                <th className="px-6 py-3 whitespace-nowrap">Store</th>
                                <th className="px-6 py-3 whitespace-nowrap">Ville</th>
                                <th className="px-6 py-3 whitespace-nowrap">DLC</th>
                                <th className="px-6 py-3 whitespace-nowrap">Veille</th>
                                <th className="px-6 py-3 whitespace-nowrap">Rupture</th>
                                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                <th className="px-6 py-3 whitespace-nowrap">Progress</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-[80px]" title={String(report.id)}>{String(report.id).slice(0, 5)}..</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.merch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.store}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.ville}</td>
                                    <td className="px-6 py-4 truncate max-w-[150px]" title={report.dlc}>{report.dlc || '-'}</td>
                                    <td className="px-6 py-4 truncate max-w-[150px]" title={report.veille}>{report.veille || '-'}</td>
                                    <td className="px-6 py-4">
                                        {report.rupture === 'Oui' ? (
                                            <span className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded">Oui</span>
                                        ) : (
                                            <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">Non</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.status === 'Terminé' ? (
                                            <span className="text-green-600 dark:text-green-400 font-bold">Terminé</span>
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">En cours</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{report.date}</td>
                                    <td className="px-6 py-4 min-w-[120px]">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div className={`h-2.5 rounded-full ${report.progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${report.progress}%` }}></div>
                                        </div>
                                        <span className="text-xs mt-1">{report.progress}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-gray-500 dark:text-gray-400 hover:text-red-600 transition" title="Télécharger PDF">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PhotoGalleryView = ({ visits, merchandisers, stores }: { visits: Visit[], merchandisers: MerchandiserProfile[], stores: Store[] }) => {
    const [filterStore, setFilterStore] = useState('Tous');
    const [filterAnomaly, setFilterAnomaly] = useState('Tous');
    const [downloading, setDownloading] = useState(false);

    // Generate Photo List from Real Visits
    const realPhotos: PhotoItem[] = [];

    // Sort visits by date descending
    const sortedVisits = [...visits].sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime());

    sortedVisits.forEach(v => {
        const merchName = merchandisers.find(m => m.id === v.merchandiserId)?.name || 'Inconnu';
        const storeName = v.store?.name || stores.find(s => s.id === v.storeId)?.name || 'Inconnu';
        const dateStr = v.checkInTime ? new Date(v.checkInTime).toLocaleDateString() : new Date(v.scheduledStart).toLocaleDateString();

        // Add "Avant" photo if exists
        if (v.photoAvant) {
            realPhotos.push({
                id: `${v.id}-avant`,
                url: v.photoAvant,
                merch: merchName,
                store: storeName,
                date: dateStr,
                anomalyType: 'Avant', // Special type for Badge
                comment: 'Photo AVANT'
            });
        }

        // Add "Apres" photo if exists
        if (v.photoApres) {
            realPhotos.push({
                id: `${v.id}-apres`,
                url: v.photoApres,
                merch: merchName,
                store: storeName,
                date: dateStr,
                anomalyType: 'Apres', // Special type for Badge
                comment: v.rupture === 'Oui' ? 'Rupture Signalée' : 'Photo APRÈS'
            });
        }
    });

    // Combine with mocks if needed, or just use real
    const displayPhotos = realPhotos.length > 0 ? realPhotos : MOCK_PHOTOS;

    const filteredPhotos = displayPhotos.filter(p => {
        const matchStore = filterStore === 'Tous' || p.store === filterStore;
        // Updated filter logic for custom badges
        const matchAnomaly = filterAnomaly === 'Tous'
            || (filterAnomaly === 'Avant' && p.anomalyType === 'Avant')
            || (filterAnomaly === 'Apres' && p.anomalyType === 'Apres')
            || (filterAnomaly === 'Anomalie' && p.comment?.includes('Rupture'));

        return matchStore && matchAnomaly;
    });

    const uniqueStores = Array.from(new Set(displayPhotos.map(p => p.store)));

    const handleZipExport = async () => {
        if (filteredPhotos.length === 0) {
            alert("Aucune photo à exporter.");
            return;
        }

        setDownloading(true);
        const zip = new JSZip();
        const folder = zip.folder("Photos_Export_RAYA");

        try {
            await Promise.all(filteredPhotos.map(async (photo, index) => {
                try {
                    const response = await fetch(photo.url);
                    const blob = await response.blob();

                    const safeMerch = photo.merch.replace(/[^a-zA-Z0-9]/g, '_');
                    const safeStore = photo.store.replace(/[^a-zA-Z0-9]/g, '_');
                    const safeDate = photo.date.replace(/\//g, '-');
                    const type = photo.anomalyType === 'Avant' ? 'AVANT' : 'APRES';
                    const ext = photo.url.split('.').pop()?.split('?')[0] || 'jpg';

                    const filename = `${safeDate}_${safeMerch}_${safeStore}_${type}_${index}.${ext}`;

                    folder?.file(filename, blob);
                } catch (err) {
                    console.error(`Failed to load image for ZIP: ${photo.url}`, err);
                }
            }));

            const content = await zip.generateAsync({ type: "blob" });

            const url = window.URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Export_Photos_${new Date().toISOString().split('T')[0]}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("ZIP Generation failed", error);
            alert("Erreur lors de la génération du ZIP.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Galerie Photos</h2>

                {/* Export ZIP Button */}
                <button
                    onClick={handleZipExport}
                    disabled={downloading}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white shadow-sm transition ${downloading ? 'bg-gray-400 cursor-wait' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                    {downloading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Compression...
                        </>
                    ) : (
                        <>
                            <Archive size={18} />
                            <span className="hidden md:inline">Télécharger ZIP</span>
                            <span className="md:hidden">ZIP</span>
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Point de Vente</label>
                    <select
                        value={filterStore}
                        onChange={(e) => setFilterStore((e.target as HTMLSelectElement).value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full md:w-48 p-2.5"
                    >
                        <option value="Tous">Tous</option>
                        {uniqueStores.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Filtre Type</label>
                    <select
                        value={filterAnomaly}
                        onChange={(e) => setFilterAnomaly((e.target as HTMLSelectElement).value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg block w-full md:w-48 p-2.5"
                    >
                        <option value="Tous">Tous</option>
                        <option value="Avant">Photos Avant</option>
                        <option value="Apres">Photos Après</option>
                        <option value="Anomalie">Ruptures</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map(photo => (
                    <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition">
                        <div className="h-48 overflow-hidden relative">
                            <img src={photo.url} alt={photo.anomalyType} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-2 right-2 flex gap-1">
                                {photo.anomalyType === 'Avant' && (
                                    <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-sm font-bold tracking-wider">AVANT</span>
                                )}
                                {photo.anomalyType === 'Apres' && (
                                    <span className="bg-green-600 text-white text-[10px] px-2 py-1 rounded shadow-sm font-bold tracking-wider">APRÈS</span>
                                )}
                                {/* Fallback for mocks */}
                                {['Rupture', 'Prix', 'PLV'].includes(photo.anomalyType) && (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-sm font-bold">{photo.anomalyType}</span>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm truncate w-2/3">{photo.store}</h3>
                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{photo.date}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                                <User size={12} /> {photo.merch}
                            </p>
                            {photo.comment && (
                                <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs text-gray-600 dark:text-gray-300 italic border border-gray-100 dark:border-gray-600 truncate">
                                    "{photo.comment}"
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filteredPhotos.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
                        <ImageIcon size={48} className="mb-3 opacity-20" />
                        <p>Aucune photo trouvée pour ces filtres.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- TEAM VIEW (Updated for Hierarchy) ---
const TeamView = ({
    isAdmin,
    merchandisers,
    onAddMerchandiser,
    managers,
    onAddManager
}: {
    isAdmin: boolean,
    merchandisers: MerchandiserProfile[],
    onAddMerchandiser: (m: MerchandiserProfile) => void,
    managers: ManagerProfile[],
    onAddManager: (m: ManagerProfile) => void
}) => {
    const [viewType, setViewType] = useState<'MERCH' | 'SUPERVISOR'>('MERCH');
    const [showAddForm, setShowAddForm] = useState(false);

    // Common state for adding user
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', region: '' });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (viewType === 'MERCH') {
            if (merchandisers.length >= 3) {
                alert("Limite atteinte : Vous ne pouvez créer que 3 merchandisers dans la version d'essai.");
                return;
            }
            onAddMerchandiser({
                id: `m-${Date.now()}`,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                phone: newUser.phone,
                zone: newUser.region,
                active: true
            });
        } else {
            onAddManager({
                id: `mgr-${Date.now()}`,
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: 'SUPERVISOR',
                region: newUser.region,
                active: true
            });
        }
        setShowAddForm(false);
        setNewUser({ name: '', email: '', password: '', phone: '', region: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {isAdmin ? 'Gestion des Équipes' : 'Mon Équipe'}
                </h2>
            </div>

            {isAdmin && (
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button
                        onClick={() => setViewType('MERCH')}
                        className={`pb-2 px-4 font-medium transition whitespace-nowrap ${viewType === 'MERCH' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Merchandisers
                    </button>
                    <button
                        onClick={() => setViewType('SUPERVISOR')}
                        className={`pb-2 px-4 font-medium transition whitespace-nowrap ${viewType === 'SUPERVISOR' ? 'border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Superviseurs
                    </button>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700 transition shadow-sm w-full md:w-auto justify-center"
                >
                    <UserPlus size={18} />
                    {viewType === 'MERCH' ? 'Ajouter Merchandiser' : 'Ajouter Superviseur'}
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-brand-100 dark:border-brand-900 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
                        {viewType === 'MERCH' ? 'Nouveau Merchandiser' : 'Nouveau Superviseur'}
                    </h3>
                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            required placeholder="Nom complet"
                            className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newUser.name} onChange={(e: any) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <input
                            required type="email" placeholder="Email professionnel"
                            className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newUser.email} onChange={(e: any) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <input
                            required type="password" placeholder="Mot de passe"
                            className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newUser.password} onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <input
                            placeholder="Téléphone (Optionnel)"
                            className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newUser.phone} onChange={(e: any) => setNewUser({ ...newUser, phone: e.target.value })}
                        />
                        <input
                            required placeholder={viewType === 'MERCH' ? "Zone / Secteur" : "Région attribuée"}
                            className="p-3 border rounded-lg md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newUser.region} onChange={(e: any) => setNewUser({ ...newUser, region: e.target.value })}
                        />
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
                            <button type="submit" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium w-full md:w-auto">Créer le compte</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(viewType === 'MERCH' ? merchandisers : managers).map((user: MerchandiserProfile | ManagerProfile) => (
                    <div key={user.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-start gap-4 hover:shadow-md transition relative overflow-hidden">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${viewType === 'SUPERVISOR' ? 'bg-purple-500' : 'bg-brand-500'}`}>
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{user.name}</h3>
                                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${user.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </div>
                            <div className="space-y-2 mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
                                    <Briefcase size={14} className="flex-shrink-0" /> {viewType === 'SUPERVISOR' ? 'Superviseur' : 'Merchandiser'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
                                    <MapPin size={14} className="flex-shrink-0" /> {(user as MerchandiserProfile).zone || (user as ManagerProfile).region}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 truncate">
                                    <Mail size={14} className="flex-shrink-0" /> {user.email}
                                </p>
                            </div>
                        </div>
                        {/* Footer Line Color */}
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${viewType === 'SUPERVISOR' ? 'bg-purple-500' : 'bg-brand-500'}`}></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const StoresView = ({ stores, onAddStore, onDeleteStore, currentUser }: { stores: Store[], onAddStore: (s: Store) => void, onDeleteStore: (id: string) => void, currentUser: MerchandiserProfile | ManagerProfile | null }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStore, setNewStore] = useState({ name: '', address: '', lat: '', lng: '' });

    const handleAddStore = (e: React.FormEvent) => {
        e.preventDefault();
        const store: Store = {
            id: `s-${Date.now()}`,
            name: newStore.name,
            address: newStore.address,
            lat: parseFloat(newStore.lat),
            lng: parseFloat(newStore.lng),
            owner_id: currentUser?.id
        };
        onAddStore(store); // Call parent function
        setShowAddModal(false);
        setNewStore({ name: '', address: '', lat: '', lng: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Magasins & Points GPS</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm text-sm md:text-base"
                >
                    <Plus size={18} />
                    <span className="hidden md:inline">Ajouter un Magasin</span>
                    <span className="md:hidden">Ajouter</span>
                </button>
            </div>

            {/* Add Store Modal (Inline for simplicity) */}
            {showAddModal && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 mb-6 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Nouveau Point de Vente</h3>
                    <form onSubmit={handleAddStore} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du Magasin</label>
                            <input required value={newStore.name} onChange={(e: any) => setNewStore({ ...newStore, name: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Ex: Carrefour Market Alger Centre" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Complète</label>
                            <input required value={newStore.address} onChange={(e: any) => setNewStore({ ...newStore, address: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Adresse postale" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                            <input required type="number" step="any" value={newStore.lat} onChange={(e: any) => setNewStore({ ...newStore, lat: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="36.75..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                            <input required type="number" step="any" value={newStore.lng} onChange={(e: any) => setNewStore({ ...newStore, lng: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="3.05..." />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Annuler</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Enregistrer GPS</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-200 uppercase bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Nom</th>
                                <th className="px-6 py-3 whitespace-nowrap">Adresse</th>
                                <th className="px-6 py-3 whitespace-nowrap">Latitude</th>
                                <th className="px-6 py-3 whitespace-nowrap">Longitude</th>
                                <th className="px-6 py-3 text-center whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map(store => (
                                <tr key={store.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{store.name}</td>
                                    <td className="px-6 py-4">{store.address}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">{store.lat}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">{store.lng}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => onDeleteStore(store.id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const DispatchingView = ({ merchandisers, stores, visits, onAddVisit }: { merchandisers: MerchandiserProfile[], stores: Store[], visits: Visit[], onAddVisit: (v: Visit) => void }) => {
    const [selectedMerch, setSelectedMerch] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    // Filter only planned visits for display (optional)
    const plannedVisits = visits.filter(v => v.status === VisitStatus.TODO);

    const handleDispatch = (e: React.FormEvent) => {
        e.preventDefault();
        const store = stores.find(s => s.id === selectedStore);
        const merch = merchandisers.find(m => m.id === selectedMerch);

        if (!store || !merch) return;

        const newVisit: Visit = {
            id: `v-${Date.now()}`,
            merchandiserId: merch.id, // Assign to specific merchandiser
            storeId: store.id,
            store: store,
            scheduledStart: new Date(selectedDate).toISOString(),
            scheduledEnd: new Date(selectedDate).toISOString(), // simplified
            status: VisitStatus.TODO,
            tasks: [
                { id: `t-${Date.now()}-1`, type: 'PHOTO', title: 'Photo Rayon', completed: false, required: true },
                { id: `t-${Date.now()}-2`, type: 'FORM', title: 'Rapport Visite', completed: false, required: true },
            ]
        };

        onAddVisit(newVisit); // Call global add function
        alert(`Mission attribuée à ${merch.name} pour le magasin ${store.name} !`);
        // Reset form
        setSelectedStore('');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dispatching & Planification</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Créer une Mission</h3>
                        <form onSubmit={handleDispatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">1. Choisir Merchandiser</label>
                                <select required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedMerch} onChange={(e: any) => setSelectedMerch(e.target.value)}>
                                    <option value="">Sélectionner...</option>
                                    {merchandisers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2. Choisir Magasin</label>
                                <select required className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedStore} onChange={(e: any) => setSelectedStore(e.target.value)}>
                                    <option value="">Sélectionner...</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">3. Date de visite</label>
                                <input required type="date" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedDate} onChange={(e: any) => setSelectedDate(e.target.value)} />
                            </div>
                            <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition mt-4 flex justify-center items-center gap-2">
                                <Send size={18} />
                                Attribuer la mission
                            </button>
                        </form>
                    </div>
                </div>

                {/* Calendar / List Visualization (Simplified) */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Missions Planifiées (Cette semaine)</h3>

                        {plannedVisits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600">
                                <Calendar size={48} className="mb-4 opacity-20" />
                                <p>Aucune mission en attente.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {plannedVisits.map((visit, idx) => {
                                    const merchName = merchandisers.find(m => m.id === visit.merchandiserId)?.name || "Inconnu";
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border-l-4 border-l-blue-500 transition">
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-white">{visit.store.name}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Clock size={14} /> {new Date(visit.scheduledStart).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">Attribué à: <strong>{merchName}</strong></span>
                                                <button className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesktopApp;