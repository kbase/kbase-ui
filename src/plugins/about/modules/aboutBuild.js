define(['bluebird', 'kb_lib/html', 'kb_lib/htmlBootstrapBuilders', 'bootstrap'], function (Promise, html, BS) {
    'use strict';
    var t = html.tag,
        h1 = t('h1'),
        h2 = t('h2'),
        p = t('p'),
        div = t('div');

    /*
     * The widget factory function implements the widget interface.
     */
    function widget(config) {
        var mount,
            container,
            runtime = config.runtime;

        function buildBuildInfo() {
            var buildInfo = runtime.config('buildInfo');

            var info = {
                builtAt: new Date(buildInfo.builtAt).toLocaleString(),
                git: {
                    branch: buildInfo.git.branch,
                    url: buildInfo.git.originUrl,
                    commit: {
                        hash: buildInfo.git.commitHash,
                        shortHash: buildInfo.git.commitAbbreviatedHash,
                        message: buildInfo.git.subject,
                        by: buildInfo.git.committerName,
                        date: new Date(buildInfo.git.committerDate).toLocaleString()
                    },
                    author: {
                        author: buildInfo.git.authorName,
                        authorDate: new Date(buildInfo.git.authorDate).toLocaleString()
                    }
                }
            };

            return BS.buildPresentableJson(info);
        }

        function buildLayout() {
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
                                    class: 'col-sm-6',
                                    style: {}
                                },
                                [h1('About the KBase User Interface')]
                            ),
                            div({
                                class: 'col-sm-6',
                                style: {}
                            })
                        ]
                    ),
                    div(
                        {
                            class: 'row'
                        },
                        [
                            div(
                                {
                                    class: 'col-sm-6',
                                    style: {}
                                },
                                [h2('Build'), buildBuildInfo()]
                            ),
                            div(
                                {
                                    class: 'col-sm-6',
                                    style: {}
                                },
                                [h2('Dependencies'), p('dependencies here...')]
                            )
                        ]
                    )
                ]
            );
        }

        function render() {
            container.innerHTML = buildLayout();
        }
        // Widget API
        function attach(node) {
            mount = node;
            container = mount.appendChild(document.createElement('div'));
        }

        function detach() {
            if (mount && container) {
                mount.removeChild(container);
                container = null;
            }
        }

        function start() {
            runtime.send('ui', 'setTitle', 'About then KBase User Interface');
            return render();
        }

        function stop() {
            return null;
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
