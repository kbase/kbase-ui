/*global define: true */
/*jslint browser:true  vars: true */
/*
 * implements the kbase web app main interface
 * The Main Window implements the widget interface, of course. It is controlled
 * by the main entry point program, probably main.js
 * The main window is the controller, manager, coordinator, whatever you want to
 * call it, for the primary user interface widgets. These widget include, at 
 * present:
 * - main (hamburger) menu
 * - logo
 * - title
 * - button bar
 * - notifications
 * - user account
 * - console
 * - main content
 * 
 * Each of these areas is implemented as a widget. As much as possible, the 
 * Main Window tries to keep out of the way, and just manage the widgets. 
 * Each of them may listen for messages from other parts of the user interface.
 */
define([
    'bluebird',
    'kb_common_dom',
    'kb_common_html',
    'kb_common_widgetSet'],
    function (Promise, dom, html, WidgetSet) {
        'ust strict';
        /* Menu */

        function factory(config) {
            var mount, container, runtime = config.runtime;

            var widgetSet = WidgetSet.make({
                runtime: runtime
            });
            // widgetSet.addWidgets(['hamburgerMenu']);

            function init(config) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            function renderNavbar() {
                var div = html.tag('div');
                var content = div({style: {position: 'relative', height: '100%'}, class: 'kb-widget-mainWindow'}, [
                    div({style: {'border-right': '1px silver solid', padding: '4px', display: 'inline-block', height: '100%', verticalAlign: 'top'}}, [
                        div({id: widgetSet.addWidget('menu')})
                    ]),
                    div({style: {'border-right': '1px silver solid', padding: '4px', display: 'inline-block', height: '100%', verticalAlign: 'top'}}, div({id: widgetSet.addWidget('logo')})),
                    div({style: {display: 'inline-block', padding: '4px', height: '100%', verticalAlign: 'top'}}, [
                        div({id: widgetSet.addWidget('title')})
                    ]),
                    div({style: {border: '0px dashed blue', position: 'absolute', right: '0', top: '0', bottom: '0', verticalAlign: 'top', verticalAlign: 'top'}}, [
                        div({style: {borderLeft: '1px silver solid', 'border-right': '1px silver solid', 'border-right': '1px silver solid',padding: '4px', display: 'inline-block', height: '100%', verticalAlign: 'top', width: '100px'}}, [
                            div({id: widgetSet.addWidget('notification')})
                        ]),
                        div({style: {padding: '4px', display: 'inline-block', height: '100%'}, class: 'navbar-right'}, [
                            div({id: widgetSet.addWidget('login')})
                        ])
                    ])
                ]);
                return content;
            }

            function renderLayout() {
                var div = html.tag('div');
                return div({id: 'wrap'}, [
                    div({id: 'content'}, [
                        div({class: 'navbar navbar-kbase navbar-fixed-top', id: 'kbase-navbar', style: 'padding: 0'}, renderNavbar()),
                        div({class: 'container-fluid', style: {'padding-top': '1em'}}, [
                            div({id: widgetSet.addWidget('body')})
                        ])
                    ])
                ]);
            }
            
            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = dom.createElement('div');
                    mount.appendChild(container);

                    resolve();
                });
            }

            function start(params) {
                return new Promise(function (resolve, reject) {
                    container.innerHTML = renderLayout();
                    widgetSet.init()
                        .then(function () {
                            return widgetSet.attach();
                        })
                        .then(function () {
                            return widgetSet.start(params);
                        })
                        .then(function () {
                            /*return R.snd({
                                channel: 'ui',
                                message: 'setTitle',
                                data: 'HAL, this is Dave.'
                            })
                            */
                            // runtime.send('ui', 'setTitle', 'HAL, this is ... Dave.');
                            /*
                             * no, the app should set any default menu items and menus
                            runtime.getConfig('navbar.menu.available_items').forEach(function (item) {
                                runtime.send('ui', 'addMenuItem', item);
                            });
                            runtime.getConfig('navbar.menu.menus').forEach(function (menu) {
                                menu.items.forEach(function (item) {
                                    runtime.send('ui', 'addToMenu', {
                                        id: menu.id,
                                        item: item
                                    });
                                });
                            });
                             */
                        })
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            
                            reject(err);
                        });
                });
            }

            function run(params) {
                return new Promise(function (resolve, reject) {
                    widgetSet.run(params)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            }
            function stop() {
                return new Promise(function (resolve) {
                    widgetSet.stop()
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            }
            function detach() {
                return new Promise(function (resolve) {
                    widgetSet.detach()
                        .then(function () {
                            mount.removeChild(container);
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            }
            function destroy() {
                return new Promise(function (resolve) {
                    widgetSet.destroy()
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                run: run,
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
    