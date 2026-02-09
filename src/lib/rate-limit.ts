// ===============================================
// ClubForge - In-Memory Rate Limiter
// Sliding-window rate limiting for API routes
// ===============================================

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitResult {
    /** Whether the request is allowed */
    success: boolean;
    /** Remaining requests in the current window */
    remaining: number;
    /** Unix timestamp (ms) when the window resets */
    reset: number;
}

interface RateLimitOptions {
    /** Maximum requests allowed in the window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

// In-memory store — works for single-instance deployments.
// For multi-instance, swap with Redis/Upstash.
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup — runs every 60 seconds to evict expired entries
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now >= entry.resetTime) {
                store.delete(key);
            }
        }
        // If nothing left, stop the interval
        if (store.size === 0 && cleanupInterval) {
            clearInterval(cleanupInterval);
            cleanupInterval = null;
        }
    }, 60_000);
    // Unref so it doesn't prevent Node.js from exiting
    if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
        cleanupInterval.unref();
    }
}

/**
 * Check and consume a rate-limit token for the given identifier.
 *
 * @param identifier - Unique key for the rate-limit bucket (e.g. IP, user ID)
 * @param options    - { maxRequests, windowMs }
 * @returns          - { success, remaining, reset }
 *
 * @example
 * const ip = request.headers.get('x-forwarded-for') || 'unknown';
 * const { success, remaining } = rateLimit(ip, { maxRequests: 30, windowMs: 60_000 });
 * if (!success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export function rateLimit(
    identifier: string,
    { maxRequests, windowMs }: RateLimitOptions,
): RateLimitResult {
    ensureCleanup();

    const now = Date.now();
    const entry = store.get(identifier);

    // First request or window expired — start fresh
    if (!entry || now >= entry.resetTime) {
        const resetTime = now + windowMs;
        store.set(identifier, { count: 1, resetTime });
        return { success: true, remaining: maxRequests - 1, reset: resetTime };
    }

    // Within window — increment
    entry.count += 1;

    if (entry.count > maxRequests) {
        return { success: false, remaining: 0, reset: entry.resetTime };
    }

    return {
        success: true,
        remaining: maxRequests - entry.count,
        reset: entry.resetTime,
    };
}

/**
 * Create a rate-limit checker with preset options.
 * Useful for defining route-specific limiters.
 *
 * @example
 * const authLimiter = createRateLimiter({ maxRequests: 30, windowMs: 60_000 });
 * // In route handler:
 * const { success } = authLimiter(ip);
 */
export function createRateLimiter(options: RateLimitOptions) {
    return (identifier: string): RateLimitResult => rateLimit(identifier, options);
}
