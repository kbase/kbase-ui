export interface JobConfig {
    description: string;
}

export class Job {
    description: string;
    constructor(config: JobConfig) {
        this.description = config.description;
    }

    getDescription() {
        return this.description;
    }

    run() {
        // does nothing...
        throw new Error('Must override the run method');
    }
}

export interface TaskConfig {
    runInitially: boolean;
    interval: number;
}

export class Task {
    runInitially: boolean;
    interval: number;
    lastRun: number | null;
    jobs: Array<Job>;
    constructor(config: TaskConfig) {
        this.runInitially = config.runInitially;
        this.interval = config.interval;

        this.lastRun = null;

        this.jobs = [];
    }

    getInterval() {
        return this.interval;
    }

    setInterval(newInterval: number) {
        this.interval = newInterval;
    }

    getRunInitially() {
        return this.runInitially;
    }

    getLastRun() {
        return this.lastRun;
    }

    doContinue() {
        return true;
    }

    addJob(job: Job) {
        this.jobs.push(job);
    }

    reset() {
        this.lastRun = null;
    }

    run() {
        return Promise.all(
            this.jobs.map((job) => {
                try {
                    return job.run();
                } catch (ex) {
                    const message = (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return 'Unknown error';
                    })();
                    throw new Error(
                        `Error running poller task job: ${message}`
                    );
                }
            })
        );
    }
}

export interface PollerConfig {
    task: Task;
}

export interface Poll {
    id: number | null;
    timer: number | null;
    canceled: boolean;
}

export default class Poller {
    running: boolean;
    task: Task;
    currentPoll: Poll = {
        id: null,
        timer: 0,
        canceled: false,
    };
    lastId: number = 0;
    constructor({ task }: PollerConfig) {
        this.running = false;
        this.task = task;
    }

    nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    async start() {
        if (!this.task) {
            throw new Error('No task defined for this poller');
        }
        this.task.reset();
        this.running = true;
        if (this.task.runInitially) {
            if (this.task.doContinue) {
                if (!this.task.doContinue()) {
                    this.stop();
                    return;
                }
            }
            await this.runTask();
            this.poll();
        } else {
            this.poll();
        }
        return this;
    }

    stop() {
        this.running = false;
        return this;
    }

    timestamp() {
        return new Date().toLocaleString();
    }

    runTask() {
        if (this.task === null) {
            return;
        }
        return this.task
            .run()
            .catch((err) => {
                console.error(
                    this.timestamp() + ': Error while running task',
                    err
                );
            })
            .finally(() => {
                // console.log(timestamp() + ': ran task in ' + (new Date().getTime() - start) + 'ms');
            });
    }

    poll() {
        // If we aren't polling at all, ignore.
        if (!this.running) {
            return;
        }

        // If called when a poll is already waiting, just ignore.
        // The proper way is to cancel the original one.
        if (this.currentPoll === null) {
            return;
        }
        if (this.currentPoll.timer) {
            return;
        }

        // This is the global current poll. It can be touched during cancellation
        // to signal to the timer which has captured it to halt.
        this.currentPoll = {
            id: this.nextId(),
            timer: null,
            canceled: false,
        };

        if (this.task === null) {
            return;
        }

        this.currentPoll.timer = window.setTimeout(async () => {
            // Store a private reference so new pollers don't interfere if they are
            // created while we are still running.
            const thisPoll = this.currentPoll;
            if (thisPoll.canceled) {
                // don't do it!
                console.warn(`poll cancelled! ${thisPoll.id}`);
            }
            if (this.task === null) {
                return;
            }
            if (this.task.doContinue) {
                if (!this.task.doContinue()) {
                    this.stop();
                    return;
                }
            }
            try {
                await this.runTask();
            } finally {
                thisPoll.timer = null;
                this.poll();
            }
        }, this.task.getInterval());
    }

    cancelCurrentPoll() {
        if (this.currentPoll.timer) {
            window.clearTimeout(this.currentPoll.timer);
            this.currentPoll.timer = null;
            this.currentPoll.canceled = true;
        }
    }

    async force() {
        if (!this.running) {
            this.running = true;
        } else {
            this.cancelCurrentPoll();
        }
        try {
            await this.runTask();
        } finally {
            this.poll();
        }
    }

    restart() {
        if (!this.running) {
            this.running = true;
        } else {
            this.cancelCurrentPoll();
        }
        this.poll();
    }

    update(config: TaskConfig) {
        if (config.interval && this.task) {
            if (config.interval !== this.task.getInterval()) {
                this.task.setInterval(config.interval);
                this.restart();
            }
        }
    }
}

export function makePoller({
    interval,
    fun,
    description,
    runInitially,
}: {
    interval: number;
    description: string;
    runInitially: boolean;
    fun: () => void;
}) {
    class MyJob extends Job {
        constructor() {
            super({
                description,
            });
        }
        run() {
            return fun();
        }
    }
    const job = new MyJob();
    const task = new Task({
        interval,
        runInitially,
    });
    task.addJob(job);
    const poller = new Poller({
        task: task,
    });
    return poller;
}
// return {Poller, Task, Job, makePoller};
