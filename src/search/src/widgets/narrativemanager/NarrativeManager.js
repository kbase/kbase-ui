/**
 *
 *
 *  options should be:
 *      ws_url: ...           
 *      nms_url: ...
 *
 */
var NarrativeManager = function(options, auth, auth_cb) {

    // setup URLs and Clients
    if (!options) {
        console.error("NarrativeManager: options must be defined.");
        return;
    }
    this.config = {};
    this.config.ws_url = null;
    this.config.nms_url = null;
    if (options.ws_url) { this.config.ws_url  = options.ws_url; }
    else if (window.kbconfig && window.kbconfig.urls) {
        this.config.ws_url = window.kbconfig.urls.workspace;
    }
    if (options.nms_url) { this.config.nms_url  = options.nms_url; }
    else if (window.kbconfig && window.kbconfig.urls) {
        this.config.nms_url = window.kbconfig.urls.narrative_method_store;
    }
    
    if (typeof(this.config.ws_url) != "string" || this.config.ws_url.trim().length === 0) {
        this.config.ws_url = "https://kbase.us/services/ws";
    }
    if (typeof(this.config.nms_url) != "string" || this.config.nms_url.trim().length === 0) {
        this.config.nms_url = "https://kbase.us/services/narrative_method_store/rpc";
    }
    this.config.auth    = auth ? auth : { 'token' : '', 'user_id' : ''};
    if (!auth.user_id) {
        if (auth.token) {
            this.config.auth.user_id = auth.token.split('|')[0].split('=')[1];
        }
    }
    this.user_id = this.config.auth.user_id;
    this.config.auth_cb = auth_cb;

    this.ws = new Workspace(this.config.ws_url, this.config.auth, this.config.auth_cb);
    this.nms = new NarrativeMethodStore(this.config.nms_url, this.config.auth, this.config.auth_cb);
    
    /**
     *  creates a new Narrative in the single Narrative, single WS approach
     *
     *  // all are optional ...
     *  params =
     *  {
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
     *      importData : [
     *          {
     *               ref: ws_reference,  
     *               newName : name
     *          },
     *          ...
     *      ]
     *  }
     *
     *  _callback = function(info) {
     *
     *      info.ws_info = [ .. ]
     *      info.nar_info = [ .. ]
     *      info.object_info = [ ws_reference : [ .. ] ]
     *      
     *  }
     */
    this.createTempNarrative = function(params, _callback, _error_callback) {
        var self = this;
        var id = new Date().getTime();
        var ws_name = this.user_id + ":" + id;
        var nar_name = "Narrative."+id;
        
        console.log("creating " + nar_name);
        console.log(params);
        
        // 1 - create ws
        self.ws.create_workspace(
            {
                workspace: ws_name,
                description: ""
            },
            function(ws_info) {
                console.log("workspace created:");
                console.log(ws_info);
                
                // 2 - create the Narrative object
                var narObjs = self._buildNarrativeObjects(
                    ws_name, params.cells, params.parameters,
                    function(narrativeObject, metadataExternal) {
                        // 3 - save the Narrative object
                        self.ws.save_objects(
                            {
                                workspace: ws_name,
                                objects: [{
                                    type: "KBaseNarrative.Narrative",
                                    data: narrativeObject,
                                    name: nar_name,
                                    meta: metadataExternal,
                                    provenance: [
                                        {
                                            script: "NarrativeManager.js",
                                            description: "Created new " +
                                                "Workspace/Narrative bundle."
                                        }
                                    ],
                                    hidden:0
                                }]
                            },
                            function(obj_info_list) {
                                console.log('saved narrative:');
                                console.log(obj_info_list[0]);
                                var returnData = {ws_info: ws_info,
                                                  nar_info: obj_info_list[0]};
                                self._complete_new_narrative(
                                        ws_info[0],          //ws id
                                        obj_info_list[0][0], //obj id
                                        params.importData,
                                        function() {
                                            _callback(returnData)
                                        },
                                        _error_callback);
                            }, function (error) {
                                console.error(error);
                                if(_error_callback) {
                                    _error_callback(error.error);
                                }
                            });
                    },
                    _error_callback
                );
            },
            function(error) {
                console.error(error);
                if(_error_callback) {
                    _error_callback(error.error);
                }
            }
        );
    };
    
    this._complete_new_narrative = function(ws_id, obj_id, importData,
            _callback, _error_callback) {
        var self = this;
        // 4) better to keep the narrative perm id instead of the name
        self.ws.alter_workspace_metadata(
            {wsi: {id: ws_id},
             'new': {narrative: obj_id + '', is_temporary: 'true'}
            },
            function() {
                //should really do this first - fix later
                    self._copy_to_narrative(
                            ws_id,
                            importData,
                            _callback,
                            _error_callback
                    )
            },
            function(error) {
                console.error(error);
                if (_error_callback) {
                    _error_callback(error.error);
                }
            }
        );
    }

     
    this._copy_to_narrative = function(ws_id, importData,
            _callback, _error_callback) {
        var self = this;
        // 5) now we copy everything that we need
        if (importData != null &&
                importData != false) {
            var copyobjs = [];
            for(var cj = 0; cj < importData.length; cj++) {
                copyobjs.push({ref: importData[cj]});
            }
//            
            // we need to get obj info so that we can preserve names.. annoying that ws doesn't do this!
            self.ws.get_object_info(copyobjs,0,
                function(infoList) {
                    var copyJobs = [];
                    for(var il = 0; il < infoList.length; il++) {
                        copyJobs.push(self.ws.copy_object(
                                {from: {ref: importData[il]}, //!! assume same ordering
                                 to: {wsid: ws_id, name: infoList[il][1]}
                                },
                                function(info) {
                                    console.log('copied');
                                    console.log(info);
                                },
                                function(error){
                                    if (_error_callback) {
                                        _error_callback(error.error);
                                    }
                                }
                            )
                        )
                    }
                    $.when.apply($, copyJobs).done(function() {
                        _callback();
                    });
                },
                function(error) {
                    console.error(error);
                    if(_error_callback) {
                        _error_callback(error.error);
                    }
                });
        } else {
            _callback();
        }
    }
    
    /* looks at the user workspaces, determines which was last modified, and
     * returns this object:
     *
     * {
     *      
     *       last_narrative: {
     *                           ws_info: ...
     *                           nar_info: ...
     *                       }
     *   }
     * if there are no available narratives, this will set last_narrative:null
     *
     */
    this.detectStartSettings = function(_callback, _error_callback) {
        var self=this;
        var emptyResult = {last_narrative:null};
        
        // get the full list of workspaces
        
        self.ws.list_workspace_info(
            {owners: [self.user_id]}, //only check ws owned by user
            function(wsList) {
                var workspaces = [];
                /*WORKSPACE INFO
                    0: ws_id id
                    1: ws_name workspace
                    2: username owner
                    3: timestamp moddate,
                    4: int object
                    5: permission user_permission
                    6: permission globalread,
                    7: lock_status lockstat
                    8: usermeta metadata*/
                for (var i=0; i<wsList.length; i++) {
                    if (wsList[i][8]) { // must have metadata or else we skip
                        // we could exclude temporary narratives in the future...
                        /*if (wsList[i][8].is_temporary) { if (wsList[i][8].is_temporary === 'true') { continue; } } */
                        //must have the new narrative tag, or else we skip
                        if (wsList[i][8].narrative) {
                            workspaces.push(wsList[i]);
                        }
                    }
                }
                if (workspaces.length>0) {
                    // we have existing narratives, so we load 'em up
                    workspaces.sort(function(a,b) { //sort by date
                        if (a[3] > b[3]) return -1;
                        if (a[3] < b[3]) return 1;
                        return 0;
                    });
                    self._findRecentValidNarrative(workspaces, 0, _callback,
                            _error_callback);
                } else {
                    _callback(emptyResult);
                }
            },
            function (error) {
                if (_error_callback) {
                    _error_callback(error.error);
                }
                console.error(error);
            });
    };
    
    this._findRecentValidNarrative = function(workspaces, index,
            _callback, _error_callback) {
        var self = this;
        if (index >= workspaces.length) {
            _callback({last_narrative: null});
            return;
        }
        var ref = workspaces[index][0] + "/" + workspaces[index][8].narrative;
        self.ws.get_object_info_new(
                {objects: [{ref: ref}],
                 includeMetadata: 1,
                 ignoreErrors: 1
                 },
                function (objList) {
                     //this case should generally never happen, so we just
                     //check one workspace at a time to keep the load light
                     if (objList[0] == null) {
                         return self._findRecentValidNarrative(
                                 workspaces, index + 1,
                                 _callback, _error_callback);
                     } else {
                         _callback({last_narrative:
                                     {ws_info: workspaces[index],
                                      nar_info: objList[0]
                                     }
                         });
                     }
                },
                function (error) {
                     _error_callback(error.error);
                }
        )
    },
    
    
    this.discardTempNarrative = function(params, _callback, _error_callback) {
    };
    
    
    /**
     * 
     */
    this.cleanTempNarratives = function(params, _callback, _error_callback) {
    };
    
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
    
    /* private method to setup the narrative object,
    returns [narrative, metadata]
    */
    this._buildNarrativeObjects = function(ws_name, cells, parameters, _callback, _error_callback) {
        var self = this;
        // first thing first- we need to grap the app/method specs
        self._getSpecs(cells,
            function() {
                // now we can create the metadata and populate the cells
                var metadata = {
                    job_ids: { methods:[], apps:[], job_usage: {'queue_time':0, 'run_time':0} },
                    format:'ipynb',
                    creator:self.user_id,
                    ws_name:ws_name,
                    name:"Untitled",
                    type:"KBaseNarrative.Narrative",
                    description:"",
                    data_dependencies:[]
                };
                var cell_data = [];
                if (cells) {
                    if (cells.length>0) {
                        for(var c=0; c<cells.length; c++) {
                            if (cells[c].app) {
                                var appCell = self._buildAppCell(
                                        cell_data.length,
                                        self._specMapping.apps[cells[c].app],
                                        parameters); //this will only work with a 1 app narrative
                                cell_data.push(appCell);
                            } else if (cells[c].method) {
                                var methodCell = self._buildMethodCell(
                                        cell_data.length, 
                                        self._specMapping.methods[cells[c].method],
                                        parameters); //this will only work with a 1 method narrative
                                cell_data.push(methodCell);
                            } else if (cells[c].markdown) {
                                cell_data.push({
                                    cell_type: 'markdown',
                                    source: cells[c].markdown,
                                    metadata: {}
                                });
                            }
                            //else if (cells[c].code) { }
                            else {
                                console.error('cannot add cell '+c+', unrecognized cell content');
                                console.error(cells[c]);
                                if(_error_callback) {
                                    _error_callback({message: 'cannot add cell '
                                        + c + ', unrecognized cell content'});
                                }
                            }
                        }
                    } else {
                        cell_data.push(
                            {
                                cell_type: 'markdown',
                                source: self.introText,
                                metadata: { }
                            });
                    }
                }
                
                var narrativeObject = {
                    nbformat_minor: 0,
                    worksheets: [ {
                        cells: cell_data,
                        metadata: {}
                    }],
                    metadata: metadata,
                    nbformat:3
                };
                
                // setup external string to string metadata for the WS object
                var metadataExternal = {};
                for(var m in metadata) {
                    if (metadata.hasOwnProperty(m)) {
                        if (typeof metadata[m] === 'string') {
                            metadataExternal[m] = metadata[m];
                        } else {
                            metadataExternal[m] = JSON.stringify(metadata[m]);
                        }
                    }
                }
                _callback(narrativeObject, metadataExternal);
        
            },
            _error_callback
            );
    };
    
    this._buildAppCell = function(pos,spec, params) {
        var cellId = 'kb-cell-'+pos+'-'+this._uuidgen();
        var cell = {
            cell_type: 'markdown',
            source: "<div id='" + cellId + "'></div>" +
                    "\n<script>" +
                    "$('#" + cellId + "').kbaseNarrativeAppCell({'appSpec' : '" + this._safeJSONStringify(spec) + "', 'cellId' : '" + cellId + "'});" +
                    "</script>",
            metadata: { }
        };
        var cellInfo = {};
        cellInfo[this.KB_TYPE] = this.KB_APP_CELL;
        cellInfo['app'] = spec;
        var widgetState = [];
        if (params) {
            var steps = {};
            for (var i = 0; i < params.length; i++) {
                var stepid = 'step_' + params[i][0];
                if (!(stepid in steps)) {
                    steps[stepid] = {}
                    steps[stepid]['inputState'] = {}
                }
                steps[stepid]['inputState'][params[i][1]] = params[i][2];
            }
            var state = {state: {step: steps}};
            widgetState.push(state);
        }
        cellInfo[this.KB_STATE] = widgetState;
        cell.metadata[this.KB_CELL] = cellInfo;
        return cell;
    };
    
    this._buildMethodCell = function(pos,spec, params) {
        var cellId = 'kb-cell-'+pos+'-'+this._uuidgen();
        var cell = {
            cell_type: 'markdown',
            source: "<div id='" + cellId + "'></div>" +
                    "\n<script>" +
                    "$('#" + cellId + "').kbaseNarrativeMethodCell({'method' : '" + this._safeJSONStringify(spec) + "'});" +
                    "</script>",
            metadata: { }
        };
        var cellInfo = {};
        cellInfo[this.KB_TYPE] = this.KB_FUNCTION_CELL;
        cellInfo['method'] = spec;
        var widgetState = [];
        if (params) {
            var wparams = {};
            for (var i = 0; i < params.length; i++) {
                wparams[params[i][1]] = params[i][2];
            }
            var state = {state: wparams};
            widgetState.push(state);
        }
        cellInfo[this.KB_STATE] = widgetState;
        cellInfo['widget'] = spec.widgets.input;
        cell.metadata[this.KB_CELL] = cellInfo;
        return cell;
    };
    
    // map the app ID to the spec, map method id to spec
    this._specMapping = {
        apps : {},
        methods : {}
    };
    /** populates the app/method specs **/
    this._getSpecs = function(cells, _callback, _error_callback) {
        var self = this;
        if (cells) {
            var appSpecIds = []; var methodSpecIds = [];
            this._specMapping = { apps : {}, methods : {} }
            for(var c=0; c<cells.length; c++) {
                if (cells[c].app) {
                    appSpecIds.push(cells[c].app);
                } else if (cells[c].method) {
                    methodSpecIds.push(cells[c].method);
                }
            }
            var getSpecsJobs = [];
            if (appSpecIds.length>0) {
                getSpecsJobs.push(
                    self.nms.get_app_spec({ids:appSpecIds},
                        function(appSpecs) {
                            for (var a=0; a<appSpecs.length; a++) {
                                self._specMapping.apps[appSpecIds[a]] = appSpecs[a];
                            }
                        },
                        function(error) {
                            console.error("error getting app specs:");
                            console.error(error);
                            if(_error_callback) { _error_callback(error.error); }
                        }));
            }
            if (methodSpecIds.length>0) { // currently ununsed by kbaseNarrativeManager
                getSpecsJobs.push(
                    self.nms.get_method_spec({ids:methodSpecIds},
                        function(methodSpecs) {
                            for (var a=0; a<methodSpecs.length; a++) {
                                self._specMapping.methods[methodSpecIds[a]] = methodSpecs[a];
                            }
                        },
                        function(error) {
                            console.error("error getting method specs:");
                            console.error(error);
                            if(_error_callback) { _error_callback(error.error); }
                        }));
            }
            
            if (getSpecsJobs.length>0) {
                $.when.apply($, getSpecsJobs).done(function() {
                    _callback();
                });
            } else {
                _callback();
            }
        } else {
            _callback();
        }
    };
    
    
    
    // !! copied from kbaseNarrativeWorkspace !!
    this._safeJSONStringify = function(string) {
        var esc = function(s) { 
            return s.replace(/'/g, "&apos;")
                    .replace(/"/g, "&quot;");
        };
        return JSON.stringify(string, function(key, value) {
            return (typeof(value) === 'string') ? esc(value) : value;
        });
    };
    // !! copied from kbaseNarrativeWorkspace !!
    this._uuidgen = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);});
    };
    
    // !! copied from kbaseNarrativeWorkspace !!
    this.KB_CELL= 'kb-cell';
    this.KB_TYPE= 'type';
    this.KB_APP_CELL= 'kb_app';
    this.KB_FUNCTION_CELL= 'function_input';
    this.KB_OUTPUT_CELL= 'function_output';
    this.KB_ERROR_CELL= 'kb_error';
    this.KB_CODE_CELL= 'kb_code';
    this.KB_STATE= 'widget_state';
    
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
        s += 'Design and carry out collaborative computational experiments while\n';
        s += 'creating Narratives: interactive, shareable, and reproducible records\n';
        s += 'of your data, computational steps, and thought processes.\n';
        s += '\n';
        s += '<a href="<%= docBaseUrl %>/narrative-guide">learn more...</a>\n';
        s += '\n';
        s += '\n';
        s += 'Get Some Data\n';
        s += '---\n';
        s += '\n';
        s += 'Click the Add Data button in the Data Panel to browse for KBase data or\n';
        s += 'upload your own. Mouse over a data object to add it to your Narrative, and\n';
        s += 'check out more details once the data appears in your list.\n';
        s += '\n';
        s += '<a href="<%= docBaseUrl %>/narrative-guide/explore-data">learn more...</a>\n';
        s += '\n';
        s += '\n';
        s += 'Analyze It\n';
        s += '---\n';
        s += '\n';
        s += 'Browse available analyses that can be run using KBase apps or methods\n';
        s += '(apps are just multi-step methods that make some common analyses more\n';
        s += 'convenient). Select an analysis, fill in the fields, and click Run.\n';
        s += 'Output will be generated, and new data objects will be created and added\n';
        s += 'to your data list. Add to your results by running follow-on apps or methods.\n';
        s += '\n';
        s += '<a href="<%= docBaseUrl %>/narrative-guide/browse-apps-and-methods">learn more...</a>\n';
        s += '\n';
        s += '\n';
        s += 'Save and Share Your Narrative\n';
        s += '---\n';
        s += '\n';
        s += 'Be sure to save your Narrative frequently. When you\'re ready, click\n';
        s += 'the share button above to let collaborators view your analysis steps\n';
        s += 'and results. Or better yet, make your Narrative public and help expand\n';
        s += 'the social web that KBase is building to make systems biology research\n';
        s += 'open, collaborative, and more effective.\n';
        s += '\n';
        s += '<a href="<%= docBaseUrl %>/narrative-guide/share-narratives/">learn more...</a>\n';
        s += '\n';
        s += 'Find Documentation and Help\n';
        s += '---\n';
        s += '\n';
        s += 'For more information, please see the\n';
        s += '<a href="<%= docBaseUrl %>/narrative-guide">Narrative Interface User Guide</a>\n';
        s += 'or the <a href="<%= docBaseUrl %>/tutorials">app/method tutorials</a>.\n';
        s += '\n';
        s += 'Questions? <a href="<%= docBaseUrl %>/contact-us">Contact us</a>!\n';
        s += '\n';
        s += 'Ready to begin adding to your Narrative? You can keep this Welcome cell or\n';
        s += 'delete it with the trash icon in the top right corner.';
        return s;
    }());

    // Do we really need a guard here? If there is no kb.urls, the deploy is pretty broken...
    var docBaseUrl = kb.urls ? kb.urls.docsite.baseUrl : "http://kbase.us";
    this.introText = _.template(introTemplate)({docBaseUrl: docBaseUrl});

};

/*
WORKSPACE INFO
0: ws_id id
1: ws_name workspace
2: username owner
3: timestamp moddate,
4: int object
5: permission user_permission
6: permission globalread,
7: lock_status lockstat
8: usermeta metadata
*/
