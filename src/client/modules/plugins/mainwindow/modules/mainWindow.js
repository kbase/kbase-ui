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
    'kb_common/dom',
    'kb_common/html',
    'kb_widget/widgetSet'
], function (
    Promise,
    dom,
    html,
    WidgetSet
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function factory(config) {
        var mount, container, runtime = config.runtime,
            widgetSet = WidgetSet.make({
                runtime: runtime
            });

        function init() {
            return new Promise(function (resolve) {
                resolve();
            });
        }

        function buildHeader() {
            var cellStyle = {
                    padding: '4px',
                    display: 'inline-block',
                    height: '100%',
                    verticalAlign: 'top'
                },
                bareCellStyle = {
                    display: 'inline-block',
                    height: '100%',
                    verticalAlign: 'top'
                },
                loginWidget = runtime.feature('auth', 'widgets.login.name');

            return div({
                class: 'navbar navbar-fixed-top -navbar',
                style: 'padding: 0'
            }, div({ style: { position: 'relative', height: '100%' }, class: 'kb-widget-mainWindow' }, [
                div({ style: cellStyle, id: widgetSet.addWidget('menu') }),
                div({ style: cellStyle, id: widgetSet.addWidget('logo') }),
                div({ style: cellStyle, id: widgetSet.addWidget('title') }),
                div({
                    style: {
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        bottom: '0',
                        verticalAlign: 'top',
                        backgroundColor: 'white'
                    }
                }, [
                    div({ style: cellStyle, id: widgetSet.addWidget('buttonbar') }),
                    div({ style: cellStyle, id: widgetSet.addWidget('notification') }),
                    div({ style: cellStyle, id: widgetSet.addWidget('deployment') }),
                    div({ style: cellStyle, class: 'navbar-right', id: widgetSet.addWidget(loginWidget) })
                ])
            ]));
        }

        function renderLayout() {
            return div({
                class: 'plugin-mainwindow widget-mainwindow -main'
            }, [
                div({
                    class: '-header'
                }, buildHeader()),
                div({
                    class: '-body'
                }, [
                    div({
                        class: '-nav',
                        id: widgetSet.addWidget('kb_mainWindow_sidebarNav')
                    }),
                    div({
                        class: '-content',
                        id: widgetSet.addWidget('body')
                    })
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
