define([], function () {
    'use strict';

    function factory(config) {
        var intervalAlarms = {};
        var listeners = {};
        var currentId = 0;

        function getIntervalAlarm(interval) {
            var alarm = intervalAlarms[interval];
            if (!alarm) {
                alarm = {
                    interval: interval,
                    timer: null,
                    listeners: {}
                };
                intervalAlarms[interval] = alarm;
            }
            return alarm;
        }

        function listen(fun, interval) {
            currentId += 1;
            interval = interval || 1;
            var alarm = getIntervalAlarm(interval);
            alarm.listeners[currentId] = {
                fun: fun,
                id: currentId,
                callCount: 0,
                lastCalledAt: null,
                error: null
            };
            listeners[currentId] = {
                interval: interval,
                id: currentId
            };

            if (!alarm.timer) {
                alarm.timer = window.setInterval(function () {
                    Object.keys(alarm.listeners).forEach(function(id) {                        
                        var listener = alarm.listeners[id];
                        try {
                            listener.callCount += 1;
                            listener.lastCalledA = new Date();
                            listener.fun();
                            listener.error = null;
                        } catch (ex) {
                            console.error('ERROR calling listener ' + listener.id + ' in alarm ' + interval, ex);
                            listener.error = ex;
                        }
                    });
                }, alarm.interval * 1000);
            }
            return currentId;
        }

        function forget(id) {
            var listener = listeners[id];
            if (!listener) {
                return;
            }
            delete listeners[id];
            var alarm = intervalAlarms[listener.interval];
            delete alarm.listeners[id];
            if (Object.keys(alarm.listeners).length === 0) {
                window.clearInterval(alarm.timer);
                alarm.timer = null;
            }
        }

        return Object.freeze({
            listen: listen,
            forget: forget
        });
    }

    var globalClock = factory();

    return {
        make: factory,
        globalClock: globalClock
    };
});