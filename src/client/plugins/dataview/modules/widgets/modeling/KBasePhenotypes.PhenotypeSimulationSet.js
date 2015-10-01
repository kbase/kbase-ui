/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb_widget_dataview_modeling_objects',
    'kb.service.workspace',
    'kb.runtime',
    'bluebird'
],
    function (KBObjects, Workspace, R, Promise) {
        'use strict';
        function KBasePhenotypes_PhenotypeSimulationSet(tabwidget) {
            var self = this;
            this.tabwidget = tabwidget;

            this.setMetadata = function (data) {
                this.workspace = data[7];
                this.objName = data[1];
                this.overview = {wsid: data[7] + "/" + data[1],
                    objecttype: data[2],
                    owner: data[5],
                    instance: data[4],
                    moddate: data[3]};
                // if there is user metadata, add it
                if ('Name' in data[10]) {
                    this.usermeta = {
                        name: data[10]["Name"],
                        source: data[10]["Source"] + "/" + data[10]["Source ID"],
                        numphenotypes: data[10]["Number phenotypes"],
                        type: data[10]["Type"]
                    };

                    $.extend(this.overview, this.usermeta);
                }
            };

            this.setData = function (indata) {
                self.data = indata;
                var workspace = new Workspace(R.getConfig('services.workspace.url'), {
                    token: R.getAuthToken()
                });
                        console.log(indata);
                return new Promise.resolve(workspace.get_objects([{ref: indata.phenotypeset_ref}]))
                    .then(function (data) {
                        var kbObjects = new KBObjects();
                        self.phenoset = new kbObjects["KBasePhenotypes_PhenotypeSet"](self.tabwidget);
                        self.phenoset.setMetadata(data[0].info);
                        return self.phenoset.setData(data[0].data);
                    })
                    .then(function () {
                        self.formatObject();
                    });
            };

            this.formatObject = function () {
                self.phenotypes = self.phenoset.phenotypes;
                for (var i = 0; i < self.phenotypes.length; i++) {
                    var pheno = self.phenotypes[i];
                    pheno.simulatedGrowth = self.data.phenotypeSimulations[i].simulatedGrowthFraction;
                    pheno.phenoclass = self.data.phenotypeSimulations[i].phenoclass;
                }
            };

            this.tabList = [{
                    "key": "overview",
                    "name": "Overview",
                    "type": "verticaltbl",
                    "rows": [{
                            "label": "ID",
                            "key": "wsid"
                        }, {
                            "label": "Object type",
                            "key": "objecttype",
                            "type": "typelink"
                        }, {
                            "label": "Owner",
                            "key": "owner"
                        }, {
                            "label": "Version",
                            "key": "instance"
                        }, {
                            "label": "Mod-date",
                            "key": "moddate"
                        }, {
                            "label": "Name",
                            "key": "name"
                        }, {
                            "label": "Source",
                            "key": "source"
                        }, {
                            "label": "Number phenotypes",
                            "key": "numphenotypes"
                        }, {
                            "label": "Phenotype type",
                            "key": "type"
                        }]
                }, {
                    "key": "phenotypes",
                    "name": "Phenotypes",
                    "type": "dataTable",
                    "columns": [{
                            "label": "Growth condition",
                            "key": "media_ref",
                            "linkformat": "dispWSRef",
                            "type": "wstype",
                            "wstype": "KBaseFBA.Media"
                        }, {
                            "label": "Gene KO",
                            "type": "wstype",
                            "key": "geneko_refs"
                        }, {
                            "label": "Additional compounds",
                            "key": "additionalcompound_names"
                        }, {
                            "label": "Observed normalized growth",
                            "key": "normalizedGrowth"
                        }, {
                            "label": "Simulated growth",
                            "key": "simulatedGrowth"
                        }, {
                            "label": "Prediction class",
                            "key": "phenoclass"
                        }]
                }];
        }


// make method of base class
        KBObjects.prototype.KBasePhenotypes_PhenotypeSimulationSet = KBasePhenotypes_PhenotypeSimulationSet;
    });