define([
    'kb_common/html',
    'kb_common/bootstrapUtils'
], function (
    html,
    BS
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        p = t('p');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function render() {
            return div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-8 col-sm-push-2'
                    }, [
                        BS.buildPanel({
                            title: 'Bulk Import - DEPRECATED',
                            type: 'warning',
                            body: p([
                                'Your deprecation message here.'
                            ])
                        })
                    ])
                ])
            ]);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.innerHTML = render();
        }

        function start() {
            runtime.send('ui', 'setTitle', 'Bulk Import - DEPRECATED');
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