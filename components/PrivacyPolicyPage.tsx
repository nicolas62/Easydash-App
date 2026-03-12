import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import SEO from './SEO';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-content-primary font-sans p-4 md:p-8">
            <SEO 
                title="Politique de Confidentialité | EasyDash" 
                description="Politique de confidentialité de l'application EasyDash. Découvrez comment nous protégeons vos données et votre vie privée."
                url="https://easydash.fr/privacy"
            />
            <div className="max-w-3xl mx-auto bg-dark-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-dark-surface/50">
                    <h1 className="text-2xl font-bold text-content-primary flex items-center gap-3">
                        <Shield className="text-jeedom-500" size={32} />
                        Politique de Confidentialité
                    </h1>
                    <a href="/" className="flex items-center gap-2 text-sm text-content-secondary hover:text-jeedom-400 transition-colors">
                        <ArrowLeft size={16} />
                        Retour à l'accueil
                    </a>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 text-content-secondary space-y-8 text-base leading-relaxed">
                    <div>
                        <h2 className="text-xl font-bold text-content-primary mb-2">Politique de Confidentialité de EasyDash</h2>
                        <p className="font-medium text-jeedom-400">Dernière mise à jour : 03 Mars 2026</p>
                        <p className="mt-4">
                            L'application <strong>EasyDash</strong> ("nous", "notre", "l'application") est un tableau de bord (Dashboard) pour la solution domotique Jeedom. Nous prenons votre vie privée très au sérieux. Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre fonctionnalité de sauvegarde sur Google Drive.
                        </p>
                    </div>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">1. Données collectées</h3>
                        <p>EasyDash est une application qui fonctionne principalement localement dans votre navigateur ("Client-Side"). Nous ne possédons pas de serveurs backend pour stocker vos données personnelles.</p>
                        <p className="mt-2">Lorsque vous choisissez de connecter votre compte Google à EasyDash, nous accédons aux informations suivantes via les services d'authentification de Google (OAuth) :</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Informations de base du profil :</strong> Votre nom et votre photo de profil (uniquement pour l'affichage dans l'interface des paramètres).</li>
                            <li><strong>Adresse e-mail :</strong> Pour identifier votre session de sauvegarde.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">2. Utilisation des données Google Drive</h3>
                        <p>L'application demande l'accès à votre Google Drive avec une portée restreinte ("Scope") spécifique : <code className="bg-input-bg px-1.5 py-0.5 rounded text-sm font-mono">https://www.googleapis.com/auth/drive.file</code>.</p>
                        <p className="mt-2">Cela signifie que :</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Nous N'AVONS PAS accès</strong> à l'ensemble de votre Google Drive.</li>
                            <li><strong>Nous N'AVONS PAS accès</strong> à vos photos, documents personnels ou fichiers créés par d'autres applications.</li>
                            <li><strong>Nous avons UNIQUEMENT accès</strong> aux fichiers et dossiers que <strong>EasyDash a créés lui-même</strong>.</li>
                        </ul>
                        <p className="mt-4">Nous utilisons cet accès exclusivement pour :</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-2">
                            <li>Créer un fichier de configuration (<code className="bg-input-bg px-1.5 py-0.5 rounded text-sm font-mono">easydash_config.json</code>) contenant vos paramètres de dashboard.</li>
                            <li>Mettre à jour ce fichier spécifique lorsque vous cliquez sur "Sauvegarder".</li>
                            <li>Lire ce fichier spécifique lorsque vous cliquez sur "Restaurer".</li>
                        </ol>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">3. Partage et divulgation des données</h3>
                        <p>Vos données de configuration (adresse IP de Jeedom, clés API, agencement des widgets) sont :</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Stockées localement dans le stockage de votre navigateur (<code className="bg-input-bg px-1.5 py-0.5 rounded text-sm font-mono">localStorage</code>).</li>
                            <li>Transférées directement de votre navigateur vers les serveurs de Google (Google Drive) via une connexion sécurisée (HTTPS).</li>
                        </ul>
                        <p className="mt-2"><strong>Nous ne vendons, n'échangeons, ni ne transférons vos informations personnelles à des tiers.</strong> L'application n'envoie aucune donnée sur des serveurs autres que ceux de Google (pour la sauvegarde) et votre propre instance Jeedom (pour la domotique).</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">4. Conformité aux règles de données utilisateur de Google (Limited Use Policy)</h3>
                        <p>L'utilisation par EasyDash des informations reçues des API Google, ainsi que leur transfert vers toute autre application, respectera la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-jeedom-400 hover:underline">Politique relative aux données utilisateur des services API Google</a>, y compris les exigences d'utilisation limitée ("Limited Use requirements").</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">5. Sécurité</h3>
                        <p>La sécurité de vos données est primordiale. L'échange de données se fait directement entre votre appareil et les services de Google via des protocoles chiffrés standards. Les jetons d'accès (Tokens) sont stockés temporairement dans votre navigateur et ne sont jamais enregistrés sur nos serveurs (puisque nous n'en avons pas).</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">6. Vos droits</h3>
                        <p>Vous pouvez à tout moment révoquer l'accès de EasyDash à votre compte Google en visitant la page des <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-jeedom-400 hover:underline">paramètres de sécurité de votre compte Google</a>. Cela empêchera l'application d'accéder à votre Drive, mais ne supprimera pas les fichiers de sauvegarde déjà créés.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-content-primary mb-3">7. Contact</h3>
                        <p>Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via le formulaire de contact disponible dans l'application.</p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-dark-surface/50 text-center text-sm text-content-secondary">
                    <p>&copy; {new Date().getFullYear()} EasyDash. Tous droits réservés.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
