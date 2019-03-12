define([
    'knockout',
    'kb_knockout/registry',
    'uuid',
    'kb_lib/html',

    // for effect
    'bootstrap'
], function (
    ko,
    reg,
    Uuid,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        a = t('a');

    class Notification {
        constructor(params) {
            const newNotification = params.notification;
            this.id = newNotification.id || new Uuid(4).format();
            this.message = ko.observable(newNotification.message);
            this.autodismiss = ko.observable(newNotification.autodismiss);
            this.autodismissStartedAt = newNotification.autodismiss ? new Date().getTime() : null;
            this.type = ko.observable(newNotification.type);

            this.type.subscribeChanged((newVal, oldVal) => {
                this.summary[oldVal].count(this.summary[oldVal].count() - 1);
                this.summary[newVal].count(this.summary[newVal].count() + 1);
            });

            this.autodismiss.subscribe((newVal) => {
                if (newVal) {
                    // TODO: this
                    this.autodismissStartedAt = new Date().getTime();
                    this.startAutoDismisser();
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
                        if (!item.autodismiss.startedAt) {
                            item.autodismiss.startedAt = new Date().getTime();
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

            this.runtime.recv(this.sendingChannel, 'new', (message) => {
                this.processMessage(message);
            });
        }

        runAutoDismisser() {
            var toRemove = [];
            var now = new Date().getTime();
            this.notificationQueue().forEach((item) => {
                if (item.autodismiss()) {
                    var elapsed = now - item.autodismiss.startedAt;
                    if (item.autodismiss() < elapsed) {
                        toRemove.push(item);
                    }
                }
            });

            toRemove.forEach((item) => {
                this.removeNotification(item);
            });
            if (this.notificationQueue().length > 0) {
                this.startAutoDismisser(true);
            } else {
                this.autoDismisser = null;
            }
        }

        startAutoDismisser(force) {
            if (this.autoDismisser && !force) {
                return;
            }
            this.autoDismisser = window.setTimeout(() => {
                this.runAutoDismisser();
            }, 1000);
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
            var count = ko.observable(0);
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
            const notification = new Notification({notification: newMessage});
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
                // triangle pointing to the notification summary box
                div({
                    class: '-triangle'
                }, '▶'),
                div({
                    style: {
                        display: 'inline-block'
                    }
                }),
                // dismiss button will close the list of notifications
                a({
                    dataBind: {
                        click: '$component.doCloseNotifications',
                    },
                    class: '-button',
                    style: {
                        padding: '2px 4px',
                        display: 'inline-block',
                        marginTop: '2px',
                        marginBottom: '3px'
                    }
                }, 'dismiss'),
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
                            click: '$parent.doClearNotification',
                        },
                        class: '-button -close-button'
                    }, span({ class: 'fa fa-times' })),
                    div({
                        dataBind: {
                            html: 'message'
                        },
                        class: '-message'
                    })
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
