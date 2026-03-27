import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    structuredData?: object;
}

const DEFAULT_TITLE       = "EasyDash - Le Dashboard Fluide et Moderne pour Jeedom";
const DEFAULT_DESCRIPTION = "Transformez votre domotique avec EasyDash : l'interface personnalisable pour Jeedom. Créez des tableaux de bord design, des widgets intelligents et pilotez votre maison facilement depuis une tablette ou un smartphone.";
const DEFAULT_KEYWORDS    = "dashboard Jeedom, interface domotique, tablette domotique, tablette murale Jeedom, design Jeedom, widget domotique, EasyDash, smart home, maison connectée, dashboard domotique, alternative Jeedom, configurer dashboard jeedom tablette";
const DEFAULT_IMAGE       = "https://easydash.fr/logo.png";
const DEFAULT_URL         = "https://easydash.fr";

const DEFAULT_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EasyDash",
    "url": DEFAULT_URL,
    "description": DEFAULT_DESCRIPTION,
    "applicationCategory": "HomeAutomation",
    "operatingSystem": "Web Browser",
    "inLanguage": "fr-FR",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "featureList": [
        "Widgets drag-and-drop personnalisables",
        "Compatibilité Jeedom complète via API",
        "Notifications push même application fermée",
        "Graphiques historiques temps réel",
        "Mode tablette murale (kiosque)",
        "Interface responsive mobile et tablette",
        "Alertes configurables avec seuils",
        "Widget alarme avec code sécurisé"
    ]
};

const SEO: React.FC<SEOProps> = ({
    title       = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords    = DEFAULT_KEYWORDS,
    image       = DEFAULT_IMAGE,
    url         = DEFAULT_URL,
    structuredData = DEFAULT_STRUCTURED_DATA,
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="EasyDash" />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="fr_FR" />
            <meta property="og:site_name" content="EasyDash" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
