import React, { useState } from 'react';
import { X, Loader2, CheckCircle, User, Mail, Phone, MapPin, Building2, Lock, Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LeadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        password: ''
    });
    const [createdAccounts, setCreatedAccounts] = useState<{ manager: any, merch: any } | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Insert Lead
        const { error: leadError } = await supabase.from('leads').insert([
            {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                role: 'Prospect',
            }
        ]);

        if (leadError) console.error('Error submitting lead:', leadError);

        // 2. Create Manager Account
        const managerId = `mgr-${Date.now()}`;
        const managerUser = {
            id: managerId,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            zone: 'Global',
            role: 'SUPERVISOR',
            active: true
        };

        // 3. Create Merchandiser Account (Mobile)
        const merchId = `m-${Date.now()}`;
        const merchUser = {
            id: merchId,
            name: `Merch ${formData.firstName}`,
            email: `mobile.${formData.email}`, // Fake email for mobile login
            password: formData.password,
            phone: formData.phone,
            zone: 'Terrain',
            role: 'MERCHANDISER',
            active: true
        };

        // Insert Users
        const { error: userError } = await supabase.from('users').insert([managerUser, merchUser]);

        if (userError) {
            console.error('Error creating users:', userError);
            setLoading(false);
            return;
        }

        // Initialize Trial
        localStorage.setItem('tradeX_trial_start', new Date().toISOString());
        localStorage.setItem('tradeX_is_demo_user', 'true');

        setLoading(false);
        setCreatedAccounts({ manager: managerUser, merch: merchUser });
        // onSubmitSuccess(); // We wait for user to see credentials
    };

    if (createdAccounts) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Compte créé avec succès !</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Vous pouvez maintenant tester TradeX sur tous vos appareils.</p>

                    <div className="space-y-4 text-left">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Monitor size={20} className="text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-blue-900 dark:text-blue-300">Accès Manager (PC)</h3>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Email : <span className="font-mono font-bold">{createdAccounts.manager.email}</span></p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Mot de passe : <span className="font-mono font-bold">{createdAccounts.manager.password}</span></p>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Smartphone size={20} className="text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-purple-900 dark:text-purple-300">Accès Merchandiser (Mobile)</h3>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Email : <span className="font-mono font-bold">{createdAccounts.merch.email}</span></p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">Mot de passe : <span className="font-mono font-bold">{createdAccounts.merch.password}</span></p>
                        </div>
                    </div>

                    <button
                        onClick={onSubmitSuccess}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg mt-6 transition"
                    >
                        Commencer la démo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800">

                {/* Header */}
                <div className="bg-brand-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition bg-white/10 hover:bg-white/20 p-1 rounded-full"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold mb-2">Commencez votre essai gratuit</h2>
                    <p className="text-brand-100 text-sm">Remplissez ce formulaire pour accéder immédiatement à la démo.</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                        placeholder="Ali"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="Benamar"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email professionnel</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="ali@entreprise.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe (pour votre accès démo)</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="••••••••"
                                    minLength={4}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="05 50 ..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise</label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="SARL Distribution..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse (Wilaya / Commune)</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition dark:text-white"
                                    placeholder="Alger Centre"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Accéder à la démo"}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Vos données sont sécurisées et ne seront jamais partagées.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadFormModal;
