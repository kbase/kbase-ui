/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'kb_common/pluginManager',
    'kb_common/dom',
    'kb_common/messenger',
    'kb_widget/widgetMount',
    'kb_common/props',
    'kb_common/asyncQueue',
    'kb_common/appServiceManager',
    'kb_common_ts/Cookie'
], function(
    pluginManagerFactory,
    dom,
    messengerFactory,
    widgetMountFactory,
    props,
    asyncQueue,
    AppServiceManager,
    M_Cookie
) {
    'use strict';

    var moduleVersion = '0.0.1';

    function factory(config) {
        var pluginManager,
            appConfig = config.appConfig,
            appConfigProps = props.make({
                data: appConfig
            }),
            rootNode;

        // quick hack:

        function getConfig(prop, defaultValue) {
            return appConfigProps.getItem(prop, defaultValue);
        }

        function hasConfig(prop) {
            return appConfigProps.hasItem(prop);
        }

        function rawConfig() {
            return appConfigProps.debug();
        }

        // Events

        // Our own events
        var messenger = messengerFactory.make();

        function receive(channel, message, fun) {
            return rcv({
                channel: channel,
                message: message,
                handler: fun
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

        // The friendlier more verbose functions take explicit arguments and
        // packge them up into the messenger api format.
        function send(channel, message, data) {
            return snd({
                channel: channel,
                message: message,
                data: data
            });
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

        // Plugins
        function installPlugins(plugins) {
            return pluginManager.installPlugins(plugins);
        }

        // Services for plugins

        function setRootNode(selector) {
            rootNode = dom.qs(selector);
            if (!rootNode) {
                throw new Error('Cannot set root node for selector ' + selector);
            }

        }
        setRootNode(config.nodes.root.selector);

        var rootMount;

        function mountRootWidget(widgetId, runtime) {
            if (!rootNode) {
                throw new Error('Cannot set root widget without a root node');
            }
            // remove anything on the root mount, such as a waiter.
            rootNode.innerHTML = '';
            if (!rootMount) {
                // create the root mount.
                rootMount = widgetMountFactory.make({
                    node: rootNode,
                    runtime: runtime
                });

            }
            // ask it to load a widget.
            return rootMount.mountWidget(widgetId);
        }

        var renderQueue = asyncQueue.make();

        var appServiceManager = AppServiceManager.make();

        function proxyMethod(obj, method, args) {
            if (!obj[method]) {
                throw {
                    name: 'UndefinedMethod',
                    message: 'The requested method "' + method + '" does not exist on this object',
                    suggestion: 'This is a developer problem, not your fault'
                };
            }
            return obj[method].apply(obj, args);
        }

        function navigate(path) {
            send('app', 'navigate', path);
        }

        function feature(featureSet, path) {
            var featureFlag = new M_Cookie.CookieManager().getItem('ui.features.auth.selected');
            if (!featureFlag) {
                featureFlag = api.config('ui.features.' + featureSet + '.selected');
                // featureFlag = api.config('ui.features.' + featureSet + '.selected');
            }
            var featurePath = 'ui.features.' + featureSet + '.available.' + featureFlag + '.' + path;
            // console.log('feature', featureFlag, featurePath);
            var result = getConfig(featurePath, null);
            if (result === null) {
                throw new Error('Feature is not defined: ' + featurePath);
            }
            return result;
        }

        var api = {
            getConfig: getConfig,
            config: getConfig,
            hasConfig: hasConfig,
            rawConfig: rawConfig,
            feature: feature,
            // Session
            installPlugins: installPlugins,
            send: send,
            sendp: sendp,
            recv: receive,
            drop: drop,
            snd: snd,
            rcv: rcv,
            urcv: urcv,
            // navigation
            navigate: navigate,
            // Services
            addService: function() {
                return proxyMethod(appServiceManager, 'addService', arguments);
            },
            loadService: function() {
                return proxyMethod(appServiceManager, 'loadService', arguments);
            },
            getService: function() {
                return proxyMethod(appServiceManager, 'getService', arguments);
            },
            service: function() {
                var service = proxyMethod(appServiceManager, 'getService', arguments);
                return service
            },
            hasService: function() {
                return proxyMethod(appServiceManager, 'hasService', arguments);
            },
            dumpServices: function() {
                return proxyMethod(appServiceManager, 'dumpServices', arguments);
            }
        };


        function begin() {
            // Register service handlers.
            var sessionConfig = {
                runtime: api,
                cookieName: 'kbase_session',
                cookieMaxAge: appConfig.ui.constants.session_max_age
            };

            if (api.config('ui.backupCookie.enabled')) {
                sessionConfig.extraCookies = [{
                    name: 'kbase_session_backup',
                    domain: api.config('ui.backupCookie.domain')
                }];
            }

            // var authService = 'auth2Session'; // or 'session'

            //var authFeatureFlag = api.config('ui.features.auth.selected');
            // api.config('ui.features.auth.available.' + authFeatureFlag + '.services.session.module')

            // var sessionModule = ;

            appServiceManager.addService({
                name: 'session',
                module: api.feature('auth', 'services.session.module'),
            }, sessionConfig);

            // switch (authFeatureFlag) {
            //     case 'auth1':
            //         sessionConfig.loginUrl = api.config('services.auth.url');
            //         appServiceManager.addService({
            //             name: 'session',
            //             module: 'session'
            //         }, sessionConfig);
            //         break;
            //     case 'auth2':
            //         appServiceManager.addService({
            //             name: 'session',
            //             module: 'auth2Session'
            //         }, sessionConfig);
            //         break;
            //     default:
            //         throw new Error('Invalid auth feature flag: ' + authFeatureFlag);
            // }


            appServiceManager.addService('heartbeat', {
                runtime: api,
                interval: 500
            });


            appServiceManager.addService('route', {
                runtime: api,
                // notFoundRoute: {redirect: {path: 'message/notfound'}},
                defaultRoute: { redirect: { path: 'dashboard' } }
            });
            appServiceManager.addService('menu', {
                runtime: api,
                menus: config.menus
            });
            appServiceManager.addService('widget', {
                runtime: api
            });
            appServiceManager.addService('service', {
                runtime: api
            });
            appServiceManager.addService('data', {
                runtime: api
            });
            appServiceManager.addService('type', {
                runtime: api
            });
            appServiceManager.addService('userprofile', {
                runtime: api
            });
            appServiceManager.addService('analytics', {
                runtime: api
            });

            pluginManager = pluginManagerFactory.make({
                runtime: api
            });

            // Behavior
            // There are not too many global behaviors, and perhaps there should
            // even fewer or none. Most behavior is within services or
            // active widgets themselves.
            // receive('session', 'loggedout', function () {
            //     send('app', 'navigate', 'goodbye');
            // });

            receive('app', 'route-not-found', function(info) {
                // alert('help, the route was not found!: ' + route.path);
                send('app', 'navigate', {
                    path: 'message/error/notfound',
                    params: {
                        info: JSON.stringify(info)
                    },
                    replace: true
                });
            });

            // UI should be a service...
            // NB this was never developed beyond this stage, and should
            // probably be hunted down and removed.
            receive('ui', 'render', function(arg) {
                renderQueue.addItem({
                    onRun: function() {
                        if (arg.node) {
                            arg.node.innerHTML = arg.content;
                        } else {
                            console.error('ERROR');
                            console.error('Invalid node for ui/render');
                        }
                    }
                });
            });

            // ROUTING

            return appServiceManager.loadServices()
                .then(function() {
                    return installPlugins(config.plugins);
                })
                .then(function() {
                    return appServiceManager.startServices();
                })
                .then(function() {
                    return mountRootWidget('root', api);
                })
                .then(function() {
                    // kick off handling of the current route.
                    api.service('analytics').pageView('/index');
                    // remove the loading status.

                    send('app', 'do-route');
                    return api;
                });
        }
        return {
            begin: begin
        };
    }
    return {
        run: function(config) {
            var runtime = factory(config);
            return runtime.begin();
        },
        version: function() {
            return moduleVersion;
        }
    };
});