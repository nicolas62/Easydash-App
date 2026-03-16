import { AppSettings, JeedomCommand, JeedomEqLogic, JeedomHealthItem, JeedomScenario } from '../types';

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_DATA: JeedomEqLogic[] = [
  {
    id: '1',
    name: 'Salon',
    eqType_name: 'light',
    isVisible: '1',
    isEnable: '1',
    object_id: '1',
    cmds: [
      { id: '101', name: 'Lumière Plafond', type: 'info', subType: 'binary', value: 1, eqLogic_id: '1', logicalId: 'light_state', generic_type: 'LIGHT_STATE', eqType: 'light', order: '1', isHistorized: '0', unite: '', configuration: {}, template: {}, display: {}, isVisible: '1' },
      { id: '102', name: 'On', type: 'action', subType: 'other', eqLogic_id: '1', logicalId: 'light_on', generic_type: 'LIGHT_ON', eqType: 'light', order: '2', isHistorized: '0', unite: '', configuration: {}, template: {}, display: {}, isVisible: '1' },
      { id: '103', name: 'Off', type: 'action', subType: 'other', eqLogic_id: '1', logicalId: 'light_off', generic_type: 'LIGHT_OFF', eqType: 'light', order: '3', isHistorized: '0', unite: '', configuration: {}, template: {}, display: {}, isVisible: '1' }
    ]
  },
  {
    id: '2',
    name: 'Thermostat',
    eqType_name: 'thermostat',
    isVisible: '1',
    isEnable: '1',
    object_id: '1',
    cmds: [
      { id: '201', name: 'Température', type: 'info', subType: 'numeric', value: 21.5, unite: '°C', eqLogic_id: '2', logicalId: 'temp', generic_type: 'THERMOSTAT_TEMPERATURE', eqType: 'thermostat', order: '1', isHistorized: '1', configuration: {}, template: {}, display: {}, isVisible: '1' },
      { id: '202', name: 'Consigne', type: 'info', subType: 'numeric', value: 22, unite: '°C', eqLogic_id: '2', logicalId: 'setpoint', generic_type: 'THERMOSTAT_SETPOINT', eqType: 'thermostat', order: '2', isHistorized: '0', configuration: {}, template: {}, display: {}, isVisible: '1' }
    ]
  }
];

const MOCK_SCENARIOS: JeedomScenario[] = [
    { id: '1', name: 'Départ Maison', group: 'Sécurité', isActive: '1', mode: 'provoc', state: 'stop', lastLaunch: '2023-10-01 08:00:00', object_id: '', isVisible: '1' },
    { id: '2', name: 'Retour Maison', group: 'Sécurité', isActive: '1', mode: 'provoc', state: 'stop', lastLaunch: '2023-10-01 18:00:00', object_id: '', isVisible: '1' },
    { id: '3', name: 'Arrosage Jardin', group: 'Jardin', isActive: '0', mode: 'schedule', state: 'stop', lastLaunch: '2023-09-28 06:00:00', object_id: '', isVisible: '1' },
    { id: '4', name: 'Simulation Présence', group: 'Lumières', isActive: '1', mode: 'schedule', state: 'run', lastLaunch: '2023-10-01 20:00:00', object_id: '', isVisible: '1' },
];

// --- HELPERS ---

// Convertit n'importe quoi (Objet ou Tableau) en Tableau
const normalizeList = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') return Object.values(data);
    return [];
};

const getBaseApiUrl = (settings: AppSettings): string => {
    let cleanUrl = settings.jeedomUrl.trim();
    if (!cleanUrl) return '';

    // Fix Protocol
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = `http://${cleanUrl}`;
    }

    // Remove Query Params (Robustly)
    try {
        // Check if it's a valid URL first
        const urlObj = new URL(cleanUrl);
        // Reconstruct without query/hash
        // Use href logic manually to avoid issues with origin in some envs
        cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (e) {
        // Fallback if URL parsing fails
        cleanUrl = cleanUrl.split('?')[0].split('#')[0];
    }

    // Remove trailing slash
    if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
    }

    // Remove specific file endpoints if user included them by mistake
    if (cleanUrl.endsWith('/index.php')) cleanUrl = cleanUrl.replace(/\/index\.php$/, '');
    if (cleanUrl.endsWith('/index.html')) cleanUrl = cleanUrl.replace(/\/index\.html$/, '');

    // If the user already pointed to jeeApi.php, trust them
    if (cleanUrl.endsWith('jeeApi.php')) {
        return cleanUrl;
    }

    // If the user pointed to /core/api, just append the file
    if (cleanUrl.endsWith('/core/api')) {
        return `${cleanUrl}/jeeApi.php`;
    }

    // Common case: User put root URL (e.g. http://192.168.1.10 or http://192.168.1.10/jeedom)
    // We append the standard path
    return `${cleanUrl}/core/api/jeeApi.php`;
};

