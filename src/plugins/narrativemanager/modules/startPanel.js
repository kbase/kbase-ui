define(['kb_lib/html', 'kb_lib/htmlBuilders', './narrativeManager'], function (html, build, NarrativeManagerService) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        a = t('a'),
        p = t('p');

    function factory(config) {
        let mount;
        let container;
        const runtime = config.runtime;
        const narrativeManager = NarrativeManagerService({ runtime: runtime });

        function makeNarrativePath(objectInfo) {
            return runtime.getConfig('services.narrative.url') + '/narrative/' + objectInfo.obj_id;
        }

        function startOrCreateEmptyNarrative() {
            return narrativeManager.getMostRecentNarrative().then(function (result) {
                if (result) {
                    // we have a last_narrative, so go there
                    return {
                        redirect: {
                            url: makeNarrativePath(result.narrativeInfo),
                            new_window: false
                        }
                    };
                }
                //we need to construct a new narrative- we have a first timer
                return narrativeManager
                    .createTempNarrative({
                        cells: [],
                        parameters: [],
                        importData: []
                    })
                    .then(function (result) {
                        return {
                            redirect: {
                                url: makeNarrativePath(result.narrativeInfo),
                                new_window: false
                            }
                        };
                    });
            });
        }

        function wrapPanel(content) {
            return div({ class: 'container-fluid' }, [div({ class: 'row' }, [div({ class: 'col-md-12' }, [content])])]);
        }

        // API

        function attach(node) {
            mount = node;
            container = mount.appendChild(document.createElement('div'));
        }

        function start(params) {
            container.innerHTML = wrapPanel(build.loading('Starting or creating a Narrative for you...'));
            return startOrCreateEmptyNarrative(params)
                .then(function (result) {
                    container.innerHTML = wrapPanel([
                        p('Opening your Narrative.'),
                        p('If the Narrative did not open, use this link:'),
                        p(
                            a({ href: result.redirect.url, target: '_blank' }, [
                                'Open your Narrative: ',
                                result.redirect.url
                            ])
                        )
                    ]);
                    runtime.send('app', 'redirect', {
                        url: result.redirect.url,
                        new_window: false
                    });
                })
                .catch(function (err) {
                    container.innerHTML = 'ERROR creating and opening a new narrative';
                    console.error('ERROR creating and opening a new narrative');
                    console.error(err);
                    throw err;
                });
        }

        function detach() {
            if (mount && container) {
                mount.removeChild(container);
            }
            container.innerHTML = '';
            container = null;
        }

        return {
            attach: attach,
            start: start,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
