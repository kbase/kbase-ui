define([
    'lib/rpc'
], function (
    rpc
) {

    return class RPC {
        constructor({runtime}) {
            this.runtime = runtime;
        }
        start() {
            return Promise.resolve();
        }
        stop() {
            return Promise.resolve();
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