// --- CACHE FOR WORKING API URL ---
let cachedValidUrl: string | null = null;
let cachedSettingsUrl: string | null = null;

// Helper to detect local network URLs
const isLocalUrl = (url: string): boolean => {
    try {
        const hostname = new URL(url).hostname;
        return (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            (hostname.startsWith('172.') && parseInt(hostname.split('.')[1], 10) >= 16 && parseInt(hostname.split('.')[1], 10) <= 31) ||
            hostname.endsWith('.local')
        );
    } catch (e) {
        return false;
    }
};

const getUrlToUse = (settings: AppSettings): string => {
    if (cachedValidUrl && cachedSettingsUrl === settings.jeedomUrl) {
        return cachedValidUrl;
    }
    return getBaseApiUrl(settings);
};

const updateCachedUrl = (settings: AppSettings, newUrl: string) => {
    cachedSettingsUrl = settings.jeedomUrl;
    cachedValidUrl = newUrl;
    console.log("API URL corrected and cached:", newUrl);
};

/**
 * Executes a Standard HTTP GET call to Jeedom API
 * Retourne le JSON brut sans essayer de l'analyser intelligemment.
 */
const jeedomApiCall = async (settings: AppSettings, params: Record<string, string>) => {
    const baseUrl = getUrlToUse(settings);
    
    const urlParams = new URLSearchParams();
    urlParams.append('apikey', settings.apiKey.trim());
    Object.keys(params).forEach(key => urlParams.append(key, params[key]));
    
    const fetchUrl = `${baseUrl}?${urlParams.toString()}`;

    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text || text.trim() === '') return null;

        const cleanText = text.trim();

        // Gestion spécifique pour le ping qui retourne une string brute
        if (cleanText === 'pong') return 'pong';

        try {
            const json = JSON.parse(cleanText);
            
            // Check basic Jeedom error
            if (json.error) {
                const errMsg = typeof json.error === 'string' ? json.error : (json.error.message || JSON.stringify(json.error));
                // Parfois "error" est présent mais vide ou null, on ignore
                if (errMsg && errMsg !== "null") {
                    throw new Error(`Jeedom Error: ${errMsg}`);
                }
            }
            return json;
        } catch (e) {
            // Si le parsing JSON échoue, on vérifie si c'est une requête de type 'cmd' avec un ID.
            // Dans ce cas, Jeedom peut retourner la valeur brute (ex: "Arrêté", "12.5") qui n'est pas du JSON valide si c'est une string sans quotes.
            if (params.type === 'cmd' && params.id) {
                return cleanText;
            }

            // Gestion spécifique pour les scénarios : Jeedom retourne souvent "ok", "1", "true"
            // ou d'autres valeurs texte brutes (non-JSON) pour start/stop/activate/deactivate
            if (params.type === 'scenario') {
                return { result: cleanText || 'ok' };
            }

            // Affichage d'un extrait de la réponse pour le debug
            const snippet = cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText;
            throw new Error(`Réponse Jeedom invalide (pas de JSON): ${snippet}`);
        }
    } catch (error: any) {
        console.error(`API Fail [${JSON.stringify(params)}]:`, error);
        if (error.message === 'Failed to fetch' || error.name === 'TypeError' || (error.message && error.message.includes('ECHEC_RESEAU'))) {
            throw new Error(`ECHEC_RESEAU: Impossible de joindre Jeedom (${baseUrl}). 
            1. Le serveur est peut-être inaccessible (Port 443 fermé ?).
            2. Si certificat auto-signé : Ouvrez l'URL Jeedom dans un nouvel onglet et acceptez le risque.
            3. Vérifiez le CORS dans Jeedom.`);
        }
        throw error;
    }
};

