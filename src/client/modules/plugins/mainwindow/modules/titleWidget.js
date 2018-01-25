define([
    'kb_widget/bases/simpleWidget',
    'kb_common/html'
], function (
    simpleWidgetFactory,
    html
) {
    'use strict';

    var t = html.tag,
        h1 = t('h1');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-title');
        }

        function safeContent(content) {
            var anonDiv = document.createElement('div');
            anonDiv.innerHTML = content;
            return anonDiv.textContent || '';
        }

        function start() {
            // Listen for a setTitle message sent to the ui.
            // We use the widget convenience function in order to 
            // get automatic event listener cleanup. We could almost
            // as easily do this ourselves.
            runtime.recv('ui', 'setTitle', function (newTitle) {
                if (typeof newTitle !== 'string') {
                    return;
                }

                container.innerHTML = h1(newTitle);
                window.document.title = safeContent(newTitle) + ' | KBase';
            });
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            detach: detach
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});
