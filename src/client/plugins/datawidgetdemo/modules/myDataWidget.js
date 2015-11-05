/*global define*/
/*jslint white: true*/
define([
    'kb_widgetBases_dataWidget'
], function (DataWidget) {
    function factory(config) {
        return DataWidget.make({
            runtime: config.runtime,
            on: {
                fetch: function () {
                    this.setTitle('Fetching data...');
                    return {
                        name: 'person',
                        value: {
                            firstName: 'Erik',
                            lastName: 'Pearson'
                        }
                    };
                },
                render: function () {
                    this.setTitle('Hi ' + this.getState('person').firstName);
                    return '<p>Hi, I am ' + this.getState('person').firstName;
                }
            }
        });
    };
    return {
        make: function (config) {
            return factory(config);
        }
    };
});