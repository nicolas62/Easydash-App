import { useState, useEffect } from 'react';

interface AdSenseConfig {
    clientId: string;
    slotId: string;
}

let cachedConfig: AdSenseConfig | null = null;
let scriptInjected = false;

export function useAdSense() {
    const [config, setConfig] = useState<AdSenseConfig | null>(cachedConfig);

    useEffect(() => {
        if (cachedConfig) return;

        fetch('/api/adsense-config')
            .then(r => r.ok ? r.json() : null)
            .then((data: AdSenseConfig | null) => {
                if (!data?.clientId || !data?.slotId) return;
                cachedConfig = data;
                setConfig(data);

                if (!scriptInjected) {
                    scriptInjected = true;
                    const script = document.createElement('script');
                    script.async = true;
                    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.clientId}`;
                    script.crossOrigin = 'anonymous';
                    document.head.appendChild(script);
                }
            })
            .catch(() => { /* AdSense non configuré — silencieux */ });
    }, []);

    return config;
}