// --- JSON RPC CALL ---
const jeedomJsonRpcCall = async (settings: AppSettings, method: string, params: any = {}) => {
    const baseUrl = getUrlToUse(settings);
    
    // Prepare the JSON-RPC payload
    const rpcPayload = {
        jsonrpc: "2.0",
        method: method,
        params: {
            apikey: settings.apiKey.trim(),
            ...params
        },
        id: Date.now()
    };

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(rpcPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        
        if (json.error) {
             const errMsg = json.error.message || JSON.stringify(json.error);
             if (method === 'scenario::all' && errMsg.includes("Vous n'êtes pas autorisé")) {
                 throw new Error(`AUTH_ERROR_SCENARIO: ${errMsg}`);
             }
             throw new Error(`Jeedom RPC Error: ${errMsg}`);
        }

        return json.result;

    } catch (error: any) {
        if (error.message && error.message.startsWith('AUTH_ERROR_SCENARIO')) {
             console.warn(`[${method}] Accès refusé aux scénarios (droits insuffisants).`);
             throw error;
        }
        console.error(`RPC Fail [${method}]:`, error);
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error(`ECHEC_RESEAU: Impossible de joindre Jeedom (${baseUrl}). 
            1. Le serveur est peut-être inaccessible (Port 443 fermé ?).
            2. Si certificat auto-signé : Ouvrez l'URL Jeedom dans un nouvel onglet et acceptez le risque.
            3. Vérifiez le CORS dans Jeedom.`);
        }
        throw error;
    }
};

// --- API METHODS ---

export const testJeedomConnection = async (settings: AppSettings): Promise<{success: boolean, message: string}> => {
    if(!settings.jeedomUrl || !settings.apiKey) return { success: false, message: "URL ou Clé API manquante" };

    try {
        // Try JSON RPC Ping first as it's more robust
        try {
            const result = await jeedomJsonRpcCall(settings, 'ping');
            if (result === 'pong') return { success: true, message: "Connexion réussie (RPC) !" };
        } catch (e) {
            // Fallback to HTTP API if RPC fails (older Jeedom versions?)
            // 'ping' is not officially documented for HTTP API, so we use 'object' which is lightweight
            const result = await jeedomApiCall(settings, { type: 'object' });
            if (result && typeof result === 'object') {
                return { success: true, message: "Connexion réussie (HTTP) !" };
            }
        }
        return { success: true, message: "Connecté" };

    } catch (e: any) {
        return { success: false, message: `Erreur: ${e.message}` };
    }
};

