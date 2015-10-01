/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * Shows general gene info.
 * Such as its name, synonyms, annotation, publications, etc.
 *
 * Gene "instance" info (e.g. coordinates on a particular strain's genome)
 * is in a different widget.
 */
define([
    'jquery',
    'kb.jquery.widget',
    'kb_widget_dataview_genome_overview',
    'kb_widget_dataview_genome_wikiDescription'
], function ($) {
    'use strict';
    $.KBWidget({
        name: "KBaseGenomeWideOverview",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            genomeID: null,
            workspaceID: null,
            loadingImage: "assets/img/ajax-loader.gif",
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
            var overview = $('<div class="col-md-4">');
            row.append(overview);
            var wikidescription = $('<div class="col-md-8">');
            row.append(wikidescription);

            overview.KBaseGenomeOverview({
                genomeID: self.options.genomeID,
                workspaceID: self.options.workspaceID,
                loadingImage: self.options.loadingImage,
                genomeInfo: self.options.genomeInfo
            });
            wikidescription.KBaseWikiDescription({
                genomeID: self.options.genomeID,
                workspaceID: self.options.workspaceID,
                kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage,
                genomeInfo: self.options.genomeInfo
            });

        },
        getData: function () {
            return {
                type: "Genome Overview",
                id: this.options.genomeID,
                workspace: this.options.workspaceID,
                title: "Overview"
            };
        }

    });
});