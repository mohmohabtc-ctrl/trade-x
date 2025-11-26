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
    const [emailSent, setEmailSent] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Insert Lead (Keep this for CRM purposes)
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

        // 2. Sign Up with Supabase Auth (Manager Account)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    role: 'SUPERVISOR', // Default role for trial
                    zone: 'Global',
                    phone: formData.phone
                }
            }
        });

        if (authError) {
            console.error('Error signing up:', authError);
            alert(`Erreur lors de l'inscription: ${authError.message}`);
            setLoading(false);
            return;
        }

        // 3. Create Merchandiser Account (Mobile)
        const merchEmail = `mobile.${formData.email}`;
        const { error: merchAuthError } = await supabase.auth.signUp({
            email: merchEmail,
            password: formData.password,
            options: {
                data: {
                    name: `Merch ${formData.firstName}`,
                    role: 'MERCHANDISER',
                    zone: 'Terrain',
                    phone: formData.phone
                }
            }
        });

        if (merchAuthError) {
            console.error('Error creating merch account:', merchAuthError);
        }

        setLoading(false);
        setEmailSent(true);
    };

    if (emailSent) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Vérifiez votre email</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Un lien de confirmation a été envoyé à <span className="font-bold">{formData.email}</span>.
                        <br />Veuillez cliquer dessus pour activer votre période d'essai de 7 jours.
                    </p>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800 text-left mb-6">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note :</strong> Un compte "Merchandiser" a également été pré-créé pour vos tests mobile :
                            <br />Email : <code>mobile.{formData.email}</code>
                            <br />Mot de passe : (celui que vous avez choisi)
                            <br /><em>Vous devrez aussi confirmer cet email (si possible) ou utiliser le compte Manager pour tout gérer.</em>
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-bold shadow-sm transition"
                    >
                        Fermer
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
