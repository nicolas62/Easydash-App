import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

const SEO: React.FC<SEOProps> = ({ 
    title = "EasyDash | Le Dashboard Moderne et Personnalisable pour Jeedom", 
    description = "Transformez votre domotique Jeedom avec EasyDash. Créez facilement une interface design, fluide et sur-mesure pour votre tablette murale ou votre smartphone.", 
    keywords = "Jeedom, dashboard Jeedom, interface domotique, tablette murale, smart home, EasyDash, widget domotique, design Jeedom",
    image = "https://easydash.fr/logo.png",
    url = "https://easydash.fr"
}) => {
    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="fr_FR" />
            <meta property="og:site_name" content="EasyDash" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
