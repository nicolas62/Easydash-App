import React from 'react';
import { LayoutDashboard, Activity, History, ArrowRight, CheckCircle } from 'lucide-react';
import SEO from './SEO';

interface LandingPageProps {
    onConnect?: () => void;
    onDemo?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onConnect, onDemo }) => {
    return (
        <>
            <SEO />
            <div className="min-h-screen bg-dark-bg text-content-primary font-sans animate-in fade-in duration-500">
                {/* Header Sémantique */}
                <header className="fixed top-0 w-full z-50 bg-dark-surface/80 backdrop-blur-md border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-jeedom-600 rounded-lg flex items-center justify-center shadow-lg shadow-jeedom-500/20">
                                    <span className="font-bold text-white">J</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">EasyDash</span>
                            </div>
                            <nav className="flex gap-4">
                                {onDemo && (
                                    <button 
                                        onClick={onDemo}
                                        className="text-sm font-medium text-content-secondary hover:text-jeedom-500 transition-colors hidden sm:block"
                                    >
                                        Démo
                                    </button>
                                )}
                                {onConnect && (
                                    <button 
                                        onClick={onConnect}
                                        className="bg-jeedom-600 hover:bg-jeedom-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-jeedom-900/20 hover:shadow-jeedom-900/40 inline-flex items-center gap-2"
                                        aria-label="Configurer l'application"
                                    >
                                        Connexion <ArrowRight size={16} aria-hidden="true" />
                                    </button>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="pt-24">
                    {/* Hero Section */}
                    <section className="relative py-20 lg:py-32 overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jeedom-500/10 text-jeedom-500 text-xs font-bold uppercase tracking-wider mb-6 border border-jeedom-500/20">
                                <span className="w-2 h-2 rounded-full bg-jeedom-500 animate-pulse"></span>
                                Nouveau : Version 0.8.0
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-content-primary via-content-secondary to-content-primary">
                                L'interface ultime pour votre box Jeedom
                            </h1>
                            <p className="mt-4 max-w-2xl mx-auto text-xl text-content-secondary leading-relaxed">
                                Transformez votre expérience domotique. Créez des dashboards fluides, réactifs et entièrement personnalisables pour piloter votre maison connectée.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                                {onConnect && (
                                    <button 
                                        onClick={onConnect}
                                        className="bg-jeedom-600 text-white hover:bg-jeedom-500 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-jeedom-900/20 flex items-center justify-center gap-2"
                                        aria-label="Configurer EasyDash maintenant"
                                    >
                                        Commencer
                                        <ArrowRight size={20} className="text-white/70" />
                                    </button>
                                )}
                                {onDemo && (
                                    <button 
                                        onClick={onDemo}
                                        className="bg-dark-surface border border-border hover:bg-input-bg text-content-primary px-8 py-4 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                                        aria-label="Essayer la démo en ligne"
                                    >
                                        Essayer la Démo
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Background Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-jeedom-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" aria-hidden="true" />
                    </section>

                    {/* Features Section */}
                    <section id="features" className="py-24 bg-dark-surface/30 border-y border-border/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                    Tout ce dont vous avez besoin
                                </h2>
                                <p className="text-content-secondary max-w-2xl mx-auto">
                                    Une suite complète d'outils pour visualiser et contrôler votre environnement.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Feature 1 */}
                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-jeedom-500/50 transition-all hover:shadow-xl hover:shadow-jeedom-500/5 group">
                                    <div className="w-12 h-12 bg-jeedom-500/10 text-jeedom-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <LayoutDashboard size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Widgets Personnalisés</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Créez des interfaces uniques avec notre éditeur de widgets par glisser-déposer. Compatible avec tous vos équipements Jeedom.
                                    </p>
                                </article>

                                {/* Feature 2 */}
                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <History size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Historique Détaillé</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Visualisez vos données (température, consommation) avec des graphiques interactifs et fluides directement dans vos tuiles.
                                    </p>
                                </article>

                                {/* Feature 3 */}
                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-green-500/50 transition-all hover:shadow-xl hover:shadow-green-500/5 group">
                                    <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Activity size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Contrôle Santé</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Surveillez l'état de votre box Jeedom, gérez les mises à jour et les sauvegardes depuis un panneau dédié.
                                    </p>
                                </article>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-dark-surface border-t border-border py-12 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-jeedom-600 rounded flex items-center justify-center">
                                <span className="font-bold text-white text-xs">J</span>
                            </div>
                            <span className="text-content-primary font-bold">EasyDash</span>
                        </div>
                        <p className="text-content-secondary text-sm">
                            © {new Date().getFullYear()} EasyDash. Non affilié à Jeedom SAS.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-content-secondary hover:text-jeedom-500 transition-colors" aria-label="Mentions légales">Mentions Légales</a>
                            <a href="#" className="text-content-secondary hover:text-jeedom-500 transition-colors" aria-label="Contact">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;
