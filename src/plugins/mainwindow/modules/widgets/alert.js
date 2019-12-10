define([
    'knockout',
    'kb_lib/html'
], function (
    ko,
    html
) {
    'use strict';
    const t = html.tag,
        span = t('span'),
        div = t('div'),
        button = t('button'),
        table = t('table'),
        tr = t('tr'),
        td = t('td');

    function buildAlert() {
        return table({
            style: {
                width: '100%',
                padding: '0',
                margin: '0'
            }
        }, [
            // Title
            tr({
                style: {
                    padding: '0',
                    margin: '0'
                }
            }, [
                td({
                    style: {
                        width: '50px'
                    }
                }, span({
                    class: 'fa fa-2x',
                    dataBind: {
                        css: 'iconClass'
                    }
                })),
                td({
                    style: {}
                }, div({
                    dataBind: {
                        html: 'message'
                    }
                })),
                td({
                    style: {
                        width: '100px',
                        textAlign: 'right'
                    }
                }, [
                    button({
                        type: 'button',
                        class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                        ariaLabel: 'Open',
                        dataBind: {
                            click: 'toggleDescription',
                            visible: 'description'
                        }
                    }, [
                        span({
                            ariaHidden: 'true',
                            class: 'fa',
                            dataBind: {
                                css: {
                                    '"fa-chevron-right"': 'showDescription() !== true',
                                    '"fa-chevron-down"': 'showDescription() === true'
                                }
                            }
                        })
                    ]),
                    button({
                        type: 'button',
                        class: 'btn btn-default btn-kbase-subtle btn-kbase-compact',
                        dataBind: {
                            click: '$parent.closeAlert'
                        }
                    }, [
                        span({
                            ariaHidden: 'true',
                            class: 'fa fa-times'
                        })
                    ])
                ])
            ]),
            // Status
            '<!-- ko if remaining !== null -->',
            tr({}, [
                td(),
                td({
                    dataBind: {
                        text: 'secondsRemaining'
                    }
                }),
                td()
            ]),
            '<!-- /ko -->',
            // Description
            tr({
                dataBind: {
                    visible: 'showDescription'
                }
            }, [
                td(),
                td({
                    style: {}
                }, div({
                    dataBind: {
                        html: 'description'
                    }
                })),
                td()
            ])
        ]);
    }

    function template() {
        return div({
            dataBind: {
                foreach: 'alerts'
            }
        }, div({
            class: ['alert'],
            dataBind: {
                css: 'alertClass',
                attr: {
                    name: 'name'
                }
            },
            role: 'alert',
            style: {
                marginTop: '8px',
                marginBottom: '8px'
            }
        }, buildAlert()));
    }

    function alertViewModel(params) {
        const name = params.name;
        const icon = ko.observable(params.icon);
        const type = ko.observable(params.type);
        const message = ko.observable(params.message);
        const description = ko.observable(params.description);

        const timeout = ko.observable(null);

        const remaining = ko.observable(null);

        const secondsRemaining = ko.pureComputed(function () {
            if (remaining() === null) {
                return '';
            }
            const timeLeft = remaining() / 1000;
            return 'Autoclosing in ' + Math.round(timeLeft) + ' seconds';
        });

        const showDescription = ko.observable(false);
        const iconClass = ko.pureComputed(function () {
            return 'fa-' + icon();
        });
        const alertClass = ko.pureComputed(function () {
            return 'alert-' + type();
        });

        function toggleDescription() {
            if (showDescription()) {
                showDescription(false);
            } else {
                showDescription(true);
            }
        }

        return {
            name: name,
            icon: icon,
            type: type,
            message: message,
            description: description,
            timeout: timeout,
            remaining: remaining,
            secondsRemaining: secondsRemaining,
            showDescription: showDescription,
            toggleDescription: toggleDescription,
            iconClass: iconClass,
            alertClass: alertClass
        };
    }

    function viewModel(params) {
        const alerts = ko.observableArray();

        function closeAlert(alert) {
            alerts.remove(alert);
        }

        const runtime = params.runtime;

        function findAlert(findAlert) {
            for (let i = 0; i < alerts().length; i += 1) {
                const alert = alerts()[i];
                if (alert.name === findAlert.name) {
                    return alert;
                }
            }
        }

        runtime.receive('ui', 'alert', function (newAlert) {
            let alert = findAlert(newAlert);
            if (alert) {
                alert.message(newAlert.message);
                alert.description(newAlert.description);
                alert.timeout(newAlert.timeout || null);
                alert.remaining(null);
                alert.icon(newAlert.icon);
                alert.type(newAlert.type);
            } else {
                alert = alertViewModel(newAlert);
                alerts.push(alert);
            }

            if (alert.timeout()) {
                timeouts.push({
                    startedAt: new Date().getTime(),
                    timeout: alert.timeout,
                    name: alert.name
                });
                runTimeouts();
            }
        });

        const timeouts = [];

        function runTimeouts() {
            const todo = timeouts;
            const timeouts = [];
            const now = new Date().getTime();
            todo.forEach(function (item) {
                const elapsed = now - item.startedAt;
                const alert = findAlert(item);
                if (elapsed > alert.timeout()) {
                    alerts.remove(alert);
                } else {
                    const remaining = Math.round((item.timeout() - elapsed));
                    alert.remaining(remaining);
                    timeouts.push(item);
                }
            });
            if (timeouts.length > 0) {
                window.setTimeout(runTimeouts, 1000);
            }
        }

        return {
            alerts: alerts,
            closeAlert: closeAlert
        };
    }

    function component() {
        return {
            template: template(),
            viewModel: viewModel,
            // Required in order to make the alert component available within
            // the service api start semantics.
            // Component loading is asynchronous, and there is no hook for
            // getting component loading completion, which we could use to build a
            // promise.
            // TODO: see if there are changes in progress, or otherwise research what
            // would be required for this. At the least, the viewmodel building would
            // need async hooks, as well as applyBindings.
            synchronous: true
        };
    }
    ko.components.register('ui-alerts', component());


    function factory(config) {
        let hostNode;
        let container;
        const runtime = config.runtime;
        const listeners = [];

        // function updateAlert(node, alert) {
        //     node.classList.forEach(function (klass) {
        //         if (/^alert-/.test(klass)) {
        //             node.classList.remove(klass);
        //         }
        //     });
        //     node.classList.add('alert-' + alert.type);
        //     node.innerHTML = buildAlert(alert);
        // }

        // function removeAlert(alert) {
        //     var node = container.querySelector('[name="' + alert.name + '"]');
        //     if (node) {
        //         container.removeChild(node);
        //     }
        // }

        // function runTimeouts() {
        //     var todo = timeouts;
        //     timeouts = [];
        //     var now = new Date().getTime();
        //     todo.forEach(function (item) {
        //         var elapsed = now - item.startedAt;
        //         if (elapsed > item.timeout) {
        //             removeAlert(item.alert);
        //         } else {
        //             var alertNode = container.querySelector('[name="' + item.alert.name + '"]');
        //             var timeoutMessage = alertNode.querySelector('[name="status"] [name="timeout"]');
        //             var remaining = Math.round((item.timeout - elapsed) / 1000);
        //             timeoutMessage.innerHTML = 'closing in ' + remaining;
        //             timeouts.push(item);
        //         }
        //     });
        //     if (timeouts.length > 0) {
        //         window.setTimeout(runTimeouts, 1000);
        //     }
        // }

        // function addAlert(alert) {
        //     var el = document.createElement('div');
        //     el.innerHTML = makeAlert(alert);
        //     container.appendChild(el.firstChild);
        // }

        // function setAlert(alert) {
        //     if (!alert) {
        //         return;
        //     }
        //     if (typeof alert === 'string') {
        //         alert = {
        //             type: 'default',
        //             message: alert
        //         };
        //     }
        //     if (alert.name) {
        //         var existing = container.querySelector('[name="' + alert.name + '"');
        //         if (existing) {
        //             updateAlert(existing, alert);
        //         } else {
        //             addAlert(alert);
        //         }
        //         if (alert.timeout) {
        //             timeouts.push({
        //                 startedAt: new Date().getTime(),
        //                 timeout: alert.timeout,
        //                 alert: alert
        //             });
        //             runTimeouts();
        //         }
        //     } else {
        //         addAlert(alert);
        //     }

        // }

        function render() {
            container.innerHTML = div({
                class: 'container-fluid'
            }, [
                div({
                    dataBind: {
                        component: {
                            name: '"ui-alerts"',
                            params: {
                                runtime: 'runtime'
                            }
                        }
                    }
                })
            ]);
            const vm = {
                runtime: runtime
            };
            ko.applyBindings(vm, container);
        }

        // API

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start() {
            render();
            // listeners.push(runtime.receive('ui', 'alert', function (alert) {
            //     setAlert(alert);
            // }));
        }

        function stop() {
            listeners.forEach(function (listener) {
                runtime.drop(listener);
            });
            // remove bindings??
        }

        return {
            attach: attach,
            start: start,
            stop: stop
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});