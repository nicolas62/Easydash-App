import { useEffect, useRef } from 'react';
import { useAdSense } from '../hooks/useAdSense';

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

const AdBanner: React.FC = () => {
    const config = useAdSense();
    const pushed = useRef(false);

    useEffect(() => {
        if (!config || pushed.current) return;
        pushed.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {}
    }, [config]);

    if (!config) return null;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={config.clientId}
                data-ad-slot={config.slotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdBanner;
