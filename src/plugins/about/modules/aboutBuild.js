define([
    'preact',
    'htm',
    './reactComponents/AboutBuild',

    'bootstrap'],
function (
    preact,
    htm,
    AboutBuildComponent
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class AboutBuild {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.mount = null;
            this.container = null;
        }

        render() {
            const buildInfo = this.runtime.config('buildInfo');

            const params = {
                buildInfo
            };
            const content = html`<${AboutBuildComponent} ...${params} />`;
            render(content, this.container);
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
            this.runtime.send('ui', 'setTitle', 'About the kbase-ui build');
            return this.render();
        }

        stop() {
            return null;
        }
    }
    return AboutBuild;
});
