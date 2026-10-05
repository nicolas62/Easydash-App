const PBKDF2_V1_PREFIX = 'pbkdf2v1:';
const PBKDF2_V2_PREFIX = 'pbkdf2v2:';
const PBKDF2_V1_ITERATIONS = 100_000;
const PBKDF2_V2_ITERATIONS = 600_000; // OWASP recommendation for PBKDF2-HMAC-SHA256

function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function hexToBuf(hex: string): ArrayBuffer {
    const buf = new ArrayBuffer(hex.length / 2);
    const view = new Uint8Array(buf);
    for (let i = 0; i < view.length; i++) view[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return buf;
}

/**
 * Constant-time comparison between two hex strings to mitigate timing attacks.
 */
function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

/**
 * Hashes a PIN using PBKDF2-SHA-256 with 600,000 iterations and a random 16-byte salt.
 * Format stored: "pbkdf2v2:<salt_hex>:<hash_hex>"
 * The plain-text PIN is never stored.
 */
export async function hashPin(pin: string): Promise<string> {
    const saltBuf = new ArrayBuffer(16);
    crypto.getRandomValues(new Uint8Array(saltBuf));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_V2_ITERATIONS, salt: saltBuf },
        keyMaterial, 256
    );
    return `${PBKDF2_V2_PREFIX}${bufToHex(saltBuf)}:${bufToHex(derived)}`;
}

/**
 * Verifies a PIN against a stored hash.
 * Supports PBKDF2 v2 (600k), PBKDF2 v1 (100k) and legacy plain SHA-256.
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !pin) return false;

    // Version 2: OWASP 600,000 iterations
    if (storedHash.startsWith(PBKDF2_V2_PREFIX)) {
        const parts = storedHash.slice(PBKDF2_V2_PREFIX.length).split(':');
        if (parts.length !== 2) return false;
        const saltBuf = hexToBuf(parts[0]);
        const expected = parts[1];
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']
        );
        const derived = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_V2_ITERATIONS, salt: saltBuf },
            keyMaterial, 256
        );
        return constantTimeCompare(bufToHex(derived), expected);
    }

    // Version 1: 100,000 iterations (backward compatibility)
    if (storedHash.startsWith(PBKDF2_V1_PREFIX)) {
        const parts = storedHash.slice(PBKDF2_V1_PREFIX.length).split(':');
        if (parts.length !== 2) return false;
        const saltBuf = hexToBuf(parts[0]);
        const expected = parts[1];
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']
        );
        const derived = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_V1_ITERATIONS, salt: saltBuf },
            keyMaterial, 256
        );
        return constantTimeCompare(bufToHex(derived), expected);
    }

    // Legacy: plain SHA-256 (no salt) — backward compatibility with legacy widgets
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
    return constantTimeCompare(bufToHex(hashBuffer), storedHash);
}
