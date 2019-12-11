define([
    'bluebird',
    'kb_lib/html',
    'kb_lib/htmlBuilders',
    'kb_lib/htmlBootstrapBuilders',
    'kb_lib/jsonRpc/genericClient',
    'kb_common_ts/HttpClient',

    'bootstrap'
], (Promise, html, build, BS, GenericClient, HttpClient) => {
    'use strict';
    const t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td'),
        h3 = t('h3');

    /*
     * The widget factory function implements the widget interface.
     */
    class AboutServices {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.mount = null;
            this.container = null;

            this.vm = {
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
                searchAPI: {
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
                groups: {
                    id: html.genId(),
                    node: null
                },
                feeds: {
                    id: html.genId(),
                    node: null
                },
                dynamicServices: {
                    id: html.genId(),
                    node: null
                }
            };
        }

        layout() {
            return div(
                {
                    class: 'container-fluid'
                },
                [
                    div(
                        {
                            class: 'row'
                        },
                        [
                            div(
                                {
                                    class: 'col-sm-12'
                                },
                                [
                                    'auth',
                                    'nms',
                                    'workspace',
                                    'userProfile',
                                    'searchAPI',
                                    'catalog',
                                    'serviceWizard',
                                    'groups',
                                    'feeds',
                                    'dynamicServices'
                                ].map((id) => {
                                    return div({
                                        id: this.vm[id].id
                                    });
                                })
                            )
                        ]
                    )
                ]
            );
        }

        sum(array, fun) {
            let total = 0;
            array.forEach((item) => {
                if (fun) {
                    total += fun(item);
                } else {
                    total += item;
                }
            });
            return total;
        }

        perf(call) {
            const measures = [];
            const iters = 5;
            return new Promise((resolve) => {
                const next = (itersLeft) => {
                    if (itersLeft === 0) {
                        resolve({
                            measures: measures,
                            total: this.sum(measures),
                            average: this.sum(measures) / measures.length
                        });
                    } else {
                        call().then(() => {
                            const start = new Date().getTime();
                            const elapsed = new Date().getTime() - start;
                            measures.push(elapsed);
                            next(itersLeft - 1);
                        });
                    }
                };
                next(iters);
            });
        }

        renderNMS() {
            const client = new GenericClient({
                module: 'NarrativeMethodStore',
                url: this.runtime.config('services.narrative_method_store.url'),
                token: this.runtime.service('session').getAuthToken()
            });

            const status = () => {
                return client.callFunc('status', []).spread((result) => {
                    return result;
                });
            };

            const ver = () => {
                return client.callFunc('ver', []).spread((result) => {
                    return result;
                });
            };

            this.vm.nms.node.innerHTML = build.loading();

            return Promise.all([status(), ver(), this.perf(ver)])
                .spread((status, version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });

                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
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
                .then((info) => {
                    this.vm.nms.node.innerHTML = div({}, [
                        h3('Narrative Method Store'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderWorkspace() {
            const client = new GenericClient({
                module: 'Workspace',
                url: this.runtime.config('services.Workspace.url'),
                token: this.runtime.service('session').getAuthToken()
            });
            const ver = () => {
                return client.callFunc('ver', []);
            };
            this.vm.workspace.node.innerHTML = build.loading();

            return Promise.all([
                client.callFunc('ver', []).spread((result) => {
                    return result;
                }),
                this.perf(ver)
            ])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.workspace.node.innerHTML = div({}, [
                        h3('Workspace'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderAuth() {
            const http = new HttpClient.HttpClient();
            this.vm.auth.node.innerHTML = build.loading();

            const getRoot = () => {
                const header = new HttpClient.HttpHeader();
                header.setHeader('accept', 'application/json');
                return http
                    .request({
                        method: 'GET',
                        url: this.runtime.config('services.auth2.url'),
                        header: header
                    })
                    .then((result) => {
                        try {
                            const data = JSON.parse(result.response);
                            return data.version;
                        } catch (ex) {
                            return 'ERROR: ' + ex.message;
                        }
                    });
            };

            return Promise.all([getRoot(), this.perf(getRoot)])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.auth.node.innerHTML = div({}, [
                        h3('Auth'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderGroups() {
            const http = new HttpClient.HttpClient();
            this.vm.auth.node.innerHTML = build.loading();

            const getRoot = () => {
                const header = new HttpClient.HttpHeader();
                header.setHeader('accept', 'application/json');
                return http
                    .request({
                        method: 'GET',
                        url: this.runtime.config('services.groups.url') + '/',
                        header: header
                    })
                    .then((result) => {
                        try {
                            const data = JSON.parse(result.response);
                            return data.version;
                        } catch (ex) {
                            return 'ERROR: ' + ex.message;
                        }
                    });
            };

            return Promise.all([getRoot(), this.perf(getRoot)])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.groups.node.innerHTML = div({}, [
                        h3('Groups'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderFeeds() {
            const http = new HttpClient.HttpClient();
            this.vm.auth.node.innerHTML = build.loading();

            const getRoot = () => {
                const header = new HttpClient.HttpHeader();
                header.setHeader('accept', 'application/json');
                return http
                    .request({
                        method: 'GET',
                        url: this.runtime.config('services.feeds.url') + '/',
                        header: header
                    })
                    .then((result) => {
                        try {
                            const data = JSON.parse(result.response);
                            return data.version;
                        } catch (ex) {
                            return 'ERROR: ' + ex.message;
                        }
                    });
            };

            return Promise.all([getRoot(), this.perf(getRoot)])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.feeds.node.innerHTML = div({}, [
                        h3('Feeds'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderUserProfile() {
            const client = new GenericClient({
                url: this.runtime.config('services.user_profile.url'),
                token: this.runtime.service('session').getAuthToken(),
                module: 'UserProfile'
            });

            this.vm.userProfile.node.innerHTML = build.loading();

            const ver = () => {
                return client.callFunc('ver', []);
            };

            return Promise.all([ver(), this.perf(ver)])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version[0]
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.userProfile.node.innerHTML = div({}, [
                        h3('User Profile'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                })
                .catch((err) => {
                    this.vm.userProfile.node.innerHTML = div(
                        {
                            class: 'alert alert-danger'
                        },
                        err.message
                    );
                });
        }

        renderSearchAPI() {
            const client = new GenericClient({
                url: this.runtime.config('services.KBaseSearchEngine.url'),
                token: this.runtime.service('session').getAuthToken(),
                module: 'KBaseSearchEngine'
            });

            this.vm.userProfile.node.innerHTML = build.loading();

            const theCall = () => {
                return client.callFunc('status', []).spread((result) => {
                    return result;
                });
            };

            return Promise.all([theCall(), this.perf(theCall)])
                .spread((result, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: result.version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.searchAPI.node.innerHTML = div({}, [
                        h3('Search API'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderCatalog() {
            const client = new GenericClient({
                module: 'Catalog',
                url: this.runtime.config('services.Catalog.url'),
                token: this.runtime.service('session').getAuthToken()
            });
            const version = () => {
                return client.callFunc('version', []).spread((result) => {
                    return result;
                });
            };

            this.vm.catalog.node.innerHTML = build.loading();

            return Promise.all([version(), this.perf(version)])
                .spread((version, perf) => {
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.catalog.node.innerHTML = div({}, [
                        h3('Catalog'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderServiceWizard() {
            const serviceWizard = new GenericClient({
                url: this.runtime.config('services.service_wizard.url'),
                token: this.runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });

            this.vm.serviceWizard.node.innerHTML = build.loading();

            const theCall = () => {
                return serviceWizard.callFunc('version', []);
            };

            return Promise.all([theCall(), this.perf(theCall)])
                .spread((result, perf) => {
                    const version = result[0];
                    const info = [];
                    // Version info
                    info.push({
                        label: 'Version',
                        value: version
                    });
                    info.push({
                        label: 'Perf avg (ms/call)',
                        value: perf.average
                    });
                    info.push({
                        label: 'Perf calls (ms/call)',
                        value: perf.measures.join(', ')
                    });

                    return info;
                })
                .then((info) => {
                    this.vm.serviceWizard.node.innerHTML = div({}, [
                        h3('Service Wizard'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            info.map((item) => {
                                return tr([
                                    th(
                                        {
                                            style: {
                                                width: '10%'
                                            }
                                        },
                                        item.label
                                    ),
                                    td(item.value)
                                ]);
                            })
                        )
                    ]);
                });
        }

        renderDynamicServices() {
            const client = new GenericClient({
                url: this.runtime.config('services.service_wizard.url'),
                token: this.runtime.service('session').getAuthToken(),
                module: 'ServiceWizard'
            });
            this.vm.dynamicServices.node.innerHTML = build.loading();
            return client
                .callFunc('list_service_status', [
                    {
                        is_up: 0,
                        module_names: ['NarrativeService']
                    }
                ])
                .then((result) => {
                    this.vm.dynamicServices.node.innerHTML = div({}, [
                        h3('Dynamic Services'),
                        table(
                            {
                                class: 'table table-striped'
                            },
                            BS.buildPresentableJson(result[0])
                        )
                    ]);
                });
        }

        render() {
            return Promise.all([
                this.renderAuth(),
                this.renderNMS(),
                this.renderWorkspace(),
                this.renderUserProfile(),
                this.renderSearchAPI(),
                this.renderCatalog(),
                this.renderServiceWizard(),
                this.renderGroups(),
                this.renderFeeds(),
                this.renderDynamicServices()
            ]);
        }

        // Widget API
        attach(node) {
            this.mount = node;
            this.container = this.mount.appendChild(document.createElement('div'));
            this.container.innerHTML = this.layout();
            // bind
            Object.keys(this.vm).forEach((id) => {
                const vmNode = this.vm[id];
                vmNode.node = document.getElementById(vmNode.id);
            });
        }

        detach() {
            if (this.mount && this.container) {
                this.mount.removeChild(this.container);
                this.container = null;
            }
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'KBase Services Runtime Status');
            return this.render();
        }

        stop() {
            return null;
        }
    }

    return AboutServices;
});
