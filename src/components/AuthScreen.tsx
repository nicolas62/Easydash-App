import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!auth) {
            setError("Firebase n'est pas configuré correctement.");
            setLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error(err);
            let msg = "Une erreur est survenue.";
            if (err.code === 'auth/invalid-email') msg = "L'adresse email est invalide.";
            if (err.code === 'auth/user-disabled') msg = "Ce compte a été désactivé.";
            if (err.code === 'auth/user-not-found') msg = "Aucun compte trouvé avec cet email.";
            if (err.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
            if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
            if (err.code === 'auth/weak-password') msg = "Le mot de passe est trop faible (6 caractères min).";
            if (err.code === 'auth/invalid-credential') msg = "Identifiants invalides.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 animate-fade-in-up">
            <div className="w-full max-w-sm">
                
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-jeedom-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-jeedom-900/50 mx-auto mb-6 transform rotate-3">
                        <span className="text-4xl font-bold text-white">J</span>
                    </div>
                    <h1 className="text-3xl font-bold text-content-primary mb-2">Bienvenue</h1>
                    <p className="text-content-secondary">
                        {isLogin ? "Connectez-vous à votre espace" : "Créez votre compte Jeedom Connect"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-content-secondary group-focus-within:text-jeedom-500 transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Adresse Email"
                                className="w-full bg-dark-surface border border-border text-content-primary rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-content-secondary group-focus-within:text-jeedom-500 transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full bg-dark-surface border border-border text-content-primary rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-jeedom-500 focus:border-transparent outline-none transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-jeedom-600 hover:bg-jeedom-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-jeedom-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <span>{isLogin ? 'Se connecter' : 'S\'inscrire'}</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Switcher */}
                <div className="mt-8 text-center">
                    <p className="text-content-secondary">
                        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-jeedom-500 font-semibold hover:text-jeedom-400 ml-2 transition-colors"
                        >
                            {isLogin ? "Créer un compte" : "Se connecter"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;