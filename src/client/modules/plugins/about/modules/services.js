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
    DynamicServiceClient
) {
    'use strict';
    var t = html.tag,
        h1 = t('h1'),
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
                nms: {
                    id: html.genId(),
                    node: null
                },
                workspace: {
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
                    }, ['nms', 'workspace', 'catalog', 'serviceWizard', 'dynamicServices'].map(function (id) {
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
                            average: sum(measures) / measures.length
                        }
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
                        label: 'Perf (ms/call)',
                        value: perf.average
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
                        label: 'Perf (ms/call)',
                        value: perf.average
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
                        label: 'Perf (ms/call)',
                        value: perf.average
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
                        label: 'Perf (ms/call)',
                        value: perf.average
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
                renderNMS(),
                renderWorkspace(),
                renderCatalog(),
                renderServiceWizard(),
                renderDynamicServices()
            ]);
        }

        // function render() {
        //     return renderServices()
        //         .then(function (servicesContent) {
        //             return div({
        //                 class: 'container-fluid'
        //             }, [
        //                 div({
        //                     class: 'row'
        //                 }, [
        //                     div({
        //                         class: 'col-sm-12'
        //                     }, [
        //                         h1('KBase Services'),
        //                         servicesContent
        //                     ])
        //                 ])
        //             ]);
        //         });
        // }

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