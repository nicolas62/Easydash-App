import { useState, useEffect, useCallback } from 'react';

const DEVICE_ID_KEY    = 'easydash_push_device_id';
const PUSH_TOKEN_KEY   = 'easydash_push_token';

/** Return the cached server token, or fetch a fresh one. */
async function getPushToken(): Promise<string | null> {
    const cached = sessionStorage.getItem(PUSH_TOKEN_KEY);
    if (cached) return cached;
    try {
        const res = await fetch('/api/push/vapid-public-key');
        if (!res.ok) return null;
        const { token } = await res.json();
        if (token) sessionStorage.setItem(PUSH_TOKEN_KEY, token);
        return token ?? null;
    } catch { return null; }
}

/** Fetch wrapper that includes the push auth token. */
async function pushFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const token = await getPushToken();
    return fetch(url, {
        ...init,
        headers: {
            ...(init.headers as Record<string, string> ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}

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
    const [isSupported, setIsSupported]     = useState(false);
    const [pushAvailable, setPushAvailable] = useState<boolean | null>(null);
    const [isLoading, setIsLoading]         = useState(false);
    const [deviceId, setDeviceId]           = useState<string | null>(() => localStorage.getItem(DEVICE_ID_KEY));
    const [permission, setPermission]       = useState<NotificationPermission>('default');

    // Initialisation optimiste : si un deviceId existe en localStorage,
    // on suppose l'abonnement actif. Le check SW ci-dessous corrige si nécessaire.
    const [isSubscribed, setIsSubscribed]   = useState<boolean>(() => !!localStorage.getItem(DEVICE_ID_KEY));

    // Check support + disponibilité serveur + confirmation SW
    useEffect(() => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setIsSupported(supported);

        if (!supported) {
            setPushAvailable(false);
            setIsSubscribed(false);
            return;
        }

        setPermission(Notification.permission);

        // Disponibilité serveur
        getPushToken()
            .then(t => setPushAvailable(t !== null))
            .catch(() => setPushAvailable(false));

        // Confirmation SW : corrige l'état optimiste si la souscription
        // a été révoquée côté navigateur (ex : user a vidé le cache)
        navigator.serviceWorker.getRegistration().then(reg => {
            if (!reg) { setIsSubscribed(false); return; }
            reg.pushManager.getSubscription().then(sub => {
                const storedId = localStorage.getItem(DEVICE_ID_KEY);
                const active = !!sub && !!storedId;
                setIsSubscribed(active);
                // Nettoyage si le navigateur a révoqué la souscription
                if (!sub && storedId) localStorage.removeItem(DEVICE_ID_KEY);
            }).catch(() => {});
        }).catch(() => {});
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
            const { publicKey, token } = await keyRes.json();
            if (token) sessionStorage.setItem(PUSH_TOKEN_KEY, token);

            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: await urlBase64ToUint8Array(publicKey),
            });

            const res = await pushFetch('/api/push/subscribe', {
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
                await pushFetch(`/api/push/subscribe/${id}`, { method: 'DELETE' }).catch(() => {});
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
        await pushFetch(`/api/push/test/${id}`, { method: 'POST' }).catch(() => {});
    }, [deviceId]);

    const fetchDevices = useCallback(async (): Promise<PushDeviceInfo[]> => {
        try {
            const res = await pushFetch('/api/push/devices');
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
