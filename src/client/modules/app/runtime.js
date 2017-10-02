define([
    'kb_common_ts/Cookie'
], function (
    Cookie
) {
    'use strict';

    function factory(config) {
        var configProps = config.config;
        var messenger = config.messenger;
        var serviceManager = config.serviceManager;

        // Access to ui config. 
        // This is simply a wrapping around the venerable Props module.
        function getConfig(prop, defaultValue) {
            return configProps.getItem(prop, defaultValue);
        }

        function hasConfig(prop) {
            return configProps.hasItem(prop);
        }

        function rawConfig() {
            return configProps.debug();
        }

        // allow tag
        // Returns true if the provided string 'tag' is found in 
        // the array of allowed tags, as defined in the config 
        // property 'ui.allow'.
        function allow(tag) {
            var allowed = configProps.getItem('ui.allow', []);
            if (!(allowed instanceof Array)) {
                allowed = [allowed];
            }
            return (allowed.indexOf(tag) >= 0);
        }

        // feature set path
        function feature(featureSet, path) {
            var featureFlag = new Cookie.CookieManager().getItem('ui.features.auth.selected');
            if (!featureFlag) {
                featureFlag = configProps.getItem('ui.features.' + featureSet + '.selected');
                // featureFlag = api.config('ui.features.' + featureSet + '.selected');
            }
            var featurePath = 'ui.features.' + featureSet + '.available.' + featureFlag + '.' + path;
            var result = configProps.getItem(featurePath, null);
            if (result === null) {
                throw new Error('Feature is not defined: ' + featurePath);
            }
            return result;
        }

        // The receive and send functions are the primary message methods

        // Receive a message on a channel, and have function fun handle
        // the message.
        function receive(channel, message, fun) {
            return rcv({
                channel: channel,
                message: message,
                handler: fun
            });
        }

        // The friendlier more verbose functions take explicit arguments and
        // packge them up into the messenger api format.
        function send(channel, message, data) {
            return messenger.send({
                channel: channel,
                message: message,
                data: data
            });
        }

        // The "short" versions of the message functions just use the raw
        // messenger api, which expects an object argument.
        function rcv(spec) {
            return messenger.receive(spec);
        }

        function urcv(spec) {
            return messenger.unreceive(spec);
        }

        function snd(spec) {
            return messenger.send(spec);
        }

        function drop(spec) {
            urcv(spec);
        }

        function sendp(channel, message, data) {
            return messenger.sendPromise({
                channel: channel,
                message: message,
                data: data
            });
        }

        // navigate path
        // A simple wrapper around the navigate event.
        function navigate(path) {
            send('app', 'navigate', path);
        }

        // proxyMethod object method args
        // Captures a common pattern of needing to pass through a method call, but
        // not wanting to explicitly wrap the method.
        function proxyMethod(obj, method, args) {
            if (!obj[method]) {
                // TODO: create real exception for this.
                // Maybe proxyMethod needs to be its own module defining the exception.
                throw {
                    name: 'UndefinedMethod',
                    message: 'The requested method "' + method + '" does not exist on this object',
                    suggestion: 'This is a developer problem, not your fault'
                };
            }
            return obj[method].apply(obj, args);
        }

        return Object.freeze({
            // Configuration
            config: getConfig,
            getConfig: getConfig,
            hasConfig: hasConfig,
            rawConfig: rawConfig,

            allow: allow,

            feature: feature,

            // Messaging
            send: send,
            recv: receive,

            sendp: sendp,
            drop: drop,
            snd: snd,
            rcv: rcv,
            urcv: urcv,

            // navigation
            navigate: navigate,
            // Services
            service: function () {
                var service = proxyMethod(serviceManager, 'getService', arguments);
                return service;
            },
            hasService: function () {
                return proxyMethod(serviceManager, 'hasService', arguments);
            },
            getService: function () {
                return proxyMethod(serviceManager, 'getService', arguments);
            }

            // pretty sure all this is defunct.
            // addService: function () {
            //     return proxyMethod(appServiceManager, 'addService', arguments);
            // },
            // loadService: function () {
            //     return proxyMethod(appServiceManager, 'loadService', arguments);
            // },
            // dumpServices: function () {
            //     return proxyMethod(appServiceManager, 'dumpServices', arguments);
            // }
        });
    }

    return {
        make: factory
    };
});
