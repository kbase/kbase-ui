/* global Promise */
define([
    'kb_common/html',
    'kb_common/bootstrapUtils',
    'bootstrap'
], function (
    html,
    BS
) {
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

        function buildBuildInfo() {
            var buildInfo = runtime.config('buildInfo');

            var info = {
                builtAt: new Date(buildInfo.builtAt).toLocaleString(),
                git: {
                    root: buildInfo.git.root,
                    commit: {
                        hash: buildInfo.git.abbreviatedSha,
                        message: buildInfo.git.commitMessage,
                        date: new Date(buildInfo.git.committerDate).toLocaleString()
                    }
                }
            };

            return BS.buildPresentableJson(info);
        }

        function buildLayout() {
            return div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6',
                        style: {}
                    }, [
                        h1('About the KBase User Interface')
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {}
                    })
                ]),
                div({
                    class: 'row'
                }, [

                    div({
                        class: 'col-sm-6',
                        style: {}
                    }, [
                        h2('Build'),
                        buildBuildInfo()
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {}
                    }, [
                        h2('Dependencies'),
                        p('dependencies here...')
                    ])
                ])
            ]);
        }

        function render() {
            container.innerHTML = buildLayout();
            console.log('build info?', runtime.config('buildInfo'));
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