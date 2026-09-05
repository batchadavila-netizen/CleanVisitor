import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchWithAuth } from './services/apiClient'; 

const schema = z.object({
    email: z.string().email("Adresse email invalide"),
});

const ForgotPasswordForm = ({ onBack }) => {
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        try {
            // 🟢 Utilisation de fetchWithAuth pour cibler automatiquement Render en production
            await fetchWithAuth('/api/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: data.email }),
            });
            
            setSentEmail(data.email);
            setSent(true);
            toast.success("Email envoyé !");
        } catch {
            toast.error("Erreur lors de l'envoi.");
        }
    };

    return (
        <div className="animate-in slide-in-from-right duration-300">
            <Toaster position="top-right" />

            {sent ? (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
                    <h3 className="font-semibold text-slate-800 text-lg">Email envoyé !</h3>
                    <p className="text-slate-500 text-sm">
                        Si <strong>{sentEmail}</strong> est associé à un compte, vous recevrez un lien dans quelques minutes.
                    </p>
                    <p className="text-slate-400 text-xs">Le lien expire dans 1 heure.</p>
                    <button onClick={onBack} className="text-sm font-bold text-blue-600 hover:underline">
                        ← Retour à la connexion
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Adresse Email</label>
                        <input {...register('email')} type="email" placeholder="votre@email.com"
                            className={`w-full px-4 py-3 rounded-xl border outline-none focus:border-blue-500 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <span>⚠️</span> {errors.email.message}
                            </p>
                        )}
                    </div>

                    <button type="submit" disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-60">
                        {isSubmitting ? "Envoi en cours..." : "Envoyer le lien"}
                    </button>

                    <div className="text-center">
                        <button type="button" onClick={onBack}
                            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                            ← Retour à la connexion
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ForgotPasswordForm;