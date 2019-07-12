define([
    'bluebird',
    'lib/rpc'
], function (
    Promise,
    rpc
) {
    'use strict';

    return class RPC {
        constructor({runtime}) {
            this.runtime = runtime;
        }

        start() {
            return true;
        }
        stop() {
            return true;
        }
        pluginHandler() {
            return Promise.try(function () {
            });
        }
        makeClient({authenticated, module, timeout}) {
            if (authenticated === undefined) {
                authenticated = true;
            } else {
                authenticated = authenticated ? true : false;
            }
            const client = new rpc.RPCClient({
                runtime: this.runtime,
                module: module,
                timeout: timeout,
                authenticated: authenticated
            });
            return client;
        }
    };
});