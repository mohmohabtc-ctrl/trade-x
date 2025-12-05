'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { UserRole } from '@/utils/types';
import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    Calendar,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Sun,
    Moon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<UserRole>(UserRole.MERCHANDISER);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    useEffect(() => {
        const checkUser = async () => {
            // 1. Check for Demo Cookie (Client Side)
            const demoCookie = document.cookie.split('; ').find(row => row.startsWith('tradeX_demo_user='));
            if (demoCookie) {
                const userData = JSON.parse(decodeURIComponent(demoCookie.split('=')[1]));
                console.log("🍪 Demo User found in cookie:", userData);
                setUser(userData);
                setRole(userData.role === 'ADMIN' ? UserRole.ADMIN :
                    (userData.role === 'MANAGER' || userData.role === 'SUPERVISOR') ? UserRole.MANAGER :
                        UserRole.MERCHANDISER);
                return;
            }

            // 2. Check Supabase Auth
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                // Fetch profile
                const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
                if (profile) {
                    setUser(profile);
                    const userRole = profile.role === 'ADMIN' ? UserRole.ADMIN :
                        (profile.role === 'MANAGER' || profile.role === 'SUPERVISOR') ? UserRole.MANAGER :
                            UserRole.MERCHANDISER;
                    setRole(userRole);

                    // Redirect Merchandisers to App
                    if (userRole === UserRole.MERCHANDISER) {
                        router.push('/app');
                    }
                } else {
                    setUser(authUser); // Fallback
                }
            } else {
                router.push('/login');
            }
        };

        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear demo cookie
        document.cookie = "tradeX_demo_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', href: '/dashboard' },
        { icon: <Calendar size={20} />, label: 'Dispatching', href: '/dashboard/dispatch' },
        { icon: <Store size={20} />, label: 'Magasins & GPS', href: '/dashboard/stores' },
        { icon: <Package size={20} />, label: 'Produits', href: '/dashboard/products' },
        { icon: <Users size={20} />, label: 'Équipe', href: '/dashboard/team' },
        { icon: <FileText size={20} />, label: 'Rapports Admin', href: '/dashboard/admin' },
        { icon: <Settings size={20} />, label: 'Galerie Photos', href: '/dashboard/gallery' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
                            <div className="bg-red-600 text-white p-1 rounded">T</div>
                            TradeX
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'Utilisateur'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut size={18} /> Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
