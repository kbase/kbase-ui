define([
    'preact',
    'htm',
    './reactComponents/Developer',
    './reactComponents/ConfigEditor',
    'bootstrap'],
function (
    preact,
    htm,
    Developer,
    ConfigEditor
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class DeveloperPanel {
        constructor({ runtime }) {
            this.runtime = runtime;

            // this.mount = null;
            this.container = null;
        }

        // Widget API
        attach(node) {
            this.container = node;
            // this.mount = node;
            // this.container = this.mount.appendChild(document.createElement('div'));
        }

        renderMain() {
            const props = {
                runtime: this.runtime
            };
            return html`<${Developer} ...${props} />`;
        }

        renderNotFound() {
            return html`<div>
                <p>Not Found</p>
                <p>Try <a href="/#developer/main" target="_parent">home</a></p>
            </div>`;
        }

        // renderRoute(view, params) {
        //     if (typeof view === 'undefined') {
        //         view = 'main';
        //     }

        //     switch (view) {
        //     case 'main':
        //         return this.renderMain();
        //     case 'config':
        //         return this.renderConfigEditor(params);
        //     default:
        //         return this.renderNotFound();
        //     }
        // }

        start(params) {
            render(this.renderMain(), this.container);
            // let content;
            // if (params.path) {
            //     const [view, ...rest] = params.path;
            //     content = this.renderRoute(view, rest);
            // } else {
            //     content = this.renderNotFound();
            // }
            // render(content, this.container);
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
    return DeveloperPanel;
});
