import React, { useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/authService';
import { visitorService } from '../../services/visitorService';

// Schéma de validation
const createSchema = (isEditMode) => z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 4 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 4 caractères"),
    telephone: z.string().min(9, "Le numéro doit contenir au moins 9 chiffres"),
    email: isEditMode
        ? z.string().email("Email invalide").optional().or(z.literal(''))
        : z.string().email("Email invalide"),
    password: isEditMode
        ? z.string().min(6, "Minimum 6 caractères").optional().or(z.literal(''))
        : z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    role: z.string().optional()
});

// Composant champ avec erreur
const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                <span>⚠️</span> {error}
            </p>
        )}
    </div>
);

const Inscription = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const visitorToEdit = location.state?.visitorToEdit;
    const isEditMode = !!visitorToEdit;
    const userRole = localStorage.getItem('userRole');
    const isConnected = !!userRole;

    const schema = createSchema(isEditMode);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
         mode: 'onChange',
        defaultValues: {
            nom: '',
            prenom: '',
            telephone: '',
            email: '',
            password: '',
            role: '3'
        }
    });

    useEffect(() => {
        const fetchFullVisitorDetails = async () => {
            if (isEditMode && visitorToEdit) {
                try {
                    const fullVisitor = await visitorService.getById(visitorToEdit.id);
                    reset({
                        nom: fullVisitor.nom || '',
                        prenom: fullVisitor.prenom || '',
                        telephone: fullVisitor.telephone || '',
                        email: fullVisitor.email || '',
                        password: '',
                        role: fullVisitor.role || '3'
                    });
                } catch (error) {
                    reset({
                        nom: visitorToEdit.nom || '',
                        prenom: visitorToEdit.prenom || '',
                        telephone: visitorToEdit.telephone || '',
                        email: '',
                        password: '',
                        role: visitorToEdit.role || '3'
                    });
                }
            }
        };
        fetchFullVisitorDetails();
    }, [isEditMode, visitorToEdit, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await visitorService.update(visitorToEdit.id, data);
                alert("Modifications enregistrées avec succès !");
                navigate('/visitors');
            } else {
                await authService.Inscription(data);
                if (isConnected) {
                    alert("Visiteur créé avec succès !");
                    navigate('/visitors');
                } else {
                    alert("Inscription réussie !");
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error("Erreur lors de la soumission:", err);
            alert(err.message || "Une erreur est survenue");
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-10">
            <div className="w-full max-w-[480px]">

                <div className="text-center mb-9">
                    <div className="inline-flex items-center gap-2.5 mb-5">
                        <div className="w-[46px] h-[46px] bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            DE
                        </div>
                        <span className="text-lg font-semibold text-slate-900">Davila Entreprise</span>
                    </div>
                    <h2 className="text-[26px] font-semibold text-slate-900 mb-1.5">
                        {isEditMode ? "Modifier le profil" : isConnected ? "Nouveau visiteur" : "Créer un compte"}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {isEditMode ? "Modifiez les informations du visiteur"
                            : isConnected ? "Remplissez les informations du nouveau visiteur"
                            : "Remplissez le formulaire pour vous inscrire"}
                    </p>
                </div>

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Nom" error={errors.nom?.message}>
                            <input
                                {...register('nom')}
                                type="text"
                                placeholder="Dupont"
                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${
                                    errors.nom ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </Field>

                        <Field label="Prénom" error={errors.prenom?.message}>
                            <input
                                {...register('prenom')}
                                type="text"
                                placeholder="Jean"
                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${
                                    errors.prenom ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </Field>
                    </div>

                    <Field label="Téléphone" error={errors.telephone?.message}>
                        <input
                            {...register('telephone')}
                            type="tel"
                            placeholder="+237 6XX XX XX XX"
                            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${
                                errors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                        />
                    </Field>

                    <Field label="Email" error={errors.email?.message}>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="nom@exemple.com"
                            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${
                                errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                        />
                    </Field>

                    <Field
                        label={isEditMode ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                        error={errors.password?.message}
                    >
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors ${
                                errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                        />
                    </Field>

                    {!isEditMode && (
                        <Field label="Type de compte" error={errors.role?.message}>
                            <select
                                {...register('role')}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-[15px] text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            >
                                <option value="3">Visiteur</option>
                                <option value="2">Agent</option>
                                {userRole === 'Admin' && (
                                    <option value="1">Administrateur</option>
                                )}
                            </select>
                        </Field>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors text-[16px] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {isSubmitting ? "Chargement..." : isEditMode ? "Enregistrer les modifications" : isConnected ? "Créer le visiteur" : "Créer mon compte"}
                    </button>
                </form>

                {!isConnected && !isEditMode && (
                    <>
                        <div className="flex items-center gap-3.5 my-7">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs text-slate-400">ou</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                        <p className="text-center text-[15px] text-slate-600">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Inscription;