const PBKDF2_PREFIX = 'pbkdf2v1:';
const PBKDF2_ITERATIONS = 100_000;

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
 * Hashes a PIN using PBKDF2-SHA-256 with a random 16-byte salt.
 * Format stored: "pbkdf2v1:<salt_hex>:<hash_hex>"
 * The plain-text PIN is never stored.
 */
export async function hashPin(pin: string): Promise<string> {
    const saltBuf = new ArrayBuffer(16);
    crypto.getRandomValues(new Uint8Array(saltBuf));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: saltBuf },
        keyMaterial, 256
    );
    return `${PBKDF2_PREFIX}${bufToHex(saltBuf)}:${bufToHex(derived)}`;
}

/**
 * Verifies a PIN against a stored hash.
 * Supports both the new PBKDF2 format and the legacy plain SHA-256 format
 * so existing widget configs continue to work after the upgrade.
 */
export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
    if (storedHash.startsWith(PBKDF2_PREFIX)) {
        const parts = storedHash.slice(PBKDF2_PREFIX.length).split(':');
        if (parts.length !== 2) return false;
        const saltBuf = hexToBuf(parts[0]);
        const expected = parts[1];
        const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']
        );
        const derived = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', iterations: PBKDF2_ITERATIONS, salt: saltBuf },
            keyMaterial, 256
        );
        return bufToHex(derived) === expected;
    }
    // Legacy: plain SHA-256 (no salt) — backward compatibility with existing widgets
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
    return bufToHex(hashBuffer) === storedHash;
}
