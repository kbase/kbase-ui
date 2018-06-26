define([
    'kb_common/html'
], function (
    html
) {
    'use strict';

    var t = html.tag,
        h1 = t('h1');

    function safeContent(content) {
        var anonDiv = document.createElement('div');
        anonDiv.innerHTML = content;
        return anonDiv.textContent || '';
    }

    class TitleWidget {
        constructor(params) {
            this.runtime = params.runtime;

            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('widget-title');
            this.container.setAttribute('data-k-b-testhook-widget', 'title');
        }

        start() {
            // Listen for a setTitle message sent to the ui.
            // We use the widget convenience function in order to
            // get automatic event listener cleanup. We could almost
            // as easily do this ourselves.
            this.runtime.recv('ui', 'setTitle', (newTitle) => {
                if (typeof newTitle !== 'string') {
                    return;
                }

                this.container.innerHTML = h1({
                    dataKBTesthookLabel: 'title'
                }, newTitle);
                window.document.title = safeContent(newTitle) + ' | KBase';
            });
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return {Widget: TitleWidget};
});
