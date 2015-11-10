/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_simpleWidget',
    'kb_common_html'
],
    function (simpleWidgetFactory, html) {
        'use strict';
        function myWidget(config) {           
            return simpleWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function () {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
                        this.recv('ui', 'notification', function (data) {
                            this.set('notification', data);
                        });
                    },
                    render: function (w) {
                        // Render a simple title.
                        // NB:this is called whenver the widget thinks it needs 
                        // to re-render the title, which is essentially when the 
                        // state is dirty (has been changed) and a heartbeat
                        // event is captured.
                        var div = html.tag('div');
                        return div({style: {fontWeight: 'bold', fontSize: '150%', margin: '15px 0 0 15px'}}, [
                            this.get('notification')
                        ]);
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