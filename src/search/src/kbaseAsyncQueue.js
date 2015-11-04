/**
 * Yet another async queue
 * 
 * @module AsyncQueue
 * @author Erik Pearson <eapearson@lbl.gov>
 * @version 0.0.2
 * 
 * @todo complete testing
 * @todo determine if methods are unused, and if so, remove them
 * 
 */



define(['q'], function (Q) {
    "use strict";

    /**
     * A simple first in last out (FILO) job stack which is allowed to build up 
     * for some amount of time, after which the jobs (functions) are run.
     * 
     * The queue has the following properties:
     * - jobs may queued at any time
     * - jobs added during the same interpreter cycle will be run in the order
     *   they were added.
     * - jobs added during the queue pause interval will be run on the same
     *   "run cycle" of the queue.
     * - jobs have an optional error handler to allow an exception to be 
     *   handled in a job-specfic manner.
     * - otherwise, job exceptions are ignored.
     * - after the queue is processed, it is empty.
     * - the queue will be processed during one interpreter cycle, without
     * interruption. 
     * - items may be queued within the queue handler.
     * - items queued within a queue job handler will be added to the next queue,
     * and thus will not be part of the current queue run cycle.
     * 
     * @exports AsyncQueue/AsyncQueue
     */
    var AsyncQueue = Object.create({}, {
        version: {
            value: '0.0.2',
            writable: false
        },
        /**
         * Initialize the instance state for this object.
         * 
         * @function init
         * 
         * @param {object} cfg - configuration information
         * 
         * @returns {object} a reference to the object itself for chaining
         * 
         * @private
         */
        init: {
            value: function (cfg) {
                this.queue = [];
                this.queuePauseTime = (cfg && cfg.queuePauseTime) || 100;
                return this;
            }
        },
       
        /**
         * Run the queue, processing all pending items.
         * It is designed to be run at arbitrary times, so it will set a timeout
         * after which it will process the queue. This allows other items to be
         * added to the queue.
         * 
         * @function run
         * 
         * @returns {this} a reference to the object, to enable chaining.
         * 
         * @private
         */
        run: {
            value: function () {
                var that = this;
                this.timer = window.setTimeout(function () {
                    that.processQueue();
                }.bind(this), this.queuePauseTime);
                return this;
            }
        },
        /**
         * Process the entire queue, executing all items in the queue in order.
         * 
         * @function processQueue
         * 
         * @returns {this} a reference to this object to enable chaining.
         * 
         * @private
         */
        processQueue: {
            value: function () {
                var queue = this.queue;
                this.queue = [];
                var item = queue.shift();
                while (item) {
                    try {
                        item.onRun(this);
                    } catch (exOnRun) {
                        if (item.onError) {
                            try {
                                item.onError(exOnRun);
                            } catch (ignore) {
                                // console.log('ERROR running onerror');
                                // console.log(e);
                            }
                        }
                    }
                    item = queue.shift();
                }
                return this;
            }
        },
        
        // PUBLIC
         /**
         * Add an item to the queue.
         * 
         * @function addItem
         * 
         * @param {Any} item - an arbitrary object to be added to the queue
         * 
         * @returns {this} a reference to the object itself
         * 
         * @public
         */
        addItem: {
            value: function (item) {
                this.queue.push(item);
                this.run();
                return this;
            }
        }
    });
    return AsyncQueue;
});