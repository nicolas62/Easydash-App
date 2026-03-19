import { useEffect, useRef } from 'react';
import { AppSettings, WidgetConfig } from '../types';
import { jeedomWs } from '../services/jeedomWs';

export function usePolling(
    settings: AppSettings, 
    isSettingsLoaded: boolean, 
    refreshWidgetValues: (widgets: WidgetConfig[]) => Promise<void>,
    widgets: WidgetConfig[],
    activeDashboardId: string
) {
    const widgetsRef = useRef(widgets);
    const activeDashboardIdRef = useRef(activeDashboardId);

    useEffect(() => { widgetsRef.current = widgets; }, [widgets]);
    useEffect(() => { activeDashboardIdRef.current = activeDashboardId; }, [activeDashboardId]);

    useEffect(() => {
        if (!isSettingsLoaded) return;

        const isWsEnabled = settings.useWebSocket !== false && !settings.useDemoMode;
        // Si WS activé : 5 min minimum (le WS gère les updates temps réel)
        // Si WS désactivé : 30s minimum (évite les bursts qui déclenchent le ban IP)
        const minInterval = isWsEnabled ? 300_000 : 30_000;
        const intervalTime = Math.max(minInterval, settings.refreshInterval || 30_000);

        console.log(`Starting polling with interval: ${intervalTime}ms (WS Enabled: ${isWsEnabled})`);

        let isRunning = false;

        const intervalId = setInterval(async () => {
            if (isRunning) return;
            // Le WebSocket gère les mises à jour en temps réel — pas besoin de polluer l'API HTTP
            if (jeedomWs.isConnected()) return;

            const currentActiveId = activeDashboardIdRef.current;
            const currentWidgets = widgetsRef.current.filter(w => {
                if (currentActiveId === 'default') return w.isFavorite;
                return w.dashboardId === currentActiveId;
            });

            if (currentWidgets.length === 0) return;

            isRunning = true;
            try {
                await refreshWidgetValues(currentWidgets);
            } finally {
                isRunning = false;
            }
        }, intervalTime);

        return () => {
            console.log("Stopping polling");
            clearInterval(intervalId);
            isRunning = false;
        };
    }, [settings.refreshInterval, settings.useWebSocket, settings.useDemoMode, isSettingsLoaded, refreshWidgetValues]);
}
