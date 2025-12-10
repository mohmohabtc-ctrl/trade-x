'use client'

import React, { useState, useEffect } from 'react';
import { Zap, Moon, Sun, Loader2, ArrowLeft, LogIn, Mail, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState('');
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

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetError('');
        setResetSuccess(false);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw error;
            }

            setResetSuccess(true);
            setResetEmail('');
        } catch (err: any) {
            console.error('Password reset error:', err);
            setResetError(err.message || 'Erreur lors de l\'envoi de l\'email');
        } finally {
            setResetLoading(false);
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
                    <Image
                        src="/tradex-logo.png"
                        alt="TradeX"
                        width={180}
                        height={60}
                        className="h-16 w-auto object-contain"
                    />
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
                        className="w-full bg-[#15398c] hover:bg-[#102a6b] text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                        Se connecter
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-[#15398c] hover:text-[#102a6b] dark:text-blue-400 dark:hover:text-blue-300 transition"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                </form>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-slide-up">
                        <button
                            onClick={() => {
                                setShowForgotPassword(false);
                                setResetSuccess(false);
                                setResetError('');
                                setResetEmail('');
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Mail className="text-[#15398c] dark:text-blue-400" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Réinitialiser le mot de passe
                            </h2>
                        </div>

                        {resetSuccess ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg">
                                    <p className="font-medium mb-2">✅ Email envoyé !</p>
                                    <p className="text-sm">
                                        Vérifiez votre boîte mail. Nous vous avons envoyé un lien pour réinitialiser votre mot de passe.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setResetSuccess(false);
                                    }}
                                    className="w-full bg-[#15398c] hover:bg-[#102a6b] text-white py-3 rounded-lg font-bold transition"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </p>

                                {resetError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                                        {resetError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email professionnel
                                    </label>
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="nom@entreprise.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#15398c] hover:bg-[#102a6b] text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={20} />
                                            Envoyer le lien
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
