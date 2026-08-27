import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/authService';
import { visitorService } from '../../services/visitorService';
import { configService } from '../../services/configService';
import { Eye, EyeOff, Shield, Sparkles } from 'lucide-react';

// Schéma de validation dynamique
const createSchema = (isEditMode) => z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    telephone: z.string().min(9, "Le numéro doit contenir au moins 9 chiffres"),
    email: isEditMode
        ? z.string().email("Email invalide").optional().or(z.literal(''))
        : z.string().email("Email invalide"),
    password: isEditMode
        ? z.string().optional()
        : z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    role: z.string().optional(),
    service: z.string().optional()
});

// Composant d'enrobage pour champ avec erreur
const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-bold text-slate-600 tracking-wide">{label}</label>
        {children}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5 font-medium">
                <span>⚠️</span> {error}
            </p>
        )}
    </div>
);

const Inscription = () => {
    const [showPassword, setShowPassword] = useState(false);
    
    // Gestion dynamique du nom de l'entreprise
    const [companyName, setCompanyName] = useState(
        localStorage.getItem('companyName') || 'Davila Entreprise'
    );

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
        watch,
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
            role: '3',
            service: '5' // Secrétariat par défaut
        }
    });

    // Observer le champ rôle en temps réel
    const selectedRole = watch('role');

    // Chargement de la configuration globale
    useEffect(() => {
        configService.getConfig().then(data => {
            if (data && data.companyName) setCompanyName(data.companyName);
        });

        const handleUpdate = () => {
            const updatedName = localStorage.getItem('companyName');
            if (updatedName) setCompanyName(updatedName);
        };

        window.addEventListener('configUpdated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('configUpdated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // Chargement du visiteur à modifier
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
                        role: fullVisitor.role || '3',
                        service: fullVisitor.service || '5'
                    });
                } catch (error) {
                    reset({
                        nom: visitorToEdit.nom || '',
                        prenom: visitorToEdit.prenom || '',
                        telephone: visitorToEdit.telephone || '',
                        email: '',
                        password: '',
                        role: visitorToEdit.role || '3',
                        service: visitorToEdit.service || '5'
                    });
                }
            }
        };
        fetchFullVisitorDetails();
    }, [isEditMode, visitorToEdit, reset]);

    const getInitials = (name) => {
        if (!name) return 'DE';
        const words = name.trim().split(' ').filter(Boolean);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const onSubmit = async (data) => {
        try {
            // Conversion numérique des valeurs de rôle et service pour l'API C#
            const payload = {
                ...data,
                role: parseInt(data.role || '3', 10),
                service: parseInt(data.service || '5', 10)
            };

            if (isEditMode) {
                await visitorService.update(visitorToEdit.id, payload);
                alert("Modifications enregistrées avec succès !");
                navigate('/visitors');
            } else {
                await authService.Inscription(payload);
                if (isConnected) {
                    alert("Utilisateur créé avec succès !");
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
        <div className="min-h-screen flex w-full font-sans bg-[#F4F7F9]">
            
            {/* PANNEAU GAUCHE : BRANDING DYNAMIQUE */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
                
                <div className="relative z-10 max-w-lg p-12 text-left">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-8 shadow-lg shadow-blue-600/30">
                        {getInitials(companyName)}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                        {isEditMode ? (
                            <>Modification de profil <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{companyName}</span></>
                        ) : isConnected ? (
                            <>Gestion des Comptes <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{companyName}</span></>
                        ) : (
                            <>Rejoignez <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{companyName}</span></>
                        )}
                    </h1>

                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        {isEditMode 
                            ? "Mettez à jour les informations du profil sélectionné en toute sécurité."
                            : isConnected 
                            ? "Créez et attribuez des comptes utilisateurs pour votre établissement."
                            : "Gérez vos visites, suivez vos demandes et sécurisez l'accès à vos locaux en toute simplicité grâce à notre plateforme moderne."}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-12">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                            <Shield size={16} className="text-blue-400" /> Sécurité maximale
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-slate-300 text-sm font-medium backdrop-blur-sm">
                            <Sparkles size={16} className="text-indigo-400" /> Interface intuitive
                        </div>
                    </div>
                </div>
            </div>

            {/* PANNEAU DROIT : FORMULAIRE */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
                    
                    {/* En-tête mobile */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-600/30">
                            {getInitials(companyName)}
                        </div>
                    </div>

                    <div className="text-center mb-9">
                        <h2 className="text-[26px] font-black text-slate-900 mb-1.5 tracking-tight">
                            {isEditMode ? "Modifier le profil" : isConnected ? "Nouveau membre" : "Créer un compte"}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {isEditMode ? "Modifiez les informations du membre"
                                : isConnected ? "Remplissez les informations du nouvel utilisateur"
                                : "Remplissez le formulaire pour vous inscrire"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nom" error={errors.nom?.message}>
                                <input
                                    {...register('nom')}
                                    type="text"
                                    placeholder="Dupont"
                                    className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                                        errors.nom ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                    }`}
                                />
                            </Field>

                            <Field label="Prénom" error={errors.prenom?.message}>
                                <input
                                    {...register('prenom')}
                                    type="text"
                                    placeholder="Jean"
                                    className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
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
                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                                    errors.telephone ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </Field>

                        <Field label="Email" error={errors.email?.message}>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="nom@exemple.com"
                                className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                }`}
                            />
                        </Field>

                        {/* MOT DE PASSE : VISIBLE UNIQUEMENT LORS DE LA CRÉATION DE COMPTE */}
                        {!isEditMode && (
                            <Field label="Mot de passe" error={errors.password?.message}>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3.5 pr-12 bg-slate-50 border rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                                            errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </Field>
                        )}

                        {/* SELECTION RÔLE */}
                        {!isEditMode && (
                            <Field label="Type de compte" error={errors.role?.message}>
                                <select
                                    {...register('role')}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer transition-all"
                                >
                                    <option value="3">Visiteur</option>

                                    {(!isConnected || userRole === 'Admin' || userRole === 'admin' || userRole === '1') && (
                                        <option value="2">Agent</option>
                                    )}

                                    {(!isConnected || userRole === 'Admin' || userRole === 'admin' || userRole === '1') && (
                                        <option value="1">Administrateur</option>
                                    )}
                                </select>
                            </Field>
                        )}

                        {/* SELECTION SERVICE : APPARAÎT UNIQUEMENT SI LE RÔLE AGENT (2) EST SÉLECTIONNÉ */}
                        {!isEditMode && selectedRole === '2' && (
                            <Field label="Service d'affectation" error={errors.service?.message}>
                                <select
                                    {...register('service')}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer transition-all"
                                >
                                    <option value="5">Secrétariat (Accueil Général)</option>
                                    <option value="1">Direction</option>
                                    <option value="2">Service RH</option>
                                    <option value="3">Service Financier</option>
                                    <option value="4">Service Informatique</option>
                                </select>
                            </Field>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all text-[16px] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? "Chargement..." : isEditMode ? "Enregistrer les modifications" : isConnected ? "Créer l'utilisateur" : "Créer mon compte"}
                        </button>
                    </form>

                    {!isConnected && !isEditMode && (
                        <div className="mt-8 text-center">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <span className="relative bg-white px-4 text-xs text-slate-400 font-bold uppercase tracking-wider">ou</span>
                            </div>
                            <p className="text-[14px] text-slate-600 font-medium">
                                Déjà un compte ?{' '}
                                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inscription;