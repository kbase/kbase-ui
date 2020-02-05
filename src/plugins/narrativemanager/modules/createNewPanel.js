define([
    'bluebird',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    './widget',
    './narrativeManager'],
function (
    Bluebird,
    html,
    build,
    Widget,
    NarrativeManagerService
) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        a = t('a'),
        p = t('p');

    class CreateNewPanel extends Widget {
        constructor(params) {
            super(params);
            this.narrativeManager = new NarrativeManagerService({ runtime: this.runtime });
        }

        makeNarrativePath(wsId) {
            return this.runtime.getConfig('services.narrative.url') + '/narrative/' + wsId;
        }

        createNewNarrative(params) {
            return Bluebird.try(() => {
                params = params || {};
                if (params.app && params.method) {
                    throw 'Must provide no more than one of the app or method params';
                }
                let appData, tmp, i;
                const newNarrativeParams = {};
                if (params.copydata) {
                    newNarrativeParams.importData = params.copydata.split(';');
                }

                // Note that these are exclusive cell creation options.
                if (params.app || params.method) {
                    newNarrativeParams.method = params.app || params.method;
                    if (params.appparam) {
                        /* TODO: convert to forEach */
                        tmp = params.appparam.split(';');
                        appData = [];
                        for (i = 0; i < tmp.length; i += 1) {
                            appData[i] = tmp[i].split(',');
                            if (appData[i].length !== 3) {
                                throw new Error(
                                    'Illegal app parameter set, expected 3 parameters separated by commas: ' + tmp[i]
                                );
                            }
                            /* TODO: use standard lib for math and string->number conversions) */
                            appData[i][0] = parseInt(appData[i][0], 10);
                            if (isNaN(appData[i][0]) || appData[i][0] < 1) {
                                throw new Error(
                                    'Illegal app parameter set, first item in set must be an integer > 0: ' + tmp[i]
                                );
                            }
                        }
                        newNarrativeParams.appData = appData;
                    }
                    // } else if (params.method) {
                    //     cells = [{ method: params.method }];
                } else if (params.markdown) {
                    newNarrativeParams.markdown = params.markdown;
                }

                return this.narrativeManager.createTempNarrative(newNarrativeParams)
                    .then((info) => {
                        const wsId = info.narrativeInfo.wsid,
                            objId = info.narrativeInfo.id,
                            path = this.makeNarrativePath(wsId, objId);
                        return {
                            redirect: {
                                url: path,
                                newWindow: false
                            }
                        };
                    });
            });
        }

        // API

        start(params) {
            this.setHTML(this.wrapPanel(build.loading('Creating a new Narrative for you...')));

            return this.createNewNarrative(params)
                .then((result) => {
                    this.setHTML(this.wrapPanel([
                        p('Opening your new Narrative.'),
                        p('If the Narrative did not open, use this link'),
                        p(
                            a({ href: result.redirect.url, target: '_blank' }, [
                                'Open your new Narrative: ',
                                result.redirect.url
                            ])
                        )
                    ]));
                    this.runtime.send('app', 'redirect', {
                        url: result.redirect.url,
                        new_window: false
                    });
                })
                .catch((err) => {
                    this.setHTML(div(
                        {
                            class: 'alert alert-danger'
                        },
                        [
                            div('ERROR creating and opening a new narrative'),
                            div(
                                {
                                    style: {
                                        fontFamily: 'monospace'
                                    }
                                },
                                err.message
                            )
                        ]
                    ));
                    console.error('ERROR creating and opening a new narrative', err);
                });
        }

        stop() {
            // nothing to do?
        }
    }

    return CreateNewPanel;
});
