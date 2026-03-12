import { useState, useEffect } from 'react';
import { jeedomWs, ConnectionStatus } from '../services/jeedomWs';

export const useConnectionStatus = (useDemoMode: boolean, useWebSocket: boolean = true) => {
    const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);
    const [wsStatus, setWsStatus] = useState<ConnectionStatus>('CLOSED');

    useEffect(() => {
        const handleOnline = () => setIsNetworkOnline(true);
        const handleOffline = () => setIsNetworkOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (useDemoMode) {
            setWsStatus('OPEN'); // Simulate connected in demo mode
            return;
        }

        const unsubscribe = jeedomWs.onStatusChange((status) => {
            setWsStatus(status);
        });

        return () => {
            unsubscribe();
        };
    }, [useDemoMode]);

    // In demo mode, we just rely on network status (or always true)
    // In real mode, we assume API works if network is online, even if WS is down.
    // Buttons should only be disabled if BOTH are known to be down (e.g., offline).
    const isConnected = useDemoMode ? true : isNetworkOnline;

    return { isConnected, isNetworkOnline, wsStatus };
};
