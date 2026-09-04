import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignUp, useUser } from '@clerk/clerk-react';
import { authService } from '../../services/authService';
import { visitorService } from '../../services/visitorService';
import { configService } from '../../services/configService';
import { Eye, EyeOff, Shield, Sparkles } from 'lucide-react';

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

const DEFAULT_SERVICES = [
    { id: '1', label: 'Direction' },
    { id: '2', label: 'Service RH' },
    { id: '3', label: 'Service Financier' },
    { id: '4', label: 'Service Informatique' },
    { id: '5', label: 'Secrétariat (Accueil Général)' }
];

const Inscription = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { isLoaded, signUp } = useSignUp();
    const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
    
    const [companyName, setCompanyName] = useState(
        localStorage.getItem('companyName') || 'Davila Entreprise'
    );
    
    const [availableServices, setAvailableServices] = useState(DEFAULT_SERVICES);

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
        setValue,
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
            service: '1'
        }
    });

    const selectedRole = watch('role');

    useEffect(() => {
        const syncClerkUser = async () => {
            if (isUserLoaded && isSignedIn && user && !isConnected) {
                try {
                    const payload = {
                        email: user.primaryEmailAddress?.emailAddress,
                        nom: user.lastName || user.firstName || 'Visiteur',
                        prenom: user.firstName || 'Google',
                        telephone: user.primaryPhoneNumber?.phoneNumber || '+237600000000',
                        role: 3
                    };

                    const response = await authService.syncClerkUser(payload);
                    if (response) {
                        localStorage.setItem('userToken', response.token || response.accessToken);
                        localStorage.setItem('userRole', response.role || 'Visiteur');
                        localStorage.setItem('userName', `${payload.prenom} ${payload.nom}`);
                        navigate('/mon-espace');
                    }
                } catch (error) {
                    console.error("Erreur de synchronisation Google SSO:", error);
                }
            }
        };

        syncClerkUser();
    }, [isUserLoaded, isSignedIn, user, isConnected, navigate]);

    // 🟢 CHARGEMENT DYNAMIQUE DES SERVICES ET DE LA CONFIGURATION
    useEffect(() => {
        const fetchConfigAndServices = async () => {
            try {
                const data = await configService.getConfig();
                
                if (data) {
                    if (data.companyName) setCompanyName(data.companyName);

                    if (data.companyServices && Array.isArray(data.companyServices) && data.companyServices.length > 0) {
                        const formatted = data.companyServices.map((srv, index) => {
                            if (typeof srv === 'string') {
                                return { id: String(index + 1), label: srv };
                            }
                            return { id: String(srv.id || index + 1), label: srv.nom || srv.label || srv.name };
                        });
                        setAvailableServices(formatted);
                        if (formatted.length > 0) setValue('service', formatted[0].id);
                        return;
                    }
                }
            } catch (error) {
                console.warn("Utilisation de la configuration locale pour les services.");
            }

            const localServices = localStorage.getItem('companyServices');
            if (localServices) {
                try {
                    const parsed = JSON.parse(localServices);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const formatted = parsed.map((srv, idx) => ({
                            id: String(srv.id || idx + 1),
                            label: typeof srv === 'string' ? srv : srv.nom || srv.label
                        }));
                        setAvailableServices(formatted);
                        if (formatted.length > 0) setValue('service', formatted[0].id);
                    }
                } catch (e) {
                    console.error("Erreur parsing companyServices:", e);
                }
            }
        };

        fetchConfigAndServices();

        const handleUpdate = () => {
            const updatedName = localStorage.getItem('companyName');
            if (updatedName) setCompanyName(updatedName);
            fetchConfigAndServices();
        };

        window.addEventListener('configUpdated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('configUpdated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [setValue]);

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
                        role: String(fullVisitor.role || '3'),
                        service: String(fullVisitor.service || availableServices[0]?.id || '1')
                    });
                } catch (error) {
                    reset({
                        nom: visitorToEdit.nom || '',
                        prenom: visitorToEdit.prenom || '',
                        telephone: visitorToEdit.telephone || '',
                        email: '',
                        password: '',
                        role: String(visitorToEdit.role || '3'),
                        service: String(visitorToEdit.service || availableServices[0]?.id || '1')
                    });
                }
            }
        };
        fetchFullVisitorDetails();
    }, [isEditMode, visitorToEdit, reset, availableServices]);

    const getInitials = (name) => {
        if (!name) return 'DE';
        const words = name.trim().split(' ').filter(Boolean);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    const handleGoogleSignUp = async () => {
        if (!isLoaded) return;
        try {
            await signUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: 'http://localhost:5173/sso-callback',
                redirectUrlComplete: 'http://localhost:5173/sso-callback'
            });
        } catch (err) {
            console.error("Erreur d'inscription via Google:", err);
            alert("Erreur lors de l'inscription via Google.");
        }
    };

    const onSubmit = async (data) => {
    try {
        const payload = {
            id: visitorToEdit?.id || visitorToEdit?.Id,
            ...data,
            role: parseInt(data.role || '3', 10),
            service: data.service ? parseInt(data.service, 10) : null
        };

        if (isEditMode) {
            const targetId = visitorToEdit.id || visitorToEdit.Id;
            await visitorService.update(targetId, payload);
            alert("Modifications enregistrées avec succès !");
            navigate('/visitors');
        } else {
            // 🟢 CRÉATION DE COMPTE CLASSIQUE (Inscription ou Admin)
            await authService.Inscription(payload);
            alert("Compte créé avec succès !");
            
            if (isConnected) {
                // Si c'est un admin qui crée un utilisateur, on redirige vers la liste
                navigate('/visitors');
            } else {
                // Sinon, on redirige vers la page de connexion
                navigate('/login');
            }
        }
    } catch (err) {
        console.error("Erreur lors de la soumission:", err);
        alert(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
};

    return (
        <div className="min-h-screen flex w-full font-sans bg-[#F4F7F9]">
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

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
                    
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

                        {!isEditMode && (
                            <Field label="Type de compte" error={errors.role?.message}>
                                <select
                                    {...register('role')}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer transition-all"
                                >
                                    <option value="3">Visiteur</option>

                                    {isConnected && (userRole === 'Admin' || userRole === 'admin' || userRole === '1') && (
                                        <>
                                            <option value="2">Agent</option>
                                            <option value="1">Administrateur</option>
                                        </>
                                    )}
                                </select>
                            </Field>
                        )}

                        {/* 🟢 SERVICE D'AFFECTATION DYNAMIQUE DANS L'INSCRIPTION */}
                        {!isEditMode && selectedRole === '2' && isConnected && (
                            <Field label="Service d'affectation" error={errors.service?.message}>
                                <select
                                    {...register('service')}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-[15px] font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white cursor-pointer transition-all"
                                >
                                    {availableServices.map((srv) => (
                                        <option key={srv.id} value={srv.id}>
                                            {srv.label}
                                        </option>
                                    ))}
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
                        <div className="mt-6 text-center">
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <span className="relative bg-white px-4 text-xs text-slate-400 font-bold uppercase tracking-wider">ou</span>
                            </div>

                            <button 
                                type="button"
                                onClick={handleGoogleSignUp}
                                className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 border border-slate-200 font-bold py-3.5 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 text-sm mb-6"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                                S'inscrire avec Google
                            </button>

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