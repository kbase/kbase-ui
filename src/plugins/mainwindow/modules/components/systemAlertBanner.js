define([
    'knockout',
    'md5',
    'kb_common/html',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    './countdownClock'
], function (
    ko,
    md5,
    html,
    reg,
    gen,
    ViewModelBase,
    CountdownClockComponent
) {
    'use strict';

    let t = html.tag,
        p = t('p'),
        button = t('button'),
        span = t('span'),
        div = t('div');

    let styles = html.makeStyles({
        component: {
            css: {
                margin: '0 10px 10px 10px',                
            }
        }
    });

    class ViewModel extends ViewModelBase {
        constructor(params) {
            super(params);

            this.systemStatus = params.systemStatus;
            this.error = params.error;

            this._maintenanceNotifications = ko.observableArray();

            this.now = ko.observable(Date.now());

            this.maintenanceNotifications = ko.pureComputed(() => {
                return this._maintenanceNotifications()
                    .filter((notification) => {
                        let endTime = notification.endAt.getTime();
                        let now = this.now();
                        if ( (now - endTime) > 60000) {
                            return false;
                        }
                        return true;
                    })
                    .sort((a, b) => {
                        return (a.startAt.getTime() - b.startAt.getTime());
                    });
            });

            this.hiddenMaintenanceNotificationCount = ko.pureComputed(() => {
                return this._maintenanceNotifications()
                    .filter((notification) => {
                        return notification.read();
                    }).length;
            });

            this.subscribe(this.systemStatus, (newValue) => {
                if (!newValue) {
                    return [];
                }
                
                let hashes = [];
                newValue.upcomingMaintenanceWindows
                    .forEach((notification) => {
                        let hash = md5.hash(JSON.stringify(notification));
                        hashes.push(hash);
                        let existing = this._maintenanceNotifications().some((item) => {
                            return item.hash === hash;
                        });
                        if (existing) {
                            // ignore existing and identical notifications.
                            return;
                        }

                        // add new ones.
                        let newNotification = {
                            startAt: new Date(notification.startAt),
                            endAt: new Date(notification.endAt),
                            title: notification.title,
                            message: notification.message,
                            read: ko.observable(false),
                            hash: hash
                        };
                        this._maintenanceNotifications.push(newNotification);
                    });
                
                this._maintenanceNotifications().forEach((item) => {
                    if (hashes.indexOf(item.hash) === -1) {
                        this._maintenanceNotifications.remove(item);
                    }
                });
            });

            // monitor for expired ones and remove them
            this.timer = window.setInterval(() => {
                this.now(Date.now());
            }, 10000);
        }

        doShowHidden() {
            this._maintenanceNotifications().forEach((notification) => {
                notification.read(false);
            });
        }

        dispose() {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
        }
    }

    function buildError() {
        return div({
            class: 'alert alert-danger',
            dataBind: {
                text: 'error'
            }
        });
    }

    function buildMaintenanceNotification() {
        return div({
            class: 'panel panel-danger',
            style: {
                borderRadius: '0px',
                marginBottom: '0px'
                // position: 'relative'
            }
        }, [
            div({
                class: 'panel-heading',
                style: {
                    position: 'relative'
                }
            }, [
                span({
                    dataBind: {
                        text: '$data.title || "Upcoming System Maintenance"'
                    },
                    style: {
                        fontWeight: 'bold'
                    }
                }),  
                button({
                    type: 'button',
                    class: 'close',
                    ariaLabel: 'Close',
                    dataBind: {
                        click: 'function(d,e){d.read(true);}'
                    },
                    style: {
                        fontSize: '80%',
                        position: 'absolute',
                        right: '8px',
                        top: '8px'
                    },
                    title: 'Use this button close the alert; when you reload the browser it will reappear; it will be permanently removed when it expires.'
                }, span({
                    class: 'fa fa-times'
                })),
            ]),
            div({
                class: 'panel-body'
            }, [
                div({
                    style: {
                        display: 'inline-block',
                        verticalAlign: 'top',
                        width: '50%'
                    }
                }, [
                                  
                    div({
                        dataBind: {
                            foreach: 'message'
                        }
                    }, p({
                        dataBind: {
                            text: '$data'
                        }
                    }))
                ]),
                div({
                    style: {
                        display: 'inline-block',
                        verticalAlign: 'top',
                        width: '50%',
                        textAlign: 'right'
                    }
                }, [
                    div([
                        span({
                            dataBind: {
                                typedText: {
                                    type: '"date-range"',
                                    format: '"nice-range"',
                                    value: {
                                        startDate: 'startAt',
                                        endDate: 'endAt'
                                    }
                                }
                            }
                        })
                    ]),
                    div([
                        span({
                            dataBind: {
                                component: {
                                    name: CountdownClockComponent.quotedName(),
                                    params: {
                                        startAt: 'startAt',
                                        endAt: 'endAt'
                                    }
                                }
                            }
                        })
                    ])
                ])
            ])
        ]);
    }

    function buildHeader() {
        return div({
            class: 'bg-danger text-danger',
            style: {
                // border: '1px red solid',
                // backgroundColor: 'red',
                // color: '#FFF',
                padding: '10px 15px'
            }
        }, [
            div({
                style: {
                    display: 'inline-block',
                    width: '50%'
                }
            }, span({
                style: {
                    fontWeight: 'bold'
                }
            }, [
                'System',
                gen.plural('maintenanceNotifications().length === 1', ' Alert', ' Alerts')
            ])),
            div({
                style: {
                    display: 'inline-block',
                    width: '50%',
                    textAlign: 'right'
                }
            }, [
                span({
                    dataBind: {
                        text: 'maintenanceNotifications().length'
                    }
                }),
                gen.plural('maintenanceNotifications().length', ' alert', ' alerts'), 
                gen.if('hiddenMaintenanceNotificationCount() > 0',
                    [
                        ' (',
                        span({
                            dataBind: {
                                text: 'hiddenMaintenanceNotificationCount()'
                            }
                        }),
                        ' hidden ',
                        button({
                            type: 'button',
                            class: 'btn btn-default btn-xs',
                            dataBind: {
                                click: 'function(...args){$component.doShowHidden.apply($component, args);}'
                            }
                        }, span([
                            'show',
                            gen.plural('hiddenMaintenanceNotificationCount()', ' it', ' them')
                        ])),
                        
                        ')'
                    ])
            ])
        ]);
    }

    function template() {
        // return div('hi from the notification banner');
        return div({
            class: styles.classes.component
        }, [
            gen.if('error()', 
                buildError(),
                gen.if('maintenanceNotifications().length > 0',
                    [
                        buildHeader(),
                        gen.foreach('maintenanceNotifications()', 
                            gen.ifnot('read', buildMaintenanceNotification()))
                    ]))
        ]);
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template(),
            stylesheet: styles.sheet
        };
    }

    return reg.registerComponent(component);
});