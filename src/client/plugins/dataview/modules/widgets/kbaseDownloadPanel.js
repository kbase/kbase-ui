/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * "Download" panel for each element in data list panel.
 * @author Roman Sutormin <rsutormin@lbl.gov>
 * @public
 */
define([
    'jquery',
    'bluebird',
    'kb.runtime',
    'kb.html',
    'kb.service.workspace',
    'kb.utils',
    'kb.jquery.widget',
],
    function ($, Promise, R, html, WorkspaceService, Utils) {
        'use strict';
        $.KBWidget({
            name: "kbaseDownloadPanel",
            parent: "kbaseWidget",
            version: "1.0.0",
            options: {
                dropdown: null,
                navbar: null,
                params: null
            },
            token: null,
            type: null,
            wsId: null,
            objId: null,
            wsUrl: null,
            transformURL: null,
            ujsURL: null,
            shockURL: null,
            exportURL: null,
            timer: null,
            downloaders: {// type -> {name: ..., external_type: ...[, transform_options: ...[, unzip: <file_ext>]}
                'KBaseGenomes.ContigSet': [{
                        name: 'FASTA',
                        external_type: 'FASTA.DNA.Assembly',
                        transform_options: {
                            "output_file_name": "?.fasta"
                        }
                    }],
                'KBaseGenomes.Genome': [{
                        name: "GENBANK",
                        external_type: 'Genbank.Genome',
                        transform_options: {}
                    }],
                'KBaseAssembly.SingleEndLibrary': [{
                        name: "FASTA/FASTQ",
                        external_type: 'SequenceReads',
                        transform_options: {}
                    }],
                'KBaseAssembly.PairedEndLibrary': [{
                        name: "FASTA/FASTQ",
                        external_type: 'SequenceReads',
                        transform_options: {}
                    }],
                'KBaseFile.SingleEndLibrary': [{
                        name: "FASTA/FASTQ",
                        external_type: 'SequenceReads',
                        transform_options: {}
                    }],
                'KBaseFile.PairedEndLibrary': [{
                        name: "FASTA/FASTQ",
                        external_type: 'SequenceReads',
                        transform_options: {}
                    }],
                'KBaseFBA.FBAModel': [{
                        name: "SBML",
                        external_type: 'SBML.FBAModel',
                        transform_options: {}
                    }, {
                        name: "TSV",
                        external_type: 'TSV.FBAModel',
                        transform_options: {}
                    }, {
                        name: "EXCEL",
                        external_type: 'Excel.FBAModel',
                        transform_options: {}
                    }],
                'KBaseFBA.FBA': [{
                        name: "TSV",
                        external_type: 'TSV.FBA',
                        transform_options: {}
                    }, {
                        name: "EXCEL",
                        external_type: 'Excel.FBA',
                        transform_options: {}
                    }],
                'KBaseBiochem.Media': [{
                        name: "TSV",
                        external_type: 'TSV.Media',
                        transform_options: {}
                    }, {
                        name: "EXCEL",
                        external_type: 'Excel.Media',
                        transform_options: {}
                    }],
                'KBasePhenotypes.PhenotypeSet': [{
                        name: "TSV",
                        external_type: 'TSV.PhenotypeSet',
                        transform_options: {}
                    }],
                'KBasePhenotypes.PhenotypeSimulationSet': [{
                        name: "TSV",
                        external_type: 'TSV.PhenotypeSimulationSet',
                        transform_options: {}
                    }, {
                        name: "EXCEL",
                        external_type: 'Excel.PhenotypeSimulationSet',
                        transform_options: {}
                    }],
                'KBaseGenomes.Pangenome': [{
                        name: 'TSV',
                        external_type: 'TSV.Pangenome',
                        transform_options: {}
                    }, {
                        name: "EXCEL",
                        external_type: 'Excel.Pangenome',
                        transform_options: {}
                    }]
            },
            init: function (options) {
                this._super(options);
                this.wsUrl = R.getConfig('services.workspace.url');
                this.transformURL = R.getConfig('services.transform.url');
                this.ujsURL = R.getConfig('services.user_job_state.url');
                this.shockURL = R.getConfig('services.shock.url');
                this.exportURL = R.getConfig('services.data_import_export.url');
                this.token = R.getAuthToken();
                this.type = null; //this.options.type;
                this.wsId = this.options.params.ws;
                this.objId = this.options.params.obj;
                var self = this;

                var Workspace = new WorkspaceService(this.wsUrl, {
                    token: this.token
                });
                Promise.resolve(Workspace.get_object_info_new({
                    objects: [{
                            ref: this.wsId + '/' + this.objId
                        }]
                }))
                    .then(function (objInfoList) {
                        self.objId = objInfoList[0][1];
                        self.type = objInfoList[0][2].split('-')[0];
                        self.wsId = objInfoList[0][7];
                        self.render();
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    })
                    .done();

                return this;
            },
            render: function () {
                var self = this;
                var downloadPanel = this.$elem;
                downloadPanel.css({
                    'min-width': '260px',
                    'margin-left': '10px'
                });
                var $labeltd = $('<td>').css({
                    'white-space': 'nowrap',
                    'padding': '1px'
                }).append('Export as:');
                var $btnTd = $('<td>').css({
                    'padding': '1px'
                });
                downloadPanel.append($('<table>').css({
                    width: '100%'
                })
                    .append('<tr>')
                    .append($labeltd)
                    .append($btnTd));
                var $cancelButton =
                    $('<button>').addClass('kb-data-list-cancel-btn')
                    .append('Cancel').click(function () {
                    self.stopTimer();
                    $btnTd.find('.kb-data-list-btn').prop('disabled', false);
                    self.$statusDivContent.empty();
                    //downloadPanel.empty();
                });
                var addDownloader = function (descr) {
                    var btn = $('<button>').addClass('kb-data-list-btn')
                        .append(descr.name)
                        .click(function (e) {
                            e.stopPropagation();
                            $btnTd.find('.kb-data-list-btn').prop('disabled', true);
                            self.runDownloader(self.type, self.wsId, self.objId, descr, function (ok) {
                                if (ok)
                                    $cancelButton.click();
                            });
                        });
                    $btnTd.append(btn);
                };
                var downloaders = self.prepareDownloaders(self.type, self.wsId, self.objId);
                for (var downloadPos in downloaders)
                    addDownloader(downloaders[downloadPos]);
                var jsonBtn = $('<button>').addClass('kb-data-list-btn')
                    .append('JSON')
                    .click(function (e) {
                        var url = self.exportURL + '/download?ws=' + encodeURIComponent(self.wsId) +
                            '&id=' + encodeURIComponent(self.objId) + '&token=' + encodeURIComponent(self.token) +
                            '&url=' + encodeURIComponent(self.wsUrl) + '&wszip=1' +
                            '&name=' + encodeURIComponent(self.objId + '.JSON.zip');
                        self.downloadFile(url);
                    });
                $btnTd.append(jsonBtn);
                $btnTd.append('<br>').append($cancelButton);
                self.$statusDiv = $('<div>').css({
                    'margin': '15px'
                });
                self.$statusDivContent = $('<div>');
                self.$statusDiv.append(self.$statusDivContent);
                downloadPanel.append(self.$statusDiv.hide());
            },
            prepareDownloaders: function (type, wsId, objId) {
                var descrList = this.downloaders[type];
                var ret = [];
                for (var descrPos in descrList) {
                    var descr = descrList[descrPos];
                    var retDescr = {
                        name: descr.name,
                        external_type: descr.external_type,
                        unzip: descr.unzip
                    };
                    ret.push(retDescr);
                    if (descr.transform_options) {
                        retDescr.transform_options = {};
                        for (var key in descr.transform_options) {
                            if (!descr.transform_options.hasOwnProperty(key))
                                continue;
                            var value = descr.transform_options[key];
                            if (value.indexOf('?') == 0)
                                value = objId + value.substring(1);
                            retDescr.transform_options[key] = value;
                        }
                    }
                }
                return ret;
            },
            runDownloader: function (type, wsId, objId, descr, callback) {
                // descr is {name: ..., external_type: ...[, transform_options: ...[, unzip: ...]]}
                var self = this;
                //self.showButtonSpinner(true);
                self.showMessage(html.loading() + 'Export status: Preparing data');
                self.$statusDiv.show();
                var transform_options = descr.transform_options;
                if (!transform_options)
                    transform_options = {};
                var args = {
                    external_type: descr.external_type,
                    kbase_type: type,
                    workspace_name: wsId,
                    object_name: objId,
                    optional_arguments: {
                        transform: transform_options
                    }
                };
                console.log("Downloader data to be sent to transform service:");
                console.log(JSON.stringify(args));
                var nameSuffix = '.' + descr.name.replace(/[^a-zA-Z0-9|\.\-_]/g, '_');
                var transformSrv = new Transform(this.transformURL, {
                    token: this.token
                });
                transformSrv.download(args,
                    $.proxy(function (data) {
                        console.log(data);
                        var jobId = data[1];
                        self.waitForJob(jobId, objId + nameSuffix, descr.unzip, callback);
                    }, this),
                    $.proxy(function (data) {
                        console.log(data.error.error);
                        self.showError(data.error.error);
                        if (callback)
                            callback(false);
                    }, this)
                    );
            },
            showButtonSpinner: function (show) {
                var div = this.options.dropdown.find("button").find(".fa");
                div.find('img').remove();
                if (show)
                    div.append(html.loading());
            },
            waitForJob: function (jobId, wsObjectName, unzip, callback) {
                var self = this;
                var jobSrv = new UserAndJobState(this.ujsURL, {
                    token: this.token
                });
                var timeLst = function (event) {
                    jobSrv.get_job_status(jobId, function (data) {
                        //console.log(data);
                        var status = data[2];
                        var complete = data[5];
                        var wasError = data[6];
                        if (complete === 1) {
                            self.stopTimer();
                            if (wasError === 0) {
                                console.log("Export is complete");
                                // Starting download from Shock
                                jobSrv.get_results(jobId, function (data) {
                                    self.$statusDiv.hide();
                                    self.$elem.find('.kb-data-list-btn').prop('disabled', false);
                                    console.log(data);
                                    self.downloadUJSResults(data, wsObjectName, unzip);
                                    if (callback)
                                        callback(true);
                                }, function (data) {
                                    console.log(data.error.message);
                                    self.showError(data.error.message);
                                    if (callback)
                                        callback(false);
                                });
                            } else {
                                console.log(status);
                                self.showError(status);
                                if (callback)
                                    callback(false);
                            }
                        } else {
                            console.log("Export status: " + status, true);
                            self.showMessage(html.loading() + ' Export status: ' + status);
                        }
                    }, function (data) {
                        self.stopTimer();
                        console.log(data.error.message);
                        self.showError(data.error.message);
                        if (callback)
                            callback(false);
                    });
                };
                self.timer = setInterval(timeLst, 5000);
                timeLst();
            },
            downloadUJSResults: function (ujsResults, wsObjectName, unzip) {
                var self = this;
                var shockNode = ujsResults.shocknodes[0];
                var elems = shockNode.split('/');
                if (elems.length > 1)
                    shockNode = elems[elems.length - 1];
                elems = shockNode.split('?');
                if (elems.length > 0)
                    shockNode = elems[0];
                console.log("Shock node ID: " + shockNode);
                var shockClient = new ShockClient({
                    url: self.shockURL,
                    token: self.token
                });
                var downloadShockNodeWithName = function (name) {
                    var url = self.exportURL + '/download?id=' + shockNode + '&token=' +
                        encodeURIComponent(self.token) + '&del=1';
                    if (unzip) {
                        url += '&unzip=' + encodeURIComponent(unzip);
                    } else {
                        url += '&name=' + encodeURIComponent(name);
                    }
                    var remoteShockUrl = ujsResults.shockurl;
                    if (remoteShockUrl)
                        url += '&url=' + encodeURIComponent(remoteShockUrl);
                    self.downloadFile(url);
                };
                /*shockClient.get_node(shockNode, function(data) {
                 console.log(data);
                 downloadShockNodeWithName(data.file.name);
                 }, function(error) {
                 console.log(error);
                 });*/
                downloadShockNodeWithName(wsObjectName + ".zip");
            },
            downloadFile: function (url) {
                console.log("Downloading url=" + url);
                var hiddenIFrameID = 'hiddenDownloader';
                var iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement('iframe');
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
            },
            showMessage: function (msg) {
                var self = this;
                self.$statusDivContent.empty();
                self.$statusDivContent.append(msg);
            },
            showError: function (msg) {
                var self = this;
                self.$statusDivContent.empty();
                self.$elem.find('.kb-data-list-btn').prop('disabled', false); // error is final state, so reactivate!
                self.$statusDivContent.append($('<span>').css({
                    color: '#F44336'
                }).append('Error: ' + msg));
            },
            stopTimer: function () {
                if (this.timer != null) {
                    clearInterval(this.timer);
                    this.timer = null;
                    console.log("Timer was stopped");
                }
                //this.showButtonSpinner(false);
            }
        });
    });