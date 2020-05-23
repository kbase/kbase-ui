define([
    'kb_lib/html'],
function (
    html
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    class Widget {
        constructor({ runtime, node }) {
            if (!runtime) {
                throw new Error('A widget requires the "runtime" argument');
            }
            this.runtime = runtime;

            // TODO: make this required...
            // if (!node) {
            //     throw new Error('A widget requires the "node" argument');
            // }
            this.mount = null;
            this.container = null;
            if (node) {
                this.createContainer(node);
            }
        }

        createContainer(node) {
            if (this.container) {
                throw new Error('Container already created already set for this widget');
            }
            this.mount = node;
            this.container = document.createElement('div');
            this.container.setAttribute('data-widget-type', 'plain');
            this.mount.appendChild(this.container);
        }

        wrapPanel(content) {
            return div({ class: 'container-fluid' }, [div({ class: 'row' }, [div({ class: 'col-md-12' }, [content])])]);
        }

        // API

        attach(node) {
            this.createContainer(node);
        }

        setHTML(html) {
            this.container.innerHTML = html;
        }

        detach() {
            if (this.container) {
                this.container.innerHTML = '';
                if (this.mount) {
                    this.mount.removeChild(this.container);
                }
                this.container = null;
            }
        }
    }

    return Widget;
});
