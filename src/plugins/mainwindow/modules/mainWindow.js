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
    'knockout',
    'kb_lib/html',
    'kb_lib/widget/widgetSet',
    './components/systemAlertBannerTemp',
    './components/systemAlertBanner',
    './components/systemAlertToggle'
], function (
    ko,
    html,
    widgetSet,
    SystemAlertBannerComponentTemp,
    SystemAlertBannerComponent,
    SystemAlertToggleComponent
) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        span = t('span'),
        p = t('p'),
        b = t('b'),
        a = t('a');

    function niceDate(d) {
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'short',
            hour: 'numeric', minute: 'numeric'  };
        return Intl.DateTimeFormat('en-US', options).format(d);

    }

    class ViewModel {
        constructor(params) {
            this.runtime = params.runtime;

            // The total number of alerts
            this.alertCount = ko.observable(null);
            this.alertSummary = ko.observable(null);
            this.hideAlerts = ko.observable(false);

        }
    }

    class MainWindow {
        constructor(config) {
            this.runtime = config.runtime;
            this.widgets = new widgetSet.WidgetSet({
                widgetManager: this.runtime.service('widget').widgetManager
            });

            this.hostNode = null;
            this.container = null;

            this.vm = new ViewModel({
                runtime: this.runtime
            });
        }

        buildHeader() {
            const loginWidget = this.runtime.config('ui.services.session.loginWidget');

            return div({
                class: '-navbar',
                style: 'padding: 0'
            }, [
                div({
                    class: '-cell -menu',
                    id: this.widgets.addWidget('menu')
                }),
                div({
                    class: '-cell -logo',
                    id: this.widgets.addWidget('logo')
                }),
                div({
                    class: '-cell -title',
                    id: this.widgets.addWidget('title')
                }),
                div({
                    class: '-buttons',
                    id: this.widgets.addWidget('buttonbar')
                }),
                (() => {
                    if (this.runtime.featureEnabled('system_alert_notification')) {
                        return div({
                            class: '-cell -alerts',
                            // id: this.widgets.addWidget('alert')
                            dataBind: {
                                component: {
                                    name: SystemAlertToggleComponent.quotedName(),
                                    params: {
                                        alertCount: 'alertCount',
                                        alertSummary: 'alertSummary',
                                        hideAlerts: 'hideAlerts'
                                    }
                                }
                            }
                        });
                    }
                    return null;
                })(),
                div({
                    class: '-cell -notification',
                    id: this.widgets.addWidget('notification')
                }),
                div({
                    class: '-cell -deployment',
                    id: this.widgets.addWidget('deployment')
                }),
                div({
                    class: '-cell -login',
                    id: this.widgets.addWidget(loginWidget)
                })
            ]);
        }

        renderLayout() {
            return [
                div({
                    class: '-header'
                }, this.buildHeader()),
                div({
                    class: '-body'
                }, [
                    div({
                        class: '-nav',
                        id: this.widgets.addWidget('kb_mainWindow_sidebarNav')
                    }),
                    div({
                        class: '-content-area'
                    }, [
                        // (() => {
                        //     const enabled = true;
                        //     if (enabled) {
                        //     // if (this.runtime.featureEnabled('system_alert_notification')) {
                        //         return div({
                        //             dataBind: {
                        //                 component: {
                        //                     name: SystemAlertBannerComponent.quotedName(),
                        //                     params: {
                        //                         runtime: 'runtime',
                        //                         alertCount: 'alertCount',
                        //                         alertSummary: 'alertSummary',
                        //                         hideAlerts: 'hideAlerts'
                        //                     }
                        //                 }
                        //             }
                        //         });
                        //     }
                        //     return null;
                        // })(),
                        div({
                            style: {
                                border: '2px solid orange',
                                margin: '10px',
                                padding: '4px'
                            }
                        }, [
                            div({
                                style: {
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '150%'
                                }
                            }, 'Extended data center maintenance'),
                            div({
                                style: {
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: '120%'
                                }
                            }, [
                                // 'from Fri Sep 6 at 10:00am to Tue Sep 10 at 1:00pm PST',
                                span({style: {
                                    fontStyle: 'italic',
                                    color: 'gray'
                                }}, 'from '),
                                niceDate(new Date('2019-09-06T10:00')),
                                span({style: {
                                    fontStyle: 'italic',
                                    color: 'gray'
                                }}, '  to  '),
                                niceDate(new Date('2019-09-10T13:00')),
                            ]),
                            div({
                                style: {
                                    width: '50%',
                                    margin: '5px auto 8px auto',
                                    borderBottom: '1px solid silver'
                                }
                            }),
                            p({style: {textAlign: 'center'}}, [
                                b('narrative.kbase.us'), ' ',
                                'will be accessible with ',
                                span({style: {fontStyle: 'italic'}}, 'limited functionality'),
                                '. ',
                                'For details and ongoing updates visit ',
                                a({href: 'http://kbase.us', target: '_blank'}, 'kbase.us')
                            ]),
                            // p([
                            //     'The following features are not available: submitting or viewing compute jobs, all uploads, and search.'
                            // ]),
                        ]),
                        div({
                            class: '-plugin-content',
                            id: this.widgets.addWidget('body')
                        })
                    ])
                ])
            ].join('');
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('plugin-mainwindow', 'widget-mainwindow', '-main');
            this.container.setAttribute('data-k-b-testhook-plugin', 'mainwindow');
        }

        start(params) {
            this.container.innerHTML = this.renderLayout();
            return this.widgets.init()
                .then(() => {
                    return this.widgets.attach(this.container);
                })
                .then(() => {
                    return this.widgets.start(params);
                })
                .then(() => {
                    if (this.runtime.featureEnabled('system_alert_notification')) {
                        ko.applyBindings(this.vm, this.container.querySelector('.-content-area'));
                        ko.applyBindings(this.vm, this.container.querySelector('.-alerts'));
                    }
                });
        }

        run(params) {
            return this.widgets.run(params);
        }

        stop() {
            return this.widgets.stop();
        }

        detach() {
            return this.widgets.detach()
                .then(() => {
                    if (this.hostNode && this.container) {
                        this.hostNode.removeChild(this.container);
                    }
                });
        }

        destroy() {
            return this.widgets.destroy();
        }
    }

    return { Widget: MainWindow };
});
