define([
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_lib/html'
], function (
    reg,
    gen,
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

    class ViewModel {
        constructor(params) {
            this.menu = params.menu;
        }
    }

    function buildMenuItems(section) {
        return [
            gen.foreach(section,
                li([
                    a({
                        dataBind: {
                            attr: {
                                href: '$data.uri ? $data.uri : "#" + $data.path',
                                target: '$data.newWindow ? "_blank" : null'
                            }
                        }
                    }, [
                        gen.if('icon',
                            div({
                                class: 'navbar-icon'
                            }, [
                                span({
                                    class: 'fa',
                                    dataBind: {
                                        class: '"fa-" + icon'
                                    }
                                })
                            ])),
                        span({
                            dataBind: {
                                text: 'label'
                            }
                        })
                    ])
                ]))
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
                gen.if('$data.developer && $data.developer().length > 0', [
                    buildDivider(),
                    buildMenuItems('developer')
                ]),
                gen.if('$data.help && $data.help().length > 0', [
                    buildDivider(),
                    buildMenuItems('help')
                ])
            ])
        ]);
    }

    function template() {
        return buildMenu();
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});