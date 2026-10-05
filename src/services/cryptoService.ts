// Service using Web Crypto API to encrypt/decrypt sensitive data
// Algorithm: AES-GCM 256-bit with non-extractable key in IndexedDB (W3C Web Crypto)

const LEGACY_STORAGE_NAME = 'jeedom_secure_key';
const DB_NAME = 'easydash_vault';
const DB_VERSION = 1;
const STORE_NAME = 'crypto_store';
const MASTER_KEY_ID = 'master_gcm_key';

// In-memory isolated Vault for runtime secrets (never exposed on window/global)
let _inMemoryApiKey: string = '';

export const setSecretApiKey = (key: string): void => {
    _inMemoryApiKey = (key || '').trim();
};

export const getSecretApiKey = (): string => {
    return _inMemoryApiKey;
};

export const hasSecretApiKey = (): boolean => {
    return _inMemoryApiKey.length > 0;
};

export const clearSecretApiKey = (): void => {
    _inMemoryApiKey = '';
};

// Helper: Convert ArrayBuffer to Hex String
const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string => {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

// Helper: Convert Hex String to ArrayBuffer
const hexToBuffer = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
};

// IndexedDB Helper to safely store non-extractable CryptoKey objects
const openVaultDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error("IndexedDB non disponible"));
            return;
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
};

const getStoredKeyFromIDB = async (): Promise<CryptoKey | null> => {
    try {
        const db = await openVaultDB();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(MASTER_KEY_ID);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return null;
    }
};

const saveKeyToIDB = async (key: CryptoKey): Promise<void> => {
    const db = await openVaultDB();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(key, MASTER_KEY_ID);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

// In-memory cached CryptoKey reference
let _cachedMasterKey: CryptoKey | null = null;

/**
 * Get or create the Master CryptoKey.
 * Security: Key has `extractable: false` and is stored natively in IndexedDB.
 * Even through DevTools / console, `crypto.subtle.exportKey` will throw an error
 * because the browser engine forbids extracting raw key material.
 */
const getMasterKey = async (): Promise<CryptoKey> => {
    if (_cachedMasterKey) return _cachedMasterKey;

    // 1. Check if key is already in IndexedDB
    const existingKey = await getStoredKeyFromIDB();
    if (existingKey) {
        _cachedMasterKey = existingKey;
        return existingKey;
    }

    // 2. Check legacy migration from localStorage (auto-migrate & purge)
    const legacyRawKey = localStorage.getItem(LEGACY_STORAGE_NAME);
    if (legacyRawKey) {
        try {
            const importedKey = await window.crypto.subtle.importKey(
                "jwk",
                JSON.parse(legacyRawKey),
                { name: "AES-GCM" },
                false, // Non-extractable upon migration!
                ["encrypt", "decrypt"]
            );
            await saveKeyToIDB(importedKey);
            localStorage.removeItem(LEGACY_STORAGE_NAME); // Purge from localStorage permanently!
            _cachedMasterKey = importedKey;
            return importedKey;
        } catch (e) {
            console.warn("Échec migration clé legacy, génération d'une nouvelle clé:", e);
            localStorage.removeItem(LEGACY_STORAGE_NAME);
        }
    }

    // 3. Generate a brand new AES-GCM 256-bit key with extractable: false
    const newKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        false, // NON-EXTRACTABLE: Cannot be read/dumped via console or JS!
        ["encrypt", "decrypt"]
    );

    await saveKeyToIDB(newKey);
    _cachedMasterKey = newKey;
    return newKey;
};

export const encryptData = async (text: string): Promise<string> => {
    if (!text) return text;
    try {
        const key = await getMasterKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encoded
        );

        // Format: IV_IN_HEX:CIPHER_IN_HEX
        return `${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
    } catch (e) {
        console.error("Chiffrement échoué :", e);
        throw new Error("Le chiffrement a échoué — la clé API n'a pas été sauvegardée.");
    }
};

export const decryptData = async (cipherText: string): Promise<string> => {
    if (!cipherText || !cipherText.includes(':')) return cipherText;

    try {
        const [ivHex, dataHex] = cipherText.split(':');
        if (!ivHex || !dataHex) return cipherText;

        const key = await getMasterKey();
        const iv = hexToBuffer(ivHex);
        const data = hexToBuffer(dataHex);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Déchiffrement échoué :", e);
        return ""; // Return empty if decryption fails (invalid key or data)
    }
};