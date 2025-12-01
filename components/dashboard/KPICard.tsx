import React from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    desc: string;
    trend: 'up' | 'down' | 'neutral';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, desc, trend }) => (
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
);
