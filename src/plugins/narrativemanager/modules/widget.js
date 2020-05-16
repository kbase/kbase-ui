define([], function () {
    'use strict';

    class Widget {
        constructor({ runtime, node }) {
            this.runtime = runtime;
            this.container = null;
            if (node) {
                this.attach(node);
            }
        }

        // API

        attach(node) {
            this.container = document.createElement('div');
            node.appendChild(this.container);
        }

        setHTML(html) {
            this.container.innerHTML = html;
        }

        detach() {
            if (this.container) {
                this.container.innerHTML = '';
                if (this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
                this.container = null;
            }
        }
    }

    return Widget;
});
