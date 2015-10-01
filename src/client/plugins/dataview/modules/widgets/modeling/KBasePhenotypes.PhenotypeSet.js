/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb_widget_dataview_modeling_objects'
],
    function (KBObjects) {
        'use strict';
        function KBasePhenotypes_PhenotypeSet(modeltabs) {
            var self = this;
            this.modeltabs = modeltabs;

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
                    }

                    $.extend(this.overview, this.usermeta);
                }
            };

            this.setData = function (indata) {
                this.data = indata;
                this.phenotypes = this.data.phenotypes;
                var cpd_refs_hash = {};
                for (var i = 0; i < this.phenotypes.length; i++) {
                    var refs = this.phenotypes[i].additionalcompound_refs;
                    refs.forEach(function (ref) {
                        var split = ref.split('/'),
                            id = split[split.length - 1];
                        cpd_refs_hash[id] = 1;
                    });
                }

                return this.modeltabs.getBiochemCompounds(Object.keys(cpd_refs_hash))
                    .then(function (cpds) {
                        var addcpd_names_hash = {};
                        for (var j = 0; j < cpds.length; j++) {
                            addcpd_names_hash[cpds[j].id] = cpds[j].name;
                        }
                        for (var i = 0; i < self.phenotypes.length; i++) {
                            var refs = self.phenotypes[i].additionalcompound_refs;
                            var names = [];
                            for (var j = 0; j < refs.length; j++) {
                                names.push(addcpd_names_hash[refs[j].split("/").pop()]);
                            }
                            self.phenotypes[i].additionalcompound_names = names;
                        }
                    });
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
                        }]
                }];
        }

// make method of base class
        KBObjects.prototype.KBasePhenotypes_PhenotypeSet = KBasePhenotypes_PhenotypeSet;
    });