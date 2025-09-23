import { EventEmitter } from 'node:events';

/**
 * @class TypedEventEmitter
 * @description Типобезпечний EventEmitter
 * @template T - Інтерфейс подій, де ключі - назви подій, а значення - типи слухачів
 * @example
 * interface MyEvents {
 *   data: (data: string) => void;
 *   error: (error: Error) => void;
 * }
 *
 * const emitter = new TypedEventEmitter<MyEvents>();
 * emitter.on('data', (data) => { console.log(data); });
 * emitter.emit('data', 'Hello, World!');
 */
export class TypedEventEmitter<T> {
    private emitter = new EventEmitter();

    /**
     * @param {'expired'|'deleted'|'prune'} event
     * @param {Function} listener
     */
    on<K extends keyof T>(event: K, listener: T[K]): this {
        this.emitter.on(event as string, listener as any);
        return this;
    }

    once<K extends keyof T>(event: K, listener: T[K]): this {
        this.emitter.once(event as string, listener as any);
        return this;
    }

    off<K extends keyof T>(event: K, listener: T[K]): this {
        this.emitter.off(event as string, listener as any);
        return this;
    }

    emit<K extends keyof T>(event: K, ...args: T[K] extends ((...args: infer P) => any) ? P : never[]): boolean {
        return this.emitter.emit(event as string, ...args);
    }
}