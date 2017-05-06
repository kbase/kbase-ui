/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'promise',
    'kb_common/html',
    'bootstrap'
], function (Promise, html) {
    'use strict';
    var t = html.tag,
        h1 = t('h1'),
        h2 = t('h2'),
        p = t('p'),
        div = t('div'),
        a = t('a');

    /*
     * The widget factory function implements the widget interface.
     */
    function widget(config) {
        var mount, container,
            runtime = config.runtime;

        function buildLayout() {
            return div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6',
                        style: {
                            backgroundColor: 'silver'
                        }
                    }, [
                        h1('KBase User Interface')
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {
                            backgroundColor: 'silver'
                        }
                    })
                ]),
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6',
                        style: {
                            backgroundColor: 'silver'
                        }
                    }, [
                        h2('About'),
                        p('What it is')
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {
                            backgroundColor: 'silver'
                        }
                    }, [
                        h2('Build'),
                        p('build info here')
                    ])
                ]),
                div({
                    class: 'row'
                }, [

                    div({
                        class: 'col-sm-12',
                        style: {
                            backgroundColor: 'silver'
                        }
                    }, [
                        h2('Dependencies'),
                        p('dependencies here...')
                    ])
                ])
            ]);
        }

        function render() {
            container.innerHTML = buildLayout();
        }
        // Widget API
        function attach(node) {
            return Promise.try(function () {
                mount = node;
                container = mount.appendChild(document.createElement('div'));
            });
        }

        function detach() {
            return Promise.try(function () {
                mount.removeChild(container);
                container = null;
            });
        }

        function start() {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'About then KBase User Interface');
                render();
                // runtime.send('ui', 'render', {
                //     node: container,
                //     content: html.flatten(render())
                // });
            });
        }

        function stop() {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'Leaving about...');
            });
        }

        return {
            attach: attach,
            detach: detach,
            start: start,
            stop: stop
        };
    }

    return {
        make: function (config) {
            return widget(config);
        }
    };

});