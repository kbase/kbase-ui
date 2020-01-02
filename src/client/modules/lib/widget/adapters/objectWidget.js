define(['bluebird', 'kb_lib/merge'], function (Promise, merge) {
    'use strict';

    class ObjectWidgetAdapter {
        constructor(config) {
            if (!config.runtime) {
                throw {
                    type: 'ArgumentError',
                    reason: 'RuntimeMissing',
                    message: 'The runtime factory construction property is required but not provided'
                };
            }
            this.runtime = config.runtime;
            this.module = config.widgetDef.module;
            this.initConfig = new merge.ShallowMerger({}).mergeIn(config.initConfig).value();

            this.widget = null;
            this.hostNode = null;
            this.container = null;
        }

        init(config) {
            return new Promise((resolve, reject) => {
                require([this.module], (Widget) => {
                    if (!Widget) {
                        reject(new Error('Widget module did not load properly (undefined) for ' + this.module));
                        return;
                    }
                    // NB we save the config, because the internal widget
                    // unfortunately requires the container in init, and
                    // that is not available until attach...
                    // or does it?? and how many of these are there? ...
                    this.initConfig = new merge.DeepMerger(this.initConfig).mergeIn(config).value();
                    this.widget = Object.create(Widget);
                    resolve();
                }, (error) => {
                    reject(error);
                });
            });
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
        }

        start(params) {
            return Promise.try(() => {
                // The config is supplied by the caller, but we add
                // standard properties here.
                /* TODO: be more generic */
                // But then again, a widget constructed on this model does
                // not need a connector!
                // not the best .. perhaps merge the params into the config
                // better yet, rewrite the widgets in the new model...
                //var widgetConfig = config.widgetDef || params || {};
                //_.extend(widgetConfig, initConfig);

                var widgetConfig = new merge.ShallowMerger(this.initConfig)
                    .mergeIn({
                        container: this.container,
                        // userId: this.runtime.getService('session').getUsername(),
                        runtime: this.runtime,
                        params: params
                    })
                    .value();
                return this.widget.init(widgetConfig);
            }).then(() => {
                // go????
                return this.widget.go();
            });
        }

        stop() {
            // noop
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }

        destroy() {
            // no method on the object widget to call.
        }
    }

    return { ObjectWidgetAdapter };
});
