'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ClipboardList, MapPin, User, Plus } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-end py-2 fixed bottom-0 w-full z-50 transition-colors duration-300 safe-area-bottom pb-safe">
            <Link
                href="/app"
                className={`flex flex-col items-center pb-1 ${isActive('/app') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <Menu size={24} />
                <span className="text-[10px] mt-1">Accueil</span>
            </Link>
            <Link
                href="/app/visits"
                className={`flex flex-col items-center pb-1 ${isActive('/app/visits') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <ClipboardList size={24} />
                <span className="text-[10px] mt-1">Tournée</span>
            </Link>

            {/* Central FAB for Add Mission */}
            <div className="relative -top-5">
                <Link
                    href="/app/add"
                    className="bg-brand-600 dark:bg-brand-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-50 dark:border-gray-900 hover:bg-brand-700 dark:hover:bg-brand-600 transition active:scale-95"
                >
                    <Plus size={28} />
                </Link>
            </div>

            <Link
                href="/app/map"
                className={`flex flex-col items-center pb-1 ${isActive('/app/map') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <MapPin size={24} />
                <span className="text-[10px] mt-1">Carte</span>
            </Link>
            <Link
                href="/app/profile"
                className={`flex flex-col items-center pb-1 ${isActive('/app/profile') ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
                <User size={24} />
                <span className="text-[10px] mt-1">Profil</span>
            </Link>
        </nav>
    );
}
