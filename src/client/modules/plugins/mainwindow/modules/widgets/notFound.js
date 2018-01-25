define([
    'kb_common/html',
    'kb_common/bootstrapUtils'
], function (
    html,
    BS
) {
    'use strict';

    var t = html.tag,
        p = t('p'),
        div = t('div'),
        span = t('span'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');


    function factory(config) {
        var hostNode, container;

        // IMPL

        function render(params) {
            var query;
            if (params.request.query && Object.keys(params.request.query).length > 0) {
                query = table({
                    class: 'table',
                    style: {
                        width: 'auto'
                    }
                }, [
                    tr([
                        th({style: {fontWeight: 'normal'}}, 'Key'),
                        th({style: {fontWeight: 'normal'}}, 'Value')
                    ]),
                    Object.keys(params.request.query).map(function(key) {
                        return tr([
                            td({style: {fontWeight: 'bold'}}, html.embeddableString(key)),
                            td({style: {fontWeight: 'bold'}}, html.embeddableString(params.request.query[key]))
                        ])
                    }).join('\n')
                ]);
            }
            return div({
                class: 'container-fluid',
                dataWidget: 'notFound'
            },
            BS.buildPanel({
                title: 'Not Found',
                type: 'warning',
                body: div([
                    p([
                        'Sorry, this path was not found: ',
                        span({
                            style: {
                                fontWeight: 'bold'
                            }
                        }, html.embeddableString(params.path.join('/')))
                    ]),
                    (function () {
                        if (query) {
                            return p([
                                'The query supplied was:',
                                query
                            ]);
                        }
                    }())
                ])
            }));
        }

        // API

        function attach(node) {
            hostNode = node;
            container = document.createElement('div');
            hostNode.appendChild(container);
        }

        function start(params) {
            container.innerHTML = render(params);
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
