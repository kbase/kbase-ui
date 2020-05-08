define([
    'preact',
    'htm',
    './components/About',
    'bootstrap'],
function (
    preact,
    htm,
    About
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class AboutPanel {
        constructor({ runtime }) {
            this.runtime = runtime;

            this.mount = null;
            this.container = null;
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
            this.runtime.send('ui', 'setTitle', 'About');
            // render(h(About, {
            //     runtime: this.runtime
            // }), this.container);
            const params = {
                runtime: this.runtime
            };
            const content = html`<${About} ...${params} />`;
            render(content, this.container);
        }

        stop() {
            return null;
        }
    }
    return AboutPanel;
});
