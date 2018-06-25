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

    class NotFoundWidget {
        constructor() {
            this.hostNode = null;
            this.container = null;
        }

        render(params) {
            let query;
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
                    Object.keys(params.request.query).map(function (key) {
                        return tr([
                            td({style: {fontWeight: 'bold'}}, html.embeddableString(key)),
                            td({style: {fontWeight: 'bold'}}, html.embeddableString(params.request.query[key]))
                        ]);
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

        attach(node) {
            this.hostNode = node;
            this.container = document.createElement('div');
            this.hostNode.appendChild(this.container);
        }

        start(params) {
            this.container.innerHTML = this.render(params);
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return {Widget: NotFoundWidget};
});
