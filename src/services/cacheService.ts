
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class CacheService {
    private static instance: CacheService;
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default

    private constructor() {}

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    public set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    public get<T>(key: string, ttl: number = this.DEFAULT_TTL): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    public clear(): void {
        this.cache.clear();
    }

    public remove(key: string): void {
        this.cache.delete(key);
    }
}

export const cacheService = CacheService.getInstance();
