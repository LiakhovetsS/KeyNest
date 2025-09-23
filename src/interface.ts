export type Key = string | number | symbol;


/**
 * @interface StoreOptions Опції для KeyValueStore
 * - cleanupEnabled?: boolean - Чи увімкнено автоматичне очищення прострочених записів. За замовчуванням false.
 * - cleanupIntervalMs?: number - Інтервал для автоматичного очищення (в мілісекундах). За замовчуванням 3600000 (1 година).
 * - staleThresholdMs?: number - Поріг часу бездіяльності для позначення запису як "застарілого" (в мілісекундах). За замовчуванням 7200000 (2 години).
 * */
export interface StoreOptions {
    cleanupEnabled?: boolean;
    cleanupIntervalMs?: number;
    staleThresholdMs?: number;
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
    schedulerTaskId?: string|undefined;
}

export interface StoreStats {
    size: number;
    totalKeys: number;
    keysWithTTL: number;
}

export type pruneList<V> = { key: Key; entry: RecordEntry<V> }[]

/**
 * @interface StoreEvents Події, що генеруються KeyValueStore
 * - expired: Викликається, коли запис прострочено. Аргументи: ключ, запис.
 * - deleted: Викликається, коли запис видалено. Аргументи: ключ, (необов'язково) запис.
 */
export interface StoreEvents<K, V> {
    expired: (key: K, entry: V) => void;
    deleted: (key: K, entry?: V) => void;
    prune: (list: pruneList<V>) => void;
}

/**
 * @interface ITask Представляє завдання, яке можна запускати та зупиняти
 * - start(): boolean - Запускає завдання. Повертає true, якщо завдання успішно запущено, і false в іншому випадку.
 * - stop(): boolean - Зупиняє завдання. Повертає true, якщо завдання успішно зупинено, і false в іншому випадку.
 * */
export interface ITask {
    start(): boolean;
    stop(): boolean;
    id: string;
}

/**
 * @interface IScheduler Представляє планувальник завдань
 * - task(name: string, intervalMs: number): ITask - Створює та запускає нове завдання з заданим ім'ям, інтервалом і функцією виконання. Повертає об'єкт ITask.
 * - hasTask(name: string): boolean - Перевіряє, чи існує завдання з заданим ім'ям. Повертає true, якщо завдання існує, і false в іншому випадку.
 * - stopTask(name: string): boolean - Зупиняє завдання з заданим ім'ям. Повертає true, якщо завдання успішно зупинено, і false в іншому випадку.
 * - stopAll(): void - Зупиняє всі активні завдання.
 * */
export interface IScheduler {
    task(name: string, intervalMs: number): string;

    hasTask(name: string): boolean;

    stopTask(name: string): boolean;

    stopAll(): void;
}

/**
 * @interface TaskEvents Події, що генеруються завданням
 * - end: Викликається, коли завдання завершується. Аргументи: результат (будь-який тип), завдання (ITask).
 * */
export interface TaskEvents {
    end: (task: ITask) => void;
}

export interface SchedulerEvents {
    end: (name: string) => void
}