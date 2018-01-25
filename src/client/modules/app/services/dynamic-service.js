define([
    'kb_common/hotCache',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient'
], function (
    HotCache,
    GenericClient,
    DynamicServiceClient
) {
    'use strict';

    function factory(config) {
        var cache = HotCache.make({
            hardTtl: 3600000, // 1 min
            hotTtl:  18000000, // 5 min
        });

        function start() {
            return cache.start();
        }

        function stop() {
            return cache.stop();
        }

        function addItem(item) {
            return cache.add(item);
        }

        function getItem(key) {
            return cache.get(key);
        }

        // no plugin config.

        return Object.freeze({
            start: start,
            stop: stop,
            additem: addItem,
            getItem: getItem
        });
    }

    return {
        make: factory
    };
});
