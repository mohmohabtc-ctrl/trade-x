/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Clock, AlertCircle, Camera, ClipboardList, Box, Navigation, Menu, User, LogOut, ChevronLeft, Upload, Plus, Calendar, Eye, AlertTriangle, FileImage, Map, Play, CheckSquare, Save, Timer, Crosshair, X, Trash2, Moon, Sun, Loader2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Visit, VisitStatus, Task, MerchandiserProfile, Store, Product } from '../types';
import { supabase } from '../supabaseClient';

interface MobileAppProps {
    onLogout: () => void;
    currentUser: MerchandiserProfile | null;
    allVisits: Visit[]; // Receive all global visits
    onUpdateVisit: (v: Visit) => void;
    onAddVisit: (v: Visit) => void;
    onUpdateStore?: (s: Store) => void; // Optional prop for updating store data
    products: Product[];
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const MobileApp: React.FC<MobileAppProps> = ({ onLogout, currentUser, allVisits, onUpdateVisit, onAddVisit, onUpdateStore, products, isDarkMode, toggleDarkMode }) => {
    const [view, setView] = useState<'HOME' | 'ROUTE' | 'VISIT' | 'ADD_MISSION' | 'MAP'>('HOME');
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

    // FILTER: Only show visits assigned to THIS currentUser
    const myVisits = allVisits.filter(v => v.merchandiserId === currentUser?.id);

    // Emulate simple navigation
    const navigateToVisit = (visit: Visit) => {
        setSelectedVisit(visit);
        setView('VISIT');
    };

    const goBack = () => {
        setView('ROUTE');
        setSelectedVisit(null);
    };

    const handleAddMission = (missionData: any) => {
        // Create a new Visit object based on form data
        const newVisit: Visit = {
            id: `v-${Date.now()}`,
            merchandiserId: currentUser?.id || 'unknown', // Auto-assign to self
            storeId: `s-${Date.now()}`,
            store: {
                id: `s-${Date.now()}`,
                name: missionData.storeName,
                address: missionData.city,
                lat: 0,
                lng: 0
            },
            scheduledStart: new Date().toISOString(), // Starts now
            scheduledEnd: new Date(Date.now() + 3600000).toISOString(), // +1 hour
            status: VisitStatus.TODO,
            tasks: [
                // Default tasks for a spontaneous mission
                {
                    id: `t-${Date.now()}-1`,
                    type: 'FORM',
                    title: 'Rapport de Mission Spontanée',
                    completed: false,
                    required: true,
                    data: {
                        dlc: '',
                        veille: '',
                        rupture: ''
                    }
                },
                {
                    id: `t-${Date.now()}-2`,
                    type: 'PHOTO',
                    title: 'Photo Preuve de passage',
                    completed: false,
                    required: true
                }
            ]
        };

        onAddVisit(newVisit); // Add to global state
        setView('ROUTE');
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full md:h-screen md:max-w-md md:mx-auto md:shadow-2xl md:overflow-hidden md:border border-gray-200 dark:border-gray-800 font-sans transition-colors duration-300 bg-gray-50 dark:bg-gray-900 relative">
            {/* Mobile Header */}
            <header className="bg-brand-700 dark:bg-brand-900 text-white p-4 flex justify-between items-center shadow-md z-10 transition-colors duration-300 shrink-0">
                {view === 'VISIT' || view === 'ADD_MISSION' ? (
                    <button onClick={() => setView('HOME')} className="flex items-center text-white">
                        <ChevronLeft size={24} />
                        <span className="ml-1 font-semibold">Retour</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {/* Logo TradeX Image */}
                        <img src="/logo.png" alt="TradeX Logo" className="h-8 w-auto object-contain" />
                    </div>
                )}
                <div className="flex gap-3 items-center">
                    <button onClick={toggleDarkMode} className="p-1">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="p-1" onClick={onLogout} title="Logout"><LogOut size={20} /></button>
                </div>
            </header >

            {/* Main Content Area */}
            < main className="flex-1 overflow-y-auto pb-20 custom-scrollbar bg-gray-50 dark:bg-gray-900" >
                {view === 'HOME' && <DashboardHome user={currentUser} onNavigateToRoute={() => setView('ROUTE')} onNavigateToAddMission={() => setView('ADD_MISSION')} visitedCount={myVisits.filter(v => v.status === VisitStatus.COMPLETED).length} totalCount={myVisits.length} />}

                {view === 'ROUTE' && <RouteList visits={myVisits} onSelectVisit={navigateToVisit} onUpdateVisit={onUpdateVisit} products={products} />}

                {view === 'VISIT' && selectedVisit && <VisitExecution visit={selectedVisit} onUpdateVisit={onUpdateVisit} onComplete={goBack} onUpdateStore={onUpdateStore} products={products} />}

                {view === 'ADD_MISSION' && <AddMissionForm onCancel={() => setView('HOME')} onSave={handleAddMission} />}

                {view === 'MAP' && <MapView visits={myVisits} />}
            </main >

            {/* Bottom Navigation Bar */}
            < nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-end py-2 absolute bottom-0 w-full z-20 transition-colors duration-300 safe-area-bottom" >
                <button
                    onClick={() => setView('HOME')}
                    className={`flex flex-col items-center pb-1 ${view === 'HOME' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <Menu size={24} />
                    <span className="text-[10px] mt-1">Accueil</span>
                </button>
                <button
                    onClick={() => setView('ROUTE')}
                    className={`flex flex-col items-center pb-1 ${view === 'ROUTE' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <ClipboardList size={24} />
                    <span className="text-[10px] mt-1">Tournée</span>
                </button>

                {/* Central FAB for Add Mission */}
                <div className="relative -top-5">
                    <button
                        onClick={() => setView('ADD_MISSION')}
                        className="bg-brand-600 dark:bg-brand-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-50 dark:border-gray-900 hover:bg-brand-700 dark:hover:bg-brand-600 transition active:scale-95"
                    >
                        <Plus size={28} />
                    </button>
                </div>

                <button
                    onClick={() => setView('MAP')}
                    className={`flex flex-col items-center pb-1 ${view === 'MAP' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <MapPin size={24} />
                    <span className="text-[10px] mt-1">Carte</span>
                </button>
                <button className="flex flex-col items-center pb-1 text-gray-400 dark:text-gray-500">
                    <User size={24} />
                    <span className="text-[10px] mt-1">Profil</span>
                </button>
            </nav >
        </div >
    );
};

// Sub-component: Dashboard Home
const DashboardHome = ({ user, onNavigateToRoute, onNavigateToAddMission, visitedCount, totalCount }: { user: MerchandiserProfile | null, onNavigateToRoute: () => void, onNavigateToAddMission: () => void, visitedCount: number, totalCount: number }) => {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="p-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bonjour, {user?.name || 'Merchandiser'}</h2>
                <p className="text-gray-500 dark:text-gray-400 capitalize">{today}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{visitedCount}/{totalCount}</span>
                    <span className="text-sm text-blue-600 dark:text-blue-300">Visites terminées</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-orange-700 dark:text-orange-400">45m</span>
                    <span className="text-sm text-orange-600 dark:text-orange-300">Prochaine visite</span>
                </div>
            </div>

            {/* Quick Action Card */}
            <button onClick={onNavigateToAddMission} className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group active:scale-95 transition">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full text-brand-600 dark:text-brand-400">
                        <Plus size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800 dark:text-white">Ajouter une mission</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Créer une visite spontanée</p>
                    </div>
                </div>
                <ChevronLeft size={20} className="transform rotate-180 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    {/* Fake Map */}
                    <img src="https://picsum.photos/800/400?grayscale" className="w-full h-full object-cover opacity-50 dark:opacity-30" alt="Map" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                            <Navigation size={16} className="text-blue-600 dark:text-blue-400" /> Itinéraire vers Super U
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <button onClick={onNavigateToRoute} className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition">
                        Voir ma tournée
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Map View
const MapView = ({ visits }: { visits: Visit[] }) => {
    const openMaps = (address: string) => {
        // Opens Google Maps with the query
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ma Carte</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Vos points de vente à visiter.</p>
            </div>

            <div className="flex-1 relative bg-slate-100 dark:bg-slate-900">
                {/* Simulated Map */}
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
                    className="w-full h-full object-cover opacity-20 dark:invert dark:opacity-10"
                    alt="Map Background"
                />

                {/* Fake Markers based on index to simulate scatter */}
                <div className="absolute inset-0">
                    {visits.map((visit, i) => (
                        <div
                            key={visit.id}
                            onClick={() => openMaps(visit.store.address)}
                            className="absolute flex flex-col items-center cursor-pointer transform hover:scale-110 transition"
                            style={{ top: `${30 + (i * 15)}%`, left: `${20 + (i * 20)}%` }}
                        >
                            <MapPin size={40} className={`drop-shadow-lg ${visit.status === 'COMPLETED' ? 'text-green-500 fill-green-100' : 'text-brand-600 fill-brand-100'}`} />
                            <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap mt-[-5px] z-10">
                                {visit.store.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* GPS FAB */}
                <div className="absolute bottom-6 right-6">
                    <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center">
                        <Navigation size={24} />
                    </button>
                </div>
            </div>

            {/* List Overlay */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                {visits.map(visit => (
                    <div key={visit.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${visit.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                <MapPin size={16} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{visit.store.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-48">{visit.store.address}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => openMaps(visit.store.address)}
                            className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        >
                            <Navigation size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sub-component: Add Mission Form
const AddMissionForm = ({ onCancel, onSave }: { onCancel: () => void, onSave: (data: any) => void }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        storeName: '',
        city: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSave(formData); // Pass the actual data back to parent
        }, 800);
    };

    const handleChange = (e: any) => {
        const target = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [target.name]: target.value
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="px-4 py-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nouvelle Mission</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ajoutez une visite à votre tournée actuelle. Vous remplirez les formulaires lors de la visite.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-24 space-y-6">
                {/* Section 1: Identification */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm uppercase tracking-wider">
                        <MapPin size={16} className="mr-2 text-brand-500" /> Localisation
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Magasin <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            type="text"
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white"
                            placeholder="Ex: Carrefour City"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ville <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            type="text"
                            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white"
                            placeholder="Ex: Lyon"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition flex justify-center items-center active:scale-95">
                    {loading ? (
                        <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Création...
                        </div>
                    ) : (
                        <>
                            <Plus size={20} className="mr-2" /> AJOUTER A LA TOURNÉE
                        </>
                    )}
                </button>

                <button type="button" onClick={onCancel} className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200">
                    Annuler
                </button>
            </form>
        </div>
    );
};

// Sub-component: Route List (UPDATED: Vertical Layout instead of Table)
const RouteList = ({ visits, onSelectVisit, onUpdateVisit, products }: { visits: Visit[], onSelectVisit: (v: Visit) => void, onUpdateVisit: (v: Visit) => void, products: Product[] }) => {
    const [savedId, setSavedId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const handleStatusChange = (visit: Visit, newStatus: VisitStatus) => {
        const now = new Date().toISOString();
        let updates: Partial<Visit> = { status: newStatus };

        if (newStatus === VisitStatus.IN_PROGRESS) {
            updates.checkInTime = now;
        } else if (newStatus === VisitStatus.COMPLETED) {
            updates.checkOutTime = now;
        }

        onUpdateVisit({ ...visit, ...updates });
    };

    const handleFieldChange = (visit: Visit, field: 'dlc' | 'veille' | 'rupture', value: string) => {
        onUpdateVisit({ ...visit, [field]: value });
    };

    const handleFileChange = async (visit: Visit, type: 'photoAvant' | 'photoApres', file: File | null) => {
        if (file) {
            setUploadingId(`${visit.id}-${type}`);
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
                onUpdateVisit({ ...visit, [type]: publicUrl });

            } catch (error) {
                console.error("Erreur d'upload:", error);
                alert("Erreur lors de l'envoi de la photo.");
            } finally {
                setUploadingId(null);
            }
        }
    };

    const handleManualSave = (visitId: string) => {
        setSavedId(visitId);
        setTimeout(() => setSavedId(null), 2000);
    }

    const formatTime = (isoDate?: string) => {
        if (!isoDate) return "--:--";
        return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const durationMins = Math.round((endTime - startTime) / 60000);
        return durationMins;
    }

    return (
        <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Rapports de Mission</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">{visits.length} visites</span>
            </div>

            {visits.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">Aucune visite prévue.</div>
            )}

            {/* VERTICAL CARDS LAYOUT */}
            <div className="space-y-4 pb-8">
                {visits.map((visit) => {
                    const city = visit.store.address.split(',').pop()?.trim() || "Inconnue";
                    const duration = calculateDuration(visit.checkInTime, visit.checkOutTime);

                    return (
                        <div key={visit.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Header: Store & Status */}
                            <div
                                onClick={() => onSelectVisit(visit)}
                                className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-brand-600 dark:text-brand-400">#{visit.id.slice(0, 4)}</span>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{visit.store.name}</h3>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2 mt-1">
                                        <MapPin size={14} />
                                        <span className="truncate max-w-[200px]">{city}</span>
                                    </div>
                                </div>
                                <StatusBadge status={visit.status} />
                            </div>

                            {/* Time Info */}
                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs border-b border-gray-100 dark:border-gray-700">
                                {visit.status === 'TODO' && (
                                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> Prévu: {formatTime(visit.scheduledStart)}
                                    </span>
                                )}
                                {visit.status === 'IN_PROGRESS' && (
                                    <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                        <Timer size={12} /> Début: {formatTime(visit.checkInTime)}
                                    </span>
                                )}
                                {visit.status === 'COMPLETED' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {formatTime(visit.checkInTime)} - {formatTime(visit.checkOutTime)}
                                        </span>
                                        {duration !== null && (
                                            <span className="text-green-700 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <Timer size={10} /> {duration} min
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Collapsible Content Area */}
                            <div className="p-4 space-y-4">
                                {/* INPUTS ROW 1: DLC & Rupture */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block">DLC</label>
                                        <input
                                            type="text"
                                            value={visit.dlc || ''}
                                            onChange={(e) => handleFieldChange(visit, 'dlc', e.target.value)}
                                            placeholder="Saisir..."
                                            className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2 block">Ruptures (Cochez les produits)</label>
                                        <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
                                            {products.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-2">Aucun produit disponible.</p>
                                            ) : (
                                                products.map(product => {
                                                    const isChecked = (visit.ruptureItems || []).includes(product.id);
                                                    return (
                                                        <div key={product.id} className="flex items-center gap-2 py-1 border-b border-gray-100 dark:border-gray-600 last:border-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    const currentItems = visit.ruptureItems || [];
                                                                    let newItems;
                                                                    if (e.target.checked) {
                                                                        newItems = [...currentItems, product.id];
                                                                    } else {
                                                                        newItems = currentItems.filter(id => id !== product.id);
                                                                    }
                                                                    // Auto-update global rupture flag
                                                                    const hasRupture = newItems.length > 0 ? 'Oui' : 'Non';
                                                                    onUpdateVisit({ ...visit, ruptureItems: newItems, rupture: hasRupture });
                                                                }}
                                                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{product.name}</span>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* INPUT ROW 2: Veille */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1 block">Veille Concurrentielle</label>
                                    <input
                                        type="text"
                                        value={visit.veille || ''}
                                        onChange={(e) => handleFieldChange(visit, 'veille', e.target.value)}
                                        placeholder="Prix, Promo, Info..."
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* PHOTOS SECTION */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {/* Avant Photo */}
                                    <label className="flex flex-col cursor-pointer group">
                                        <div className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-2 h-20 transition ${visit.photoAvant ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            {uploadingId === `${visit.id}-photoAvant` ? (
                                                <Loader2 size={18} className="animate-spin text-brand-600" />
                                            ) : (
                                                <>
                                                    {visit.photoAvant ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 mb-1">PHOTO AVANT OK</span>
                                                            <span className="text-[9px] text-gray-400 underline">Modifier</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                                            <Camera size={18} className="mb-1" />
                                                            <span className="text-[10px]">Photo Avant</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" capture="environment" onChange={(e: any) => handleFileChange(visit, 'photoAvant', (e.target as HTMLInputElement).files?.[0] || null)} className="hidden" />
                                    </label>

                                    {/* Apres Photo */}
                                    <label className="flex flex-col cursor-pointer group">
                                        <div className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-2 h-20 transition ${visit.photoApres ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            {uploadingId === `${visit.id}-photoApres` ? (
                                                <Loader2 size={18} className="animate-spin text-green-600" />
                                            ) : (
                                                <>
                                                    {visit.photoApres ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-300 mb-1">PHOTO APRÈS OK</span>
                                                            <span className="text-[9px] text-gray-400 underline">Modifier</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                                            <Camera size={18} className="mb-1" />
                                                            <span className="text-[10px]">Photo Après</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" capture="environment" onChange={(e: any) => handleFileChange(visit, 'photoApres', (e.target as HTMLInputElement).files?.[0] || null)} className="hidden" />
                                    </label>
                                </div>

                                {/* ACTIONS FOOTER */}
                                <div className="flex gap-3 pt-2">
                                    {/* Save Button */}
                                    <button
                                        onClick={() => handleManualSave(visit.id)}
                                        className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition shadow-sm ${savedId === visit.id ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        {savedId === visit.id ? <CheckCircle size={16} /> : <Save size={16} />}
                                        {savedId === visit.id ? 'OK' : 'Sauvegarder'}
                                    </button>

                                    {/* Status Button */}
                                    {visit.status === 'TODO' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(visit, VisitStatus.IN_PROGRESS); }}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm"
                                        >
                                            <Play size={16} className="fill-current" /> Commencer
                                        </button>
                                    )}
                                    {visit.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(visit, VisitStatus.COMPLETED); }}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 shadow-sm"
                                        >
                                            <CheckSquare size={16} /> Terminer
                                        </button>
                                    )}
                                    {visit.status === 'COMPLETED' && (
                                        <button disabled className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                            Visite Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Utility function to calculate distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Sub-component: Location Picker Modal (Simulates Pinning Map)
const LocationPickerModal = ({ onClose, onConfirm }: { onClose: () => void, onConfirm: (lat: number, lng: number) => void }) => {
    const [currentPos, setCurrentPos] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(false);

    const getPosition = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            alert("Géolocalisation non supportée");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCurrentPos({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                console.error(err);
                alert("Erreur GPS");
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        getPosition();
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-0 md:p-4">
            <div className="bg-white dark:bg-gray-800 w-full h-full md:h-[80vh] md:max-w-md md:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Définir la position GPS</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                    {/* Simulated Map Background */}
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg"
                        className="w-full h-full object-cover opacity-30 dark:invert dark:opacity-10"
                        alt="Map"
                    />

                    {/* Crosshair / Pin Center */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative -top-4">
                            <MapPin size={48} className="text-red-600 fill-red-100 animate-bounce" />
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-black/30 rounded-full blur-[2px]"></div>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="absolute top-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow text-sm text-center border border-gray-200 dark:border-gray-700">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"><div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div> Localisation en cours...</span>
                        ) : currentPos ? (
                            <div className="font-mono text-xs">
                                <div className="font-bold text-gray-800 dark:text-white mb-1">Position trouvée :</div>
                                LAT: <span className="text-blue-600 dark:text-blue-400">{currentPos.lat.toFixed(6)}</span><br />
                                LNG: <span className="text-blue-600 dark:text-blue-400">{currentPos.lng.toFixed(6)}</span>
                            </div>
                        ) : (
                            <span className="text-red-500">Impossible de localiser</span>
                        )}
                    </div>

                    {/* Target Button */}
                    <button
                        onClick={getPosition}
                        className="absolute bottom-20 right-4 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white hover:text-blue-600 active:scale-95"
                    >
                        <Crosshair size={24} />
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
                    <button
                        onClick={() => currentPos && onConfirm(currentPos.lat, currentPos.lng)}
                        disabled={!currentPos}
                        className={`w-full py-3 rounded-xl font-bold text-lg shadow transition ${currentPos ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'}`}
                    >
                        CONFIRMER CETTE POSITION
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-component: Visit Execution (UPDATED: MAX_DISTANCE = 500)
const VisitExecution = ({ visit, onUpdateVisit, onComplete, onUpdateStore, products }: { visit: Visit, onUpdateVisit: (v: Visit) => void, onComplete: () => void, onUpdateStore?: (s: Store) => void, products: Product[] }) => {
    const [isCheckedIn, setIsCheckedIn] = useState(visit.status === 'IN_PROGRESS' || visit.status === 'COMPLETED');
    const [tasks, setTasks] = useState(visit.tasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [checkingLocation, setCheckingLocation] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Local state for the fields in this view
    const [reportData, setReportData] = useState({
        dlc: visit.dlc || '',
        veille: visit.veille || '',
        rupture: visit.rupture || ''
    });

    // Sync tasks if visit prop changes
    useEffect(() => {
        setTasks(visit.tasks);
        setIsCheckedIn(visit.status === 'IN_PROGRESS' || visit.status === 'COMPLETED');
        setReportData({
            dlc: visit.dlc || '',
            veille: visit.veille || '',
            rupture: visit.rupture || ''
        });
    }, [visit]);

    const handleCheckIn = () => {
        setCheckingLocation(true);
        setLocationError(null);

        // If the store coordinates are invalid or 0 (e.g. spontaneous mission), skip strict check
        // NOW: We enforce coordinate setting if missing!
        if (!visit.store.lat || !visit.store.lng) {
            // Should be handled by UI logic below (Location Picker), but fail-safe:
            setCheckingLocation(false);
            setShowLocationPicker(true);
            return;
        }

        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par votre appareil.");
            setCheckingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;

                // Allow check-in if within 500 meters (UPDATED)
                const distance = calculateDistance(currentLat, currentLng, visit.store.lat, visit.store.lng);
                const MAX_DISTANCE = 500;

                console.log(`Distance to store: ${distance.toFixed(2)} meters`);

                if (distance <= MAX_DISTANCE) {
                    confirmCheckIn();
                } else {
                    setLocationError(`Vous êtes trop loin (${distance.toFixed(0)}m). Rapprochez-vous à moins de ${MAX_DISTANCE}m du magasin.`);
                }
                setCheckingLocation(false);
            },
            (error) => {
                console.error(error);
                setLocationError("Impossible de récupérer votre position. Vérifiez vos paramètres GPS.");
                setCheckingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const confirmCheckIn = () => {
        setIsCheckedIn(true);
        onUpdateVisit({ ...visit, status: VisitStatus.IN_PROGRESS, checkInTime: new Date().toISOString() });
    };

    const handleUpdateGPS = (lat: number, lng: number) => {
        if (onUpdateStore) {
            const updatedStore = { ...visit.store, lat, lng };
            onUpdateStore(updatedStore);
            setShowLocationPicker(false);
            // The prop 'visit' will update via parent, triggering useEffect,
            // but we can clear any errors immediately
            setLocationError(null);
        }
    };

    const handleTaskClick = (task: Task) => {
        if (!isCheckedIn) return;
        setActiveTask(task);
    };

    const handleTaskCompletion = (data?: any) => {
        if (activeTask) {
            const updatedTasks = tasks.map(t => t.id === activeTask.id ? { ...t, completed: true, data: data } : t);
            setTasks(updatedTasks);
            onUpdateVisit({ ...visit, tasks: updatedTasks });
            setActiveTask(null);
        }
    };

    // Handle saving the local form fields (DLC, Veille, Rupture)
    const handleSaveReport = () => {
        // VALIDATION
        let newErrors: Record<string, string> = {};
        if (!reportData.rupture) newErrors.rupture = "Veuillez indiquer s'il y a une rupture.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        onUpdateVisit({
            ...visit,
            dlc: reportData.dlc,
            veille: reportData.veille,
            rupture: reportData.rupture
        });
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const handleDataChange = (field: string, value: string) => {
        setReportData({ ...reportData, [field]: value });
        if (errors[field]) {
            setErrors(prev => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
    }

    const handleFinishVisit = () => {
        onUpdateVisit({ ...visit, status: VisitStatus.COMPLETED, checkOutTime: new Date().toISOString() });
        onComplete();
    };

    const allRequiredDone = tasks.filter(t => t.required).every(t => t.completed);
    const hasGPS = visit.store.lat !== 0 && visit.store.lng !== 0;

    if (activeTask) {
        return (
            <TaskModule
                task={activeTask}
                onCancel={() => setActiveTask(null)}
                onSave={handleTaskCompletion}
            />
        )
    }

    return (
        <div className="p-4 h-full flex flex-col relative overflow-y-auto">
            {showLocationPicker && (
                <LocationPickerModal
                    onClose={() => setShowLocationPicker(false)}
                    onConfirm={handleUpdateGPS}
                />
            )}

            <div className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{visit.store.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{visit.store.address}</p>
            </div>

            {!isCheckedIn ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin size={48} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-xs">
                        Vous êtes à proximité du magasin. Veuillez confirmer votre arrivée.
                    </p>

                    {locationError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center w-full flex items-center justify-center gap-2">
                            <AlertTriangle size={16} />
                            {locationError}
                        </div>
                    )}

                    {!hasGPS ? (
                        <button
                            onClick={() => setShowLocationPicker(true)}
                            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin size={24} />
                                DÉFINIR POSITION GPS
                            </div>
                            <span className="text-xs font-normal opacity-90 mt-1">Coordonnées manquantes pour ce magasin</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleCheckIn}
                            disabled={checkingLocation}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform ${checkingLocation ? 'bg-gray-400 cursor-wait' : 'bg-brand-600 hover:bg-brand-700 active:scale-95 text-white'
                                }`}
                        >
                            {checkingLocation ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Vérification GPS...
                                </div>
                            ) : (
                                "CHECK-IN"
                            )}
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            <CheckCircle size={14} className="mr-1" /> Check-in validé
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Début: {visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* --- SECTION DONNEES TERRAIN --- */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md mb-6 space-y-4 relative overflow-hidden shrink-0">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <ClipboardList size={18} className="text-brand-500" /> Données Terrain
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">DLC</label>
                                <input
                                    value={reportData.dlc}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('dlc', e.target.value)}
                                    placeholder="Date/Info"
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rupture ? <span className="text-red-500">*</span></label>
                                <select
                                    value={reportData.rupture}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleDataChange('rupture', e.target.value)}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white ${errors.rupture ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="Non">Non</option>
                                    <option value="Oui">Oui</option>
                                </select>
                                {errors.rupture && <p className="text-red-500 text-xs mt-1">{errors.rupture}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Veille Concurrentielle</label>
                                <input
                                    value={reportData.veille}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDataChange('veille', e.target.value)}
                                    placeholder="Prix, Promo, Info..."
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Bouton de Sauvegarde EXPLICITE */}
                        <button
                            onClick={handleSaveReport}
                            className="w-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-700 py-3 rounded-lg font-bold text-sm hover:bg-brand-100 dark:hover:bg-brand-900/50 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                        >
                            <Save size={18} /> ENREGISTRER LES DONNÉES
                        </button>

                        {/* Message de succès temporaire */}
                        {showSaveSuccess && (
                            <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 flex items-center justify-center z-10 animate-fade-in rounded-xl">
                                <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                                    <CheckCircle size={48} className="mb-2" />
                                    <span className="font-bold text-lg">Données sauvegardées !</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white shrink-0">Tâches à réaliser</h3>
                    <div className="space-y-3 mb-8">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className={`p-4 rounded-xl border flex items-center justify-between transition ${task.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${task.completed ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        {task.type === 'PHOTO' && <Camera size={20} />}
                                        {task.type === 'FORM' && <ClipboardList size={20} />}
                                        {task.type === 'INVENTORY' && <Box size={20} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold ${task.completed ? 'text-green-800 dark:text-green-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</h4>
                                        {task.required && !task.completed && <span className="text-xs text-red-500 font-medium">* Obligatoire</span>}
                                    </div>
                                </div>
                                {task.completed && <CheckCircle size={20} className="text-green-600 dark:text-green-400" />}
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto shrink-0 pb-6">
                        <button
                            disabled={!allRequiredDone}
                            onClick={handleFinishVisit}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${allRequiredDone ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
                        >
                            TERMINER LA VISITE
                        </button>
                        {!allRequiredDone && <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">Complétez les tâches obligatoires pour finir.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component: Task Module (Generic for Photo/Form) with VALIDATION
const TaskModule = ({ task, onCancel, onSave }: { task: Task, onCancel: () => void, onSave: (data?: any) => void }) => {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // For spontaneous forms, initialize state with potentially existing data
    const [formData, setFormData] = useState(task.data || {
        dlc: '',
        veille: '',
        rupture: '',
        // For standard forms simulation
        q1: '',
        q2: '',
        q3: 0
    });

    const isSpontaneous = task.title.includes("Spontanée");

    // Validation logic
    const validate = () => {
        let newErrors: Record<string, string> = {};

        if (task.type === 'FORM') {
            if (isSpontaneous) {
                if (!formData.dlc) newErrors.dlc = "La DLC est obligatoire.";
                if (!formData.rupture) newErrors.rupture = "Le champ rupture doit être renseigné.";
            } else {
                // Standard Form Mock Validation
                if (!formData.q1) newErrors.q1 = "Veuillez sélectionner une option.";
                if (!formData.q2) newErrors.q2 = "Le nombre de facings est requis.";
            }
        }

        if (task.type === 'PHOTO' && !previewUrl && !task.data) {
            // Assuming task.data might hold previous photo
            // If it's a pure photo task without previous data, we could enforce it here.
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // Pass formData back if it's a form task
            onSave(task.type === 'FORM' ? formData : undefined);
        }, 800);
    }

    const handlePhotoSelect = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFormChange = (e: any) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        setFormData({
            ...formData,
            [target.name]: target.value
        });
        // Clear error when typing
        if (errors[target.name]) {
            setErrors(prev => {
                const newErr = { ...prev };
                delete newErr[target.name];
                return newErr;
            });
        }
    }

    return (
        <div className="p-4 h-full flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center mb-6 shrink-0">
                <button onClick={onCancel} className="mr-4 text-gray-600 dark:text-gray-400"><ChevronLeft /></button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Dynamic rendering based on task type and title */}

                {/* CAS 1: Formulaire Spontané (DLC, Veille, Rupture) */}
                {task.type === 'FORM' && isSpontaneous && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300 mb-4">
                            Veuillez compléter les informations terrain ci-dessous.
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <Calendar size={16} className="mr-2 text-brand-500" /> DLC (Date Limite) <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                name="dlc"
                                value={formData.dlc}
                                onChange={handleFormChange}
                                type="date"
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white ${errors.dlc ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                            />
                            {errors.dlc && <p className="text-red-500 text-xs mt-1">{errors.dlc}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <Eye size={16} className="mr-2 text-brand-500" /> Veille Concurrentielle
                            </label>
                            <textarea
                                name="veille"
                                value={formData.veille}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white"
                                rows={4}
                                placeholder="Relevé prix, nouvelles promotions concurrents..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <AlertTriangle size={16} className="mr-2 text-brand-500" /> Rupture Signalée <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                name="rupture"
                                value={formData.rupture}
                                onChange={handleFormChange}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 dark:text-white ${errors.rupture ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                                rows={4}
                                placeholder="Produits en rupture, durée estimée..."
                            ></textarea>
                            {errors.rupture && <p className="text-red-500 text-xs mt-1">{errors.rupture}</p>}
                        </div>
                    </div>
                )}

                {/* CAS 2: Formulaire Standard (Promo, Tête de gondole) */}
                {task.type === 'FORM' && !isSpontaneous && (
                    <div className="space-y-6 text-gray-800 dark:text-gray-200">
                        <div>
                            <label className="block font-medium mb-2">Le produit est-il en tête de gondole ? <span className="text-red-500">*</span></label>
                            <div className={`flex gap-4 p-2 rounded-lg ${errors.q1 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : ''}`}>
                                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg flex-1 justify-center cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-900/20">
                                    <input
                                        type="radio" name="q1" value="Oui" className="mr-2 accent-brand-600"
                                        checked={formData.q1 === 'Oui'}
                                        onChange={handleFormChange}
                                    /> Oui
                                </label>
                                <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg flex-1 justify-center cursor-pointer has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-brand-900/20">
                                    <input
                                        type="radio" name="q1" value="Non" className="mr-2 accent-brand-600"
                                        checked={formData.q1 === 'Non'}
                                        onChange={handleFormChange}
                                    /> Non
                                </label>
                            </div>
                            {errors.q1 && <p className="text-red-500 text-xs mt-1">{errors.q1}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Nombre de facings visibles <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="q2"
                                value={formData.q2}
                                onChange={handleFormChange}
                                className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white ${errors.q2 ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                                placeholder="0"
                            />
                            {errors.q2 && <p className="text-red-500 text-xs mt-1">{errors.q2}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Note de propreté (1-5)</label>
                            <div className="flex justify-between">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setFormData({ ...formData, q3: n })}
                                        className={`w-10 h-10 rounded-full font-bold transition ${formData.q3 === n ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:text-yellow-400'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CAS 3: Photo - ANTI-CHEAT ENABLED */}
                {task.type === 'PHOTO' && (
                    <div className="space-y-6 text-center pt-10">
                        <label className="block w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition relative overflow-hidden group">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment" // Forces rear camera on mobile
                                className="hidden"
                                onChange={handlePhotoSelect}
                            />

                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <span className="text-white font-bold flex items-center gap-2"><Camera /> Reprendre la photo</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-brand-100 dark:bg-brand-900/50 p-4 rounded-full mb-4">
                                        <Camera size={48} className="text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <p className="text-gray-800 dark:text-white font-bold text-lg">Prendre une photo</p>
                                    <p className="text-gray-400 text-sm mt-1">Caméra uniquement (Galerie désactivée)</p>
                                </>
                            )}
                        </label>

                        <textarea className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-gray-700 dark:text-white" placeholder="Ajouter un commentaire (optionnel)..." rows={3}></textarea>
                    </div>
                )}

                {/* CAS 4: Inventaire */}
                {task.type === 'INVENTORY' && (
                    <div className="space-y-6 text-center pt-10">
                        <div className="w-full p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                            <Box size={48} className="text-blue-500 mx-auto mb-2" />
                            <h3 className="font-bold text-blue-900 dark:text-blue-300">Scanner Code-Barre</h3>
                        </div>
                        <button className="flex items-center justify-center w-full py-3 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-500 rounded-lg font-bold">
                            <Camera size={20} className="mr-2" /> Scanner
                        </button>
                        <div className="relative border-t border-gray-200 dark:border-gray-700 my-4">
                            <span className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 px-2 text-gray-400 text-sm">OU</span>
                        </div>
                        <input type="number" className="w-full p-3 border rounded-lg text-center text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Saisir quantité manuellement" />
                    </div>
                )}
            </div>

            <button
                onClick={handleSave}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mt-4 flex items-center justify-center shrink-0 safe-area-bottom"
            >
                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'ENREGISTRER'}
            </button>
        </div>
    )
}

const StatusBadge = ({ status }: { status: VisitStatus }) => {
    switch (status) {
        case 'COMPLETED': return <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-1 rounded font-medium">Terminée</span>;
        case 'IN_PROGRESS': return <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-1 rounded font-medium">En cours</span>;
        case 'LATE': return <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-1 rounded font-medium">En retard</span>;
        default: return <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium">À faire</span>;
    }
};

export default MobileApp;