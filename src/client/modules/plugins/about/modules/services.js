define([
    'bluebird',
    'kb_common/html',
    'kb_common/dom',
    'kb_common/bootstrapUtils',
    'kb_service/client/narrativeMethodStore',
    'kb_service/client/workspace',
    'kb_service/client/catalog',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient',
    'kb_common_ts/HttpClient',

    'bootstrap'
], function (
    Promise,
    html,
    dom,
    BS,
    NMS,
    Workspace,
    Catalog,
    GenericClient,
    DynamicServiceClient,
    HttpClient
) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td'),
        h3 = t('h3');

    /*
     * The widget factory function implements the widget interface.
     */
    function widget(config) {
        var mount, container,
            runtime = config.runtime,
            vm = {
                auth: {
                    id: html.genId(),
                    node: null
                },
                nms: {
                    id: html.genId(),
                    node: null
                },
                workspace: {
                    id: html.genId(),
                    node: null
                },
                userProfile: {
                    id: html.genId(),
                    node: null
                },
                catalog: {
                    id: html.genId(),
                    node: null
                },
                serviceWizard: {
                    id: html.genId(),
                    node: null
                },
                dynamicServices: {
                    id: html.genId(),
                    node: null
                }
            };

        function layout() {
            return div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-12'
                    }, ['auth', 'nms', 'workspace', 'userProfile', 'catalog', 'serviceWizard', 'dynamicServices'].map(function (id) {
                        return div({
                            id: vm[id].id
                        });
                    }))
                ])
            ]);
        }

        function sum(array, fun) {
            var total = 0;
            array.forEach(function (item) {
                if (fun) {
                    total += fun(item);
                } else {
                    total += item;
                }
            });
            return total;
        }

        function perf(call) {
            var measures = [];
            var iters = 5;
            return new Promise(function (resolve) {
                function next(itersLeft) {
                    if (itersLeft === 0) {
                        var stats = {
                            measures: measures,
                            total: sum(measures),
                            average: sum(measures) / measures.length
                        };
                        resolve(stats);
                    } else {
                        var start = new Date().getTime();
                        call()
                            .then(function () {
                                var elapsed = new Date().getTime() - start;
                                measures.push(elapsed);
                                next(itersLeft - 1);
                            });
                    }
                }
                next(iters);
            });
        }

        function renderNMS() {
            var nms = new NMS(runtime.config('services.narrative_method_store.url', {
                token: runtime.service('session').getAuthToken()
            }));

            vm.nms.node.innerHTML = html.loading();

            return Promise.all([nms.status(), nms.ver(), perf(nms.ver)])
                .spread(function (status, version, perf) {
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });

                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms))',
                        value: perf.measures.join(', ')
                    });

                    // Status info
                    info.push({
                        label: 'Branch',
                        value: status.git_spec_branch
                    });
                    info.push({
                        label: 'Commit Hash',
                        value: status.git_spec_commit
                    });
                    info.push({
                        label: 'Github Url',
                        value: status.git_spec_url
                    });
                    return info;
                })
                .then(function (info) {
                    vm.nms.node.innerHTML = div({}, [
                        h3('Narrative Method Store'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });

        }

        function renderWorkspace() {
            var workspace = new Workspace(runtime.config('services.workspace.url', {
                token: runtime.service('session').getAuthToken()
            }));
            vm.workspace.node.innerHTML = html.loading();

            return Promise.all([workspace.ver(), perf(workspace.ver)])
                .spread(function (version, perf) {
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then(function (info) {
                    vm.workspace.node.innerHTML = div({}, [
                        h3('Workspace'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });
        }


        function renderAuth() {
            // +++ 
            var http = new HttpClient.HttpClient();
            vm.auth.node.innerHTML = html.loading();

            function getRoot() {
                var header = new HttpClient.HttpHeader();
                header.setHeader('accept', 'application/json');
                return http.request({
                        method: 'GET',
                        url: runtime.config('services.auth2.url'),
                        header: header
                    })
                    .then(function (result) {
                        try {
                            var data = JSON.parse(result.response);
                            return data.version;
                        } catch (ex) {
                            return 'ERROR: ' + ex.message;
                        }
                    });
            }

            return Promise.all([getRoot(), perf(getRoot)])
                .spread(function (version, perf) {
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then(function (info) {
                    vm.auth.node.innerHTML = div({}, [
                        h3('Auth'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });
        }

        function renderUserProfile() {

            var client = new GenericClient({
                url: runtime.config('services.user_profile.url'),
                token: runtime.service('session').getAuthToken(),
                module: 'UserProfile'
            });

            vm.userProfile.node.innerHTML = html.loading();

            function theCall() {
                return client.callFunc('ver', []);
            }

            return Promise.all([theCall(), perf(theCall)])
                .spread(function (version, perf) {
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version[0]
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });


                    return info;
                })
                .then(function (info) {
                    vm.userProfile.node.innerHTML = div({}, [
                        h3('User Profile'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });
        }

        function renderCatalog() {
            var catalog = new Catalog(runtime.config('services.catalog.url', {
                token: runtime.service('session').getAuthToken()
            }));
            vm.catalog.node.innerHTML = html.loading();

            return Promise.all([catalog.version(), perf(catalog.version)])
                .spread(function (version, perf) {
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then(function (info) {
                    vm.catalog.node.innerHTML = div({}, [
                        h3('Catalog'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });
        }

        function renderServiceWizard() {
            var serviceWizard = new GenericClient({
                url: runtime.config('services.service_wizard.url'),
                token: runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });

            vm.serviceWizard.node.innerHTML = html.loading();

            function theCall() {
                return serviceWizard.callFunc('version', []);
            }

            return Promise.all([theCall(), perf(theCall)])
                .spread(function (result, perf) {
                    var version = result[0];
                    var info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average + ' (' + perf.total + ' / ' + perf.measures.length + ')'
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then(function (info) {
                    vm.serviceWizard.node.innerHTML = div({}, [
                        h3('Service Wizard'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function (item) {
                            return tr([
                                th({
                                    style: {
                                        width: '10%'
                                    }
                                }, item.label),
                                td(item.value)
                            ]);
                        }))
                    ]);
                });
        }

        function renderDynamicServices() {
            var client = new GenericClient({
                url: runtime.config('services.service_wizard.url'),
                token: runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });
            vm.dynamicServices.node.innerHTML = html.loading();
            return client.callFunc('list_service_status', [{
                    is_up: 0,
                    module_names: ['NarrativeService']
                }])
                .then(function (result) {
                    vm.dynamicServices.node.innerHTML = div({}, [
                        h3('Dynamic Services'),
                        table({
                            class: 'table table-striped'
                        }, BS.buildPresentableJson(result[0]))
                    ]);
                });
        }


        function render() {
            return Promise.all([
                renderAuth(),
                renderNMS(),
                renderWorkspace(),
                renderUserProfile(),
                renderCatalog(),
                renderServiceWizard(),
                renderDynamicServices()
            ]);
        }

        // Widget API
        function attach(node) {
            return Promise.try(function () {
                mount = node;
                container = mount.appendChild(document.createElement('div'));
                container.innerHTML = layout();
                // bind
                Object.keys(vm).forEach(function (id) {
                    var vmNode = vm[id];
                    vmNode.node = document.getElementById(vmNode.id);
                });
            });
        }

        function detach() {
            return Promise.try(function () {
                mount.removeChild(container);
                container = null;
            });
        }

        function start() {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'About the <strike>FUNctional Site</strike> UI');
                return render();
            });
        }

        function stop() {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'Leaving about...');
            });
        }

        return {
            attach: attach,
            detach: detach,
            start: start,
            stop: stop
        };
    }

    return {
        make: function (config) {
            return widget(config);
        }
    };

});
