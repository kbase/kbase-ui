/**
 * An object which which allows state to be used asynchronously.
 * It solves the problem of arbitrary asynchronously loaded modules, for 
 * example widgets, to access shared state when that shared state is also 
 * available asynchronously. 
 * The basic solutions are syncronous access, persisten listeners, one-time
 * listeners, and promise wrappers.
 * 
 * @module StateMachine
 * @author Erik Pearson <eapearson@lbl.gov>
 * @version 0.0.2
 * 
 * @todo complete testing
 * @todo determine if methods are unused, and if so, remove them
 * 
 */

/**
 * An ordered list of properties that specify a path into an object. Each
 * path item represents a property name of the current object. The first 
 * item represents a property of the immediate object, the second a property
 * of the value of the first property, if that contained an object, and so
 * forth. The canonical representation is an array of strings, but a string
 * with property components separated by dots is a natural and easier form
 * for people.
 * 
 * @typedef {(string|string[])} PropertyPath
 */

/**
 * Any Javsascript type.
 * 
 * @typedef {(object|string|number|boolean|undefined|function)} Any
 */

define(['kb.utils', 'kb.asyncqueue', 'q'], function (Utils, AsyncQueue, Q) {
    "use strict";
    var StateMachine = Object.create({}, {
        /**
         * The version of this object definition.
         * 
         * @const
         * @private
         * 
         * @type {string}
         * 
         */
        version: {
            value: '0.0.2',
            writable: false
        },
        /**
         * Initializes instance properties.
         * 
         * @function
         * @private
         * 
         * @param {object} cfg - a configuration object
         * 
         * @todo specify properties of this object
         * 
         */
        init: {
            value: function (cfg) {
                this.state = {};
                this.listeners = {};
                this.queue = Object.create(AsyncQueue).init();
                return this;
            }
        },
        /**
         * Sets a state object for the given property path.
         * The setting of a state object may trigger listener callbacks.
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath} key - a path to an object stored in the state.
         * At present only top-level properties are suppored.
         * @param {Any} value - a value to be stored on this state property.
         * 
         * @returns {this} a reference to the object to allow chaining
         * 
         */
        setItem: {
            value: function (key, value) {
                var oldState = Utils.getProp(this.state, key);
                if (this.listeners[key]) {
                    var newListeners = [];
                    this.listeners[key].forEach(function (item) {
                        this.queue.addItem({
                            onRun: (function (fun, value, oldvalue, machine) {
                                return function () {
                                    try {
                                        fun(value, oldvalue, machine);
                                    } catch (ex) {
                                        //TODO: need a sensible way to manage exception reporting.
                                        //console.log('EX running onrun handler');
                                        //console.log(ex);
                                    }
                                };
                            }(item.onSet, value, (oldState && oldState.value), this))
                        });
                        if (!item.oneTime) {
                            newListeners.push(item);
                        }
                    }.bind(this));
                    this.listeners[key] = newListeners;
                }
                Utils.setProp(this.state, key, {status: 'set', value: value, time: new Date()});
                return this;
            }
        },
        /**
         * Return the value of the state object as specified by the property path
         * into the state object. Although this will work for sub-properties, 
         * the state machine is not yet designed to do anything special, so best
         * to just use top level keys.
         * This method is synchronous, so if the state object is not yet set,
         * it will return undefined or the default value if provided.
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath} key - the key to the state object desired
         * @param {Any} defaultValue - a value to return if the state object was
         * not found.
         * 
         * @returns {Any) either the state object, the default value, or undefined.
         */
        getItem: {
            value: function (key, defaultValue) {
                var item = Utils.getProp(this.state, key);
                if (item !== undefined) {
                    if (item.status === 'set') {
                        return item.value;
                    } else {
                        //TODO: is this the best thing to do?
                        return defaultValue;
                    }
                } else {
                    return defaultValue;
                }
            }
        },
        /**
         * Use this method to determine whether or not the state property
         * exists. 
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath{} key - the key to the state object desired.
         * 
         * @returns {boolean} true if the property was found, false otherwise.
         */
        hasItem: {
            value: function (key) {
                return Utils.hasProp(this.state, key);
            }
        },
        /**
         * Sets a state property into an error state.
         * This should be called when an attempt to obtain the state value 
         * results in an error condition.
         * 
         * The error condition is communicated through the standard listener
         * mechanism, so that consumers can reflect the current state.
         * The onError method, if provideded by a listener, is called with the
         * error object.
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath} key - the property path to the state object.
         * @param {Any} err - the error object generated by the attempt to
         * obtain the state property.
         * 
         * @returns {this} a reference to the state machine object to allow chaining.
         */
        setError: {
            value: function (key, err) {
                if (this.listeners[key]) {
                    var newListeners = [];
                    this.listeners[key].forEach(function (item) {
                        this.queue.addItem({
                            onRun: (function (fun, err) {
                                return function () {
                                    try {
                                        fun(err);
                                    } catch (ex) {
                                        //TODO: need a sensible way of logging exceptions...
                                        //console.log('EX running onRun handler');
                                        //console.log(ex);
                                    }
                                };
                            }(item.onError, err, this))
                        });
                        if (!item.oneTime) {
                            newListeners.push(item);
                        }
                    }.bind(this));
                    this.listeners[key] = newListeners;
                }
                Utils.setProp(this.state, key, {status: 'error', error: err, time: new Date()});
            }
        },
        /**
         * Used to determine if the state property is in an error state.
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath} key - the path to the state property in 
         * question.
         * 
         * @returns {boolean} true if the state property is in an error state, 
         * false otherwise.
         */
        hasError: {
            value: function (key) {
                var item = Utils.getProp(this.state, key);
                if (item && item.status === 'error') {
                    return true;
                }
                return false;
            }
        },
        /**
         * Delete a state property.
         * 
         * @todo this needs to be communicated to subscribers
         * @todo then the subscribtions need to be removed.
         * @todo actually they are part of the state object??
         * 
         * @function
         * @public
         * 
         * @param {PropertyPath} key - the path to the state property to be removed.
         * 
         * @returns {boolean} true if the object was found and deleted, false
         * otherwise.
         */
        delItem: {
            value: function (key) {
                if (Utils.hasProp(this.state, key)) {
                    Utils.deleteProp(this.state, key);
                }
            }
        },
        /**
         * A short synonym for listenForItem.
         * 
         * @function 
         * @public
         * 
         * @see listenForItem
         */
        listen: {
            value: function (key, cfg) {
                return this.listenForItem(key, cfg);
            }
        },
        /**
         * Set up a listener for changes to a state property.
         * The listener may be configured to receive set, error, or delete
         * notifiations. In addition, the listener may be specified a
         * one-time, meaning that it will be removed from the listener list
         * after the first call. For the latter usage, though, whenItem may
         * be more convenient.
         * 
         * @function
         * @public
         * 
         * @param {StatePropertyKey} key - a path to the state property
         * @param {ListenerConfig} cfg - a simple object to configure the listener.
         *  
         * @returns {this} a reference to the state machine to enable chaining. 
         */
        listenForItem: {
            value: function (key, cfg) {
                // A cheap call supplies just a function.
                //TODO: really support this?
                if (typeof cfg === 'function') {
                    cfg = {onSet: cfg};
                }
                // If the item is available, provide immediate callback.
                var item = Utils.getProp(this.state, key);
                if (item) {
                    if (cfg.hear) {
                        cfg.hear(item.value);
                        if (cfg.oneTime) {
                            return;
                        }
                    } else {
                        switch (item.status) {
                        case 'set':
                            cfg.onSet(item.value);
                            break;
                        case 'error':
                            cfg.onError(item.error);
                            break;
                        default:
                            throw 'Invalid status: ' + item.status;
                        }
                    }
                }
                if (this.listeners[key] === undefined) {
                    this.listeners[key] = [];
                }
                this.listeners[key].push(cfg);
                return this;
            }
        },
        /**
         * This differs from listen in that it returns a promise that is 
         * fulfilled either now (the item is available) or when it is
         * first set (via a set of one-time listeners).
         * 
         * @function
         * @public
         * 
         * @param {StatePropertyKey} key - a path to the state property in question
         * @params {integer} timeout - if the state property is not initialized 
         * within the timeout period, the onError method will be called with a 
         * reason set to 'timeout'.
         * 
         * @returns {promise} a promise that will be fulfilled when the state
         * property has been initialized.
         */
        whenItem: {
            value: function (key, timeout) {
                var p = Q.Promise(function (resolve, reject) {
                    if (Utils.hasProp(this.state, key)) {
                        var item = Utils.getProp(this.state, key);
                        if (item.status === 'error') {
                            reject(item.error);
                        } else {
                            resolve(item.value);
                        }
                    } else {
                        this.listenForItem(key, {
                            oneTime: true,
                            addedAt: (new Date()).getTime(),
                            onSet: function (value) {
                                resolve(value);
                            },
                            onError: function (err) {
                                reject(err);
                            }
                        });
                    }
                }.bind(this));
                if (timeout) {
                    return p.timeout(timeout);
                }
                return p;
            }
        }
    });
    return StateMachine;
});