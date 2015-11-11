/*global define*/
/*jslint white: true*/
define([
    'jquery',
    'underscore',
    'bluebird',
    'kb_service_workspace',
    'kb_service_narrativeMethodStore',
    'kb_service_utils'
],
    function ($, _, Promise, Workspace, NarrativeMethodStore, serviceUtils) {
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
                workspace = new Workspace(runtime.getConfig('services.workspace.url'), {
                    token: runtime.service('session').getAuthToken()
                }),
                narrativeMethodStore = new NarrativeMethodStore(runtime.getConfig('services.narrative_method_store.url'), {
                    token: runtime.service('session').getAuthToken()
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
                    return workspace.get_object_info_new({
                        objects: objectsToCopy,
                        includeMetadata: 0
                    })
                        .then(function (infoList) {
                            return infoList.map(function (item) {

                                var objectInfo = serviceUtils.object_info_to_object(item);
                                return workspace.copy_object({
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
                return workspace.alter_workspace_metadata({
                    wsi: {id: workspaceId},
                    new : {narrative: String(objectId), is_temporary: 'true'}
                })
                    .then(function () {
                        //should really do this first - fix later
                        return copy_to_narrative(workspaceId, importData);
                    });
            }

            function findRecentValidNarrative(workspaces) {
                if (!workspaces || workspaces.length === 0) {
                    return null;
                }
                
                var test, workspaceInfo, ref;
                
                while (workspaces.length) {
                    test = workspaces.shift();
                    if (test.metadata && test.metadata.narrative) {
                        workspaceInfo = test;
                    }
                }
                
                if (!workspaceInfo) {
                    console.log('No Narratives found');
                    return null;
                }
                
                ref = [workspaceInfo.id, workspaceInfo.metadata.narrative].join('/');

                return workspace.get_object_info_new({
                    objects: [{ref: ref}],
                    includeMetadata: 1,
                    ignoreErrors: 1
                })
                    .then(function (objList) {
                        // this case should generally never happen, so we just
                        // check one workspace at a time to keep the load light
                        if (objList[0] === null) {
                            return findRecentValidNarrative(workspaces);
                        }
                        return({
                            workspaceInfo: workspaceInfo,
                            narrativeInfo: serviceUtils.objectInfoToObject(objList[0])
                        });
                    });
            }

            function detectStartSettings() {
                // get the full list of workspaces
                return workspace.list_workspace_info({
                    owners: [runtime.service('session').getUsername()]
                })
                    .then(function (wsList) { //only check ws owned by user
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
                        if (workspaces.length > 0) {
                            // we have existing narratives, so we load 'em up
                            workspaces.sort(function (a, b) { //sort by date
                                if (a[3] > b[3]) {
                                    return -1;
                                }
                                if (a[3] < b[3]) {
                                    return 1;
                                }
                                return 0;
                            });
                            var test = findRecentValidNarrative(workspaces);
                            return test;
                        }
                        return null;
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
                            cell_data.push(buildMethodCell(cell_data.length, specMapping.methods[cells.method], parameters));
                        } else if (cell.markdown) {
                            cell_data.push({cell_type: 'markdown', source: cell.markdown, metadata: {}});
                        } else {
                            throw {
                                message: 'cannot add cell #' + String(cellCount - 1) + ', unrecognized cell content'
                            };
                        }
                    });
                } else {
                    cell_data.push({cell_type: 'markdown', source: introText, metadata: {}});
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
                                worksheets: [{
                                        cells: cellData,
                                        metadata: {}
                                    }],
                                metadata: metadata,
                                nbformat: 3
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

            /*
             Note: The source for the template is: NarrativeManager-welcome-cell-content.txt
             Do not change the content here!
             
             See NarrativeManager-welcome-cell-content.txt and /tools/markdown-to-js-string.pl
             E.g.
             
             ../../../tools/markdown-to-js-string.pl < NarrativeManager-welcome-cell-content.txt
             */
            var introTemplate = (function () {
                var s = '';
                s += '![KBase Logo](<%= docBaseUrl %>/wp-content/uploads/2014/11/kbase-logo-web.png)\n';
                s += 'Welcome to the Narrative Interface!\n';
                s += '===\n';
                s += '\n';
                s += 'What\'s a Narrative?\n';
                s += '---\n';
                s += '\n';
                s += 'Design and carry out collaborative computational experiments while  \n';
                s += 'creating Narratives: interactive, shareable, and reproducible records \n';
                s += 'of your data, computational steps, and thought processes.\n';
                s += '\n';
                s += '<a href="<%= docBaseUrl %>/narrative-guide">learn more...</a>\n';
                s += '\n';
                s += '\n';
                s += 'Get Some Data\n';
                s += '---\n';
                s += '\n';
                s += 'Click the Add Data button in the Data Panel to browse for KBase data or \n';
                s += 'upload your own. Mouse over a data object to add it to your Narrative, and  \n';
                s += 'check out more details once the data appears in your list.\n';
                s += '\n';
                s += '<a href="<%= docBaseUrl %>/narrative-guide/explore-data">learn more...</a>\n';
                s += '\n';
                s += '\n';
                s += 'Analyze It\n';
                s += '---\n';
                s += '\n';
                s += 'Browse available analyses that can be run using KBase apps or methods \n';
                s += '(apps are just multi-step methods that make some common analyses more \n';
                s += 'convenient). Select an analysis, fill in the fields, and click Run. \n';
                s += 'Output will be generated, and new data objects will be created and added \n';
                s += 'to your data list. Add to your results by running follow-on apps or methods.\n';
                s += '\n';
                s += '<a href="<%= docBaseUrl %>/narrative-guide/browse-apps-and-methods">learn more...</a>\n';
                s += '\n';
                s += '\n';
                s += 'Save and Share Your Narrative\n';
                s += '---\n';
                s += '\n';
                s += 'Be sure to save your Narrative frequently. When you\'re ready, click  \n';
                s += 'the share button above to let collaborators view your analysis steps \n';
                s += 'and results. Or better yet, make your Narrative public and help expand \n';
                s += 'the social web that KBase is building to make systems biology research \n';
                s += 'open, collaborative, and more effective.\n';
                s += '\n';
                s += '<a href="<%= docBaseUrl %>/narrative-guide/share-narratives/">learn more...</a>\n';
                s += '\n';
                s += 'Find Documentation and Help\n';
                s += '---\n';
                s += '\n';
                s += 'For more information, please see the \n';
                s += '<a href="<%= docBaseUrl %>/narrative-guide">Narrative Interface User Guide</a> \n';
                s += 'or the <a href="<%= docBaseUrl %>/tutorials">app/method tutorials</a>.\n';
                s += '\n';
                s += 'Questions? <a href="<%= docBaseUrl %>/contact-us">Contact us</a>!\n';
                s += '\n';
                s += 'Ready to begin adding to your Narrative? You can keep this Welcome cell or \n';
                s += 'delete it with the trash icon in the top right corner.';
                return s;
            }());

            // Do we really need a guard here? If there is no kb.urls, the deploy is pretty broken...
            var introText = _.template(introTemplate)({
                docBaseUrl: runtime.getConfig('docsite.baseUrl')
            });

            function createTempNarrative(params) {
                return Promise.try(function () {
                    var id = (new Date()).getTime(),
                        workspaceName = runtime.service('session').getUsername() + ':' + id,
                        narrativeName = 'Narrative.' + id,
                        newWorkspaceInfo,
                        returnData;

                    // 1 - create ws
                    return workspace.create_workspace({
                        workspace: workspaceName,
                        description: ''
                    })
                        .then(function (ws_info) {
                            newWorkspaceInfo = serviceUtils.workspaceInfoToObject(ws_info);
                            // 2 - create the Narrative object
                            return fetchNarrativeObjects(workspaceName, params.cells, params.parameters);
                        })
                        .then(function (result) {
                            var narrativeObject = result[0],
                                metadataExternal = result[1];
                            // 3 - save the Narrative object
                            return workspace.save_objects({
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
                            var objectInfo = serviceUtils.objectInfoToObject(obj_info_list[0])
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
                detectStartSettings: detectStartSettings
            };
        }

        // simple factory pattern.
        return factory;

    });