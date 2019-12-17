define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'uuid',
    'kb_lib/html',

    // for effect
    'bootstrap'
], function (
    ko,
    reg,
    gen,
    Uuid,
    html
) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        span = t('span'),
        a = t('a'),
        svg = t('svg'),
        polygon = t('polygon');

    const AUTODISMISSER_INTERVAL = 1000;

    class Notification {
        constructor({ notification, parent }) {
            const newNotification = notification;
            this.id = newNotification.id || new Uuid(4).format();
            this.message = ko.observable(newNotification.message);
            this.description = ko.observable(newNotification.description);
            this.autodismiss = ko.observable(newNotification.autodismiss);
            this.icon = ko.observable(newNotification.icon);
            this.autodismissStartedAt = newNotification.autodismiss ? new Date().getTime() : null;
            this.type = ko.observable(newNotification.type);
            this.parent = parent;

            this.type.subscribeChanged((newVal, oldVal) => {
                this.parent.summary[oldVal].count(this.parent.summary[oldVal].count() - 1);
                this.parent.summary[newVal].count(this.parent.summary[newVal].count() + 1);
            });

            this.autodismiss.subscribe((newVal) => {
                if (newVal) {
                    // TODO: this
                    this.autodismissStartedAt = new Date().getTime();
                    this.parent.startAutoDismisser();
                }
            });
        }
    }

    class ViewModel {
        constructor(params) {
            this.runtime = params.runtime;
            this.sendingChannel = new Uuid(4).format();

            this.notificationQueue = ko.observableArray();
            this.notificationMap = {};
            this.show = ko.observable(false);
            this.autoDismisser;

            this.notificationQueue.subscribe((newQueue) => {
                // start or stop the autodismiss listener
                let autoDismissable = false;
                let newItems = false;
                newQueue.forEach((item) => {
                    if (!item.addedAt) {
                        newItems = true;
                        item.addedAt = new Date().getTime();
                    }
                    if (item.autodismiss()) {
                        if (!item.autodismissStartedAt) {
                            item.autodismissStartedAt = new Date().getTime();
                        }
                        autoDismissable = true;
                    }
                });
                if (newItems) {
                    this.show(true);
                }
                if (this.notificationQueue().length === 0) {
                    this.show(false);
                }
                if (autoDismissable) {
                    this.startAutoDismisser();
                }
            });

            this.summary = {
                success: this.summaryItem('success'),
                info: this.summaryItem('info'),
                warning: this.summaryItem('warning'),
                error: this.summaryItem('error'),
            };

            this.hasNotifications = ko.pureComputed(() => {
                if (this.notificationQueue().length === 0) {
                    return false;
                }
                return true;
            });

            this.runtime.send('notification', 'ready', {
                channel: this.sendingChannel
            });

            this.runtime.receive(this.sendingChannel, 'new', (message) => {
                this.processMessage(message);
            });
        }

        runAutoDismisser() {
            const toRemove = [];
            const now = new Date().getTime();
            let autodismissLeft = 0;
            this.notificationQueue().forEach((item) => {
                if (item.autodismiss()) {
                    const elapsed = now - item.autodismissStartedAt;
                    if (item.autodismiss() < elapsed) {
                        toRemove.push(item);
                    } else {
                        autodismissLeft += 1;
                    }
                }
            });

            toRemove.forEach((item) => {
                this.removeNotification(item);
            });

            if (autodismissLeft > 0) {
                this.autoDismisserLoop();
            } else {
                this.autoDismisser = null;
            }
        }

        autoDismisserLoop() {
            this.autoDismisser = window.setTimeout(() => {
                this.runAutoDismisser();
            }, AUTODISMISSER_INTERVAL);
        }

        startAutoDismisser(force) {
            if (this.autoDismisser && !force) {
                return;
            }
            this.runAutoDismisser();
        }

        doToggleNotification() {
            // only allow toggling if have items...
            // if (queue().length === 0) {
            //     return;
            // }
            if (this.show()) {
                this.show(false);
            } else {
                this.show(true);
            }
        }

        doCloseNotifications() {
            this.show(false);
        }

        doClearNotification(data, event) {
            event.stopPropagation();
            this.removeNotification(data);
        }

        summaryItem(name) {
            const count = ko.observable(0);
            return {
                label: name,
                count: count,
                myClass: ko.pureComputed(() => {
                    if (count() > 0) {
                        return '-' + name + ' -hasitems';
                    } else {
                        return '-' + name;
                    }
                })
            };
        }

        addNotification(newMessage) {
            const notification = new Notification({ notification: newMessage, parent: this });
            const summaryItem = this.summary[notification.type()];
            if (summaryItem) {
                summaryItem.count(summaryItem.count() + 1);
            }
            this.notificationQueue.unshift(notification);
            this.notificationMap[notification.id] = notification;
        }

        updateNotification(newMessage) {
            const notification = this.notificationMap[newMessage.id];
            if (!notification) {
                console.error('Cannot update message, not found: ' + newMessage.id, newMessage);
                return;
            }
            notification.type(newMessage.type);
            notification.message(newMessage.message);
            notification.autodismiss(newMessage.autodismiss);
        }

        removeNotification(notification) {
            const summaryItem = this.summary[notification.type()];
            if (summaryItem) {
                summaryItem.count(summaryItem.count() - 1);
            }

            this.notificationQueue.remove(notification);
            delete this.notificationMap[notification.id];
        }

        processMessage(message) {
            if (!message.type) {
                console.error('Message not processed - no type', message);
                return;
            }
            if (['success', 'info', 'warning', 'error'].indexOf(message.type) === -1) {
                console.error('Message not processed - invalid type', message);
                return;
            }
            if (message.id) {
                if (this.notificationMap[message.id]) {
                    // just update it.
                    this.updateNotification(message);
                    return;
                }
            }
            this.addNotification(message);
        }
    }

    function buildSummaryItem(name) {
        return div({
            dataBind: {
                with: name
            }
        }, div({
            dataBind: {
                css: 'myClass'
            },
            class: '-item'
        }, [
            div({
                dataBind: {
                    text: 'count'
                },
                style: {
                    display: 'inline-block',
                    width: '30%',
                    textAlign: 'right',
                    paddingRight: '3px',
                    lineHeight: '1'
                }
            }),
            div({
                dataBind: {
                    text: 'label'
                },
                style: {
                    display: 'inline-block',
                    width: '60%'
                }
            })
        ]));
    }

    function buildSummary() {
        return div({
            dataBind: {
                with: 'summary',
                click: 'doToggleNotification'
            },
            class: '-summary'
        }, [
            buildSummaryItem('success'),
            buildSummaryItem('info'),
            buildSummaryItem('warning'),
            buildSummaryItem('error')
        ]);
    }

    function buildNotificationDisplay() {
        return div({
            dataBind: {
                css: {
                    '"-active"': 'show'
                },
            },
            class: '-container'
        }, [
            div({
                dataBind: {
                    css: {
                        hidden: '!show()'
                    }
                },
                class: '-notification-set',
                style: {
                    position: 'absolute',
                    top: '0px',
                    right: '20px',
                    zIndex: '100',
                    width: '200px',
                    textAlign: 'center'
                }
            }, [
                div({
                    class: '-pointer'
                }, [
                    svg({
                        viewBox: '0 0 25 25',
                        xmlns: 'http://www.w3.org/2000/svg',
                        width: '25px',
                        height: '25px'
                    }, [
                        polygon({
                            points: '0 0, 0 20, 20 10',
                            fill: 'gray'
                        })
                    ])
                ]),
                div({
                    style: {
                        display: 'inline-block'
                    }
                }),
                // dismiss button will close the list of notifications
                a({
                    dataBind: {
                        click: '$component.doCloseNotifications.bind($component)',
                    },
                    class: '-button',
                    style: {
                        padding: '2px 4px',
                        display: 'inline-block',
                        marginTop: '2px',
                        marginBottom: '3px'
                    }
                }, 'close'),
                // container for the list of notifications.
                // has a max-height and is vertically scrollable
                div({
                    dataBind: {
                        foreach: 'notificationQueue'
                    },
                    class: '-notification-container'
                }, div({
                    class: '-notification',
                    dataBind: {
                        css: {
                            '"-success"': 'type() === "success"',
                            '"-info"': 'type() === "info"',
                            '"-warning"': 'type() === "warning"',
                            '"-error"': 'type() === "error"'
                        }
                    },
                }, [
                    a({
                        dataBind: {
                            click: '$parent.doClearNotification.bind($parent)',
                        },
                        class: '-button -close-button',
                        title: 'Clear this notification'
                    }, span({ class: 'fa fa-times' })),
                    div({
                        dataBind: {
                            attr: {
                                title: 'description'
                            }
                        },
                        class: '-message',
                    }, [
                        // gen.if('icon', span({
                        //     dataBind: {
                        //         css: '"fa fa-"' + 'icon'
                        //     }
                        // })),
                        span({
                            dataBind: {
                                html: 'message'
                            }
                        })
                    ])
                ]))
            ])
        ]);
    }

    function template() {
        return div({
            dataBind: {
                if: 'notificationQueue().length > 0'
            },
            dataElement: 'widget-notification',
            class: 'widget-notification'
        }, div({
            style: {
                // padding: '4px',
                display: 'inline-block',
                height: '100%',
                verticalAlign: 'top',

                border: '1px silver solid',
                fontSize: '90%',
                width: '80px'
            }
        }, [
            buildSummary(),
            buildNotificationDisplay()
        ]));
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});
