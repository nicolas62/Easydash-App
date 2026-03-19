import { useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { WidgetConfig } from '../types';

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
        const minInterval = isWsEnabled ? 300000 : 2000;
        const intervalTime = Math.max(minInterval, settings.refreshInterval || 5000);

        console.log(`Starting polling with interval: ${intervalTime}ms (WS Enabled: ${isWsEnabled})`);

        let isRunning = false;

        const intervalId = setInterval(async () => {
            if (isRunning) return;

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
