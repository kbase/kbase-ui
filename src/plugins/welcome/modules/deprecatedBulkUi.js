define(['kb_lib/html', 'kb_lib/htmlBootstrapBuilders'], function (html, BS) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        a = t('a'),
        p = t('p');

    class DeprecatedBulkUI {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
        }

        render() {
            return div(
                {
                    class: 'container-fluid'
                },
                [
                    div(
                        {
                            class: 'row'
                        },
                        [
                            div(
                                {
                                    class: 'col-sm-8 col-sm-push-2'
                                },
                                [
                                    BS.buildPanel({
                                        title: 'Bulk Import - DEPRECATED',
                                        type: 'warning',
                                        body: div([
                                            p(['This Bulk Import interface is no longer supported.']),
                                            p([
                                                'To import data to your KBase account, please use the new Import tab, which you can find in the Data Slideout',
                                                'in any Narrative. See ',
                                                a(
                                                    {
                                                        href:
                                                            'http://kbase.us/narrative-guide/add-data-to-your-narrative-2',
                                                        target: '_blank'
                                                    },
                                                    'http://kbase.us/narrative-guide/add-data-to-your-narrative-2'
                                                ),
                                                ' for more information.'
                                            ]),
                                            p([
                                                'The new Import tab also has a link to let you transfer data from your Globus account to your Narrative-- ',
                                                'see ',
                                                a(
                                                    {
                                                        href: 'http://kbase.us/transfer-data-from-globus-to-kbase',
                                                        target: '_blank'
                                                    },
                                                    'http://kbase.us/transfer-data-from-globus-to-kbase'
                                                ),
                                                ' for more information.'
                                            ])
                                        ])
                                    })
                                ]
                            )
                        ]
                    )
                ]
            );
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.innerHTML = this.render();
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'Bulk Import - DEPRECATED');
        }

        stop() {
            return null;
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return DeprecatedBulkUI;
});
