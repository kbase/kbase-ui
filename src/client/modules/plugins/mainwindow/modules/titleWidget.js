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

    function myWidget(config) {
        return simpleWidgetFactory.make({
            runtime: config.runtime,
            on: {
                start: function () {
                    // Listen for a setTitle message sent to the ui.
                    // We use the widget convenience function in order to 
                    // get automatic event listener cleanup. We could almost
                    // as easily do this ourselves.
                    this.recv('ui', 'setTitle', function (data) {
                        if (typeof data !== 'string') {
                            return;
                        }
                        this.set('title', data);
                        // TODO: this should be in kb common
                        var anonDiv = document.createElement('div'),
                            text;
                        anonDiv.innerHTML = data;
                        text = anonDiv.textContent || '';
                        window.document.title = text + ' | KBase';
                    }.bind(this));
                },
                render: function () {
                    // Render a simple title.
                    // NB:this is called whenver the widget thinks it needs 
                    // to re-render the title, which is essentially when the 
                    // state is dirty (has been changed) and a heartbeat
                    // event is captured.
                    return h1(this.get('title'));
                }
            }
        });
    }
    return {
        make: function (config) {
            return myWidget(config);
        }
    };
});
