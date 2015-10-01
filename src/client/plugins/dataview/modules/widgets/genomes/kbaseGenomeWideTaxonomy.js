/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb.runtime',
    'kb.html',
    'kb.service.workspace',
    'kb.jquery.widget',
    'kb_widget_dataview_genomeLineage'
], function ($, R, html, Workspace) {
    'use strict';
    $.KBWidget({
        name: "KBaseGenomeWideTaxonomy",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            genomeID: null,
            workspaceID: null,
            genomeInfo: null
        },
        init: function (options) {
            this._super(options);
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            var row = $('<div class="row">');
            self.$elem.append(row);
            var taxonomyinfo = $('<div class="col-md-5">');
            row.append(taxonomyinfo);
            var tree = $('<div class="col-md-7">');
            row.append(tree);
            taxonomyinfo.KBaseGenomeLineage({
                genomeID: self.options.genomeID,
                workspaceID: self.options.workspaceID,
                genomeInfo: self.options.genomeInfo
            });
            this.prepareTree({ws: self.options.workspaceID, id: self.options.genomeID}, tree);
        },
        prepareTree: function (scope, $div) {
            var objectIdentity = {ref: scope.ws + "/" + scope.id};
            var workspace = new Workspace(R.getConfig('services.workspace.url'), {
                token: R.getAuthToken()
            });
            workspace.list_referencing_objects([objectIdentity], function (data) {
                var treeName = null,
                    treeWs = null,
                    i;
                for (i in data[0]) {
                    var objInfo = data[0][i],
                        wsName = objInfo[7],
                        wsId = objInfo[6],
                        objName = objInfo[1],
                        type = objInfo[2].split('-')[0];
                    // either match exactly the string, or we match with coercion the number
                    if (type === "KBaseTrees.Tree") {
                        treeName = objName;
                        treeWs = wsId;
                        break;
                    }
                }
                var $buildBtn = $("<button>")
                    .addClass("kb-primary-btn")
                    .append("Build Another Tree in a New Narrative");
                var $buildNarPanel = $("<div>")
                    .append($('<a href="#/narrativemanager/new?copydata=' + scope.ws + '/' + scope.id + '&app=build_species_tree&appparam=1,param0,' + scope.id + '" target="_blank">')
                        .append($buildBtn));

                if (treeName) {
                    var $widgetDiv = $('<div>');
                    $div.append(
                        $('<table>').append($('<tr>')
                        .append($('<td>')
                            .append('<h4>Showing Phylogenetic Tree: <a href="#/dataview/' + treeWs + '/' + treeName + '" target="_blank">' + treeName + '</a></h4>'))
                        .append($('<td>')
                            .append($buildNarPanel))));

                    $widgetDiv.kbaseTree({treeID: treeName, workspaceID: treeWs, genomeInfo: self.options.genomeInfo});
                    $div.append($widgetDiv);
                } else {
                    $buildBtn.html("Launch a new Tree Building Narrative");
                    $div
                        .append('<b>There are no species trees created for this genome, but you can use the Narrative to build a new species tree of closely related genomes.</b>');

                    $div.append("<br><br>");
                    $div.append($buildNarPanel);
                    $div.append("<br><br>");
                }
            },
                function (error) {
                    var err = '<b>Sorry!</b>  Error retreiveing species trees info';
                    if (typeof error === "string") {
                        err += ": " + error;
                    } else if (error.error && error.error.message) {
                        err += ": " + error.error.message;
                    }
                    $div.append(err);
                });
        },
        getData: function () {
            return {
                type: "Genome Taxonomy",
                id: this.options.genomeID,
                workspace: this.options.workspaceID,
                title: "Taxonomy"
            };
        }

    });
});