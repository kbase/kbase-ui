define([
    'kb_lib/html'],
function (
    html
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    class Widget {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.mount = null;
            this.container = null;
        }

        wrapPanel(content) {
            return div({ class: 'container-fluid' }, [div({ class: 'row' }, [div({ class: 'col-md-12' }, [content])])]);
        }

        // API

        attach(node) {
            this.mount = node;
            this.container = document.createElement('div');
            this.mount.appendChild(this.container);
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
