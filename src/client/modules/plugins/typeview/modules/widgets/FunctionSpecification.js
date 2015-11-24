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
    'underscore',
    'kb/common/html',
    'kb_service_workspace',
    'kb_typeView_specCommon',
    'google-code-prettify',
    'kb/common/format',
    'datatables_bootstrap'],
    function ($, Promise, _, html, Workspace, specCommon, PR, Format) {
        'use strict';

        // Just take params for now
        /* TODO: use specific arguments */
        var factory = function (config) {

            var mount, container, $container, children = [], runtime = config.runtime;

            var workspace = new Workspace(runtime.getConfig('workspace_url', {
                token: runtime.service('session').getAuthToken()
            }));

            var functionId, moduleName, functionName, functionVersion;



            // tags used in this module.
            var table = html.tag('table'),
                tr = html.tag('tr'),
                th = html.tag('th'),
                td = html.tag('td'),
                a = html.tag('a'),
                div = html.tag('div'),
                pre = html.tag('pre'),
                ul = html.tag('ul'),
                li = html.tag('li');

            function tabTableContent() {
                return table({
                    class: 'table table-striped table-bordered',
                    style: {width: '100%'},
                    'data-attach': 'table'});
            }

            // OVERVIEW Tab
            function overviewTab(data) {
                var username = runtime.service('session').getUsername()
                    
                var matched = data.func_def.match(/-/),
                    funcName = matched[1],
                    funcVersion = matched[2];
                
                var moduleLinks = data.module_vers.map(function (moduleVersion) {
                    var moduleId = moduleName + '.' + moduleVersion;
                    return a({href: '#spec/module/' + moduleId}, moduleVersion);
                });

                return table({class: 'table table-striped table-bordered',
                    style: 'margin-left: auto; margin-right: auto'}, [
                    tr([th('Name'), td(funcName)]),
                    tr([th('Version'), td(funcVersion)]),
                    tr([th('Module version(s)'), td(moduleLinks.join(', '))]),
                    /* TODO: improve date formatting */
                    tr([th('Description'), td(pre({style: {'white-space': 'pre-wrap', 'word-wrap': 'break-word'}}, data.description))])
                ]);
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
                var tableData = data.func_vers.map(function (funcId) {
                    var parsed = funcId.match(/^(.+?)-(.+?)$/),
                        funcName = parsed[1],
                        funcVer = parsed[2];

                    return {
                        name: a({href: '#spec/function/'+funcId}, funcName),
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
                return new Promise(function (resolve, reject) {
                    Promise.resolve(workspace.get_func_info(functionId))
                        .then(function (data) {
                                var tabs = [
                                    {title: 'Overview', id: 'overview', content: overviewTab},
                                    {title: 'Spec-file', id: 'spec', content: specFileTab},
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
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                            //var error = 'Error rendering widget';
                            //console.log(err);
                            //container.html(error);
                        });
                });
            }

            // API
            
            function create() {
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
                    container.empty();
                    resolve();
                });
            }

            function start(params) {
                return new Promise(function (resolve, reject) {
                    $container.html(html.loading());

                    // Parse the data type, throwing exceptions if malformed.
                    functionId = params.functionid;
                    var matched = functionId.match(/^(.+?)-(.+)\.(.+)$/);
                    if (!matched) {
                        throw new Error('Invalid function id ' + functionId);
                    }
                    if (matched.length !== 4) {
                        throw new Error('Invalid function id ' + functionId);
                    }

                    moduleName = matched[1];
                    functionName = matched[2];
                    functionVersion = matched[3];

                    render()
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        });

                });
            }

            function stop() {
                return new Promise(function (resolve) {
                    resolve();
                });
            }

            return {
                create: create,
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