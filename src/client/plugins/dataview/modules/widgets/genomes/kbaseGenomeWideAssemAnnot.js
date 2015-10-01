/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb.jquery.widget',
    'kb_widget_dataview_genome_multiContigBrowser',
    'kb_widget_dataview_genome_seedFunctions',
    'kb_widget_dataview_genome_geneTable'
], function ($, _W) {
    'use strict';
    $.KBWidget({
        name: "KBaseGenomeWideAssemAnnot",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            genomeID: null,
            workspaceID: null,
            ver: null,
            loadingImage: "assets/img/ajax-loader.gif",
            kbCache: null,
            genomeInfo: null,
            contigSetInfo: null
        },
        init: function (options) {
            this._super(options);
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            var row0 = $('<div class="row">');
            self.$elem.append(row0);
            var contigbrowser = $('<div class="col-md-12">');
            row0.append(contigbrowser);
            contigbrowser.KBaseMultiContigBrowser({
                genomeID: self.options.genomeID,
                workspaceID: self.options.workspaceID,
                ver: self.options.ver,
                kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage,
                genomeInfo: self.options.genomeInfo
            });
            var row1 = $('<div class="row">');
            self.$elem.append(row1);
            var seedannotations = $('<div class="col-md-6">');
            row1.append(seedannotations);
            var genetable = $('<div class="col-md-6">');
            row1.append(genetable);
            seedannotations.KBaseSEEDFunctions({
                objNameOrId: self.options.genomeID,
                wsNameOrId: self.options.workspaceID,
                objVer: null,
                kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage,
                genomeInfo: self.options.genomeInfo
            });
            genetable.KBaseGenomeGeneTable({
                genome_id: self.options.genomeID,
                ws_name: self.options.workspaceID,
                ver: self.options.ver,
                kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage,
                genomeInfo: self.options.genomeInfo
            });
        },
        getData: function () {
            return {
                type: "Genome Assembly and Annotation",
                id: this.options.genomeID,
                workspace: this.options.workspaceID,
                title: "Assembly and Annotation"
            };
        }

    });
});