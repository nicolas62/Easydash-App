import { useEffect } from 'react';
import { jeedomWs } from '../services/jeedomWs';
import { AppSettings } from '../types';

type CommandUpdateCallback = (updates: Array<{id: string, value: string | number}>) => void;

export function useWebSocket(
    settings: AppSettings,
    isSettingsLoaded: boolean,
    onCommandUpdate: CommandUpdateCallback
) {
    // Enregistre le callback une seule fois (et le met à jour si la référence change)
    useEffect(() => {
        jeedomWs.onUpdate(onCommandUpdate);
    }, [onCommandUpdate]);

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
