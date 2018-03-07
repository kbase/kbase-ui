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
    'kb_common/html',
    'kb_widget/widgetSet'
], function (
    Promise,
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

        function buildHeader() {
            // var loginWidget = runtime.feature('auth', 'widgets.login.name');
            var loginWidget = runtime.config('ui.services.session.loginWidget');

            return div({
                class: '-navbar',
                style: 'padding: 0'
            }, [
                div({
                    class: '-cell -menu',
                    id: widgetSet.addWidget('menu')
                }),
                div({
                    class: '-cell -logo',
                    id: widgetSet.addWidget('logo')
                }),
                div({
                    class: '-cell -title',
                    id: widgetSet.addWidget('title')
                }),
                div({
                    class: '-cell -buttons',
                    id: widgetSet.addWidget('buttonbar')
                }),
                div({
                    class: '-cell -notification',
                    id: widgetSet.addWidget('notification')
                }),
                div({
                    class: '-cell -deployment',
                    id: widgetSet.addWidget('deployment')
                }),
                div({
                    class: '-cell -login',
                    id: widgetSet.addWidget(loginWidget)
                })
            ]);
        }

        function renderLayout() {
            return [
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
            ].join('');
        }

        function attach(node) {
            mount = node;
            container = document.createElement('div');
            container.classList.add('plugin-mainwindow', 'widget-mainwindow', '-main');
            container.setAttribute('data-kbase-plugin', 'mainwindow');
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
                    if (mount && container) {
                        mount.removeChild(container);
                    }
                });
        }

        function destroy() {
            return widgetSet.destroy();
        }

        return {
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
