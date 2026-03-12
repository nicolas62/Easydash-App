import { useEffect, useState } from 'react';
import { APP_VERSION } from '../constants';

export const useVersionCheck = () => {
    const [hasUpdate, setHasUpdate] = useState(false);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Add timestamp to prevent caching of version.json
                const response = await fetch(`/version.json?t=${new Date().getTime()}`);
                if (!response.ok) return;
                
                const data = await response.json();
                const serverVersion = data.version;
                
                if (serverVersion && serverVersion !== APP_VERSION) {
                    console.log(`New version detected: ${serverVersion} (current: ${APP_VERSION})`);
                    setHasUpdate(true);
                }
            } catch (error) {
                // Silently fail for network errors during background checks
                // console.error('Failed to check version', error);
            }
        };

        // Check immediately
        checkVersion();

        // Check every minute
        const interval = setInterval(checkVersion, 60 * 1000);

        // Check on visibility change (when user comes back to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return hasUpdate;
};