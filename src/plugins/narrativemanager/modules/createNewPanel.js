define([
    'preact',
    'htm',
    './reactComponents/NewNarrative',
    './widget',

    'bootstrap'],
function (
    preact,
    htm,
    NewNarrativeMain,
    Widget
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class StartPanel extends Widget {
        constructor(params) {
            super(params);
        }

        start(params) {
            this.runtime.send('ui', 'setTitle', 'Creating and Opening New Narrative...');
            const props = {
                runtime: this.runtime,
                app: params.app,
                method: params.method,
                copydata: params.copydata,
                appparam: params.appparam,
                markdown: params.markdown
            };
            const content = html`<${NewNarrativeMain} ...${props} />`;
            render(content, this.container);
        }
    }

    return StartPanel;
});
