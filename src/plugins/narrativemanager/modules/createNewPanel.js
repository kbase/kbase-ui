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

    var t = html.tag,
        div = t('div'),
        a = t('a'),
        p = t('p');

    function factory(config) {
        var mount, container, runtime = config.runtime,
            narrativeManager = NarrativeManagerService({ runtime: runtime });

        function makeNarrativePath(wsId, objId) {
            return runtime.getConfig('services.narrative.url') + '/narrative/ws.' + wsId + '.obj.' + objId;
        }

        function createNewNarrative(params) {
            return Promise.try(function () {
                params = params || {};
                if (params.app && params.method) {
                    throw 'Must provide no more than one of the app or method params';
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
                            throw new Error('Illegal app parameter set, expected 3 parameters separated by commas: ' + tmp[i]);
                        }
                        /* TODO: use standard lib for math and string->number conversions) */
                        appData[i][0] = parseInt(appData[i][0], 10);
                        if (isNaN(appData[i][0]) || appData[i][0] < 1) {
                            throw new Error('Illegal app parameter set, first item in set must be an integer > 0: ' + tmp[i]);
                        }
                    }
                }

                // Note that these are exclusive cell creation options.
                if (params.app) {
                    cells = [{ app: params.app }];
                } else if (params.method) {
                    cells = [{ method: params.method }];
                } else if (params.markdown) {
                    cells = [{ markdown: params.markdown }];
                }

                return narrativeManager.createTempNarrative({
                    cells: cells,
                    parameters: appData,
                    importData: importData
                })
                    .then(function (info) {
                        var wsId = info.narrativeInfo.wsid,
                            objId = info.narrativeInfo.id,
                            path = makeNarrativePath(wsId, objId);
                        return {
                            redirect: {
                                url: path,
                                newWindow: false
                            }
                        };
                    });
            });
        }

        function wrapPanel(content) {
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
            container.innerHTML = wrapPanel(html.loading('Creating a new Narrative for you...'));
            return new Promise(function (resolve, reject) {
                createNewNarrative(params)
                    .then(function (result) {
                        container.innerHTML = wrapPanel([
                            p('Opening your new Narrative.'),
                            p('If the Narrative did not open, use this link'),
                            p(a({ href: result.redirect.url, target: '_blank' }, [
                                'Open your new Narrative: ',
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
                        console.error('ERROR creating and opening a new narrative', err);
                        reject(err);
                    });
            });
        }

        function stop() {
            // nothing to do?
        }

        function detach() {
            mount.removeChild(container);
            container.innerHTML = '';
            container = null;
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };

});
