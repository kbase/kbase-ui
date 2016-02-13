/*global define */
/*jslint white: true, browser: true */
define([    
    'kb/widget/bases/simpleWidget',
    'kb/common/html'
],
    function (simpleWidgetFactory, html) {
        'use strict';
        function myWidget(config) {
            function render(title) {
                var div = html.tag('div');
                return div({class: 'kb-widget-title'}, [
                    title
                ]);
            }
            return simpleWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function () {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
                        this.recv('ui', 'setTitle', function (data) {
                            this.set('title', data);
                        }.bind(this));
                    },
                    render: function () {
                        // Render a simple title.
                        // NB:this is called whenver the widget thinks it needs 
                        // to re-render the title, which is essentially when the 
                        // state is dirty (has been changed) and a heartbeat
                        // event is captured.
                        return render(this.get('title'));
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