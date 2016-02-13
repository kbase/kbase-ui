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
    'kb/common/dom',
    'kb/common/html',
    'kb/widget/widgetSet'],
    function (Promise, dom, html, WidgetSet) {
        'ust strict';
        /* Menu */

        function factory(config) {
            var mount, container, runtime = config.runtime,
                widgetSet = WidgetSet.make({
                    runtime: runtime
                });

            function init(config) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            function renderNavbar() {
                var div = html.tag('div'),
                    cellStyle = {
                        padding: '4px',
                        display: 'inline-block',
                        height: '100%',
                        verticalAlign: 'top'
                    },
                content = div({style: {position: 'relative', height: '100%'}, class: 'kb-widget-mainWindow'}, [
                    div({style: cellStyle, id: widgetSet.addWidget('menu')}),
                    div({style: cellStyle, id: widgetSet.addWidget('logo')}),
                    div({style: cellStyle, id: widgetSet.addWidget('title')}),
                    div({style: {position: 'absolute', right: '0', top: '0', bottom: '0', verticalAlign: 'top'}}, [
                        div({style: cellStyle, id: widgetSet.addWidget('buttonbar')}),
                        div({style: {borderLeft: '0px #EEE solid', borderRight: '0px #EEE solid', padding: '4px', display: 'inline-block', height: '100%', verticalAlign: 'top', width: '100px'}, id: widgetSet.addWidget('notification')}),
                        div({style: cellStyle, class: 'navbar-right', id: widgetSet.addWidget('login')})
                    ])
                ]);
                return content;
            }

            function renderLayout() {
                var div = html.tag('div');
                return div({id: 'wrap'}, [
                    div({id: 'content'}, [
                        div({class: 'navbar navbar-kbase navbar-fixed-top', id: 'kbase-navbar', style: 'padding: 0'}, renderNavbar()),
                        div({class: 'kb-mainwindow-body', style: {'padding-top': '1em'}}, [
                            div({id: widgetSet.addWidget('body')})
                        ])
                    ])
                ]);
            }

            function attach(node) {
                mount = node;
                container = dom.createElement('div');
                mount.appendChild(container);
            }

            function start(params) {
                container.innerHTML = renderLayout();
                return widgetSet.init()
                    .then(function () {
                        return widgetSet.attach(container);
                    })
                    .then(function () {
                        return widgetSet.start(params);
                    });
            }

            function run(params) {
                return widgetSet.run(params);
            }
            function stop() {
                return widgetSet.stop();
            }
            function detach() {
                return widgetSet.detach()
                    .then(function () {
                        mount.removeChild(container);
                        resolve();
                    });
            }
            function destroy() {
                return widgetSet.destroy();
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