/*global define */
/*jslint white: true, browser: true */
define([
    'kb.dom',
    'kb.html',
    'kb.runtime',
    'kb_state'
],
    function (dom, html, R, State) {
        'use strict';
        
        function factory(config) {
            var mount, container,
                listeners = [],
                state = State.make();
            
            function render() {
                if (!state.isDirty()) {
                    return;
                }
                var div = html.tag('div');
                container.innerHTML = div({style: {fontWeight: 'bold', fontSize: '150%', marginTop: '15px'}}, [
                    state.get('title')
                ]);
                state.setClean();
            }
            function doHeartbeat() {
                render();
            }
            
            // LIFECYCLE
          
            function init(config) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = dom.createElement('div');
                    dom.append(mount, container);
                    resolve();
                });
            }

            function start(params) {
                return new Promise(function (resolve) {
                    // Listen for title events.
                    /*listeners.push(R.rcv({
                        channel: 'ui',
                        message: 'setTitle',
                        handler: function (data) {
                            return new Promise(function (resolve) {
                                state.setItem('title', data);
                                resolve();
                            });
                        }
                    }));
                    */
                   
                    listeners.push(R.recv('ui', 'setTitle', function (data) {
                       state.set('title', data);
                    }));
                    
                    listeners.push(R.recv('app', 'heartbeat', function () {
                        doHeartbeat();
                    }));
                    
                    resolve();
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    
                    // Stop listening for all events.
                    listeners.map(function (listener) {
                        R.drop(listener);
                    });
                    
                    resolve();
                });
            }
            function detach() {                
                return new Promise(function (resolve) {
                    mount.innerHTML = '';
                    container = null;
                    mount = null;
                    resolve();
                });
            }
            function destroy() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
          
            return {
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }
        return {
            make: function (config) {
                return factory(config);
            }
        };
    });
