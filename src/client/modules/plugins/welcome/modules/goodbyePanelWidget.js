/*global define */
/*jslint white: true, browser: true */
define([
    'kb/common/dom',
    'kb/common/html'
],
    function (dom, html) {
        'use strict';

        function factory(config) {
            var parent, container, runtime = config.runtime,
                t = html.tag,
                p = t('p'), span = t('span'), div = t('div'), a = t('a'),
                timer;

            // VIEW

            function render(params) {
                return div({class: 'container-fluid'}, html.makePanel({
                    title: 'Signed Out',
                    content: [
                        p('You are signed out of KBase.'),
                        p(['In ',
                            span({dataElement: 'countdown', style: {color: 'green'}}),
                            ' seconds your browser will be redirected to the ',
                            a({href: runtime.getConfig('services.doc_site.url')}, [
                                'KBase home page'
                            ]),
                            '.'
                        ])
                    ]
                }));
            }

            function renderCountdown(time) {
                container.querySelector('[data-element="countdown"]').innerHTML = String(time);
            }

            function countdown(counter) {
                if (counter < 0) {
                    runtime.send('app', 'redirect', {
                        url: runtime.getConfig('services.doc_site.url')
                    });
                } else {
                    renderCountdown(counter);
                    timer = window.setTimeout(function () {
                        countdown(counter - 1);
                    }, 1000);
                }
            }

            // API
            function attach(node) {
                parent = node;
                container = parent.appendChild(document.createElement('div'));
            }
            function start(params) {
                if (runtime.service('session').isLoggedIn()) {
                    runtime.send('app', 'navigate', {
                        path: '/'
                    });
                } else {
                    runtime.send('ui', 'setTitle', 'You are Signed Out');
                    container.innerHTML = render(params);
                    countdown(30);
                }
            }
            function stop() {
                if (timer) {
                    window.clearTimeout(timer);
                }
            }
            return {
                attach: attach,
                start: start,
                stop: stop
            };
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });