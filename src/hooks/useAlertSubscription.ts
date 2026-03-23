import { useState, useEffect, useCallback } from 'react';

const DEVICE_ID_KEY = 'easydash_push_device_id';

/** Convert a VAPID URL-safe base64 public key to a Uint8Array. */
async function urlBase64ToUint8Array(base64: string): Promise<Uint8Array> {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    return Uint8Array.from(raw, c => c.charCodeAt(0));
}

export interface PushDeviceInfo {
    id: string;
    deviceName: string;
    createdAt: number;
}

export function useAlertSubscription() {
    const [isSupported, setIsSupported]   = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading]       = useState(false);
    const [pushAvailable, setPushAvailable] = useState<boolean | null>(null); // null = checking
    const [deviceId, setDeviceId]         = useState<string | null>(() => localStorage.getItem(DEVICE_ID_KEY));
    const [permission, setPermission]     = useState<NotificationPermission>('default');

    // Check if push is supported and already subscribed
    useEffect(() => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setIsSupported(supported);

        if (!supported) {
            setPushAvailable(false);
            return;
        }

        setPermission(Notification.permission);

        // Check server-side availability
        fetch('/api/push/vapid-public-key')
            .then(r => setPushAvailable(r.ok))
            .catch(() => setPushAvailable(false));

        // Check existing subscription
        navigator.serviceWorker.ready.then(reg =>
            reg.pushManager.getSubscription().then(sub => {
                const storedId = localStorage.getItem(DEVICE_ID_KEY);
                setIsSubscribed(!!sub && !!storedId);
            })
        ).catch(() => {});
    }, []);

    const subscribe = useCallback(async (): Promise<void> => {
        if (!isSupported) return;
        setIsLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== 'granted') return;

            const keyRes = await fetch('/api/push/vapid-public-key');
            if (!keyRes.ok) throw new Error('Push not configured on server');
            const { publicKey } = await keyRes.json();

            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: await urlBase64ToUint8Array(publicKey),
            });

            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    deviceName: navigator.userAgent.slice(0, 120),
                }),
            });
            if (!res.ok) throw new Error('Failed to save subscription');

            const { id } = await res.json();
            localStorage.setItem(DEVICE_ID_KEY, id);
            setDeviceId(id);
            setIsSubscribed(true);
        } catch (e) {
            console.error('[push] subscribe error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!isSupported) return;
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();

            const id = localStorage.getItem(DEVICE_ID_KEY);
            if (id) {
                await fetch(`/api/push/subscribe/${id}`, { method: 'DELETE' }).catch(() => {});
                localStorage.removeItem(DEVICE_ID_KEY);
            }
            setDeviceId(null);
            setIsSubscribed(false);
        } catch (e) {
            console.error('[push] unsubscribe error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const sendTest = useCallback(async (): Promise<void> => {
        const id = deviceId;
        if (!id) return;
        await fetch(`/api/push/test/${id}`, { method: 'POST' }).catch(() => {});
    }, [deviceId]);

    const fetchDevices = useCallback(async (): Promise<PushDeviceInfo[]> => {
        try {
            const res = await fetch('/api/push/devices');
            return res.ok ? res.json() : [];
        } catch { return []; }
    }, []);

    return {
        isSupported,
        pushAvailable,
        isSubscribed,
        isLoading,
        permission,
        deviceId,
        subscribe,
        unsubscribe,
        sendTest,
        fetchDevices,
    };
}
