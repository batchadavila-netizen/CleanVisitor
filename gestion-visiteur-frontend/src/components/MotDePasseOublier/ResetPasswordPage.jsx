import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(6, "Veuillez confirmer votre mot de passe"),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠️</span> {error}
            </p>
        )}
    </div>
);

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        try {
            await axios.post('http://localhost:5283/api/auth/reset-password', {
                email, token, newPassword: data.newPassword
            });
            toast.success("Mot de passe réinitialisé !");
            setTimeout(() => navigate('/login'), 2000);
        } catch {
            toast.error("Lien invalide ou expiré.");
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-red-500 font-bold">Lien invalide.</p>
                    <button onClick={() => navigate('/login')} className="mt-4 text-blue-600 font-bold hover:underline">
                        Retour à la connexion
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Toaster position="top-right" />
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 border border-slate-100">
                <div className="mb-8 text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
                    <h2 className="text-2xl font-semibold text-slate-800">Nouveau mot de passe</h2>
                    <p className="text-slate-400 text-sm mt-1">Choisissez un mot de passe sécurisé</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <Field label="Nouveau mot de passe" error={errors.newPassword?.message}>
                        <div className="relative">
                            <input {...register('newPassword')}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`w-full border rounded-xl p-4 outline-none font-medium text-slate-700 focus:ring-2 ring-blue-500/20 transition-colors ${errors.newPassword ? 'border-red-400 bg-red-50' : 'bg-slate-50 border-slate-200'}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                {showPassword ? "Cacher" : "Voir"}
                            </button>
                        </div>
                    </Field>

                    <Field label="Confirmer le mot de passe" error={errors.confirmPassword?.message}>
                        <input {...register('confirmPassword')}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full border rounded-xl p-4 outline-none font-medium text-slate-700 focus:ring-2 ring-blue-500/20 transition-colors ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'bg-slate-50 border-slate-200'}`}
                        />
                    </Field>

                    <button type="submit" disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSubmitting ? "Enregistrement..." : "Confirmer"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;