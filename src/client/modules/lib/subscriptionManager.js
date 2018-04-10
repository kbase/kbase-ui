define([
], function (
) {
    'use strict';

    function factory() {
        var subscriptions = [];

        function add(subscription) {
            subscriptions.push(subscription);
        }
        function dispose() {
            subscriptions.forEach(function (sub, index) {
                try {
                    sub.dispose();
                } catch (ex) {
                    console.error('Error disposing of subscription: ' + index);
                }
            });
        }

        return Object.freeze({
            add: add,
            dispose: dispose
        });
    }

    return {
        make: factory
    };
});