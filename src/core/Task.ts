import {TypedEventEmitter} from './Emitter';
import {ITask, TaskEvents} from "../interface";
import {setTimeout} from "node:timers";

export class Task extends TypedEventEmitter<TaskEvents> implements ITask {
    private readonly name: string;
    private readonly intervalMs: number
    private isRunning: boolean = false;
    private timer: NodeJS.Timeout | undefined = undefined;
    private setTime = setTimeout;
    private clearTime = clearTimeout;
    private _id: string = this.generateId();

    get id(): string {
        return this._id;
    }


    constructor(name: string, intervalMs: number) {
        super();
        this.name = name;
        this.intervalMs = intervalMs;
    }

    get active(): boolean {
        return !!this.timer;
    }

    start(): boolean {
        this.stop();
        if (this.isRunning) return false;
        if (this.intervalMs <= 0) return false;
        this.timer = this.setTime(() => {
            this.isRunning = true;
            this.emit('end', this);
        }, this.intervalMs);
        return true;
    }

    stop(): boolean {
        if (!this.active || this.isRunning) return false;
        this.clearTime(this.timer);
        this.timer = undefined;
        this.isRunning = false;
        return true;
    }

    private generateId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
}