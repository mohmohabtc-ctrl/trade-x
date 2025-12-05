'use client'

import React, { useState, useEffect } from 'react';
import { Zap, Moon, Sun, Loader2, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Login successful
            console.log('Login success:', data);

            // Role-based redirection
            if (data.user?.role === 'MERCHANDISER') {
                router.push('/app');
            } else {
                router.push('/dashboard');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <Link
                href="/"
                className="absolute top-4 left-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
            >
                <ArrowLeft size={20} /> Retour
            </Link>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-fade-in">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-600 text-white p-2 rounded-lg shadow-lg">
                            <Zap size={28} className="fill-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">TradeX <span className="text-red-600">Insights</span></h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase font-semibold">Espace Professionnel</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email professionnel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="nom@entreprise.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
