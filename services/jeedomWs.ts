import { AppSettings } from '../types';

type JeedomEventCallback = (value: string | number) => void;
export type ConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSED';
export type StatusCallback = (status: ConnectionStatus) => void;

class JeedomWebSocketService {
    private static instance: JeedomWebSocketService;
    private ws: WebSocket | null = null;
    private settings: AppSettings | null = null;
    private subscribers: Map<string, Set<JeedomEventCallback>> = new Map();
    private statusSubscribers: Set<StatusCallback> = new Set();
    private currentStatus: ConnectionStatus = 'CLOSED';
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private isConnecting = false;
    private pingInterval: NodeJS.Timeout | null = null;
    private currentAttempt: 'A' | 'B' = 'A';

    private constructor() {}

    public static getInstance(): JeedomWebSocketService {
        if (!JeedomWebSocketService.instance) {
            JeedomWebSocketService.instance = new JeedomWebSocketService();
        }
        return JeedomWebSocketService.instance;
    }

    private setStatus(status: ConnectionStatus) {
        if (this.currentStatus !== status) {
            this.currentStatus = status;
            this.statusSubscribers.forEach(cb => cb(status));
        }
    }

    public onStatusChange(callback: StatusCallback) {
        this.statusSubscribers.add(callback);
        callback(this.currentStatus); // trigger immediately
        return () => {
            this.statusSubscribers.delete(callback);
        };
    }

