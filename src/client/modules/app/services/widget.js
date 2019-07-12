define(['promise', '../../lib/widget/manager'], function (Promise, widgetManager) {
    'use strict';

    class WidgetService {
        constructor({ params: {runtime} }) {
            // the config has two properties:
            // config - from the service config
            // params - runtime params required for integration with ui runtime

            if (!runtime) {
                throw new Error('WidgetService start requires a runtime object; provide as "runtime"');
            }
            this.widgetManager = new widgetManager.WidgetManager({
                runtime
            });
        }
        start() {
            return true;
        }
        stop() {
            return true;
        }
        pluginHandler(widgetsConfig, pluginConfig) {
            return Promise.try(() => {
                widgetsConfig.forEach((widgetDef) => {
                    // If source modules are not specified, we are using module
                    // paths. A full path will start with "plugins/" and a relative
                    // path won't. Prefix a relative path with the plugin's module path.
                    if (!pluginConfig.usingSourceModules) {
                        if (!widgetDef.module.match(/^plugins\//)) {
                            widgetDef.module = [pluginConfig.moduleRoot, widgetDef.module].join('/');
                        }
                    }
                    this.widgetManager.addWidget(widgetDef);
                });
            });
        }
        getWidget() {
            return this.widgetManager.getWidget.apply(this.widgetManager, arguments);
        }
        makeWidget() {
            return this.widgetManager.makeWidget.apply(this.widgetManager, arguments);
        }
    }
    return { ServiceClass: WidgetService };
});