export const fetchJeedomFullData = async (settings: AppSettings): Promise<JeedomEqLogic[]> => {
    if (settings.useDemoMode) {
        return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(MOCK_DATA))), 500));
    }

    const processEqs = (extractedEqs: any[]) => {
        extractedEqs = normalizeList(extractedEqs);
        const validEqs = extractedEqs.filter((item: any) => item && item.id !== undefined && item.name);

        if (validEqs.length > 0) {
            console.log(`fullData : ${validEqs.length} équipements récupérés.`);
            
            return validEqs.filter((eq: any) => {
                const isEnable = eq.isEnable;
                return isEnable === '1' || isEnable === 1 || isEnable === true;
            }).map((eq: any) => {
                if (eq.cmds) {
                    eq.cmds = normalizeList(eq.cmds);
                } else if (eq.commands) {
                    eq.cmds = normalizeList(eq.commands);
                } else {
                    eq.cmds = [];
                }
                return eq;
            });
        }
        return [];
    };

    try {
        // METHOD 1: JSON RPC jeeObject::full
        const json = await jeedomJsonRpcCall(settings, 'jeeObject::full');
        if (json) {
            // jeeObject::full returns an array of objects (rooms), each with an eqLogics array
            let extractedEqs: any[] = [];
            if (Array.isArray(json)) {
                extractedEqs = json.flatMap(room => Array.isArray(room.eqLogics) ? room.eqLogics : []);
            }
            const processed = processEqs(extractedEqs);
            if (processed.length > 0) return processed;
        }
    } catch (e) {
        console.warn("Echec JSON RPC jeeObject::full, tentative fallback HTTP API...", e);
    }

    try {
        // METHOD 2: HTTP API fullData
        const json = await jeedomApiCall(settings, { type: 'fullData' });
        if (!json) return [];

        let extractedEqs: any[] = [];

        const extractEqs = (root: any): any[] => {
            if (!root) return [];
            if (Array.isArray(root)) {
                const hasSubEqs = root.some(item => item && item.eqLogics && Array.isArray(item.eqLogics));
                if (hasSubEqs) {
                    return root.flatMap(room => Array.isArray(room.eqLogics) ? room.eqLogics : []);
                }
                if (root.length > 0 && root[0] && root[0].id && root[0].eqType_name) {
                     return root;
                }
                return root;
            }
            if (typeof root === 'object') {
                if (root.result) return extractEqs(root.result);
                if (root.eqLogics && Array.isArray(root.eqLogics)) return root.eqLogics;
                const values = Object.values(root);
                if (values.length > 0 && (values[0] as any).id && (values[0] as any).eqType_name) {
                    return values;
                }
            }
            return [];
        };

        extractedEqs = extractEqs(json);
        const processed = processEqs(extractedEqs);
        if (processed.length > 0) return processed;

        console.warn("Format fullData inconnu ou vide, tentative fallback eqLogic::all...");

    } catch (e) {
        console.warn("Echec HTTP API fullData, tentative fallback eqLogic::all...", e);
    }

    // METHOD 3: Fallback JSON RPC eqLogic::all + cmd::all
    console.log("Fallback vers eqLogic::all + cmd::all...");
    try {
        const eqLogicsPromise = jeedomJsonRpcCall(settings, 'eqLogic::all');
        const commandsPromise = jeedomJsonRpcCall(settings, 'cmd::all');

        const [eqRaw, cmdRaw] = await Promise.all([eqLogicsPromise, commandsPromise]);

        const getList = (data: any) => {
             if (data?.result) return normalizeList(data.result);
             return normalizeList(data);
        };

        const eqLogics = getList(eqRaw);
        const allCmds = getList(cmdRaw);

        if (eqLogics.length === 0) {
            return [];
        }

        const processedEqs = eqLogics.map((eq: any) => {
            const eqCmds = allCmds.filter((c: any) => String(c.eqLogic_id) === String(eq.id));
            eqCmds.sort((a: any, b: any) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
            return { ...eq, cmds: eqCmds };
        });

        return processedEqs.filter((eq: JeedomEqLogic) => {
            const isEnable = eq.isEnable as any;
            return isEnable === '1' || isEnable === 1 || isEnable === true;
        });

    } catch (error) {
        console.error("Erreur critique fetchJeedomFullData", error);
        throw error;
    }
};

export const fetchSpecificCommandValues = async (settings: AppSettings, cmdIds: string[]): Promise<Array<{id: string, value: string | number}>> => {
    if (cmdIds.length === 0) return [];
    if (settings.useDemoMode) {
        return cmdIds.map(id => ({ id, value: Math.floor(Math.random() * 100) }));
    }
    
    const promises = cmdIds.map(async (id) => {
        try {
            let val = await jeedomJsonRpcCall(settings, 'cmd::execCmd', { id: id });
            
            // Unpack object if needed
            if (val && typeof val === 'object') {
                if (val.value !== undefined) val = val.value;
                else if (val.result !== undefined) val = val.result;
            }
            
            // Ensure primitive for display
            if (val && typeof val === 'object') {
                try {
                    val = JSON.stringify(val);
                } catch (e) {
                    val = String(val);
                }
            }

            return { id, value: val };
        } catch (e) {
            try {
                const res = await jeedomApiCall(settings, { type: 'cmd', id: id });
                let val = res;
                
                if (val && typeof val === 'object') {
                    if (val.result !== undefined) val = val.result;
                    else if (val.value !== undefined) val = val.value;
                }

                if (val && typeof val === 'object') {
                    try {
                        val = JSON.stringify(val);
                    } catch (e) {
                        val = String(val);
                    }
                }
                
                return { id, value: val };
            } catch (e2) {
                return null;
            }
        }
    });

    const results = await Promise.all(promises);
    return results.filter(r => r !== null) as Array<{id: string, value: string | number}>;
};