    public connect(settings: AppSettings) {
        // If settings haven't changed and we are connected or connecting, do nothing
        if (this.settings && 
            this.settings.jeedomUrl === settings.jeedomUrl && 
            this.settings.apiKey === settings.apiKey &&
            (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.disconnect();

        this.settings = settings;
        this.reconnectAttempts = 0;
        this.currentAttempt = 'A';
        this.initConnection();
    }

    public disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.stopPing();
        
        if (this.ws) {
            // Prevent auto-reconnect on intentional disconnect
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.close();
            this.ws = null;
        }
        
        this.isConnecting = false;
        this.setStatus('CLOSED');
    }

    private getWsUrls(jeedomUrl: string): { urlA: string, urlB: string } {
        let url = jeedomUrl.trim();
        
        // Remove trailing slash
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        // Determine protocol
        let isHttps = url.startsWith('https://');
        if (window.location.protocol === 'https:') {
            isHttps = true; // Force HTTPS/WSS if the app is loaded over HTTPS to avoid Mixed Content errors
        }
        const protocol = isHttps ? 'wss://' : 'ws://';
        
        // Remove protocol from URL for parsing
        const cleanUrl = url.replace(/^https?:\/\//, '');
        
        // Extract hostname
        const hostname = cleanUrl.split('/')[0].split(':')[0]; // Remove path and existing port

        // Determine port
        // Default Jeedom ports: 8011 for HTTP/WS, 8012 for HTTPS/WSS
        // Allow override via localStorage or Env
        const storedPort = localStorage.getItem('jeedom_ws_port');
        const envPort = import.meta.env.VITE_JEEDOM_WS_PORT;
        
        let port = isHttps ? '8012' : '8011';
        if (storedPort) port = storedPort;
        else if (envPort) port = envPort;

        const urlA = `${protocol}${hostname}:${port}`;
        const urlB = `${protocol}${cleanUrl}/ws/`;

        return { urlA, urlB };
    }

    private initConnection() {
        if (!this.settings?.jeedomUrl || !this.settings.apiKey) return;
        if (this.isConnecting) return;

        this.isConnecting = true;
        this.setStatus('CONNECTING');
        
        const urls = this.getWsUrls(this.settings.jeedomUrl);
        const wsUrl = this.currentAttempt === 'A' ? urls.urlA : urls.urlB;
        
        if (this.currentAttempt === 'A') {
            console.info(`[JeedomWS] Tentative de connexion avec la clé API commençant par : ${this.settings.apiKey.substring(0, 4)}...`);
            console.log(`[JeedomWS] Tentative de connexion via port direct (URL A) : ${wsUrl}`);
        } else {
            console.warn(`[JeedomWS] Échec URL A. Tentative de repli via Proxy Apache (URL B) : ${wsUrl}`);
        }

        try {
            this.ws = new WebSocket(wsUrl);
            let hasOpened = false;

            this.ws.onopen = () => {
                hasOpened = true;
                console.log(`[JeedomWS] 🟢 Connecté avec succès via : ${wsUrl}`);
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.currentAttempt = 'A'; // Reset for future reconnects
                this.setStatus('OPEN');
                
                // Authenticate
                this.send({
                    apikey: this.settings?.apiKey
                });

                // Start Ping (Keep Alive)
                this.startPing();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    console.error('[JeedomWS] Failed to parse message', event.data);
                }
            };

            this.ws.onclose = (event) => {
                this.isConnecting = false;
                this.setStatus('CLOSED');
                this.stopPing();
                
                if (!hasOpened && this.currentAttempt === 'A') {
                    // Fallback to B with 1000ms delay
                    this.currentAttempt = 'B';
                    console.log(`[JeedomWS] Attente de 1000ms avant de tenter l'URL B...`);
                    this.reconnectTimeout = setTimeout(() => {
                        this.initConnection();
                    }, 1000);
                } else {
                    // Either it was open and then closed, or B failed too
                    if (hasOpened) {
                        console.log('[JeedomWS] Disconnected', event.code, event.reason);
                    } else {
                        console.warn(`[JeedomWS] Échec URL B (${wsUrl}). Déclenchement de la reconnexion...`);
                    }
                    this.currentAttempt = 'A'; // Reset for next full cycle
                    this.scheduleReconnect();
                }
            };

            this.ws.onerror = (error) => {
                // onError usually precedes onClose, so we let onClose handle reconnect/fallback
                console.error(`[JeedomWS] Error on ${wsUrl}`, error);
            };

        } catch (e) {
            console.error('[JeedomWS] Connection failed', e);
            this.isConnecting = false;
            this.setStatus('CLOSED');
            
            if (this.currentAttempt === 'A') {
                this.currentAttempt = 'B';
                console.log(`[JeedomWS] Attente de 1000ms avant de tenter l'URL B...`);
                this.reconnectTimeout = setTimeout(() => {
                    this.initConnection();
                }, 1000);
            } else {
                this.currentAttempt = 'A';
                this.scheduleReconnect();
            }
        }
    }

    private send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    private handleMessage(data: any) {
        // Jeedom WS format usually:
        // { type: "event", event: "cmd", id: "123", value: "on" } or similar
        // Or sometimes just { type: "event", id: "123", value: "..." }
        
        // Log for debug (remove in production if too noisy)
        // console.log('[JeedomWS] Message:', data);

        if (data.type === 'event' && (data.event === 'cmd' || data.id)) {
            const cmdId = String(data.id);
            const value = data.value;

            if (cmdId && this.subscribers.has(cmdId)) {
                const callbacks = this.subscribers.get(cmdId);
                callbacks?.forEach(cb => cb(value));
            }
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        // Exponential backoff: 5s, 10s, 20s, 40s... max 60s
        const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000);
        
        console.log(`[JeedomWS] Reconnecting in ${delay}ms...`);
        
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.initConnection();
        }, delay);
    }

    private startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                // Send empty object or specific ping if needed. 
                // Jeedom usually keeps connection alive but sending {} is safe.
                this.send({}); 
            }
        }, 30000); // 30s ping
    }

    private stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    public subscribe(cmdId: string, callback: JeedomEventCallback) {
        if (!this.subscribers.has(cmdId)) {
            this.subscribers.set(cmdId, new Set());
        }
        this.subscribers.get(cmdId)?.add(callback);
    }

    public unsubscribe(cmdId: string, callback: JeedomEventCallback) {
        if (this.subscribers.has(cmdId)) {
            this.subscribers.get(cmdId)?.delete(callback);
            if (this.subscribers.get(cmdId)?.size === 0) {
                this.subscribers.delete(cmdId);
            }
        }
    }
}

export const jeedomWs = JeedomWebSocketService.getInstance();
