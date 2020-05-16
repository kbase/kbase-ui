define([
    'preact',
    'htm',
    './reactComponents/DeprecatedBulkUI'
], function (
    preact,
    htm,
    DeprecatedBulkUIComponent
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);


    class DeprecatedBulkUI {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
        }

        render() {
            const content = html`
                <${DeprecatedBulkUIComponent} />
            `;
            render(content, this.container);
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.render();
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'Bulk Import - DEPRECATED');
        }

        stop() {
            return null;
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return DeprecatedBulkUI;
});
