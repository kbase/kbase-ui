/*global define*/
/*jslint white: true*/
define([
    'jquery',
    'underscore',
    'bluebird',
    'handlebars',
    'kb/service/client/workspace',
    'kb/service/client/narrativeMethodStore',
    'kb/service/utils',
    'marked',
    'text!../content/welcome-cell-content.md'
],
    function ($, _, Promise, Handlebars, Workspace, NarrativeMethodStore, serviceUtils, marked, welcomeCellContent) {
        'use strict';

        var KB_CELL = 'kb-cell',
            KB_TYPE = 'type',
            KB_APP_CELL = 'kb_app',
            KB_FUNCTION_CELL = 'function_input',
            KB_OUTPUT_CELL = 'function_output',
            KB_ERROR_CELL = 'kb_error',
            KB_CODE_CELL = 'kb_code',
            KB_STATE = 'widget_state';

        // TODO: not sure why the funny business here...
        // !! copied from kbaseNarrativeWorkspace !!
        function safeJSONStringify(string) {
            var esc = function (s) {
                return s.replace(/'/g, "&apos;")
                    .replace(/"/g, "&quot;");
            };
            return JSON.stringify(string, function (key, value) {
                return (typeof (value) === 'string') ? esc(value) : value;
            });
        }

        // !! copied from kbaseNarrativeWorkspace !!
        function uuidgen() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function factory(config) {
            var runtime = config.runtime,
                workspaceClient = new Workspace(runtime.getConfig('services.workspace.url'), {
                    token: runtime.service('session').getAuthToken()
                }),
                narrativeMethodStore = new NarrativeMethodStore(runtime.getConfig('services.narrative_method_store.url'), {
                    token: runtime.service('session').getAuthToken()
                }), introHtml;

            // Compile the intro cell html as an object level value.
            // We could promote this to module level, but we need to runtime
            // object here for the template context.
            // We should be able to compile this with just the load-time
            // configuration, but we need to work out the mechanics of that.
            introHtml = Handlebars.compile(welcomeCellContent)({
                config: runtime.rawConfig()
            });

            function copy_to_narrative(ws_id, importData) {
                return Promise.try(function () {
                    // 5) now we copy everything that we need
                    if (!importData) {
                        return;
                    }
                    var objectsToCopy = importData.map(function (item) {
                        return {ref: item};
                    });
                    // we need to get obj info so that we can preserve names.. annoying that ws doesn't do this!
                    return workspaceClient.get_object_info_new({
                        objects: objectsToCopy,
                        includeMetadata: 0
                    })
                        .then(function (infoList) {
                            return infoList.map(function (item) {

                                var objectInfo = serviceUtils.object_info_to_object(item);
                                return workspaceClient.copy_object({
                                    from: {ref: objectInfo.ref}, //!! assume same ordering
                                    to: {wsid: ws_id, name: objectInfo.name}
                                });
                            });
                        })
                        .then(function (promises) {
                            return Promise.all(promises);
                        });
                });

            }

            function completeNewNarrative(workspaceId, objectId, importData) {
                // 4) better to keep the narrative perm id instead of the name
                return workspaceClient.alter_workspace_metadata({
                    wsi: {id: workspaceId},
                    new : {narrative: String(objectId), is_temporary: 'true'}
                })
                    .then(function () {
                        //should really do this first - fix later
                        return copy_to_narrative(workspaceId, importData);
                    });
            }

            function getMostRecentNarrative() {
                // get the full list of workspaces
                return workspaceClient.list_workspace_info({
                    owners: [runtime.service('session').getUsername()]
                })
                    .then(function (wsList) {
                        var workspaces = wsList
                            .map(function (workspaceInfo) {
                                return serviceUtils.workspaceInfoToObject(workspaceInfo);
                            })
                            .filter(function (workspaceInfo) {
                                if (workspaceInfo.metadata && workspaceInfo.metadata.narrative) {
                                    return true;
                                }
                                return false;
                            });

                        if (workspaces.length === 0) {
                            return null;
                        }

                        workspaces.sort(function (a, b) {
                            if (a.moddate > b.moddate) {
                                return -1;
                            }
                            if (a.moddate < b.moddate) {
                                return 1;
                            }
                            return 0;
                        });
                        var workspaceInfo = workspaces[0],
                            ref = [workspaceInfo.id, workspaceInfo.metadata.narrative].join('/');

                        return workspaceClient.get_object_info_new({
                            objects: [{ref: ref}],
                            includeMetadata: 1,
                            ignoreErrors: 1
                        })
                            .then(function (objList) {
                                return({
                                    workspaceInfo: workspaceInfo,
                                    narrativeInfo: serviceUtils.objectInfoToObject(objList[0])
                                });
                            });
                    });
            }

            function discardTempNarrative(params, resolve, fail) {
            }

            function cleanTempNarratives(params, resolve, fail) {
            }


            /*
             *      cells : [
             *          { app: app_id },
             *          { method: method_id },
             *          { markdown: markdown },
             *          { code: code }
             *      ],
             *      parameters : [
             *          {
             *              cell: n,           // indicates index in the cell
             *              step_id: id,
             *              parameter_id: id,
             *              value: value
             *          }
             *      ],
             */
            function buildAppCell(pos, spec, params) {
                var cellId = 'kb-cell-' + pos + '-' + uuidgen(),
                    cell = {
                        cell_type: 'markdown',
                        source: "<div id='" + cellId + "'></div>" +
                            "\n<script>" +
                            "$('#" + cellId + "').kbaseNarrativeAppCell({'appSpec' : '" + safeJSONStringify(spec) + "', 'cellId' : '" + cellId + "'});" +
                            "</script>",
                        metadata: {}
                    },
                cellInfo = {},
                    widgetState = [];


                cellInfo[KB_TYPE] = KB_APP_CELL;
                cellInfo.app = spec;
                if (params) {
                    var steps = {};
                    for (var i = 0; i < params.length; i++) {
                        var stepid = 'step_' + params[i][0];
                        if (!(stepid in steps)) {
                            steps[stepid] = {};
                            steps[stepid]['inputState'] = {};
                        }
                        steps[stepid]['inputState'][params[i][1]] = params[i][2];
                    }
                    var state = {state: {step: steps}};
                    widgetState.push(state);
                }
                cellInfo[KB_STATE] = widgetState;
                cell.metadata[KB_CELL] = cellInfo;
                return cell;
            }

            function buildMethodCell(pos, spec, params) {
                var cellId = 'kb-cell-' + pos + '-' + uuidgen(),
                    cell = {
                        cell_type: 'markdown',
                        source: "<div id='" + cellId + "'></div>" +
                            "\n<script>" +
                            "$('#" + cellId + "').kbaseNarrativeMethodCell({'method' : '" + safeJSONStringify(spec) + "'});" +
                            "</script>",
                        metadata: {}
                    },
                cellInfo = {
                    method: spec,
                    widget: spec.widgets.input
                };
                cellInfo[KB_TYPE] = KB_FUNCTION_CELL;

                var widgetState = [];
                if (params) {
                    var wparams = {};
                    params.forEach(function (param) {
                        wparams[param[1]] = param[2];
                    });
                    widgetState.push({state: wparams});
                }
                cellInfo[KB_STATE] = widgetState;
                cell.metadata[KB_CELL] = cellInfo;
                return cell;
            }



            function gatherCellData(cells, specMapping, parameters) {
                var cell_data = [],
                    cellCount = 0;
                if (cells && cells.length > 0) {
                    cells.forEach(function (cell) {
                        cellCount += 1;
                        if (cell.app) {
                            //this will only work with a 1 app narrative
                            cell_data.push(buildAppCell(cell_data.length, specMapping.apps[cell.app], parameters));
                        } else if (cell.method) {
                            //this will only work with a 1 method narrative
                            cell_data.push(buildMethodCell(cell_data.length, specMapping.methods[cell.method], parameters));
                        } else if (cell.markdown) {
                            cell_data.push({cell_type: 'markdown', source: cell.markdown, metadata: {}});
                        } else {
                            throw {
                                message: 'cannot add cell #' + String(cellCount - 1) + ', unrecognized cell content'
                            };
                        }
                    });
                } else {
                    cell_data.push({cell_type: 'markdown', source: introHtml, metadata: {}});
                }
                return cell_data;
            }


            /* populates the app/method specs */
            function fetchSpecs(cells) {
                return Promise.try(function () {
                    if (!cells) {
                        return {};
                    }
                    var appSpecIds = [],
                        methodSpecIds = [],
                        specMapping = {apps: {}, methods: {}};

                    // First create lists of just app and method ids. We use these
                    // to query the method store for the specs for apps and methods.
                    cells.forEach(function (cell) {
                        if (cell.app) {
                            appSpecIds.push(cell.app);
                        } else if (cell.method) {
                            methodSpecIds.push(cell.method);
                        }
                    });

                    return narrativeMethodStore.get_app_spec({ids: appSpecIds})
                        .then(function (appSpecs) {
                            appSpecs.forEach(function (spec) {
                                var id = appSpecIds.shift();
                                specMapping.apps[id] = spec;
                            });
                            return narrativeMethodStore.get_method_spec({ids: methodSpecIds});
                        })
                        .then(function (methodSpecs) {
                            methodSpecs.forEach(function (spec) {
                                var id = methodSpecIds.shift();
                                specMapping.methods[id] = spec;
                            });
                            return specMapping;
                        });
                });
            }

            /* private method to setup the narrative object,
             returns [narrative, metadata]
             */
            function fetchNarrativeObjects(ws_name, cells, parameters) {
                // first thing first- we need to grap the app/method specs
                return fetchSpecs(cells)
                    .then(function (specMapping) {
                        // now we can create the metadata and populate the cells
                        var metadata = {
                            job_ids: {methods: [], apps: [], job_usage: {'queue_time': 0, 'run_time': 0}},
                            format: 'ipynb',
                            creator: runtime.service('session').getUsername(),
                            ws_name: ws_name,
                            name: 'Untitled',
                            type: 'KBaseNarrative.Narrative',
                            description: '',
                            data_dependencies: []
                        },
                        cellData = gatherCellData(cells, specMapping, parameters),
                            narrativeObject = {
                                nbformat_minor: 0,
                                cells: cellData,
                                metadata: metadata,
                                nbformat: 4
                            },
                        // setup external string to string metadata for the WS object
                        metadataExternal = {};
                        Object.keys(metadata).forEach(function (key) {
                            if (typeof metadata[key] === 'string') {
                                metadataExternal[key] = metadata[key];
                            } else {
                                metadataExternal[key] = JSON.stringify(metadata[key]);
                            }
                        });
                        return [narrativeObject, metadataExternal];
                    });
            }


            function buildAppCell(pos, spec, params) {
                var cellId = 'kb-cell-' + pos + '-' + uuidgen(),
                    cell = {
                        cell_type: 'markdown',
                        source: "<div id='" + cellId + "'></div>" +
                            "\n<script>" +
                            "$('#" + cellId + "').kbaseNarrativeAppCell({'appSpec' : '" + safeJSONStringify(spec) + "', 'cellId' : '" + cellId + "'});" +
                            "</script>",
                        metadata: {}
                    },
                cellInfo = {},
                    widgetState = [];


                cellInfo[KB_TYPE] = KB_APP_CELL;
                cellInfo.app = spec;
                if (params) {
                    var steps = {};
                    for (var i = 0; i < params.length; i++) {
                        var stepid = 'step_' + params[i][0];
                        if (!(stepid in steps)) {
                            steps[stepid] = {};
                            steps[stepid]['inputState'] = {};
                        }
                        steps[stepid]['inputState'][params[i][1]] = params[i][2];
                    }
                    var state = {state: {step: steps}};
                    widgetState.push(state);
                }
                cellInfo[KB_STATE] = widgetState;
                cell.metadata[KB_CELL] = cellInfo;
                return cell;
            }

            function buildMethodCell(pos, spec, params) {
                var cellId = 'kb-cell-' + pos + '-' + uuidgen(),
                    cell = {
                        cell_type: 'markdown',
                        source: "<div id='" + cellId + "'></div>" +
                            "\n<script>" +
                            "$('#" + cellId + "').kbaseNarrativeMethodCell({'method' : '" + safeJSONStringify(spec) + "'});" +
                            "</script>",
                        metadata: {}
                    },
                cellInfo = {};
                cellInfo[KB_TYPE] = KB_FUNCTION_CELL;
                cellInfo['method'] = spec;
                var widgetState = [];
                if (params) {
                    var wparams = {};
                    params.forEach(function (param) {
                        wparams[param[1]] = param[2];
                    });
                    var state = {state: wparams};
                    widgetState.push(state);
                }
                cellInfo[KB_STATE] = widgetState;
                cellInfo.widget = spec.widgets.input;
                cell.metadata[KB_CELL] = cellInfo;
                return cell;
            }

            // Do we really need a guard here? If there is no kb.urls, the deploy is pretty broken...
            //var introText = _.template(introTemplate)({
            //    docBaseUrl: runtime.getConfig('resources.docSite.base.url')
            //});

            function createTempNarrative(params) {
                return Promise.try(function () {
                    var id = (new Date()).getTime(),
                        workspaceName = runtime.service('session').getUsername() + ':' + id,
                        narrativeName = 'Narrative.' + id,
                        newWorkspaceInfo,
                        returnData;

                    // 1 - create ws
                    return workspaceClient.create_workspace({
                        workspace: workspaceName,
                        description: ''
                    })
                        .then(function (ws_info) {
                            newWorkspaceInfo = serviceUtils.workspaceInfoToObject(ws_info);
                            // 2 - create the Narrative object
                            return fetchNarrativeObjects(workspaceName, params.cells, params.parameters);
                        })
                        .spread(function (narrativeObject, metadataExternal) {
                            // 3 - save the Narrative object
                            return workspaceClient.save_objects({
                                workspace: workspaceName,
                                objects: [{
                                        type: 'KBaseNarrative.Narrative',
                                        data: narrativeObject,
                                        name: narrativeName,
                                        meta: metadataExternal,
                                        provenance: [{
                                                script: 'NarrativeManager.js',
                                                description: 'Created new ' +
                                                    'Workspace/Narrative bundle.'
                                            }],
                                        hidden: 0
                                    }]
                            });
                        })
                        .then(function (obj_info_list) {
                            // NB, there is only one so just use the first element.
                            var objectInfo = serviceUtils.objectInfoToObject(obj_info_list[0]);
                            returnData = {
                                workspaceInfo: newWorkspaceInfo,
                                narrativeInfo: objectInfo
                            };
                            return completeNewNarrative(newWorkspaceInfo.id, objectInfo.id, params.importData);
                        })
                        .then(function () {
                            return returnData;
                        });
                });
            }

            return {
                createTempNarrative: createTempNarrative,
                getMostRecentNarrative: getMostRecentNarrative
            };
        }

        // simple factory pattern.
        return factory;

    });
