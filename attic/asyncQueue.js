/*global define */
/*jslint white: true */

define([
    'promise'
], function (Promise) {
    'use strict';

    /**
     * A simple first in last out (FILO) job stack which is allowed to build up 
     * for some amount of time, after which the jobs (functions) are run.
     * 
     * The queue has the following properties:
     * - jobs may queued at any time
     * - jobs added during the same interpreter cycle will be run in the order
     *   they were added.
     * - jobs added during the queue pause interval will be run on the same
     *   'run cycle' of the queue.
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

    function factory(config) {
        var queue = [],
            queuePauseTime = (config && config.queuePauseItme) || 0,
            itemId = 0,
            timer;


        /**
         * Process the entire queue, executing all items in the queue in order.
         * 
         * @function processQueue
         * 
         * @returns {this} a reference to this object to enable chaining.
         * 
         * @private
         */
        function processQueue() {
            //var queueToProcess = queue;
            //queue = [];
            //stop();
            var item = queue.shift();
            if (item) {
                try {
                    item.onRun();
                } catch (ex) {
                    if (item.onError) {
                        try {
                            item.onError(ex);
                        } catch (ignore) {
                            console.log('ERROR running onerror');
                            console.log(ex);
                        }
                    } else {
                        console.log('Error processing queue item');
                        console.log(ex);
                    }
                } finally {
                    start();
                }
            }
        }


        function start() {
            timer = window.setTimeout(function () {
                processQueue();
            }, queuePauseTime);
        }

        function stop() {
            window.clearTimeout(timer);
            timer = null;
        }

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
        function addItem(item) {
            itemId += 1;
            item.id = itemId;
            queue.push(item);
            start();
        }

        return {
            addItem: addItem
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});