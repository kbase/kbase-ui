/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb/common/html',
    'kb/common/utils',
    'kb_service_workspace',
    'kb_typeView_specCommon',
    'google-code-prettify',
    'datatables_bootstrap'
],
    function ($, Promise, html, Utils, Workspace, specCommon, PR) {
        'use strict';

        // Just take params for now
        /* TODO: use specific arguments */
        var factory = function (config) {
            var mount, container, $container, runtime = config.runtime,
                dataType, moduleName, typeName, typeVersion;

            // tags used in this module.
            var table = html.tag('table'),
                tr = html.tag('tr'),
                th = html.tag('th'),
                td = html.tag('td'),
                a = html.tag('a'),
                div = html.tag('div'),
                pre = html.tag('pre'),
                ul = html.tag('ul'),
                li = html.tag('li'),
                bstable = function (cols, rows) {
                    return html.makeTable({columns: cols, rows: rows, class: 'table'});
                }
            
            function tabTableContent() {
                return table({
                    class: 'table table-striped table-bordered',
                    style: {width: '100%'},
                    'data-attach': 'table'});
            }

            // OVERVIEW Tab
            function overviewTab(data) {
                return table({class: 'table table-striped table-bordered',
                    style: 'margin-left: auto; margin-right: auto'}, [
                    tr([th('Name'), td(typeName)]),
                    tr([th('Version'), td(typeVersion)]),
                    tr([th('Module version(s)'), td(
                            bstable(['Version id', 'Created at'], data.module_vers.map(function (moduleVer) {
                                var moduleId = moduleName + '-' + moduleVer;
                                return [a({href: '#spec/module/'+moduleId}, moduleVer), 
                                        Utils.niceTimestamp(parseInt(moduleVer, 10))];
                            })))]),
                    tr([th('Description'), td(pre({style: {'white-space': 'pre-wrap', 'word-wrap': 'break-word'}}, data.description))])
                ]);
                /* TODO: Add back in the kidl editor -- need to talk to Roman */
            }

            // SPEC FILE Tab
            function specFileTab(data) {
                var specText = specCommon.replaceMarkedTypeLinksInSpec(moduleName, data.spec_def, 'links-click');
                var content = div({style: {width: '100%'}}, [
                    pre({class: 'prettyprint lang-spec'}, specText)
                ]);
                return {
                    content: content,
                    widget: {
                        attach: function (node) {
                            PR.prettyPrint(null, node.get(0));
                        }
                    }
                };
            }

            // FUNCTIONS Tab
            function functionsTab(data) {
                // Build The table more functionally, using datatables.
                var tableData = data.using_func_defs.map(function (funcId) {
                    var parsed = funcId.match(/^(.+?)-(.+?)$/),
                        funcName = parsed[1],
                        funcVer = parsed[2];

                    return {
                        name: a({href: '#spec/functions/'+funcId}, funcName),
                        ver: funcVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Function name', mData: 'name'},
                        {sTitle: 'Function version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search function:',
                        sEmptyTable: 'No functions use this type'
                    }
                };

                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // USING TYPES Tab
            function usingTypesTab(data) {
                var tableData = data.using_type_defs.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/' + typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search types:',
                        sEmptyTable: 'No types use this type'
                    }
                };

                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // SUB TYPES Tab
            function subTypesTab(data) {
                var tableData = data.used_type_defs.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/'+typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search types:',
                        sEmptyTable: 'No types use this type'
                    }
                };
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            // VERSIONS Tab
            function versionsTab(data) {
                var tableData = data.type_vers.map(function (typeId) {
                    var parsed = typeId.match(/^(.+?)-(.+?)$/),
                        typeName = parsed[1],
                        typeVer = parsed[2];

                    return {
                        name: a({href: '#spec/type/'+typeId}, typeName),
                        ver: typeVer
                    };
                });
                var tableSettings = {
                    sPaginationType: 'full_numbers',
                    iDisplayLength: 10,
                    aoColumns: [
                        {sTitle: 'Type name', mData: 'name'},
                        {sTitle: 'Type version', mData: 'ver'}
                    ],
                    aaData: tableData,
                    oLanguage: {
                        sSearch: 'Search versions:',
                        sEmptyTable: 'No versions registered'
                    }
                };
                return {
                    content: tabTableContent(),
                    widget: {
                        attach: function (node) {
                            $(node).find('[data-attach="table"]').dataTable(tableSettings);
                        }
                    }
                };
            }

            function render() {
                var workspace = new Workspace(runtime.getConfig('workspace_url', {
                    token: runtime.service('session').getAuthToken()
                }));

                Promise.resolve(workspace.get_type_info(dataType))
                    .then(function (data) {
                        var tabs = [
                            {title: 'Overview', id: 'overview', content: overviewTab},
                            {title: 'Spec-file', id: 'spec', content: specFileTab},
                            {title: 'Functions', id: 'funcs', content: functionsTab},
                            {title: 'Using Types', id: 'types', content: usingTypesTab},
                            {title: 'Sub-types', id: 'subs', content: subTypesTab},
                            {title: 'Versions', id: 'vers', content: versionsTab}
                        ],
                            id = '_' + html.genId(),
                            widgets = [];

                        var content = div([
                                ul({id: id, class: 'nav nav-tabs'},
                                    tabs.map(function (tab) {
                                        var active = (tab.id === 'overview') ? 'active' : '';
                                        return li({class: active}, a({href: '#' + tab.id + id, 'data-toggle': 'tab'}, tab.title));
                                    })),
                                div({class: 'tab-content'}, tabs.map(function (tab) {
                                    var active = (tab.id === 'overview') ? ' active' : '',
                                        result = tab.content(data);
                                    if (typeof result === 'string') {
                                        return div({class: 'tab-pane in' + active, id: tab.id + id}, tab.content(data));
                                    }
                                    // This is the emerging widget pattern: Save a list of widgets 
                                    // and invoke them after the content is added to the dom,
                                    // because they need a real node to render upon.
                                    var widgetId = html.genId();
                                    widgets.push({
                                        id: widgetId,
                                        widget: result.widget
                                    });
                                    return div({class: 'tab-pane in' + active, id: tab.id + id}, [
                                        div({id: widgetId}, [
                                            result.content
                                        ])
                                    ]);
                                })
                                    )
                            ]);
                        $container.html(content);
                        widgets.forEach(function (widget) {
                            widget.widget.attach($('#' + widget.id));
                        });
                        PR.prettyPrint();
                    })
                    .catch(function (err) {
                        var error = 'Error rendering widget';
                        console.log(err);
                        $container.html(error);
                    });
            }
            
            // API
            
            var mount, container, $container, children = [];
            
            function init() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    $container = $(container);
                    resolve();
                });
            }
            
            function detach() {
                return new Promise(function (resolve) {
                    $container.empty();
                    resolve();
                });
            }

            function start(params) {
                return new Promise(function (resolve) {
                    $container.html(html.loading());
                
                    // Parse the data type, throwing exceptions if malformed.
                    dataType = params.datatype;
                    var matched = dataType.match(/^(.+?)\.(.+?)-(.+)$/);
                    if (!matched) {
                        throw new Error('Invalid data type ' + dataType);
                    }
                    if (matched.length !== 4) {
                        throw new Error('Invalid data type ' + dataType);
                    }

                    moduleName = matched[1];
                    typeName = matched[1] + '.' + matched[2];
                    typeVersion = matched[3];

                    /* TODO: reign this puppy in... */
                    // This is a promise that isn't returned ... so it just goes off by itself.
                    render();
                    
                    resolve();
                });
            }

            function stop() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            return {
                init: init,
                attach: attach,
                detach: detach,
                start: start,
                stop: stop
            };
        };

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });