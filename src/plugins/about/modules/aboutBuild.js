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
    class AboutBuild {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.mount = null;
            this.container = null;
        }

        buildBuildInfo() {
            var buildInfo = this.runtime.config('buildInfo');

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

        buildLayout() {
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
                                [h2('Build'), this.buildBuildInfo()]
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

        render() {
            this.container.innerHTML = this.buildLayout();
        }
        // Widget API
        attach(node) {
            this.mount = node;
            this.container = this.mount.appendChild(document.createElement('div'));
        }

        detach() {
            if (this.mount && this.container) {
                this.mount.removeChild(this.container);
                this.container = null;
            }
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'About then KBase User Interface');
            return this.render();
        }

        stop() {
            return null;
        }
    }
    return AboutBuild;
});
