import React from 'react';
import { BottomNav } from '@/components/mobile/BottomNav';

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
