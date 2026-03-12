// Service using Web Crypto API to encrypt/decrypt sensitive data
// Algorithm: AES-GCM

const KEY_STORAGE_NAME = 'jeedom_secure_key';

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

// Get or Create the Master Key
const getMasterKey = async (): Promise<CryptoKey> => {
    let rawKey = localStorage.getItem(KEY_STORAGE_NAME);
    
    if (!rawKey) {
        // Generate a new key
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        );
        
        // Export and save (This is client-side security: protecting against casual snooping/XSS dumps, 
        // but physically the key is next to the lock if user has full device access)
        const exported = await window.crypto.subtle.exportKey("jwk", key);
        localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exported));
        return key;
    }

    // Import existing key
    return await window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(rawKey),
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
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
        console.error("Encryption failed", e);
        return text; // Fallback to plain if crypto fails (unlikely)
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
        console.error("Decryption failed", e);
        return ""; // Return empty if decryption fails (invalid key or data)
    }
};