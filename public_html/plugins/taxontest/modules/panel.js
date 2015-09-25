/*global define */
/*jslint white: true, browser: true */
define([    
    'kb_widgetBases_standardWidget',
    'kb_common_html'
],
    function (standardWidgetFactory, html) {
        'use strict';
        function myWidget(config) {           
            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function (w) {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
                        w.setState('update', new Date());
                    },
                    render: function (w) {
                        // Render a simple title.
                        // NB:this is called whenver the widget thinks it needs 
                        // to re-render the title, which is essentially when the 
                        // state is dirty (has been changed) and a heartbeat
                        // event is captured.
                        var div = html.tag('div');
                        return div('taxon testing widget here... can invoke sub widgets.');
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