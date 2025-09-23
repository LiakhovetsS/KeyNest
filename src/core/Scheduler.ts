import {TypedEventEmitter} from './Emitter';
import {IScheduler, SchedulerEvents,ITask} from "../interface";
import {Task} from "./Task";

export class Scheduler extends TypedEventEmitter<SchedulerEvents> implements IScheduler {
    private tasks: Map<string, ITask> = new Map();

    constructor() {
        super();
    }

    task(name: string, intervalMs: number): string {
        this.stopTask(name);
        const task = new Task(name, intervalMs);
        this.tasks.set(name, task);
        task.on('end', () => {
            this.emit('end', name);
            task.stop();
            this.tasks.delete(name);
        });
        task.start();
        return task.id;
    }

    stopTask(name: string): boolean {
        const task = this.tasks.get(name);
        if (!task) return false;
        const stopped = task.stop();
        this.tasks.delete(name);
        return stopped;
    }

    hasTask(name: string): boolean {
        return this.tasks.has(name);
    }

    stopAll(): void {
        for (const [name, task] of this.tasks) {
            task.stop();
            this.tasks.delete(name);
        }
    }
}