'use client';

import React from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();
                setUser(profile);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (!user) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mon Profil</h2>
            </div>

            <div className="p-4 space-y-6">
                <div className="flex flex-col items-center py-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-24 h-24 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                        <User size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded-full text-xs font-bold mt-2">
                        MERCHANDISER
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <Mail size={20} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Email</p>
                            <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                        </div>
                    </div>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <Phone size={20} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Téléphone</p>
                            <p className="text-gray-900 dark:text-white font-medium">{user.phone || 'Non renseigné'}</p>
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                        <MapPin size={20} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Zone</p>
                            <p className="text-gray-900 dark:text-white font-medium">{user.zone || 'Non assignée'}</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 py-4 rounded-xl font-bold text-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition flex justify-center items-center gap-2"
                >
                    <LogOut size={20} />
                    SE DÉCONNECTER
                </button>
            </div>
        </div>
    );
}
