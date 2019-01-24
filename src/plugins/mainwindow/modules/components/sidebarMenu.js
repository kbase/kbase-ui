define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_common/html'
], function (
    ko,
    reg,
    gen,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        a = t('a');

    class ViewModel {
        constructor(params) {
            this.buttons = params.buttons;
            this.isAuthorized = params.isAuthorized;

            this.notificationCount = ko.observable(null);
            this.notificationError = ko.observable(null);

            params.runtime.db().subscribe({
                path: 'feeds'
            }, (feeds) => {
                this.processFeeds(feeds);
            });

            const feeds = params.runtime.db().get('feeds');
            this.processFeeds(feeds);
            // if (feeds.error) {
            //     this.notificationError(feeds.error);
            //     return;
            // }
            // this.notificationError(null);
            // if (feeds.notifications) {
            //     const nsCount = Object.entries(feeds.notifications).reduce((total, [, feed]) => {
            //         return total + feed.unseen;
            //     }, 0);
            //     this.notificationCount(nsCount);
            // }

        }

        processFeeds(feeds) {
            if (feeds.error) {
                this.notificationError(feeds.error);
                return;
            }
            this.notificationError(null);
            if (!feeds.notifications) {
                return;
            }
            const nsCount = feeds.notifications.user.unseen +
                    feeds.notifications.global.unseen;

            this.notificationCount(nsCount);
        }
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
                focus: {
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

    function buildPublicSearchIcon() {
        return div({
            class: 'fa-stack fa-2x',
            style: {
                marginBottom: '-12px'
            },
            ariaHidden: 'true'
        }, [
            div({
                class: 'fa fa-stack-2x',
                style: {
                    fontSize: '1.6em'
                },
                dataBind: {
                    class: '"fa-search"'
                }
            }),
            div({
                class: 'fa fa-stack-1x ',
                style: {
                    fontSize: '85%',
                    top: '-7px',
                    left: '-3px'
                },
                dataBind: {
                    class: '"fa-globe"'
                }
            })
        ]);
    }

    function buildIcon() {
        return gen.switch('icon', [
            [
                '"public-search"',
                buildPublicSearchIcon()
            ],
            [
                '$default',
                div({
                    class: 'fa fa-3x ',
                    dataBind: {
                        class: '"fa-" + icon'
                    }
                })
            ]
        ]);
    }

    function buildBeta() {
        return div({
            style: {
                position: 'absolute',
                top: '0',
                right: '0',
                color: 'rgb(193, 119, 54)',
                textAlign: 'center',
                fontWeight: 'bold',
                fontStyle: 'italic'
            }
        }, 'beta');
    }

    function buildBadge() {
        return gen.if('$data.beta',
            buildBeta(),
            gen.if('$data.id === "feeds"',
                gen.if('$component.notificationCount() || $component.notificationError()',
                    div({
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0'
                        }
                    }, div({
                        style: {
                            padding: '4px',
                            color: 'white',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontStyle: 'italic',
                            borderRadius: '3px'
                        }
                    }, gen.if('$component.notificationCount()',
                        span({
                            dataBind: {
                                text: '$component.notificationCount'
                            }
                        }),
                        gen.if('$component.notificationError()', span({
                            class: 'fa fa-ban'
                        }))
                    ))))));
    }

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
            buildIcon(),
            div({
                dataBind: {
                    text: 'label'
                }
            }),
            buildBadge()
        ]);
    }

    function buildButtons() {
        return div({
            dataBind: {
                foreach: 'buttons'
            }
        }, [
            buildButton()
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
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});