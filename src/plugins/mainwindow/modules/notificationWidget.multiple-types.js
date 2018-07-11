define([
    'jquery',
    'bluebird',
    'knockout-plus',
    'uuid',
    'kb_common/html',
    'bootstrap'
], function (
    $,
    Promise,
    ko,
    Uuid,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        a = t('a');

    function factory(config) {
        var container;
        var runtime = config.runtime;
        var sendingChannel = new Uuid(4).format();

        // individual notification item
        function notification(params) {
            var message = ko.observable(params.message.message);
            var autodismiss = params.message.autodismiss;
            var type = params.message.type;
            var over = ko.observable(false);

            function doMouseOver() {
                over(true);
            }

            function doMouseOut() {
                over(false);
            }

            return {
                message: message,
                autodismiss: autodismiss,
                type: type,

                over: over,
                doMouseOver: doMouseOver,
                doMouseOut: doMouseOut
            };
        }

        // a bunch of notifications together.
        function notificationSet(params) {
            var queue = ko.observableArray();
            var over = ko.observable(false);
            var show = ko.observable(false);
            var autoDismisser;

            function runAutoDismisser() {
                var toRemove = [];
                var now = new Date().getTime();
                queue().forEach(function (item) {
                    if (item.autodismiss) {
                        var elapsed = now - item.addedAt;
                        if (item.autodismiss < elapsed) {
                            toRemove.push(item);
                        }
                    }
                });
                toRemove.forEach(function (item) {
                    queue.remove(item);
                });
                if (queue().length > 0) {
                    startAutoDismisser(true);
                } else {
                    autoDismisser = null;
                }
            }

            function startAutoDismisser(force) {
                if (autoDismisser && !force) {
                    return;
                }
                autoDismisser = window.setTimeout(function () {
                    runAutoDismisser();
                }, 1000);
            }

            queue.subscribe(function (newQueue) {
                // start or stop the autodismiss listener
                var autoDismissable = false;
                var newItems = false;
                newQueue.forEach(function (item) {
                    if (!item.addedAt) {
                        newItems = true;
                        item.addedAt = new Date().getTime();
                    }
                    if (item.autodismiss) {
                        autoDismissable = true;
                    }
                });
                if (newItems) {
                    show(true);
                }
                if (queue().length === 0) {
                    show(false);
                }
                if (autoDismissable) {
                    startAutoDismisser();
                }
            });

            // EVENT HANDLERS

            function doMouseOver() {
                over(true);
            }

            function doMouseOut() {
                over(false);
            }

            function doToggleNotification() {
                // only allow toggling if have items...
                if (queue().length === 0) {
                    return;
                }
                if (show()) {
                    show(false);
                } else {
                    show(true);
                }
            }

            function doClearNotification(data, event) {
                event.stopPropagation();
                queue.remove(data);
            }

            return {
                label: params.label,
                queue: queue,
                over: over,
                show: show,
                // backgroundColor: backgroundColor,
                doMouseOver: doMouseOver,
                doMouseOut: doMouseOut,
                doToggleNotification: doToggleNotification,
                doClearNotification: doClearNotification
            };
        }


        function viewModel() {
            var notifications = {
                info: notificationSet({
                    label: 'info'
                }),
                warn: notificationSet({
                    label: 'warn'
                }),
                error: notificationSet({
                    label: 'error'
                })
            };

            function processMessage(message) {
                // start simple, man.
                var type = message.type;
                if (!message.id) {
                    message.id = new Uuid(4).format();
                }
                notifications[type].queue.unshift(notification({
                    message: message
                }));
            }

            var hasNotifications = ko.pureComputed(function () {
                if (notifications.info.queue().length +
                    notifications.warn.queue().length +
                    notifications.error.queue().length === 0) {
                    return false;
                }
                return true;
            });

            runtime.send('notification', 'ready', {
                channel: sendingChannel
            });
            runtime.recv(sendingChannel, 'new', function (message) {
                processMessage(message);
            });

            return {
                notifications: notifications,
                hasNotifications: hasNotifications
            };
        }

        function buildRow(name) {
            return div({
                dataBind: {
                    with: name
                },
                style: {
                    verticalAlign: 'middle',
                    position: 'relative',
                    cursor: 'pointer'
                },
                class: '-' + name
            }, div({
                dataBind: {
                    event: {
                        click: 'doToggleNotification'
                        // mouseover: 'doMouseOver',
                        // mouseout: 'doMouseOut'
                    },
                    // style: {
                    //     '"background-color"': 'backgroundColor'
                    // },
                    css: {
                        // '"-hover"': 'over',
                        '"-active"': 'show'
                    },
                },
                class: '-container'
            }, [
                div({
                    dataBind: {
                        text: 'queue().length'
                    },
                    style: {
                        display: 'inline-block',
                        width: '40%',
                        textAlign: 'right',
                        paddingRight: '3px'
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
                }),
                div({
                    dataBind: {
                        css: {
                            hidden: '!show()'
                        }
                    },
                    class: '-notification-set',
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '86px',
                        zIndex: '100',
                        width: '200px'
                    }
                }, [
                    div({
                        class: '-triangle'
                    }, '▶'),
                    div({
                        class: '-notification-container',
                        dataBind: {
                            foreach: 'queue'
                        }
                    }, div({
                        class: '-notification'
                        // dataBind: {
                        //     css: {
                        //         '"-hover"': 'over'
                        //     }
                        // }
                    }, [
                        div({
                            dataBind: {
                                text: 'message'
                                // event: {
                                //     mouseover: 'doMouseOver',
                                //     mouseout: 'doMouseOut'
                                // }
                            },
                            style: {
                                display: 'inline-block'
                            }
                        }),
                        a({
                            dataBind: {
                                click: '$parent.doClearNotification',
                            },
                            class: '-close-button'
                        }, 'x')
                    ]))
                ])
            ]));
        }

        function template() {
            return div({
                dataBind: {
                    if: 'hasNotifications()'
                },
                dataElement: 'widget-notification',
                class: 'widget-notification'
            }, div({
                dataBind: {
                    with: 'notifications'
                },
                style: {
                    padding: '4px',
                    display: 'inline-block',
                    height: '100%',
                    verticalAlign: 'top',
                    // width: '100px',

                    border: '1px silver solid',
                    fontSize: '90%',
                    width: '80px'
                }
            }, [
                buildRow('info'),
                buildRow('warn'),
                buildRow('error')
            ]));
        }

        function component() {
            return {
                viewModel: viewModel,
                template: template()
            };
        }

        ko.components.register('notifications', component());

        // SERVICE API

        function attach(node) {
            container = node;
        }

        function start() {
            container.innerHTML = div({
                dataBind: {
                    component: {
                        name: '"notifications"',
                        params: {}
                    }
                }
            });
            var vm = {};
            try {
                ko.applyBindings(vm, container);
            } catch (err) {
                console.error('Error binding', err);
            }

        }

        function stop() {

        }

        function detach() {

        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };

    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});