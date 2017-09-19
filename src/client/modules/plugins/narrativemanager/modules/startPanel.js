define([
    'bluebird',
    'kb_common/html',
    'kb_common/dom',
    './narrativeManager'

], function (
    Promise,
    html,
    dom,
    NarrativeManagerService
) {
    'use strict';

    function factory(config) {
        var mount, container, runtime = config.runtime,
            narrativeManager = NarrativeManagerService({ runtime: runtime });

        function makeNarrativePath(objectInfo) {
            return runtime.getConfig('services.narrative.url') + '/narrative/' + objectInfo.obj_id;
        }

        function startOrCreateEmptyNarrative() {
            return narrativeManager.getMostRecentNarrative()
                .then(function (result) {
                    if (result) {
                        // we have a last_narrative, so go there
                        return {
                            redirect: {
                                url: makeNarrativePath(result.narrativeInfo),
                                new_window: false
                            }
                        };
                    } else {
                        //we need to construct a new narrative- we have a first timer
                        return narrativeManager.createTempNarrative({
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
                    }
                });
        }

        function wrapPanel(content) {
            var div = html.tag('div');
            return div({ class: 'container-fluid' }, [
                div({ class: 'row' }, [
                    div({ class: 'col-md-12' }, [
                        content
                    ])
                ])
            ]);
        }

        // API

        function attach(node) {
            mount = node;
            container = dom.createElement('div');
            mount.appendChild(container);
        }

        function start(params) {
            var a = html.tag('a'),
                p = html.tag('p');
            container.innerHTML = wrapPanel(html.loading('Starting or creating a Narrative for you...'));
            return new Promise(function (resolve, reject) {
                startOrCreateEmptyNarrative(params)
                    .then(function (result) {
                        container.innerHTML = wrapPanel([
                            p('Opening your Narrative.'),
                            p('If the Narrative did not open, use this link:'),
                            p(a({ href: result.redirect.url, target: '_blank' }, [
                                'Open your Narrative: ',
                                result.redirect.url
                            ]))
                        ]);
                        runtime.send('app', 'redirect', {
                            url: result.redirect.url,
                            new_window: false
                        });
                        resolve();
                    })
                    .catch(function (err) {
                        container.innerHTML = 'ERROR creating and opening a new narrative';
                        console.error('ERROR creating and opening a new narrative');
                        console.error(err);
                        reject(err);
                    });
            });
        }

        function detach() {
            if (container) {
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
