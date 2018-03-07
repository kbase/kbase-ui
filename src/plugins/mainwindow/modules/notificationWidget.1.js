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
        div = t('div');

    function factory(config) {
        var container;
        var runtime = config.runtime;
        var sendingChannel = new Uuid(4).format();

        function notification(params) {
            var queue = ko.observableArray();
            var over = ko.observable(false);
            var show = ko.observable(false);
            // var backgroundColor = ko.pureComputed(function () {
            //     if (over()) {
            //         // if (show()) {
            //         //     return 'gray';
            //         // }
            //         return 'silver';
            //     }
            //     if (show()) {
            //         return 'gray';
            //     }
            //     return 'transparent';
            // });

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
                }, 100000);
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
                messages: {},
                over: over,
                show: show,
                // backgroundColor: backgroundColor,
                doMouseOver: doMouseOver,
                doMouseOut: doMouseOut,
                doToggleNotification: doToggleNotification,
                doClearNotification: doClearNotification
            };
        }

        function viewModel(params) {
            var notifications = {
                info: notification({
                    label: 'info'
                }),
                warn: notification({
                    label: 'warn'
                }),
                error: notification({
                    label: 'error'
                })
            };

            function processMessage(message) {
                // start simple, man.
                var type = message.type;
                if (!message.id) {
                    message.id = new Uuid(4).format();
                }
                notifications[type].queue.push(message);
                notifications[type].messages[message.id] = message;
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
                        click: 'doToggleNotification',
                        mouseover: 'doMouseOver',
                        mouseout: 'doMouseOut'
                    },
                    // style: {
                    //     '"background-color"': 'backgroundColor'
                    // },
                    css: {
                        '"-hover"': 'over',
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
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '74px',
                        zIndex: '100',
                        width: '200px'
                    }
                }, div({
                    class: '-notification',
                    dataBind: {
                        foreach: 'queue'
                    }
                }, div({}, [
                    div({
                        dataBind: {
                            text: 'message'
                        },
                        style: {
                            display: 'inline-block'
                        }
                    }),
                    div({
                        dataBind: {
                            click: '$parent.doClearNotification',
                        },
                        style: {
                            float: 'right'
                        }
                    }, 'x')
                ])))
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

        function start(params) {
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