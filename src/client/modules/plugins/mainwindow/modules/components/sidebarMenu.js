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
        a = t('a');

    function viewModel(params) {
        var buttons = params.buttons;

        return {
            buttons: buttons,
            isAuthorized: params.isAuthorized
        };
    }

    var styles = html.makeStyles({
        button: {
            css: {
                backgroundColor: 'transparent',
                width: '75px',
                textAlign: 'center',
                padding: '3px',
                margin: '6px 0',
                display: 'block',
                color: '#000',
                textDecoration: 'none',
                position: 'relative'
            },
            pseudo: {
                hover: {
                    color: '#000',
                    backgroundColor: 'rgba(200, 200, 200, 0.5)'
                },
                active: {
                    color: '#000',
                    backgroundColor: 'rgba(200, 200, 200, 0.5)'
                }
            },
            modifiers: {
                active: {
                    backgroundColor: 'rgba(200, 200, 200, 0.5)'
                }
            }
        },
        statusIndicator: {
            position: 'absolute',
            left: '2px',
            top: '0',
            backgroundColor: 'rgba(191, 26, 26, 0.5)',
            color: '#FFF',
            padding: '2px'
        }
    });

    function buildButton() {
        return a({
            dataBind: {
                attr: {
                    href: '"#" + path'
                },
                class: 'active() ? "' + styles.scopes.active + '" : null'
            },
            class: styles.classes.button
        }, [
            div({
                class: 'fa fa-3x ',
                dataBind: {
                    class: '"fa-" + icon'
                }
            }),
            div({
                dataBind: {
                    text: 'label'
                }
            }),
            // info,
            // status
        ]);
    }

    function buildButtons() {
        return div({
            dataBind: {
                foreach: 'buttons'
            }
        }, [
            // '<!-- ko ifnot: authRequired && !$component.isAuthorized() -->',
            buildButton(),
            // '<!-- /ko -->'
        ]);
    }

    function template() {
        return div([
            styles.sheet,
            buildButtons()
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return ko.kb.registerComponent(component);
});