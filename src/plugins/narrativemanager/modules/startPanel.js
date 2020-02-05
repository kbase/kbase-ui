define([
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    './widget',
    './narrativeManager'],
function (
    html,
    build,
    Widget,
    NarrativeManagerService)
{
    'use strict';

    const t = html.tag,
        a = t('a'),
        p = t('p');

    class StartPanel extends Widget {
        constructor(params) {
            super(params);
            this.narrativeManager = new NarrativeManagerService({ runtime: this.runtime });
        }

        makeNarrativePath(objectInfo) {
            return this.runtime.getConfig('services.narrative.url') + '/narrative/' + objectInfo.obj_id;
        }

        startOrCreateEmptyNarrative() {
            return this.narrativeManager.getMostRecentNarrative()
                .then((result) => {
                    if (result) {
                    // we have a last_narrative, so go there
                        return {
                            redirect: {
                                url: this.makeNarrativePath(result.narrativeInfo),
                                new_window: false
                            }
                        };
                    }
                    //we need to construct a new narrative- we have a first timer
                    return this.narrativeManager
                        .createTempNarrative({
                            cells: [],
                            parameters: [],
                            importData: []
                        })
                        .then((result) => {
                            return {
                                redirect: {
                                    url: this.makeNarrativePath(result.narrativeInfo),
                                    new_window: false
                                }
                            };
                        });
                });
        }

        // API

        start(params) {
            this.container.innerHTML = this.wrapPanel(build.loading('Starting or creating a Narrative for you...'));
            return this.startOrCreateEmptyNarrative(params)
                .then((result) => {
                    this.container.innerHTML = this.wrapPanel([
                        p('Opening your Narrative.'),
                        p('If the Narrative did not open, use this link:'),
                        p(
                            a({ href: result.redirect.url, target: '_blank' }, [
                                'Open your Narrative: ',
                                result.redirect.url
                            ])
                        )
                    ]);
                    this.runtime.send('app', 'redirect', {
                        url: result.redirect.url,
                        new_window: false
                    });
                })
                .catch((err) => {
                    this.container.innerHTML = 'ERROR creating and opening a new narrative';
                    console.error('ERROR creating and opening a new narrative');
                    console.error(err);
                    throw err;
                });
        }
    }

    return StartPanel;
});
