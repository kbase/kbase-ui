define(['module', './iframer', 'css!./panel.css'], function (module, Iframer) {
    'use strict';

    // The module url includes the initial / and, so we start after that,
    // and we also remove this file and the modules directory.
    // const pluginPath = module.uri
    //     .split('/')
    //     .slice(1, -2)
    //     .join('/');

    class Panel {
        constructor(config) {
            this.runtime = config.runtime;
            this.iframer = null;
            this.hostNode = null;
            this.container = null;
            this.firstTime = true;
        }

        attach(node) {
            this.hostNode = node;
            this.container = node.appendChild(document.createElement('div'));
            this.container.classList.add('plugin_panel');
        }

        start(params) {
            params = params || {};

            if (params.viewParams) {
                params.viewParams = JSON.parse(params.viewParams);
            }

            const pluginPath = ['modules', 'plugins', params.plugin].join('/');

            this.runtime.send('ui', 'setTitle', '');

            this.iframer = new Iframer({
                runtime: this.runtime,
                node: this.container,
                pluginPath: pluginPath,
                params: {
                    originalPath: window.location.pathname,
                    routeParams: params || {}
                }
            });

            return this.iframer.start();
        }

        run(params) {
            // The route to get here provides an optional path and
            // query. We simply pass those into the already-running
            // iframe-based app.

            // in the params, the 'path' property represents the rest of the
            // nav path (hash) after #auth.
            // We remove that and call it the path for the sake of the
            // navigate event.
            const path = params.path;
            delete params.path;

            this.iframer.channel.send('navigate', { path, params });
        }

        stop() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
            if (this.iframer) {
                return this.iframer.stop();
            }
        }
    }
    return Panel;
});