export const executeJeedomCommand = async (settings: AppSettings, cmdId: string, options: any = {}): Promise<void> => {
    if (settings.useDemoMode) return;
    if (!cmdId || String(cmdId).trim() === '') {
        console.warn("executeJeedomCommand: ID vide ignoré");
        return;
    }

    try {
        const params: any = { id: cmdId };
        if (options.value !== undefined) {
            params.options = {
                slider: String(options.value),
                title: String(options.value),
                message: String(options.value),
                color: String(options.value)
            };
        }
        await jeedomJsonRpcCall(settings, 'cmd::execCmd', params);
    } catch (e) {
        console.warn("RPC failed, trying HTTP API for command execution...");
        const params: Record<string, string> = { 
            type: 'cmd', 
            id: cmdId 
        };

        if (options.value !== undefined) {
            params.slider = String(options.value);
            params.title = String(options.value);
            params.message = String(options.value);
            params.color = String(options.value); 
        }

        await jeedomApiCall(settings, params);
    }
};

export const fetchJeedomHealth = async (settings: AppSettings): Promise<JeedomHealthItem[]> => {
    if (settings.useDemoMode) return [];

    try {
        let rawData;
        try {
             rawData = await jeedomJsonRpcCall(settings, 'jeedom::isOk');
        } catch(e) {
             // fallback
        }

        if (rawData && typeof rawData === 'object') {
             const items: JeedomHealthItem[] = [];
             Object.keys(rawData).forEach((key) => {
                const val = rawData[key];
                if (typeof val === 'object' && val !== null) {
                    items.push({
                        id: key, 
                        name: key, 
                        state: (val.status === 'OK' || val.state === 'OK') ? 'OK' : 'NOK', 
                        details: val.result || val.comment || JSON.stringify(val), 
                        type: 'other'
                    });
                }
            });
            return items;
        }

        await jeedomJsonRpcCall(settings, 'ping');
        return [{
            id: 'system',
            name: 'API Connection',
            state: 'OK',
            details: 'Connexion API fonctionnelle',
            type: 'network'
        }];

    } catch (e) {
        console.error("Health Fetch Error:", e);
        return [{
            id: 'error',
            name: 'Erreur Connexion',
            state: 'NOK',
            details: (e as Error).message,
            type: 'other'
        }];
    }
};

// --- SCENARIO METHODS (JSON RPC) ---

export const fetchJeedomScenarios = async (settings: AppSettings): Promise<JeedomScenario[]> => {
    if (settings.useDemoMode) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_SCENARIOS), 500));
    }

    try {
        // Use JSON RPC 'scenario::all'
        const result = await jeedomJsonRpcCall(settings, 'scenario::all');
        
        console.log("Raw Scenario RPC Result:", result);

        const list = normalizeList(result);
        console.log("Normalized Scenarios:", list);

        const filtered = list
            .filter((s: any) => s && (s.id !== undefined && s.id !== null) && s.name)
            .map((s: any) => ({
                id: String(s.id), // Ensure ID is string
                name: s.name,
                isActive: s.isActive,
                group: s.group,
                mode: s.mode,
                state: s.state,
                lastLaunch: s.lastLaunch,
                object_id: s.object_id,
                isVisible: s.isVisible
            }));
            
        console.log("Final Filtered Scenarios:", filtered);
        return filtered;
    } catch (e: any) {
        if (e.message && e.message.startsWith('AUTH_ERROR_SCENARIO')) {
             console.log("Scénarios ignorés : L'utilisateur n'a pas les droits nécessaires.");
        } else {
             console.error("Fetch Scenarios Error (RPC):", e);
        }
        // Return empty array instead of throwing to avoid breaking the whole app load
        return [];
    }
};

/**
 * Helper: exécute une action scénario avec double fallback (RPC → HTTP → erreur claire)
 * Ne relance jamais d'erreur si au moins l'une des méthodes réussit.
 */
