define([
    'knockout',
    'md5',
    'kb_common/html',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_knockout/lib/viewModelBase',
    './countdownClock',
    '../models/systemAlerts'
], function (
    ko,
    md5,
    html,
    reg,
    gen,
    ViewModelBase,
    CountdownClockComponent,
    systemAlerts
) {
    'use strict';

    const t = html.tag,
        button = t('button'),
        span = t('span'),
        div = t('div');

    const styles = html.makeStyles({
        component: {

        },
        wrapper: {
            css: {
                margin: '4px 10px 10px 10px',
                boxShadow: '4px 4px 4px silver',
            }
        },
        itemsWrapper: {
            css: {
                border: '2px #f2dede solid',
                // padding: '10px'
            }
        },
        title1: {
            css: {
                backgroundColor: 'rgba(169,68,68,1)',
                color: 'white'
            }
        },
        title2: {
            css: {
                backgroundColor: 'white',
                color: 'rgba(169,68,68,1)'
            }
        }
    });

    class Alert {
        constructor({startAt, endAt, title, message, hash, now}) {
            this.startAt = new Date(startAt);
            if (endAt === null || endAt === undefined) {
                this.endAt = null;
            } else {
                this.endAt = new Date(endAt);
            }
            this.title = title;
            this.message = message;
            this.hash = hash;
            this.now = now;

            this.read = ko.observable(false);
            this.showMessage = ko.observable(false);

            this.countdownToStart = ko.pureComputed(() => {
                if (!this.now()) {
                    return null;
                }
                return this.startAt - this.now();
            });

            this.countdownToEnd = ko.pureComputed(() => {
                if (!this.now()) {
                    return null;
                }
                if (this.endAt === null) {
                    return Infinity;
                }
                return this.endAt - this.now();
            });
        }

        toggleMessage() {
            this.showMessage(!this.showMessage());
        }
    }

    class AlertsViewModel extends ViewModelBase {
        constructor(params) {
            super(params);
            this.runtime = params.runtime;
            this.hideAlerts = params.hideAlerts;
            this.alertCount = params.alertCount;

            this.alertSummary = params.alertSummary;

            this.systemStatus = ko.observable();
            this.error = ko.observable(false);

            this._maintenanceNotifications = ko.observableArray();

            this.now = ko.observable(Date.now());

            this.maintenanceNotifications = ko.pureComputed(() => {
                return this._maintenanceNotifications()
                    // .filter((notification) => {
                    //     const endTime = notification.endAt.getTime();
                    //     const now = this.now();
                    //     if ((now - endTime) > 60000) {
                    //         return false;
                    //     }
                    //     return true;
                    // })
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

            // TODO: better way, pureComputed perhaps?
            this.subscribe(this._maintenanceNotifications, (newValue) => {
                const now = Date.now();
                const summary = newValue.reduce((acc, alert) => {
                    // console.log('present??', alert.startAt <= now, alert.EndAt >= now, alert.startAt > now, alert.endAt, now);
                    if ((alert.startAt.getTime() <= now) &&
                        ((alert.endAt === null || alert.endAt.getTime() >= now))) {
                        acc.present += 1;
                    } else if (alert.startAt.getTime() > now) {
                        acc.future += 1;
                    }
                    return acc;
                }, {
                    present: 0,
                    future: 0
                });
                this.alertSummary(summary);
            });

            this.subscribe(this.systemStatus, (newValue) => {
                if (!newValue) {
                    return [];
                }

                this.alertCount(newValue.upcomingMaintenanceWindows.length);
                const hashes = [];
                newValue.upcomingMaintenanceWindows
                    .forEach((notification) => {
                        const hash = md5.hash(JSON.stringify(notification));
                        hashes.push(hash);
                        const existing = this._maintenanceNotifications().some((item) => {
                            return item.hash === hash;
                        });
                        if (existing) {
                            // ignore existing and identical notifications.
                            return;
                        }

                        const newNotification = new Alert({
                            startAt: notification.start_at,
                            endAt: notification.end_at,
                            title: notification.title,
                            message: notification.message,
                            hash: hash,
                            now: this.now
                        });

                        this._maintenanceNotifications.push(newNotification);
                    });

                this._maintenanceNotifications().forEach((item) => {
                    if (hashes.indexOf(item.hash) === -1) {
                        this._maintenanceNotifications.remove(item);
                    }
                });
            });

            // A simple clock.
            this.timer = window.setInterval(() => {
                this.now(Date.now());
            }, 1000);
            this.model = new systemAlerts.AlertsModel({
                runtime: this.runtime,
                updateInterval: 10000
            });

            this.model.onUpdate((result, error) => {
                if (result) {
                    if (error) {
                        this.systemStatus(null);
                        this.error(error.message);
                    } else {
                        this.systemStatus(result);
                        this.error(null);
                    }
                } else {
                    this.systemStatus(null);
                    if (error) {
                        this.systemStatus(null);
                        this.error(error.message);
                    } else {
                        this.systemStatus(null);
                        this.error('No error or result');
                    }
                }
            });

            this.model.start();
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

        hide() {
            this.hideAlerts(this.hideAlerts() ? false : true);
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

    function buildAlertIcon() {
        return span({
            style: {
                width: '1.5em',
                fontSize: '120%',
                textAlign: 'center',
                // marginRight: '4px'
            }
        }, [
            span({
                class: 'fa',
                dataBind: {
                    css: {
                        'fa-clock-o': 'countdownToStart() > 0',
                        'fa-exclamation-triangle': 'countdownToStart() <= 0 && countdownToEnd() > 0',
                        'fa-color-warning': 'countdownToStart() > 0',
                        'fa-color-danger': 'countdownToStart() <= 0 && countdownToEnd() > 0'
                    }
                }
            })
        ]);
    }

    function buildMaintenanceNotification() {
        return div({
            style: {
                borderRadius: '0px',
                marginBottom: '0px',
                borderTop: '2px #f2dede solid'
            }
        }, [
            div({
                style: {
                    display: 'flex',
                    flexDirection: 'row',
                    // borderBottom: '1px #f2dede solid',
                    // marginBottom: '8px'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 0px',
                        // backgroundColor: 'rgba(169,68,68,1)',
                        // color: 'white',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    },
                    class: styles.classes.title2
                    // dataBind: {
                    //     class: 'showMessage() ? "' + styles.classes.title1 + '" : "' + styles.classes.title2 + '"'
                    // }
                }, div({
                    dataBind: {
                        text: '$data.title || "Upcoming System Maintenance"'
                    },
                    style: {
                        fontWeight: 'bold'
                    }
                })),
                div({
                    style: {
                        flex: '1 1 0px',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }
                }, [
                    buildAlertIcon(),
                    div({
                        style: {
                            flex: '1 1 0px'
                        },
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
                ]),
                // span({
                //     style: {
                //     }
                // }, [
                //     button({
                //         type: 'button',
                //         class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                //         dataBind: {
                //             click: 'function(d,e){d.read(true);}'
                //         },
                //         title: 'Use this button close the alert; when you reload the browser it will reappear; it will be permanently removed when it expires.'
                //     }, span({
                //         class: 'fa fa-times'
                //     }))
                // ]),
                div({
                    style: {
                        width: '2em',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    },
                }, [
                    button({
                        type: 'button',

                        class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                        dataBind: {
                            click: 'function(d,e){d.toggleMessage();}',
                        },
                        title: 'Use this button close the alert details; when you reload the browser it will reappear; it will be permanently removed when it expires.'
                    }, span({
                        dataBind: {
                            class: 'showMessage() ? "fa-chevron-down" : "fa-chevron-right"'
                        },
                        class: 'fa'
                    }))
                ])
            ]),
            gen.if('showMessage()',
                div({
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        padding: '4px'
                    }
                }, [
                    div({
                        style: {
                            verticalAlign: 'top',
                            flex: '1 1 0px'
                        }
                    }, [

                        div({
                            dataBind: {
                                htmlMarkdown: 'message'
                            }
                        })
                    ])
                ]))
        ]);
    }

    function buildMaintenanceNotificationx() {
        return div({
            style: {
                borderRadius: '0px',
                marginBottom: '0px',
                padding: '4px',
                borderTop: '2px #f2dede solid'
            }
        }, [
            div({
                style: {
                    position: 'relative'
                }
            }, [
                div({
                    style: {
                        display: 'flex',
                        flexDirection: 'row'
                    }
                }, [
                    div({
                        style: {
                            flex: '1 1 0px'
                        }
                    }, span({
                        dataBind: {
                            text: '$data.title || "Upcoming System Maintenance"'
                        },
                        style: {
                            fontWeight: 'bold'
                        }
                    })),
                    div({
                        style: {
                            flex: '1 1 0px'
                        }
                    }, [
                        buildAlertIcon(),
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
                    ]),
                    span({
                        style: {
                            // flex: '0'
                        }
                    }, [
                        button({
                            type: 'button',
                            class: 'close',
                            ariaLabel: 'Close',
                            dataBind: {
                                click: 'function(d,e){d.read(true);}'
                            },
                            style: {
                                fontSize: '80%'
                            },
                            title: 'Use this button close the alert; when you reload the browser it will reappear; it will be permanently removed when it expires.'
                        }, span({
                            class: 'fa fa-times'
                        }))
                    ])
                ])
            ]),
            div({
                // class: 'panel-body'
            }, div({
                style: {
                    display: 'flex',
                    flexDirection: 'row'
                }
            }, [
                div({
                    style: {
                        verticalAlign: 'top',
                        flex: '1 1 0px'
                    }
                }, [

                    div({
                        dataBind: {
                            htmlMarkdown: 'message'
                        }
                    })
                ]),
                div({
                    style: {
                        verticalAlign: 'top',
                        textAlign: 'right',
                        flex: '1 1 0px'
                    }
                }, [
                    // div([
                    //     span({
                    //         dataBind: {
                    //             typedText: {
                    //                 type: '"date-range"',
                    //                 format: '"nice-range"',
                    //                 value: {
                    //                     startDate: 'startAt',
                    //                     endDate: 'endAt'
                    //                 }
                    //             }
                    //         }
                    //     })
                    // ]),

                ]),

            ]))
        ]);
    }

    function buildHeader() {
        return div({
            class: 'bg-danger text-danger',
            style: {
                padding: '10px 15px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'row'
            }
        }, [
            div({
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    alignItems: 'center'
                }
            }, span({
                style: {
                    fontWeight: 'bold'
                }
            }, [
                'System',
                gen.plural('maintenanceNotifications().length', ' Alert', ' Alerts')
            ])),
            div({
                style: {
                    textAlign: 'right',
                    // paddingRight: '12px',
                    flex: '1 1 0px'
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
                            class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                            dataBind: {
                                click: 'function(...args){$component.doShowHidden.apply($component, args);}'
                            }
                        }, span([
                            'show',
                            gen.plural('hiddenMaintenanceNotificationCount()', ' it', ' them')
                        ])),

                        ')'
                    ]),
                button({
                    class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                    style: {
                        marginLeft: '8px'
                    },
                    type: 'button',
                    dataBind: {
                        click: 'function(d,e){$component.hide.call($component);}'
                    }
                }, span({
                    // class: 'fa fa-minus-square-o'
                }, [
                    'hide ',
                    gen.plural('maintenanceNotifications().length', ' alert', ' alerts')
                ]))
            ])
            //     button({
            //         type: 'button',
            //         class: 'close',
            //         ariaLabel: 'Close',
            //         dataBind: {
            //             click: 'function(d,e){$component.hide.call($component);}'
            //         },
            //         style: {
            //             fontSize: '80%',
            //             position: 'absolute',
            //             right: '8px',
            //             top: '8px'
            //         },
            //         title: 'Use this button close the alerts strip; when you reload the browser it will reappear; it will be permanently removed when all alerts expire.'
            //     }, span({
            //         class: 'fa fa-times'
            //     }))
            // ])

        ]);
    }

    function buildNotifications() {
        // return div('hi from the notification banner');
        return div({
            class: styles.classes.component
        }, [
            gen.if('error()',
                div({
                    class: styles.classes.wrapper
                }, buildError()),
                gen.if('maintenanceNotifications().length > 0',
                    div({
                        class: styles.classes.wrapper
                    }, [
                        buildHeader(),
                        gen.if('maintenanceNotifications().some((alert) => {return !alert.read();})',
                            div({
                                class: styles.classes.itemsWrapper
                            },
                            gen.foreach('maintenanceNotifications()',
                                gen.ifnot('read', buildMaintenanceNotification()))))
                    ])))

        ]);
    }

    function template() {
        return div(gen.if('hideAlerts()', '', buildNotifications()));
    }

    function component() {
        return {
            viewModel: AlertsViewModel,
            template: template(),
            stylesheet: styles.sheet
        };
    }

    return reg.registerComponent(component);
});