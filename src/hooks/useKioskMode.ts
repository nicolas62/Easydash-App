import { useState, useEffect, useCallback, useRef } from 'react';

export const useKioskMode = () => {
    const [isKioskActive, setIsKioskActive] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake Lock is active');
            } catch (err: any) {
                console.error(`Wake Lock Error: ${err.name}, ${err.message}`);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                console.log('Wake Lock released');
            } catch (err: any) {
                console.error(`Wake Lock Release Error: ${err.name}, ${err.message}`);
            }
        }
    }, []);

    const enterFullscreen = useCallback(async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if ((document.documentElement as any).webkitRequestFullscreen) {
                await (document.documentElement as any).webkitRequestFullscreen(); // Safari
            } else if ((document.documentElement as any).msRequestFullscreen) {
                await (document.documentElement as any).msRequestFullscreen(); // IE11
            }
        } catch (err) {
            console.error("Error attempting to enable full-screen mode:", err);
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen();
            }
        } catch (err) {
            console.error("Error attempting to exit full-screen mode:", err);
        }
    }, []);

    const enableKiosk = useCallback(async () => {
        await enterFullscreen();
        await requestWakeLock();
        setIsKioskActive(true);
        localStorage.setItem('kiosk_mode', 'true');
    }, [enterFullscreen, requestWakeLock]);

    const disableKiosk = useCallback(async () => {
        await exitFullscreen();
        await releaseWakeLock();
        setIsKioskActive(false);
        localStorage.setItem('kiosk_mode', 'false');
    }, [exitFullscreen, releaseWakeLock]);

    const toggleKiosk = useCallback(() => {
        if (isKioskActive) {
            disableKiosk();
        } else {
            enableKiosk();
        }
    }, [isKioskActive, enableKiosk, disableKiosk]);

    // Handle visibility change to re-acquire wake lock
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isKioskActive) {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isKioskActive, requestWakeLock]);

    // Handle fullscreen change (user pressed ESC)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
            if (!isFullscreen && isKioskActive) {
                // User exited fullscreen manually
                // We sync state but keep wake lock if desired? 
                // Usually exiting fullscreen implies exiting kiosk mode.
                setIsKioskActive(false);
                localStorage.setItem('kiosk_mode', 'false');
                releaseWakeLock();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, [isKioskActive, releaseWakeLock]);

    // Restore state on mount (only Wake Lock, Fullscreen needs user interaction)
    useEffect(() => {
        const savedState = localStorage.getItem('kiosk_mode') === 'true';
        if (savedState) {
            setIsKioskActive(true);
            requestWakeLock();
            // Note: We cannot automatically enter fullscreen here due to browser security policies.
            // The user will need to click the toggle button to re-enter fullscreen if they refreshed.
        }
    }, [requestWakeLock]);

    return { isKioskActive, toggleKiosk };
};
