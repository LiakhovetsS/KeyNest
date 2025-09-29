import {TypedEventEmitter} from './Emitter';
import {Key, pruneList, RecordEntry, StoreEvents, StoreOptions, StoreStats} from '../interface';
import {Scheduler} from "./Scheduler";

/**
 * @class KeyNestStore
 * @description Типобезпечне сховище ключ-значення з підтримкою TTL, автоматичним очищенням та подіями.
 * @template K - Тип ключа (string | number | symbol)
 * @template V - Тип значення
 */
export class Store<K extends Key, V> extends TypedEventEmitter<StoreEvents<K, V>> {
    private store = new Map<K, RecordEntry<V>>();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;
    private readonly defaultTTLms: number = 0;
    private readonly options: Required<
        Pick<StoreOptions, 'cleanupEnabled' | 'cleanupIntervalMs' | 'staleThresholdMs'>
    >;
    private scheduler = new Scheduler();

    constructor(opts?: StoreOptions) {
        super();
        this.options = {
            cleanupEnabled: Boolean(opts?.cleanupEnabled) ?? false,
            cleanupIntervalMs: opts?.cleanupIntervalMs ?? 60 * 60 * 1000,
            staleThresholdMs: opts?.staleThresholdMs ?? 2 * 60 * 60 * 1000,
        };

        if (this.options.cleanupEnabled) {
            this.startCleanup();
        }

        this.scheduler.on('end', (name: string) => {
            const value = name.replace('expire-', '');
            const key = (String(value) as K);
            const entry = this.store.get(key);
            if (!entry) return;
            this.store.delete(key);
            this.emit('expired', key, entry.value);
        });

    }

    /**
     * @property entriesSnapshot Повертає знімок поточних записів у сховищі
     * @returns Масив об'єктів з ключами та відповідними записами
     * @description Знімок не включає прострочені записи, оскільки вони видаляються при доступі.
     * */
    get entriesSnapshot(): { name: K; entry: RecordEntry<V> }[] {
        return Array.from(this.store, ([name, entry]) => ({name, entry}));
    }

    /**
     * @method set Додає або оновлює запис у сховищі
     * @param key - Ключ запису
     * @param value - Значення запису
     * @param ttlMs - Час життя запису в мілісекундах (необов'язково). Якщо не вказано, використовується defaultTTLms.
     * @description Якщо ttlMs не вказано, використовується defaultTTLms. Якщо defaultTTLms також 0, запис не має терміну дії.
     *
     * */
    set(key: K, value: V, ttlMs = 0): void {
        const now = Date.now();
        const effectiveTTL = ttlMs ?? this.defaultTTLms;
        const entry: RecordEntry<V> = {
            value,
            createdAt: now,
            lastAccessed: now,
            ttlMs: effectiveTTL,
            expiresAt: effectiveTTL ? now + effectiveTTL : undefined,
        };
        if (ttlMs > 0) {
            entry.schedulerTaskId = this.scheduler.task(`expire-${String(key)}`, ttlMs);
        }
        this.store.set(key, entry);

        if (this.options.cleanupEnabled && !this.cleanupTimer) {
            this.startCleanup();
        }
    }

