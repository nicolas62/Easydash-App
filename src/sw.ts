/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// ── Precache ──────────────────────────────────────────────────────────────────
// VitePWA injects the manifest list here at build time.
precacheAndRoute((self as any).__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Activate immediately — take control of all clients
self.addEventListener('install', () => (self as any).skipWaiting());
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil((self as any).clients.claim());
});

// ── Runtime caching ───────────────────────────────────────────────────────────

// POST requests and Jeedom API calls → always network
registerRoute(
    ({ request, url }: { request: Request; url: URL }) =>
        request.method === 'POST' ||
        url.pathname.startsWith('/core/api') ||
        url.pathname.includes('jeeApi'),
    new NetworkOnly()
);

// Static assets → stale-while-revalidate
registerRoute(
    ({ request }: { request: Request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image' ||
        request.destination === 'font',
    new StaleWhileRevalidate()
);

// SPA navigation fallback → serve /index.html from cache
const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/^\/core\/api/, /^\/core\/jeeApi\.php/, /^\/api\//],
});
registerRoute(navigationRoute);

// ── Web Push ──────────────────────────────────────────────────────────────────

self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    let data: { title: string; body: string; severity?: string; icon?: string };
    try {
        data = event.data.json();
    } catch {
        data = { title: 'EasyDash', body: event.data.text() };
    }

    const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        tag: `easydash-${Date.now()}`,
        data: { severity: data.severity },
        requireInteraction: data.severity === 'critical',
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ── Notification click ────────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event: any) => {
    event.notification.close();
    event.waitUntil(
        (self as any).clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients: WindowClient[]) => {
                const existing = clients.find(c =>
                    c.url.startsWith(self.location.origin)
                );
                if (existing) return existing.focus();
                return (self as any).clients.openWindow('/');
            })
    );
});
