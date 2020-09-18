define([
    'preact',
    'htm',
    './reactComponents/DeprecatedBulkUI'
], function (
    preact,
    htm,
    DeprecatedBulkUIComponent
) {

    const {h, render} = preact;
    const html = htm.bind(h);

    class DeprecatedBulkUI {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
        }

        start() {
            const props = {
                runtime: this.runtime
            };
            const content = html`
                <${DeprecatedBulkUIComponent} ...${props}/>
            `;
            render(content, this.container);
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
