define([], function () {
    'use strict';

    function factory(config, params) {
        // Heartbeat
        var heartbeat = 0,
            heartbeatTimer,
            runtime = params.runtime,
            interval = config.interval || 100;

        function start() {
            heartbeat = 0;
            heartbeatTimer = window.setInterval(function () {
                heartbeat += 1;
                runtime.send('app', 'heartbeat', { heartbeat: heartbeat });
            }, interval);
        }

        function stop() {
            if (heartbeatTimer) {
                window.clearInterval(heartbeatTimer);
            }
        }
        return {
            start: start,
            stop: stop
        };
    }

    return {
        make: factory
    };
});