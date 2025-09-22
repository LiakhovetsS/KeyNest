export type Key = string | number | symbol;

/**
 * @interface StoreOptions Опції для KeyValueStore
 * - cleanupEnabled?: boolean - Чи увімкнено автоматичне очищення прострочених записів. За замовчуванням false.
 * - cleanupIntervalMs?: number - Інтервал для автоматичного очищення (в мілісекундах). За замовчуванням 3600000 (1 година).
 * - staleThresholdMs?: number - Поріг часу бездіяльності для позначення запису як "застарілого" (в мілісекундах). За замовчуванням 7200000 (2 години).
 * - touchOnGet?: boolean - Чи оновлювати час останнього доступу при отриманні запису. За замовчуванням true.
 * */
export interface StoreOptions {
    cleanupEnabled?: boolean;
    cleanupIntervalMs?: number;
    staleThresholdMs?: number;
    touchOnGet?: boolean;
}

/**
 * @interface RecordEntry Представляє запис у сховищі
 * - value: V - Значення запису.
 * - createdAt: number - Час створення запису (в мілісекундах з епохи).
 * - lastAccessed: number - Час останнього доступу до запису (в мілісекундах з епохи).
 * - ttlMs?: number - Час життя запису (в мілісекундах). Необов'язковий.
 * - expiresAt?: number - Час, коли запис спливає (в мілісекундах з епохи). Необов'язковий.
 *
 * */
export interface RecordEntry<V> {
    value: V;
    createdAt: number;
    lastAccessed: number;
    ttlMs?: number;
    expiresAt?: number;
}

export interface StoreStats {
    size: number;
    totalKeys: number;
    keysWithTTL: number;
}

/**
 * @interface StoreEvents Події, що генеруються KeyValueStore
 * - expired: Викликається, коли запис прострочено. Аргументи: ключ, запис.
 * - stale: Викликається, коли запис позначено як "застарілий". Аргументи: ключ, запис.
 * - deleted: Викликається, коли запис видалено. Аргументи: ключ, (необов'язково) запис.
 */
export interface StoreEvents<K, V> {
    expired: (key: K, entry: RecordEntry<V>) => void;
    stale: (key: K, entry: RecordEntry<V>) => void;
    deleted: (key: K, entry?: RecordEntry<V>) => void;
}