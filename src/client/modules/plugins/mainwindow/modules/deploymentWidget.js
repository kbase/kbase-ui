define([
    'bluebird',
    'kb_common/html'
], function (
    Promise,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span');

    function factory(config) {
        var runtime = config.runtime;
        var container;

        function attach(node) {
            container = node;
        }

        function start(params) {
            // Do not show the deployment widget for prod
            if (runtime.config('deploy.environment') === 'prod') {
                return;
            }
            container.innerHTML = div({
                style: {
                    height: '100%',
                    border: '1px silver solid',
                    padding: '3px'
                }
            }, [
                div({
                    style: {
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }
                }, runtime.config('deploy.environment').toUpperCase()),
                div({
                    style: {
                        textAlign: 'center'
                    }
                }, span({
                    class: ['fa', 'fa-2x', 'fa-' + runtime.config('deploy.icon')]
                }))
            ]);
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
