import React from 'react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => (
    <div className={`p-4 rounded-xl border ${color} flex items-center justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
            {icon}
        </div>
    </div>
);
