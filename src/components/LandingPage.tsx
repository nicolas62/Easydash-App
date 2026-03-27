import React, { useState } from 'react';
import {
    LayoutDashboard, Activity, History, ArrowRight, CheckCircle,
    Zap, Smartphone, Bell, ShieldCheck, Sliders, MonitorSmartphone,
    Puzzle, BarChart3, Camera, Thermometer, AlarmSmoke, ExternalLink
} from 'lucide-react';
import SEO from './SEO';
import ReleaseNotesModal from './ReleaseNotesModal';
import ContactModal from './ContactModal';
import { APP_VERSION } from '../constants';

interface LandingPageProps {
    onConnect?: () => void; // Opens SettingsModal to configure Jeedom
}

const LandingPage: React.FC<LandingPageProps> = ({ onConnect }) => {
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [showContact, setShowContact]           = useState(false);

    const handleDemo = () => {
        window.open(window.location.origin + '?demo=true', '_blank', 'noopener');
    };

    return (
        <>
            <SEO />
            <div className="min-h-screen bg-dark-bg text-content-primary font-sans animate-in fade-in duration-500">

                {/* ── Header ───────────────────────────────────────────── */}
                <header className="fixed top-0 w-full z-50 bg-dark-surface/80 backdrop-blur-md border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-jeedom-600 rounded-lg flex items-center justify-center shadow-lg shadow-jeedom-500/20">
                                    <span className="font-bold text-white text-sm">J</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">EasyDash</span>
                            </div>
                            <nav className="flex items-center gap-4" aria-label="Navigation principale">
                                <a href="#pourquoi" className="text-sm font-medium text-content-secondary hover:text-jeedom-500 transition-colors hidden md:block">
                                    Pourquoi EasyDash ?
                                </a>
                                <a href="#comment" className="text-sm font-medium text-content-secondary hover:text-jeedom-500 transition-colors hidden md:block">
                                    Comment ça marche
                                </a>
                                <button
                                    onClick={handleDemo}
                                    className="text-sm font-medium text-content-secondary hover:text-jeedom-500 transition-colors hidden sm:flex items-center gap-1"
                                >
                                    Démo <ExternalLink size={12} aria-hidden="true" />
                                </button>
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

                    {/* ── Hero ─────────────────────────────────────────────── */}
                    <section className="relative py-20 lg:py-32 overflow-hidden" aria-labelledby="hero-heading">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jeedom-500/10 text-jeedom-500 text-xs font-bold uppercase tracking-wider mb-6 border border-jeedom-500/20">
                                <span className="w-2 h-2 rounded-full bg-jeedom-500 animate-pulse" aria-hidden="true" />
                                Nouveau : Version {APP_VERSION}
                            </div>

                            <h1
                                id="hero-heading"
                                className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-content-primary via-content-secondary to-content-primary"
                            >
                                Le Dashboard ultime pour votre Jeedom
                            </h1>

                            <p className="mt-4 max-w-2xl mx-auto text-xl text-content-secondary leading-relaxed">
                                Créez des <strong className="text-content-primary">tableaux de bord Jeedom design et personnalisables</strong> sans écrire une ligne de CSS.
                                Parfait pour votre <strong className="text-content-primary">tablette murale domotique</strong> ou votre smartphone.
                            </p>

                            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                                {onConnect && (
                                    <button
                                        onClick={onConnect}
                                        className="bg-jeedom-600 text-white hover:bg-jeedom-500 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-jeedom-900/20 flex items-center justify-center gap-2"
                                        aria-label="Configurer EasyDash avec votre Jeedom"
                                    >
                                        Commencer gratuitement
                                        <ArrowRight size={20} className="text-white/70" aria-hidden="true" />
                                    </button>
                                )}
                                <button
                                    onClick={handleDemo}
                                    className="bg-dark-surface border border-border hover:bg-input-bg text-content-primary px-8 py-4 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                                    aria-label="Essayer la démo en ligne sans configuration"
                                >
                                    Essayer la Démo
                                    <ExternalLink size={16} className="text-content-secondary/60" aria-hidden="true" />
                                </button>
                            </div>

                            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-content-secondary" aria-label="Points clés">
                                {["100% gratuit & open source", "Aucun CSS requis", "Compatible toutes box Jeedom", "Mode tablette murale intégré"].map(item => (
                                    <li key={item} className="flex items-center gap-1.5">
                                        <CheckCircle size={14} className="text-jeedom-500 shrink-0" aria-hidden="true" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-jeedom-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" aria-hidden="true" />
                    </section>

                    {/* ── Pourquoi EasyDash ? ──────────────────────────────── */}
                    <section id="pourquoi" className="py-24 bg-dark-surface/30 border-y border-border/50" aria-labelledby="pourquoi-heading">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 id="pourquoi-heading" className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                    Pourquoi EasyDash plutôt qu'un design Jeedom natif ?
                                </h2>
                                <p className="text-content-secondary max-w-3xl mx-auto text-lg leading-relaxed">
                                    Les designs natifs de Jeedom nécessitent des heures de CSS, des plugins payants et restent difficiles à adapter sur tablette.
                                    EasyDash propose une <strong className="text-content-primary">interface domotique prête à l'emploi</strong>, moderne, fluide et entièrement personnalisable — en quelques minutes.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-jeedom-500/50 transition-all group">
                                    <div className="w-12 h-12 bg-jeedom-500/10 text-jeedom-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Zap size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Zéro CSS, résultat immédiat</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Glissez-déposez vos widgets, choisissez vos couleurs et votre <strong className="text-content-primary">dashboard Jeedom</strong> est prêt.
                                        Pas de fichier CSS à maintenir, pas de plugin tiers à payer.
                                    </p>
                                </article>

                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Smartphone size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Parfait pour tablette murale</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Le mode <strong className="text-content-primary">tablette domotique</strong> (kiosque) masque la navigation et garde l'écran allumé.
                                        Interface responsive optimisée pour les grands écrans muraux.
                                    </p>
                                </article>

                                <article className="bg-dark-card border border-border p-8 rounded-2xl hover:border-green-500/50 transition-all group">
                                    <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <MonitorSmartphone size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-xl font-bold text-content-primary mb-3">Temps réel & réactif</h3>
                                    <p className="text-content-secondary leading-relaxed">
                                        Connexion <strong className="text-content-primary">WebSocket</strong> à votre box Jeedom pour des valeurs instantanées.
                                        Chaque widget se met à jour automatiquement dès que votre équipement change d'état.
                                    </p>
                                </article>
                            </div>

                            {/* Comparison table */}
                            <div className="mt-16 overflow-x-auto">
                                <table className="w-full max-w-3xl mx-auto text-sm border-collapse">
                                    <caption className="sr-only">Comparaison EasyDash vs Designs Jeedom natifs</caption>
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-content-secondary font-medium">Fonctionnalité</th>
                                            <th className="py-3 px-4 text-jeedom-500 font-bold text-center">EasyDash</th>
                                            <th className="py-3 px-4 text-content-secondary font-medium text-center">Designs Jeedom</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ["Configuration sans CSS", true, false],
                                            ["Mode tablette murale natif", true, false],
                                            ["Notifications push hors-ligne", true, false],
                                            ["Drag & drop temps réel", true, "Partiel"],
                                            ["Alertes avec historique", true, "Plugin payant"],
                                            ["Graphiques historiques intégrés", true, "Plugin payant"],
                                        ].map(([feature, easydash, jeedom]) => (
                                            <tr key={String(feature)} className="border-b border-border/50 hover:bg-dark-surface/30 transition-colors">
                                                <td className="py-3 px-4 text-content-primary">{feature}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {easydash === true
                                                        ? <CheckCircle size={18} className="text-jeedom-500 mx-auto" aria-label="Oui" />
                                                        : <span className="text-jeedom-400 text-xs">{String(easydash)}</span>}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {jeedom === false
                                                        ? <span className="text-content-secondary/40 text-lg">—</span>
                                                        : <span className="text-orange-400 text-xs">{String(jeedom)}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* ── Comment ça marche ────────────────────────────────── */}
                    <section id="comment" className="py-24" aria-labelledby="comment-heading">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 id="comment-heading" className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                    Comment configurer votre dashboard Jeedom ?
                                </h2>
                                <p className="text-content-secondary max-w-2xl mx-auto">
                                    EasyDash se connecte à votre box Jeedom via l'API officielle. Aucune modification de Jeedom nécessaire.
                                </p>
                            </div>

                            <ol className="grid md:grid-cols-3 gap-8 list-none" aria-label="Étapes de configuration">
                                {[
                                    { step: "01", icon: Zap,             title: "Déployez EasyDash",          color: "jeedom", text: "Lancez l'image Docker officielle sur votre NAS, Raspberry Pi ou serveur local. Une seule commande suffit. EasyDash tourne en parallèle de votre Jeedom existant." },
                                    { step: "02", icon: Puzzle,          title: "Connectez votre Jeedom",     color: "blue",   text: "Entrez l'URL de votre box Jeedom et votre clé API dans les paramètres. EasyDash interroge l'API officielle pour récupérer tous vos équipements et commandes automatiquement." },
                                    { step: "03", icon: LayoutDashboard, title: "Créez vos tableaux de bord", color: "green",  text: "Ajoutez des widgets par glisser-déposer, choisissez vos commandes Jeedom, personnalisez couleurs et icônes. Votre interface tablette domotique est prête en quelques minutes." },
                                ].map(({ step, icon: Icon, title, text, color }) => (
                                    <li key={step} className="relative bg-dark-card border border-border p-8 rounded-2xl">
                                        <span className="text-5xl font-black text-content-secondary/10 absolute top-6 right-6" aria-hidden="true">{step}</span>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color === 'jeedom' ? 'bg-jeedom-500/10 text-jeedom-500' : color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <Icon size={24} aria-hidden="true" />
                                        </div>
                                        <h3 className="text-xl font-bold text-content-primary mb-3">{title}</h3>
                                        <p className="text-content-secondary leading-relaxed text-sm">{text}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    {/* ── Widgets ──────────────────────────────────────────── */}
                    <section className="py-24 bg-dark-surface/30 border-y border-border/50" aria-labelledby="widgets-heading">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 id="widgets-heading" className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                    Une bibliothèque complète de widgets domotiques
                                </h2>
                                <p className="text-content-secondary max-w-2xl mx-auto">
                                    Chaque widget se connecte directement à une commande Jeedom et se met à jour en temps réel.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: LayoutDashboard, label: "Actions & Interrupteurs",  desc: "Boutons, toggles, séquences multi-commandes" },
                                    { icon: Sliders,         label: "Curseur (Slider)",          desc: "Luminosité, volets, tout équipement numérique" },
                                    { icon: BarChart3,       label: "Graphiques historiques",    desc: "Courbes et histogrammes depuis Jeedom" },
                                    { icon: Thermometer,     label: "Thermostat",                desc: "Consigne, température, modes éco/absent" },
                                    { icon: Camera,          label: "Caméra",                    desc: "Flux MJPEG ou snapshot avec proxy sécurisé" },
                                    { icon: Bell,            label: "Alertes & Notifications",   desc: "Push Web même application fermée" },
                                    { icon: AlarmSmoke,      label: "Alarme sécurisée",          desc: "Arm/Désarm avec code PIN chiffré SHA-256" },
                                    { icon: Activity,        label: "Santé & Supervision",       desc: "État de la box, CPU, mémoire, réseau" },
                                ].map(({ icon: Icon, label, desc }) => (
                                    <article key={label} className="bg-dark-card border border-border p-5 rounded-xl hover:border-jeedom-500/40 transition-all group">
                                        <div className="w-10 h-10 bg-jeedom-500/10 text-jeedom-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Icon size={20} aria-hidden="true" />
                                        </div>
                                        <h3 className="text-sm font-bold text-content-primary mb-1">{label}</h3>
                                        <p className="text-xs text-content-secondary leading-relaxed">{desc}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Features ─────────────────────────────────────────── */}
                    <section className="py-24" aria-labelledby="features-heading">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                    Tout ce dont vous avez besoin
                                </h2>
                                <p className="text-content-secondary max-w-2xl mx-auto">
                                    Au-delà des widgets, EasyDash intègre des fonctionnalités pensées pour une utilisation quotidienne fiable.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { icon: Bell,           color: "jeedom", title: "Notifications Push Web",   text: "Recevez des alertes domotiques sur votre téléphone ou tablette même lorsque l'application est fermée. Basé sur le Web Push API standard (RFC 8030)." },
                                    { icon: History,        color: "blue",   title: "Historique & Graphiques",  text: "Visualisez l'évolution de vos capteurs (température, consommation électrique, humidité) avec des graphiques interactifs sur 24h, 7j ou 30j — intégrés directement dans vos tuiles." },
                                    { icon: ShieldCheck,    color: "green",  title: "Vie Privée & Sécurité",    text: "Vos données restent chez vous : stockées uniquement dans votre navigateur. Clé API chiffrée AES-GCM. Aucun cloud tiers." },
                                ].map(({ icon: Icon, color, title, text }) => (
                                    <article key={title} className="bg-dark-card border border-border p-8 rounded-2xl hover:shadow-xl transition-all group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${color === 'jeedom' ? 'bg-jeedom-500/10 text-jeedom-500' : color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <Icon size={24} aria-hidden="true" />
                                        </div>
                                        <h3 className="text-xl font-bold text-content-primary mb-3">{title}</h3>
                                        <p className="text-content-secondary leading-relaxed">{text}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ ──────────────────────────────────────────────── */}
                    <section className="py-24 bg-dark-surface/30 border-t border-border/50" aria-labelledby="faq-heading">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 id="faq-heading" className="text-3xl font-bold text-content-primary mb-12 text-center">
                                Questions fréquentes
                            </h2>
                            <dl className="space-y-8">
                                {[
                                    { q: "EasyDash est-il compatible avec ma version de Jeedom ?", a: "Oui. EasyDash utilise l'API JSON-RPC officielle de Jeedom, compatible avec toutes les versions récentes (V4+). Il suffit d'avoir une clé API valide et d'autoriser les appels depuis le navigateur (ou d'activer le mode Proxy intégré pour contourner les restrictions CORS)." },
                                    { q: "Comment configurer un dashboard Jeedom sur tablette murale ?", a: "Activez le mode Kiosque dans les paramètres d'EasyDash : la navigation disparaît, l'écran reste allumé et l'interface occupe tout l'espace. Idéal pour une tablette Amazon Fire, iPad ou Android fixée au mur dans votre cuisine ou couloir." },
                                    { q: "Mes données Jeedom sont-elles envoyées vers un serveur externe ?", a: "Non. EasyDash communique exclusivement en direct avec votre box Jeedom locale. Vos dashboards, widgets et règles d'alertes sont stockés dans le localStorage de votre navigateur. Rien ne transite par un serveur cloud tiers." },
                                    { q: "Quelle est la différence avec les designs natifs Jeedom ?", a: "Les designs Jeedom natifs sont des thèmes CSS qui modifient l'interface existante de Jeedom. EasyDash est une application indépendante connectée à votre Jeedom via l'API : pas de CSS à écrire, interface drag-and-drop, mode tablette intégré, alertes push, compatible avec tous les designs existants." },
                                ].map(({ q, a }) => (
                                    <div key={q}>
                                        <dt className="text-lg font-bold text-content-primary mb-2">{q}</dt>
                                        <dd className="text-content-secondary leading-relaxed">{a}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>

                    {/* ── CTA ──────────────────────────────────────────────── */}
                    <section className="py-24" aria-labelledby="cta-heading">
                        <div className="max-w-3xl mx-auto px-4 text-center">
                            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-content-primary mb-4">
                                Prêt à transformer votre interface Jeedom ?
                            </h2>
                            <p className="text-content-secondary mb-8 text-lg">
                                Gratuit, open source, et déployable en 5 minutes sur votre infrastructure.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {onConnect && (
                                    <button
                                        onClick={onConnect}
                                        className="bg-jeedom-600 text-white hover:bg-jeedom-500 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-jeedom-900/20 flex items-center justify-center gap-2"
                                    >
                                        Commencer maintenant <ArrowRight size={20} aria-hidden="true" />
                                    </button>
                                )}
                                <button
                                    onClick={handleDemo}
                                    className="bg-dark-surface border border-border hover:bg-input-bg text-content-primary px-8 py-4 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Voir la démo <ExternalLink size={16} className="text-content-secondary/60" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </section>

                </main>

                {/* ── Footer ───────────────────────────────────────────── */}
                <footer className="bg-dark-surface border-t border-border py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-jeedom-600 rounded flex items-center justify-center">
                                <span className="font-bold text-white text-xs">J</span>
                            </div>
                            <span className="text-content-primary font-bold">EasyDash</span>
                            <button
                                onClick={() => setShowReleaseNotes(true)}
                                className="text-content-secondary/50 text-xs ml-1 hover:text-jeedom-400 transition-colors cursor-pointer"
                                title="Voir les notes de version"
                            >
                                v{APP_VERSION}
                            </button>
                        </div>
                        <p className="text-content-secondary text-sm text-center">
                            Dashboard Jeedom open source — Non affilié à Jeedom SAS.<br />
                            © {new Date().getFullYear()} EasyDash. Tous droits réservés.
                        </p>
                        <div className="flex gap-6">
                            <a href="/legal" className="text-content-secondary hover:text-jeedom-500 transition-colors text-sm">
                                Mentions Légales
                            </a>
                            <button
                                onClick={() => setShowContact(true)}
                                className="text-content-secondary hover:text-jeedom-500 transition-colors text-sm"
                            >
                                Contact
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Modals */}
            <ReleaseNotesModal isOpen={showReleaseNotes} onClose={() => setShowReleaseNotes(false)} />
            <ContactModal     isOpen={showContact}       onClose={() => setShowContact(false)} />
        </>
    );
};

export default LandingPage;
