/*global define*/
/*jslint white:true*/
define([
    'bluebird',
    'kb_common/html',
    'kb_common/dom',
    './narrativeManager'

], function (Promise, html, dom, NarrativeManagerService) {
    'use strict';

    function factory(config) {
        var mount, container, runtime = config.runtime,
            narrativeManager = NarrativeManagerService({runtime: runtime});

        function makeNarrativePath(objectInfo) {
            return runtime.getConfig('services.narrative.url') + '/narrative/' + objectInfo.obj_id;
        }
        function createNewNarrative(params) {
            return Promise.try(function () {
                params = params || {};
                if (params.app && params.method) {
                    throw "Must provide no more than one of the app or method params";
                }
                var importData, appData, tmp, i, cells;
                if (params.copydata) {
                    importData = params.copydata.split(';');
                }
                if (params.appparam) {
                    /* TODO: convert to forEach */
                    tmp = params.appparam.split(';');
                    appData = [];
                    for (i = 0; i < tmp.length; i += 1) {
                        appData[i] = tmp[i].split(',');
                        if (appData[i].length !== 3) {
                            throw "Illegal app parameter set, expected 3 parameters separated by commas: " + tmp[i];
                        }
                        /* TODO: use standard lib for math and string->number conversions) */
                        appData[i][0] = parseInt(appData[i][0], 10);
                        if (isNaN(appData[i][0]) || appData[i][0] < 1) {
                            throw "Illegal app parameter set, first item in set must be an integer > 0: " + tmp[i];
                        }
                    }
                }
                if (params.app) {
                    cells = [{app: params.app}];
                } else if (params.method) {
                    cells = [{method: params.method}];
                }
                return narrativeManager.createTempNarrative({
                    cells: cells,
                    parameters: appData,
                    importData: importData
                })
                    .then(function (data) {
                        return {
                            redirect: {
                                url: makeNarrativePath(data.narrativeInfo),
                                newWindow: false
                            }
                        };
                    });
            });
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
            return div({class: 'container-fluid'}, [
                div({class: 'row'}, [
                    div({class: 'col-md-12'}, [
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
            var div = html.tag('div'),
                a = html.tag('a'),
                p = html.tag('p');
            container.innerHTML = wrapPanel(html.loading('Starting or creating a Narrative for you...'));
            return new Promise(function (resolve, reject) {
                startOrCreateEmptyNarrative(params)
                    .then(function (result) {
                        container.innerHTML = wrapPanel([
                            p('Opening your Narrative.'),
                            p('If the Narrative did not open, use this link:'),
                            p(a({href: result.redirect.url, target: '_blank'}, [
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