define([
    'lib/rpc'
], function (
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
            return Promise.resolve(null);
        }
        newClient({authenticated, module, timeout}) {
            if (typeof authenticated === 'undefined') {
                authenticated = true;
            } else {
                authenticated = authenticated ? true : false;
            }
            return new rpc.RPCClient({
                runtime: this.runtime,
                module, timeout, authenticated
            });
        }
    };
});