/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'underscore',
    'kb_common_dom',
    'kb_common_state',
    'kb_common_html',
    'kb_common_domEvent'
],
    function (Promise, _, dom, State, html, fDomEvent) {
        'use strict';

        function makeWidget(config) {
            var mount, container, hooks = [], listeners = [],
                state = State.make(),
                runtime = config.runtime,
                internalApi = {}, externalApi = {},
                domEvent = fDomEvent.make();

            if (!runtime) {
                throw {
                    type: 'ArgumentError',
                    reason: 'RuntimeMissing',
                    blame: 'standardWidget',
                    message: 'The runtime argument was not provided'
                };
            }

            // The hooks for widget objects.
            function addHook(name, fun) {
                if (!hooks.hasOwnProperty(name)) {
                    hooks[name] = [];
                }
                hooks[name].push(fun);
            }
            function hook(name, fun) {
                if (_.isArray(name)) {
                    name.forEach(function (hookDef) {
                        addHook(hookDef[0], hookDef[1]);
                    });
                } else {
                    addHook(name, fun);
                }
            }
            function hasHook(name) {
                if (hooks.hasOwnProperty(name)) {
                    return true;
                }
                return false;
            }
            function getHook(name) {
                if (hasHook(name)) {
                    return hooks[name];
                }
                return [];
            }

            // Interacting with content.
            function setHtml(content) {
                if (container) {
                    container.innerHTML = content;
                }
            }

            // STATE
            // 
            // Interacting with state
            function setState(prop, value) {
                state.set(prop, value);
            }
            function getState(prop, defaultValue) {
                return state.get(prop, defaultValue);
            }

            // EVENTS
            function recv(channel, message, handler) {
                listeners.push(runtime.recv(channel, message, handler));
            }
            function send(channel, message, data) {
                runtime.send(channel, message, data);
            }

            // DOM EVENTS
            function addDomEvent(type, handler, id, data) {
                return domEvent.addEvent(type, handler, id, data);
            }
            function attachDomEvent(type, handler, selector, data) {
                return domEvent.attachEvent(type, handler, selector, data);
            }
            function attachDomEvents() {
                domEvent.attachEvents();
            }
            function detachDomEvents() {
                domEvent.detachEvents();
            }
            
            // Object construction setup
            
            if (config && config.on) {
                Object.keys(config.on).forEach(function (hookName) {
                    addHook(hookName, config.on[hookName]);
                });
            }
            
            if (config && config.events) {
                config.events.forEach(function (event) {
                    attachDomEvent(event);
                })
            }



            // INTERNAL API

            internalApi = Object.freeze({
                recv: recv,
                send: send,
                getState: getState,
                setState: setState,
                get: getState,
                set: setState,
                addDomEvent: addDomEvent,
                attachDomEvent: attachDomEvent,
                runtime: runtime
            });


            // RENDERING

            function render() {
                return Promise.try(function () {
                    if (!state.isDirty()) {
                        return;
                    }
                    state.setClean();
                    // For now we assume that rendering blows away dom events
                    // and re-initializes them.
                    // Let us get more subtle later.
                    detachDomEvents();
                    var promises = getHook('render').map(function (fun) {
                        return Promise.try(fun, [internalApi]);
                    });
                    return Promise.settle(promises)
                        .then(function (results) {
                            // should only be one render result ... 
                            var result = results[results.length - 1];
                            if (result.isFulfilled()) {
                                if (result.value()) {
                                    setHtml(result.value());
                                }
                            } else if (result.isRejected()) {
                                setHtml('ERROR: ' + result.reason());
                                console.log('ERROR');
                                console.log(result.reason());
                            }
                        })
                        .then(function () {
                            attachDomEvents();
                        });
                });
            }

            // The Interface

            function init(config) {
                return Promise.try(function () {
                    if (hasHook('init')) {
                        var promises = getHook('init').map(function (fun) {
                            return Promise.try(fun, [internalApi, config]);
                        });
                        return Promise.settle(promises);
                    }
                });
            }
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = dom.createElement('div');
                    dom.append(mount, container);
                    if (hasHook('attach')) {
                        var promises = getHook('attach').map(function (fun) {
                            return Promise.try(fun, [internalApi, container]);
                        });
                        return Promise.settle(promises)
                            .then(function () {
                                attachDomEvents();
                            });
                    }
                });
            }
            function start(params) {
                return Promise.try(function () {
                    // Start the heartbeat listener, which presently just 
                    // renders.
                    listeners.push(runtime.recv('app', 'heartbeat', function () {
                        render()
                            .then(function () {
                                // what here?
                            })
                            .catch(function (err) {
                                // handle render error
                                console.log('ERROR');
                                console.log(err);
                            });
                    }));
                    return Promise.try(function () {
                        var promises = [];
                        if (hasHook('initialContent')) {
                            getHook('initialContent').forEach(function (fun) {
                                promises.push(
                                    Promise.try(fun, [internalApi, params])
                                    .then(function (data) {
                                        setHtml(data);
                                    }));
                            });
                        }
                        if (hasHook('start')) {
                            getHook('start').forEach(function (fun) {
                                promises.push(Promise.try(fun, [internalApi, params]));
                            });
                        }
                        return promises;
                    })
                    .each(function (item, index, value) {
                        // what to do? Check value for error and log it.
                    });
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    if (hasHook('stop')) {
                        var promises = getHook('stop').map(function (fun) {
                            return Promise.try(fun, [internalApi]);
                        });
                        resolve(Promise.settle(promises));
                    } else {
                        resolve();
                    }
                });
            }
            function detach() {
                return new Promise(function (resolve) {
                    mount.innerHTML = '';
                    container = null;
                    mount = null;
                    if (hasHook('detach')) {
                        var promises = getHook('detach').map(function (fun) {
                            return Promise.try(fun, [internalApi]);
                        });
                        resolve(Promise.settle(promises).
                            then(function () {
                                detachDomEvents();
                            }));
                    } else {
                        resolve();
                    }
                });
            }
            function destroy() {
                return new Promise(function (resolve) {
                    if (hasHook('destroy')) {
                        var promises = getHook('destroy').map(function (fun) {
                            return Promise.try(fun, [internalApi]);
                        });
                        resolve(Promise.settle(promises));
                    } else {
                        resolve();
                    }
                });
            }

            externalApi = {
                // Widget Interface
                on: hook,
                // Lifecycle Interface
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach,
                destroy: destroy
            };

            return Object.freeze(externalApi);
        }

        return {
            make: function (config) {
                return makeWidget(config);
            }
        };
    });