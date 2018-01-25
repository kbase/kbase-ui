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
        p = t('p'),
        h2 = t('h2');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function render() {
            return div([
                h2('Hello from KBase'),
                p('This is KBase')
            ]);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.innerHTML = render();
        }

        function start() {
            runtime.send('ui', 'setTitle', 'Hello');
        }

        function stop() {
            return null;
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: factory
    };
});