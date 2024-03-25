import { v4 as uuidv4 } from 'uuid';

export type TaskID = string;

export interface Task<ResultType> {
    id: TaskID;
    promise: Promise<ResultType>;
    isCanceled: boolean;
}

// type Request<ParamType, ResultType> = (param: ParamType) => Promise<ResultType>;

export default abstract class CancelableRequest<ParamType, ResultType> {
    pendingTasks: Map<TaskID, Task<ResultType>>;
    isCanceled: boolean;
    constructor() {
        this.pendingTasks = new Map<TaskID, Task<ResultType>>();
        this.isCanceled = false;
    }

    newID() {
        return uuidv4();
    }

    cancel(task: Task<ResultType>) {
        task.isCanceled = true;
        this.pendingTasks.delete(task.id);
    }

    cancelPending() {
        this.pendingTasks.forEach((task) => {
            this.cancel(task);
        });
    }

    done(task: Task<ResultType>) {
        this.pendingTasks.delete(task.id);
    }

    spawn(param: ParamType): Task<ResultType> {
        this.cancelPending();
        return this.request(param);
    }

    abstract request(param: ParamType): Task<ResultType>;
}