define([
    'knockout-plus',
    'kb_common/html',
    'kb_common/bootstrapUtils'
], function (
    ko,
    html,
    BS
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function validateViewModel(params) {
        var spec = {            
            source: {
                type: 'string',
                observable: true,
                required: false
            },
            code: {
                type: 'string',
                observable: true,
                required: true
            },
            message: {
                type: 'string',
                observable: true,
                required: true
            },
            detail: {
                type: 'string',
                observable: true,
                required: true
            },
            info: {
                type: 'object',
                observable: true,
                required: false
            },
            onClose: {
                type: 'function',
                required: true
            }
        };
    }

    function viewModel(params) {
        var infoHtml;
        if (params.info() === undefined) {
            infoHtml = 'none';
        } else {
            infoHtml = BS.buildPresentableJson(params.info());
        }
        return {
            source: params.source,
            code: params.code,
            message: params.message,
            detail: params.detail,
            info: infoHtml,
            stackTrace: params.stackTrace
        };
    }

    function template() {
        return div([
            BS.buildPanel({
                name: 'message',
                class: 'kb-panel-light',
                title: 'Message',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'message'
                    }
                })
            }),
            '<!-- ko if: source -->',
            BS.buildPanel({
                name: 'source',
                class: 'kb-panel-light',                
                title: 'Source',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'source'
                    }
                })
            }),
            '<!-- /ko -->',
            BS.buildPanel({
                name: 'code',
                class: 'kb-panel-light',
                title: 'Code',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'code'
                    }
                })
            }), 
            '<!-- ko if: $data.detail -->',     
            BS.buildCollapsiblePanel({
                name: 'detail',
                title: 'Detail',
                type: 'danger',
                classes: ['kb-panel-light'],
                collapsed: false,
                hidden: false,
                body: div({
                    dataBind: {
                        html: 'detail'
                    }
                })
            }),
            '<!-- /ko -->',
            '<!-- ko if: $data.info -->',
            BS.buildCollapsiblePanel({
                name: 'info',
                title: 'Info',
                type: 'danger',
                classes: ['kb-panel-light'],
                collapsed: true,
                hidden: false,
                body: div({
                    dataBind: {
                        if: '$data.info'
                    }
                }, div({
                    dataBind: {
                        html: '$data.info'
                    }
                }))
            }),
            '<!-- /ko -->',
            '<!-- ko if: $data.stackTrace -->',
            BS.buildCollapsiblePanel({
                name: 'stackTrace',
                title: 'Stack Trace',
                type: 'danger',
                classes: ['kb-panel-light'],
                collapsed: true,
                hidden: false,
                body: div({
                    dataBind: {
                        foreach: '$data.stackTrace'
                    }
                }, div({
                    dataBind: {
                        text: '$data'
                    }
                }))
            }),
            '<!-- /ko -->'
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