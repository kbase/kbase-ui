define([
    'bluebird',
    'moment',
    'kb_common/html',
    'kb_common/bootstrapUtils',
    'bootstrap'
], function (
    Promise,
    moment,
    html,
    BS
) {
    'use strict';
    var t = html.tag,
        span = t('span'),
        a = t('a'),
        h2 = t('h2'),
        h3 = t('h3'),
        ul = t('ul'),
        li = t('li'),
        p = t('p'),
        img = t('img'),
        div = t('div');

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

        function buildHub() {
            return span({
                style: {
                    whiteSpace: 'nowrap'
                }
            }, [
                span({
                    style: {
                        fontWeight: 'bold'
                    }
                }, 'KBase hub '),
                img({
                    src: '/images/hub32.png',
                    width: '20px'
                })
            ]);
        }

        function buildWelcome() {
            var narrativeUrl = runtime.config('services.narrative.url');
            var docSiteUrl = runtime.config('resources.docSite.base.url');

            return [
                p(['This is ', buildHub(), ', a collection of tools for KBase Users and Developers. This is where you log in and out of KBase, can access your Narratives and those shared with you, access a catalog of Narrative Apps, and search for data. As a developer you can register and manage your apps as well.']),
                p('The Hub is just one of three primary user interfaces:'),
                ul([
                    li('The Hub, which provides login, account management, dashboard, catalog, data object viewing, and search services'),
                    li([
                        'The ',
                        a({
                            href: narrativeUrl,
                            target: '_blank',
                        }, 'Narrative Interface'),
                        ', a tool for creating, editing, running and publishing active scienctific documents called Narratives '
                    ]),
                    li([
                        'The ',
                        a({
                            href: docSiteUrl,
                            target: '_blank'
                        }, 'Documentation Site'),
                        ', which provides tutorials and developer documenation, communications and publications, links to social media outlets, developer documentation, and background on KBase.'
                    ])
                ]),
                p([
                    'KBase is under active development, adding new features, tools and content all the time. '
                ])
            ];
        }

        function buildVersionInfo() {
            var buildInfo = runtime.config('buildInfo');
            var builtAt = moment(new Date(buildInfo.builtAt));
            var buildDate = builtAt.format('dddd MMMM D, YYYY');
            var buildTime = builtAt.format('h:mm:ss a ');
            var repoUrl = buildInfo.git.originUrl; // 'https://github.com/kbase/kbase-ui';
            var hash = buildInfo.git.commitHash;
            // https://github.com/eapearson/kbase-ui/blob/bf5efa0810d9f097b7c6ba8390f97c008d98d80e/release-notes/RELEASE_NOTES_1.5.0.md
            if (/^ssh:/.test(repoUrl)) {
                var m = /^ssh:\/\/git@(.*?)\/(.*?)$/.exec(repoUrl);
                repoUrl = 'https://' + m[1] + '/' + m[2];
            }

            var docSiteUrl = runtime.config('resources.docSite.base.url');
            var contactUrl = runtime.config('resources.contact.url');
            var helpUrl = runtime.config('resources.help.url');
            var aboutKbase = runtime.config('resources.documentation.aboutKbase.url');

            var commitHash = buildInfo.git.commitHash;

            var githubUrl;
            var relNotesUrl;
            var versionMessage;
            if (buildInfo.git.tag) {
                relNotesUrl = [
                    repoUrl,
                    'blob',
                    hash,
                    'release-notes',
                    'RELEASE_NOTES_' + buildInfo.git.version + '.md'
                ].join('/');
                githubUrl = [
                    repoUrl,
                    'tree',
                    buildInfo.git.tag
                ].join('/');

                versionMessage = p([
                    'You are currently using version ',
                    a({
                        href: relNotesUrl,
                        target: '_blank',
                        style: {
                            fontWeight: 'bold'
                        }
                    }, buildInfo.git.version),
                    ' of ',
                    buildHub(),
                    '.'
                ]);
            } else {
                relNotesUrl = [
                    repoUrl,
                    'blob',
                    hash,
                    'release-notes',
                    'index.md'
                ].join('/');
                githubUrl = [
                    repoUrl,
                    'tree',
                    hash
                ].join('/');
                versionMessage = p([
                    'This build is not currently located at a tagged commit. ',
                    'The current commit is ',
                    a({
                        href: [
                            repoUrl,
                            'commit',
                            hash
                        ].join('/'),
                        target: '_blank'
                    }, commitHash),
                    '.'
                ]);
            }

            return [
                versionMessage,
                p([
                    'It was built on ', buildDate, ' at ', buildTime, '.'
                ]),
                h3([
                    'You may also be interested in:'
                ]),
                ul([
                    li(a({
                        href: relNotesUrl,
                        target: '_blank'
                    }, 'Release Notes')),
                    li(a({
                        href: githubUrl,
                        target: '_blank'
                    }, 'Github Repo')),
                    li(a({
                        href: helpUrl,
                        target: '_blank'
                    }, 'Public Help Board')),
                    li(a({
                        href: contactUrl,
                        target: '_blank'
                    }, 'Contact KBase')),
                    li(a({
                        href: aboutKbase,
                        target: '_blank'
                    }, 'About KBase')),
                ])
            ];
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
                        h2('The KBase Hub'),
                        buildWelcome()
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {}
                    }, [
                        h2('This Version'),
                        buildVersionInfo()
                    ])
                ])
            ]);
        }

        function buildLayoutNoHub() {
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
                        h2('This Version'),
                        buildVersionInfo()
                    ]),
                    div({
                        class: 'col-sm-6',
                        style: {}
                    }, [

                    ])
                ])
            ]);
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
            runtime.send('ui', 'setTitle', 'About');
            render();
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
