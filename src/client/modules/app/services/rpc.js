define([
    'bluebird',
    'lib/rpc'
], function (
    Promise,
    rpc
) {
    'use strict';

    // function proxyMethod(obj, method, args) {
    //     if (!obj[method]) {
    //         throw {
    //             name: 'UndefinedMethod',
    //             message: 'The requested method "' + method + '" does not exist on this object',
    //             suggestion: 'This is a developer problem, not your fault'
    //         };
    //     }
    //     return obj[method].apply(obj, args);
    // }

    function factory(config, params) {
        var runtime = params.runtime;

        function start() {
            return true;
        }
        function stop() {
            return true;
        }
        function pluginHandler() {
            return Promise.try(function () {
            });
        }

        function makeClient(arg) {
            let authenticated;
            if (arg.authenticated === undefined) {
                authenticated = true;
            } else {
                authenticated = arg.authenticated ? true : false;
            }
            const client = new rpc.RPCClient({
                runtime: runtime,
                module: arg.module,
                timeout: arg.timeout,
                authenticated: authenticated
            });
            return client;
        }

        return {start, stop, pluginHandler, makeClient};
    }
    return {
        make: factory
    };
});