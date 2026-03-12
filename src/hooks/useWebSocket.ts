import { useEffect } from 'react';
import { jeedomWs } from '../services/jeedomWs';
import { AppSettings } from '../types';

export function useWebSocket(settings: AppSettings, isSettingsLoaded: boolean) {
    useEffect(() => {
        if (isSettingsLoaded && settings.jeedomUrl && settings.apiKey && !settings.useDemoMode) {
            if (settings.useWebSocket !== false) {
                jeedomWs.connect(settings);
            } else {
                jeedomWs.disconnect();
            }
        } else if (isSettingsLoaded && settings.useDemoMode) {
            jeedomWs.disconnect();
        }
    }, [settings, isSettingsLoaded]);
}
