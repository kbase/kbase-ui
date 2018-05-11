define([
    'knockout',
    'kb_common/html',
    './components/notification'
], function (
    ko,
    html,
    NotificationComponent
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function factory(config) {
        var container;
        var runtime = config.runtime;

        // SERVICE API

        function attach(node) {
            container = node;
        }

        function start() {
            container.innerHTML = div({
                dataBind: {
                    component: {
                        name: NotificationComponent.quotedName(),
                        params: {
                            runtime: 'runtime'
                        }
                    }
                }
            });
            var vm = {
                runtime: runtime
            };
            try {
                ko.applyBindings(vm, container);
            } catch (err) {
                console.error('Error binding', err);
            }

        }

        function stop() {}

        function detach() {}

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