    /**
     * @method get Отримує значення за ключем
     * @param key - Ключ запису
     * @returns Значення запису або null, якщо запис не існує або прострочено
     * @description Якщо запис прострочено, він видаляється зі сховища і генерується подія 'expired'.
     *
     * */
    get(key: K): V | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (this.checkExpired(key, entry)) return null;
        entry.lastAccessed = Date.now();
        return entry.value;
    }

    /**
     * @method has Перевіряє наявність ключа у сховищі
     * @param key - Ключ запису
     * @returns true, якщо запис існує і не прострочено, інакше false
     * @description Якщо запис прострочено, він видаляється зі сховища і генерується подія 'expired'.
     * */
    has(key: K): boolean {
        const entry = this.store.get(key);
        if (!entry) return false;
        return !this.checkExpired(key, entry);

    }

    /**
     * @method delete Видаляє запис за ключем
     * @param key - Ключ запису
     * @returns true, якщо запис існував і був видалений, інакше false
     * @description Якщо запис існував і був видалений, генерується подія 'deleted'.
     *
     * */
    delete(key: K): boolean {
        const entry = this.store.get(key);
        if (entry && entry.schedulerTaskId) {
            this.scheduler.stopTask(key as string);
        }
        const existed = this.store.delete(key);
        if (existed) {
            this.emit('deleted', key, entry?.value);
        }
        return existed;
    }

    /**
     * @method clear Очищає всі записи у сховищі
     * @description Генерує подію 'deleted' для кожного видаленого запису.
     *
     * */
    clear(): void {
        for (const [key, entry] of this.store.entries()) {
            if (entry.schedulerTaskId) {
                this.scheduler.stopTask(key as string);
            }
            this.emit('deleted', key, entry.value);
        }
        this.store.clear();
    }

    /**
     * @method stats Повертає статистику сховища
     * @returns Об'єкт StoreStats з інформацією про розмір сховища, загальну кількість ключів та кількість ключів з TTL
     *
     *
     * */
    stats(): StoreStats {
        let keysWithTTL = 0;
        for (const entry of this.store.values()) {
            if (entry.ttlMs !== undefined) keysWithTTL++;
        }
        return {
            size: this.store.size,
            totalKeys: this.store.size,
            keysWithTTL,
        };
    }

    /**
     * @method pruneNow Виконує негайне очищення прострочених та застарілих записів
     * @description Перевіряє всі записи у сховищі і видаляє ті, що прострочені або застарілі.
     * Генерує відповідні події 'expired' для кожного видаленого запису.
     * Якщо запис прострочено, він видаляється зі сховища і генерується подія 'expired'.
     * */
    pruneNow(): void {
        const now = Date.now();
        const list: pruneList<V> = [];
        for (const [key, entry] of this.store.entries()) {
            if (entry.lastAccessed !== undefined && now >= entry.lastAccessed) {
                if (entry.schedulerTaskId) {
                    this.scheduler.stopTask(key as string);
                }
                this.store.delete(key);
                list.push({key, entry});
            }
        }
        if (list.length === 0) {
            this.stopCleanup();
        }
        this.emit('prune', list);

    }

    /**
     * @method startCleanup Запускає автоматичне очищення прострочених та застарілих записів
     * @description Якщо очищення вже запущено, метод нічого не робить.
     * Інакше встановлює інтервал для виклику pruneNow() відповідно до cleanupIntervalMs.
     * Генерує помилки у випадку проблем під час очищення, але не зупиняє таймер.
     *
     * */
    startCleanup(): void {
        if (this.cleanupTimer) return;
        this.cleanupTimer = setInterval(() => {
            try {
                this.pruneNow();
            } catch (err) {
                // console.error('cleanup error', err);
            }
        }, this.options.cleanupIntervalMs);
    }

    /**
     * @method stopCleanup Зупиняє автоматичне очищення прострочених та застарілих записів
     * @description Якщо очищення не запущено, метод нічого не робить.
     * Інакше очищає інтервал і встановлює cleanupTimer в null.
     * */
    stopCleanup(): void {
        if (!this.cleanupTimer) return;
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
    }

    /**
     * @method updateOptions Оновлює опції сховища
     * @param opts - Об'єкт з новими опціями. Можна оновити будь-яку з опцій: cleanupEnabled, cleanupIntervalMs, staleThresholdMs.
     * @description Якщо змінено cleanupEnabled, метод відповідно запускає або зупиняє автоматичне очищення.
     * Якщо змінено cleanupIntervalMs і очищення увімкнено, метод перезапускає таймер з новим інтервалом.
     * */
    updateOptions(opts: Partial<StoreOptions>): void {
        if (opts.cleanupIntervalMs !== undefined)
            this.options.cleanupIntervalMs = opts.cleanupIntervalMs;
        if (opts.staleThresholdMs !== undefined)
            this.options.staleThresholdMs = opts.staleThresholdMs;
        if (opts.cleanupEnabled !== undefined) this.options.cleanupEnabled = opts.cleanupEnabled;

        if (this.options.cleanupEnabled && !this.cleanupTimer) {
            this.startCleanup();
        } else if (!this.options.cleanupEnabled && this.cleanupTimer) {
            this.stopCleanup();
        } else if (this.options.cleanupEnabled && this.cleanupTimer) {
            this.stopCleanup();
            this.startCleanup();
        }
    }


    /**
     * @method checkExpired Перевіряє, чи прострочено запис, і видаляє його, якщо так
     * @param key - Ключ запису
     * @param entry - Запис для перевірки
     * @returns true, якщо запис був прострочений і видалений, інакше false
     * @description Якщо запис прострочено, він видаляється зі сховища і генерується подія 'expired'.
     * */
    private checkExpired(key: K, entry: RecordEntry<V>): boolean {
        if (entry.expiresAt !== undefined && Date.now() >= entry.expiresAt) {
            if (entry && entry.schedulerTaskId) {
                this.scheduler.stopTask(key as string);
            }
            this.store.delete(key);
            this.emit('expired', key, entry.value);
            return true;
        }
        return false;
    }
}