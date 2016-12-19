/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'bluebird',
    'kb/common/html',
    'kb/common/dom',
    'kb/service/client/narrativeMethodStore',
    'kb/service/client/workspace',
    'kb/service/client/catalog',
    'kb_sdk_clients/genericClient',

    'bootstrap'
], function(
    Promise,
    html,
    dom,
    NMS,
    Workspace,
    Catalog,
    GenericClient) {
    'use strict';
    var t = html.tag,
        h1 = t('h1'),
        p = t('p'),
        div = t('div'),
        a = t('a'),
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
            mounts = {
                content: {
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
                    }, [
                        div({
                            id: mounts.content.id
                        })
                    ])
                ])
            ]);
        }

        function sum(array, fun) {
            var total = 0;
            array.forEach(function(item) {
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
            return new Promise(function(resolve) {
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
                            .then(function() {
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

            return Promise.all([nms.status(), nms.ver(), perf(nms.ver)])
                .spread(function(status, version, perf) {
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
                .then(function(info) {
                    return div({}, [
                        h3('Narrative Method Store'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function(item) {
                            return tr([
                                th({
                                        style: {
                                            width: '10%'
                                        }
                                    },
                                    item.label),
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

            return Promise.all([workspace.ver(), perf(workspace.ver)])
                .spread(function(version, perf) {
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
                .then(function(info) {
                    return div({}, [
                        h3('Workspace'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function(item) {
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

            return Promise.all([catalog.version(), perf(catalog.version)])
                .spread(function(version, perf) {
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
                .then(function(info) {
                    return div({}, [
                        h3('Catalog'),
                        table({
                            class: 'table table-striped'
                        }, info.map(function(item) {
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

        function renderServices() {
            return Promise.all([renderNMS(), renderWorkspace(), renderCatalog()])
                .then(function(results) {
                    return results.join('\n');
                });
        }

        function render() {
            return renderServices()
                .then(function(servicesContent) {
                    return div({
                        class: 'container-fluid'
                    }, [
                        div({
                            class: 'row'
                        }, [
                            div({
                                class: 'col-sm-12'
                            }, [
                                h1('KBase Services'),
                                servicesContent
                            ])
                        ])
                    ]);
                });
        }

        // Widget API
        function attach(node) {
            return Promise.try(function() {
                mount = node;
                container = mount.appendChild(document.createElement('div'));
            });
        }

        function detach() {
            return Promise.try(function() {
                mount.removeChild(container);
                container = null;
            });
        }

        function start() {
            return Promise.try(function() {
                    runtime.send('ui', 'setTitle', 'About then FUNctional Site');
                    return render();
                })
                .then(function(content) {
                    runtime.send('ui', 'render', {
                        node: container,
                        content: content
                    });
                });
        }

        function stop() {
            return Promise.try(function() {
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
        make: function(config) {
            return widget(config);
        }
    };

});