const executeScenarioAction = async (
    settings: AppSettings,
    scenarioId: string,
    rpcState: string,
    httpAction: string
): Promise<void> => {
    // Tentative 1 : JSON-RPC
    let rpcError: any = null;
    try {
        console.log(`[scenario] RPC attempt: scenario::changeState id=${scenarioId} state=${rpcState}`);
        await jeedomJsonRpcCall(settings, 'scenario::changeState', { id: scenarioId, state: rpcState });
        console.log(`[scenario] RPC success: state=${rpcState}`);
        return; // succès → on sort
    } catch (e: any) {
        rpcError = e;
        console.warn(`[scenario] RPC failed (state=${rpcState}):`, e?.message || e);
    }

    // Tentative 2 : HTTP API fallback
    try {
        console.log(`[scenario] HTTP fallback attempt: type=scenario id=${scenarioId} action=${httpAction}`);
        const result = await jeedomApiCall(settings, { type: 'scenario', id: scenarioId, action: httpAction });
        console.log(`[scenario] HTTP fallback success:`, result);
        return; // succès → on sort
    } catch (e: any) {
        console.error(`[scenario] HTTP fallback also failed (action=${httpAction}):`, e?.message || e);
        // Les deux méthodes ont échoué → on remonte une erreur claire
        const isNetworkError = (err: any) => err?.message?.includes('ECHEC_RESEAU') || err?.name === 'TypeError';
        if (isNetworkError(rpcError) || isNetworkError(e)) {
            throw new Error(`Impossible de joindre Jeedom. Vérifiez la connexion réseau et les paramètres CORS.`);
        }
        throw new Error(`Echec action scénario. RPC: ${rpcError?.message || '?'} | HTTP: ${e?.message || '?'}`);
    }
};

export const executeScenario = async (settings: AppSettings, scenarioId: string): Promise<void> => {
    if (settings.useDemoMode) return;
    await executeScenarioAction(settings, scenarioId, 'run', 'start');
};

export const stopScenario = async (settings: AppSettings, scenarioId: string): Promise<void> => {
    if (settings.useDemoMode) return;
    await executeScenarioAction(settings, scenarioId, 'stop', 'stop');
};

export const toggleScenarioState = async (settings: AppSettings, scenarioId: string, currentState: boolean): Promise<void> => {
    if (settings.useDemoMode) return;
    const state = currentState ? 'disable' : 'enable';
    await executeScenarioAction(settings, scenarioId, state, state);
};

export const getJeedomHistory = async (settings: AppSettings, commandId: string, startTime: string, endTime: string): Promise<any[]> => {
    if (settings.useDemoMode) {
        // Mock data for demo
        const data = [];
        const end = new Date();
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000); // 24h
        for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
            data.push({
                datetime: d.toISOString().slice(0, 19).replace('T', ' '),
                value: Math.floor(Math.random() * 30) + 10
            });
        }
        return new Promise(resolve => setTimeout(() => resolve(data), 500));
    }

    try {
        const result = await jeedomJsonRpcCall(settings, 'cmd::getHistory', {
            id: commandId,
            startTime: startTime,
            endTime: endTime
        });
        return Array.isArray(result) ? result : [];
    } catch (e) {
        console.error("Error fetching history:", e);
        return [];
    }
};

// --- SYSTEM METHODS ---

export const getJeedomUsbMapping = async (settings: AppSettings): Promise<Record<string, string>> => {
    if (settings.useDemoMode) {
        return new Promise(resolve => setTimeout(() => resolve({
            "/dev/ttyUSB0": "Z-Wave Stick (Sigma Designs)",
            "/dev/ttyUSB1": "RFXCom (RFXtrx433)",
            "/dev/ttyACM0": "Zigbee Key (ConBee II)"
        }), 500));
    }
    try {
        const result = await jeedomJsonRpcCall(settings, 'jeedom::getUsbMapping');
        // Result format: { "port": "value", ... } or { "result": { ... } }
        return result || {};
    } catch (e) {
        console.error("Error fetching USB mapping:", e);
        return {};
    }
};

export const jeedomReboot = async (settings: AppSettings): Promise<void> => {
    if (settings.useDemoMode) return new Promise(resolve => setTimeout(resolve, 2000));
    await jeedomJsonRpcCall(settings, 'jeedom::reboot');
};

export const jeedomHalt = async (settings: AppSettings): Promise<void> => {
    if (settings.useDemoMode) return new Promise(resolve => setTimeout(resolve, 2000));
    await jeedomJsonRpcCall(settings, 'jeedom::halt');
};

export const jeedomUpdate = async (settings: AppSettings): Promise<void> => {
    if (settings.useDemoMode) return new Promise(resolve => setTimeout(resolve, 2000));
    await jeedomJsonRpcCall(settings, 'update::update');
};

export const jeedomBackup = async (settings: AppSettings): Promise<void> => {
    if (settings.useDemoMode) return new Promise(resolve => setTimeout(resolve, 2000));
    await jeedomJsonRpcCall(settings, 'jeedom::backup');
};