/*global define */
/*jslint white: true, browser: true */
define([    
    'kb_widgetBases_standardWidget',
    'kb_common_html'
],
    function (standardWidgetFactory, html) {
        'use strict';
        function myWidget(config) {
            function render(title) {
                var div = html.tag('div');
                return div({style: {fontWeight: 'bold', fontSize: '150%', margin: '15px 0 0 15px'}}, [
                    title
                ]);
            }
            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function (w) {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
//                        w.recv('title', 'set', function (data) {
//                            w.setHtml(render(data));
//                        });
                        w.recv('ui', 'setTitle', function (data) {
                            w.set('title', data);
                        });
                    },
                    render: function (w) {
                        // Render a simple title.
                        // NB:this is called whenver the widget thinks it needs 
                        // to re-render the title, which is essentially when the 
                        // state is dirty (has been changed) and a heartbeat
                        // event is captured.
                        return render(w.get('title'));
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