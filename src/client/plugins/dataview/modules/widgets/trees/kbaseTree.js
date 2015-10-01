/**
 * @author Bill Riehl <wjriehl@lbl.gov>, Roman Sutormin <rsutormin@lbl.gov>
 * @public
 */
/*global
 define, console
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb.runtime',
    'kb.html',
    'jquery',
    'bluebird',
    'uuid',
    'kb.service.workspace',
    'kb.service.ujs',
    'kb.easytree',
    'kb.jquery.authenticatedwidget'
],
    function (R, html, $, Promise, uuid, Workspace, UserAndJobState, EasyTree) {
        'use strict';
        $.KBWidget({
            name: 'kbaseTree',
            parent: 'kbaseAuthenticatedWidget',
            version: '0.0.1',
            options: {
                treeID: null,
                workspaceID: null,
                treeObjVer: null,
                jobID: null,
                token: null,
                kbCache: null,
                workspaceURL: R.getConfig('services.workspace.url'),
                ujsServiceURL: R.getConfig('services.user_job_state.url'),
                width: 1045,
                height: 600
            },
            treeWsRef: null,
            pref: null,
            timer: null,
            init: function (options) {
                this._super(options);
                this.pref = uuid.v4();

                if (!this.options.treeID) {
                    this.renderError("No tree to render!");
                } else if (!this.options.workspaceID) {
                    this.renderError("No workspace given!");
                } else if (!this.options.kbCache && !this.authToken()) {
                    this.renderError("No cache given, and not logged in!");
                } else {
                    if (!this.options.kbCache) {
                        this.wsClient = new Workspace(this.options.workspaceURL, {token: this.authToken()});
                    }

                    this.$messagePane = $("<div/>")
                        .addClass("kbwidget-message-pane kbwidget-hide-message");
                    this.$elem.append(this.$messagePane);

                    this.render();
                }

                return this;
            },
            render: function () {
                this.loading(false);
                if (this.treeWsRef || this.options.jobID === null) {
                    this.loadTree();
                } else {
                    var self = this;
                    var jobSrv = new UserAndJobState(self.options.ujsServiceURL, {token: this.authToken()});
                    self.$elem.empty();

                    var panel = $('<div class="loader-table"/>');
                    self.$elem.append(panel);
                    var table = $('<table class="table table-striped table-bordered" ' +
            			'style="margin-left: auto; margin-right: auto;" id="' + self.pref + 'overview-table"/>');
                    panel.append(table);
                    table.append('<tr><td>Job was created with id</td><td>' + self.options.jobID + '</td></tr>');
                    table.append('<tr><td>Output result will be stored as</td><td>' + self.options.treeID + '</td></tr>');
                    table.append('<tr><td>Current job state is</td><td id="' + self.pref + 'job"></td></tr>');
                    var timeLst = function (event) {
                        jobSrv.get_job_status(self.options.jobID, function (data) {
                            var status = data[2];
                            var complete = data[5];
                            var wasError = data[6];
                            var tdElem = $('#' + self.pref + 'job');
                            if (status === 'running') {
                                tdElem.html(html.loading(status));
                            } else {
                                tdElem.html(status);
                            }
                            if (complete === 1) {
                                clearInterval(self.timer);
                                if (this.treeWsRef) {
                                    // Just skip all this cause data was already showed through setState()
                                } else {
                                    if (wasError === 0) {
                                        self.loadTree();
                                    }
                                }
                            }
                        }, function (data) {
                            clearInterval(self.timer);
                            if (this.treeWsRef) {
                                // Just skip all this cause data was already showed through setState()
                            } else {
                                var tdElem = $('#' + self.pref + 'job');
                                tdElem.html("Error accessing job status: " + data.error.message);
                            }
                        });
                    };
                    timeLst();
                    self.timer = setInterval(timeLst, 5000);
                }
            },
            loadTree: function () {
                var prom;
                var objId = this.buildObjectIdentity(this.options.workspaceID, this.options.treeID, this.options.treeObjVer, this.treeWsRef);
                if (this.options.kbCache) {
                    prom = this.options.kbCache.req('ws', 'get_objects', [objId]);
                } else {
                    prom = this.wsClient.get_objects([objId]);
                }

                var self = this;

                $.when(prom).done($.proxy(function (objArr) {
                    self.$elem.empty();

                    var canvasDivId = "knhx-canvas-div-" + self.pref;
                    self.canvasId = "knhx-canvas-" + self.pref;
                    self.$canvas = $('<div id="' + canvasDivId + '">')
                        .append($('<canvas id="' + self.canvasId + '">'));

                    if (self.options.height) {
                        self.$canvas.css({'max-height': self.options.height - 85, 'overflow': 'scroll'});
                    }
                    self.$elem.append(self.$canvas);

                    // SKIP FOR NOW
                    //watchForWidgetMaxWidthCorrection(canvasDivId);

                    if (!self.treeWsRef) {
                        var info = objArr[0].info;
                        self.treeWsRef = info[6] + "/" + info[0] + "/" + info[4];
                    }
                    var tree = objArr[0].data;

                    var refToInfoMap = {};
                    var objIdentityList = [];
                    if (tree.ws_refs) {
                        var key;
                        for (key in tree.ws_refs) {
                            objIdentityList.push({ref: tree.ws_refs[key]['g'][0]});
                        }
                    }
                    if (objIdentityList.length > 0) {
                        self.wsClient.get_object_info_new({objects: objIdentityList}, function (data) {
                            var i;
                            for (i in data) {
                                var objInfo = data[i];
                                refToInfoMap[objIdentityList[i].ref] = objInfo;
                            }
                        }, function (err) {
                            console.log("Error getting genomes info:");
                            console.log(err);
                        });
                    }
                    new EasyTree(self.canvasId, tree.tree, tree.default_node_labels, function (node) {
                        if ((!tree.ws_refs) || (!tree.ws_refs[node.id])) {
                            var node_name = tree.default_node_labels[node.id];
                            if (node_name.indexOf('/') > 0) {  // Gene label
                                /* TODO: reroute #genes to #dataview */
                                var url = "#genes/" + self.options.workspaceID + "/" + node_name;
                                window.open(url, '_blank');
                            }
                            return;
                        }
                        var ref = tree.ws_refs[node.id]['g'][0];
                        var objInfo = refToInfoMap[ref];
                        if (objInfo) {
                            var url = "#dataview/" + objInfo[7] + "/" + objInfo[1];
                            window.open(url, '_blank');
                        }
                    }, function (node) {
                        if (node.id && node.id.indexOf("user") === 0) {
                            return "#0000ff";
                        }
                        return null;
                    });
                    self.loading(true);
                }, this));
                $.when(prom).fail($.proxy(function (error) {
                    this.renderError(error);
                }, this));
            },
            renderError: function (error) {
                var errString = "Sorry, an unknown error occurred";
                if (typeof error === "string") {
                    errString = error;
                } else if (error.error && error.error.message) {
                    errString = error.error.message;
                }

                var $errorDiv = $("<div>")
                    .addClass("alert alert-danger")
                    .append("<b>Error:</b>")
                    .append("<br>" + errString);
                this.$elem.empty();
                this.$elem.append($errorDiv);
            },
            getData: function () {
                return {
                    type: 'Tree',
                    id: this.options.treeID,
                    workspace: this.options.workspaceID,
                    title: 'Tree'
                };
            },
            buildObjectIdentity: function (workspaceID, objectID, objectVer, wsRef) {
                var obj = {};
                if (wsRef) {
                    obj['ref'] = wsRef;
                } else {
                    if (/^\d+$/.exec(workspaceID)) {
                        obj['wsid'] = workspaceID;
                    } else {
                        obj['workspace'] = workspaceID;
                    }

                    // same for the id
                    if (/^\d+$/.exec(objectID)) {
                        obj['objid'] = objectID;
                    } else {
                        obj['name'] = objectID;
                    }

                    if (objectVer) {
                        obj['ver'] = objectVer;
                    }
                }
                return obj;
            },
            loading: function (doneLoading) {
                if (doneLoading) {
                    this.hideMessage();
                } else {
                    this.showMessage(html.loading());
                }
            },
            showMessage: function (message) {
                var span = $("<span/>").append(message);

                this.$messagePane.append(span);
                this.$messagePane.show();
            },
            hideMessage: function () {
                this.$messagePane.hide();
                this.$messagePane.empty();
            },
            getState: function () {
                var self = this;
                var state = {
                    treeWsRef: self.treeWsRef
                };
                return state;
            },
            loadState: function (state) {
                var self = this;
                if (state && state.treeWsRef) {
                    self.treeWsRef = state.treeWsRef;
                    self.render();
                }
            }

        });
    });