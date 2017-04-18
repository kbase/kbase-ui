/*global define */
/*jslint white: true, browser: true */
define([
        'kb_widget/bases/simpleWidget',
        'kb_common/html'
    ],
    function(simpleWidgetFactory, html) {
        'use strict';
        var div = html.tag('div');

        function myWidget(config) {
            return simpleWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    start: function() {
                        this.recv('ui', 'notification', function(data) {
                            this.set('notification', data);
                        });
                    },
                    render: function(w) {
                        return div({
                            style: {
                                fontWeight: 'bold',
                                fontSize: '150%',
                                margin: '15px 0 0 15px'
                            }
                        }, [
                            this.get('notification')
                        ]);
                    }
                }
            });
        }
        return {
            make: function(config) {
                return myWidget(config);
            }
        };
    });