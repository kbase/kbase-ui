define([
    'preact',
    'htm',
    './reactComponents/About',
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

        start() {
            this.runtime.send('ui', 'setTitle', 'About');
            const params = {
                runtime: this.runtime
            };
            const content = html`<${About} ...${params} />`;
            render(content, this.container);
        }

        stop() {
            return null;
        }

        detach() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
                this.container = null;
            }
        }
    }
    return AboutPanel;
});
