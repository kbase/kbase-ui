define([
    'preact',
    'htm',
    './reactComponents/RecentNarrative',
    './widget',

    'bootstrap'],
function (
    preact,
    htm,
    OpenNarrativeMain,
    Widget
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class StartPanel extends Widget {
        constructor(params) {
            super(params);
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'Loading Narrative');
            const props = {
                runtime: this.runtime,
            };
            const content = html`<${OpenNarrativeMain} ...${props} />`;
            render(content, this.container);
        }
    }

    return StartPanel;
});
