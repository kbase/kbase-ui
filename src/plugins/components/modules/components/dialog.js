define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        button = t('button');

    function viewModel(params) {
        function doClose() {
            params.onClose();
        }
        return {
            title: params.title,
            body: params.body,
            buttons: [
                {
                    title: 'Close',
                    action: doClose
                }
            ]
        };
    }

    function template() {
        return div({
            style: {
                // backgroundColor: 'white'
            }
        }, [
            // title
            div({
                dataBind: {
                    text: 'title'
                },
                style: {
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    fontSize: '150%',
                    padding: '8px',
                    borderBottom: '1px green solid'
                }
            }),
            // body
            div({
                dataBind: {
                    text: 'body'
                },
                style: {
                    padding: '8px',
                    minHeight: '10em',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                }
            }),
            // buttons
            div({
                dataBind: {
                    foreach: 'buttons'
                },
                style: {
                    padding: '8px',
                    textAlign: 'right',
                    backgroundColor: 'transparent'
                }
            }, button({
                type: 'button',
                class: 'btn btn-default',
                dataBind: {
                    text: 'title',
                    click: 'action'
                }
            })),

        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return component;
});