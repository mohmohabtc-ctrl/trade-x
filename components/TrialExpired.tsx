import React from 'react';
import { Lock, Phone, Mail, ExternalLink } from 'lucide-react';

const TrialExpired: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={40} className="text-red-600 dark:text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Période d'essai terminée</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Nous espérons que vous avez apprécié votre essai de TradeX Insights. Pour continuer à utiliser la plateforme, veuillez contacter notre équipe commerciale.
                </p>

                <div className="space-y-3">
                    <a
                        href="mailto:sales@tradex-insights.com"
                        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition"
                    >
                        <Mail size={18} /> Contacter les ventes
                    </a>

                    <a
                        href="tel:+213550000000"
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                    >
                        <Phone size={18} /> Appeler le support
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <p className="text-xs text-gray-400">
                        Vous avez déjà souscrit ? <a href="#" onClick={() => window.location.reload()} className="text-brand-600 hover:underline">Actualiser</a>
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('tradeX_trial_start');
                            localStorage.removeItem('tradeX_is_demo_user');
                            window.location.reload();
                        }}
                        className="text-xs text-gray-300 hover:text-gray-500 underline"
                    >
                        (Dev) Réinitialiser l'essai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialExpired;
