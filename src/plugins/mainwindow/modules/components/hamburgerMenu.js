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
        span = t('span'),
        button = t('button'),
        ul = t('ul'),
        li = t('li'),
        a = t('a');

    function viewModel(params) {
        return {
            menu: params.menu
        };
    }

    function buildMenuItems(section) {
        return [
            '<!-- ko foreach: ' + section + '-->',

            // TODO: swtich on type

            li([
                a({
                    dataBind: {
                        attr: {
                            href: '$data.uri ? $data.uri : "#" + $data.path',
                            target: '$data.newWindow ? "_blank" : null'
                        }
                    }
                }, [
                    '<!-- ko if: icon -->',
                    div({
                        class: 'navbar-icon'
                    }, [
                        span({
                            class: 'fa',
                            dataBind: {
                                class: '"fa-" + icon'
                            }
                        })
                    ]),
                    '<!-- /ko -->',
                    span({
                        dataBind: {
                            text: 'label'
                        }
                    })
                ])
            ]),

            '<!-- /ko -->'
        ];
    }

    function buildDivider() {
        return li({
            role: 'presentation',
            class: 'divider'
        });
    }

    function buildMenu() {
        return div({
            class: 'navbar'
        }, [
            button({
                id: 'kb-nav-menu',
                class: 'btn btn-default navbar-btn kb-nav-btn',
                dataToggle: 'dropdown',
                ariaHaspopup: 'true'
            }, [
                span({
                    class: 'fa fa-navicon'
                })
            ]),
            ul({
                class: 'dropdown-menu',
                role: 'menu',
                ariaLabeledby: 'kb-nav-menu',
                dataBind: {
                    with: 'menu'
                }
            }, [
                buildMenuItems('main'),
                '<!-- ko if: $data.developer && $data.developer().length > 0 -->',
                buildDivider(),
                buildMenuItems('developer'),
                '<!-- /ko -->',
                '<!-- ko if: $data.help && $data.help().length > 0 -->',
                buildDivider(),
                buildMenuItems('help'),
                '<!-- /ko -->'
            ])
        ]);
    }

    function template() {
        return buildMenu();
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return ko.kb.registerComponent(component);
});