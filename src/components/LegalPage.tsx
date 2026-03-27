import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import SEO from './SEO';

const LegalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-content-primary font-sans p-4 md:p-8">
            <SEO
                title="Mentions Légales | EasyDash"
                description="Mentions légales de l'application EasyDash — éditeur, hébergement, propriété intellectuelle et responsabilité."
                url="https://easydash.fr/legal"
            />
            <div className="max-w-3xl mx-auto bg-dark-surface rounded-2xl shadow-2xl border border-border overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50">
                    <h1 className="text-2xl font-bold text-content-primary flex items-center gap-3">
                        <Scale className="text-jeedom-500" size={28} />
                        Mentions Légales
                    </h1>
                    <a href="/" className="flex items-center gap-2 text-sm text-content-secondary hover:text-jeedom-400 transition-colors">
                        <ArrowLeft size={16} />
                        Retour à l'accueil
                    </a>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 text-content-secondary space-y-10 text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">1. Présentation du site</h2>
                        <p>
                            Le site <strong className="text-content-primary">EasyDash</strong> (accessible à l'adresse <code className="bg-dark-card px-1 py-0.5 rounded text-sm text-jeedom-400">easydash.fr</code>) est une application web open source permettant de créer des tableaux de bord personnalisés pour la box domotique Jeedom.
                        </p>
                        <p className="mt-3">
                            EasyDash est un projet indépendant, développé et maintenu par un particulier. Il n'est en aucun cas affilié, soutenu, sponsorisé ou approuvé par la société <strong className="text-content-primary">JEEDOM SAS</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">2. Responsable de la publication</h2>
                        <p>
                            Responsable de la publication : Nicolas Gauthier<br />
                            Contact : <a href="mailto:easydash.l701w@silomails.com" className="text-jeedom-400 hover:underline">easydash.l701w@silomails.com</a>
                        </p>
                        <p className="mt-3 text-sm">
                            EasyDash est un logiciel libre distribué sous licence open source. Le code source est disponible publiquement sur GitHub.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">3. Hébergement</h2>
                        <p>
                            Le site <code className="bg-dark-card px-1 py-0.5 rounded text-sm text-jeedom-400">easydash.fr</code> est hébergé sur une infrastructure privée.
                        </p>
                        <p className="mt-3 text-sm">
                            Note : EasyDash est conçu pour être auto-hébergé par ses utilisateurs. Chaque déploiement relève de la responsabilité de l'administrateur qui l'installe (via Docker ou tout autre moyen). Les présentes mentions légales s'appliquent uniquement à l'instance officielle accessible sur <code className="bg-dark-card px-1 py-0.5 rounded text-sm text-jeedom-400">easydash.fr</code>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">4. Propriété intellectuelle</h2>
                        <p>
                            L'ensemble du code source d'EasyDash est distribué sous licence open source (MIT). Vous êtes libre de l'utiliser, le modifier et le redistribuer dans le respect des termes de cette licence.
                        </p>
                        <p className="mt-3">
                            Les marques, logos et noms commerciaux mentionnés sur ce site (Jeedom, etc.) sont la propriété exclusive de leurs détenteurs respectifs. Leur mention vise uniquement à décrire la compatibilité technique du logiciel.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">5. Limitation de responsabilité</h2>
                        <p>
                            EasyDash est fourni <strong className="text-content-primary">« tel quel »</strong>, sans garantie d'aucune sorte, expresse ou implicite. Le responsable de la publication ne saurait être tenu pour responsable de :
                        </p>
                        <ul className="list-disc list-inside mt-3 space-y-1.5">
                            <li>Toute interruption, dysfonctionnement ou indisponibilité du service ;</li>
                            <li>Toute perte de données ou dommage résultant de l'utilisation du logiciel ;</li>
                            <li>Tout problème lié à la compatibilité avec votre installation Jeedom ;</li>
                            <li>Tout usage inapproprié ou non conforme aux présentes mentions légales.</li>
                        </ul>
                        <p className="mt-3">
                            L'utilisation d'EasyDash implique l'acceptation de ces conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">6. Données personnelles</h2>
                        <p>
                            EasyDash est conçu avec le respect de la vie privée comme priorité. Vos données (configuration Jeedom, widgets, tableaux de bord) sont stockées <strong className="text-content-primary">exclusivement dans votre navigateur</strong> (localStorage) et ne transitent jamais par un serveur tiers.
                        </p>
                        <p className="mt-3">
                            Votre clé API Jeedom est chiffrée localement (AES-GCM) avant d'être stockée. Aucune donnée personnelle n'est collectée ni transmise à des fins commerciales.
                        </p>
                        <p className="mt-3">
                            Pour plus de détails, consultez notre{' '}
                            <a href="/privacy" className="text-jeedom-400 hover:underline">Politique de confidentialité</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">7. Cookies</h2>
                        <p>
                            EasyDash n'utilise pas de cookies à des fins de traçage ou de publicité. Un bandeau de consentement est affiché pour vous informer de l'utilisation du stockage local (localStorage) nécessaire au fonctionnement de l'application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-content-primary mb-3">8. Droit applicable</h2>
                        <p>
                            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
                        </p>
                    </section>

                    <p className="text-sm text-content-secondary/60 border-t border-border pt-6">
                        Dernière mise à jour : Mars 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
