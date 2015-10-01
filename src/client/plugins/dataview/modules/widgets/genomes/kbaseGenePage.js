/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * Output widget for visualization of genome annotation.
 * @author Roman Sutormin <rsutormin@lbl.gov>
 * @public
 */
define([
    'jquery',
    'kb.html',
    
    'kb.jquery.widget',
    'kb_widget_dataview_genome_geneInstanceInfo',
    'kb_widget_dataview_genome_geneBiochemistry',
    'kb_widget_dataview_genome_geneSequence'
], function ($, html) {
    'use strict';
    $.KBWidget({
        name: "KBaseGenePage",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            featureID: null,
            genomeID: null,
            workspaceID: null,
        },
        init: function (options) {
            this._super(options);
            if (this.options.workspaceID === 'CDS')
                this.options.workspaceID = 'KBasePublicGenomesV4';
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            var scope = {
                ws: this.options.workspaceID,
                gid: this.options.genomeID,
                fid: this.options.featureID
            };
            ///////////////////////////////////////////////////////////////////////////////
            var cell1 = $('<div panel panel-default">');
            self.$elem.append(cell1);
            var panel1 = self.makePleaseWaitPanel();
            self.makeDecoration(cell1, 'Feature Overview', panel1);
            ///////////////////////////////////////////////////////////////////////////////
            var cell2 = $('<div panel panel-default">');
            self.$elem.append(cell2);
            var panel2 = self.makePleaseWaitPanel();
            self.makeDecoration(cell2, 'Biochemistry', panel2);
            ///////////////////////////////////////////////////////////////////////////////
            var cell3 = $('<div panel panel-default">');
            self.$elem.append(cell3);
            var panel3 = self.makePleaseWaitPanel();
            self.makeDecoration(cell3, 'Sequence', panel3);
            ///////////////////////////////////////////////////////////////////////////////

            var objId = scope.ws + "/" + scope.gid;
            var included = ["/complete", "/contig_ids", "/contig_lengths", "contigset_ref", "/dna_size",
                "/domain", "/gc_content", "/genetic_code", "/id", "/md5", "num_contigs",
                "/scientific_name", "/source", "/source_id", "/tax_id", "/taxonomy",
                "/features/[*]/id"];

            var ready = function (genomeInfo) {
                panel1.empty();
                try {
                    panel1.KBaseGeneInstanceInfo({
                        featureID: scope.fid,
                        genomeID: scope.gid,
                        workspaceID: scope.ws,
                        kbCache: kb,
                        hideButtons: true,
                        genomeInfo: genomeInfo
                    });
                } catch (e) {
                    console.error(e);
                    self.showError(panel1, e.message);
                }

                var searchTerm = "";
                if (genomeInfo && genomeInfo.data['scientific_name']) {
                    searchTerm = genomeInfo.data['scientific_name'];
                }
                panel2.empty();
                try {
                    panel2.KBaseGeneBiochemistry({
                        featureID: scope.fid,
                        genomeID: scope.gid,
                        workspaceID: scope.ws,
                        kbCache: kb,
                        genomeInfo: genomeInfo
                    });
                } catch (e) {
                    console.error(e);
                    self.showError(panel2, e.message);
                }

                panel3.empty();
                panel3.KBaseGeneSequence({
                    featureID: scope.fid,
                    genomeID: scope.gid,
                    workspaceID: scope.ws,
                    kbCache: kb,
                    genomeInfo: genomeInfo
                });
            };

            kb.ws.get_object_subset([{ref: objId, included: included}], function (data) {
                var genomeInfo = data[0];
                var featureIdx = null;
                for (var pos in genomeInfo.data.features) {
                    var featureId = genomeInfo.data.features[pos].id;
                    if (featureId && featureId === scope.fid) {
                        featureIdx = pos;
                        break;
                    }
                }
                if (featureIdx) {
                    kb.ws.get_object_subset([{ref: objId, included: ["/features/" + featureIdx]}], function (data) {
                        var fInfo = data[0].data;
                        genomeInfo.data.features[featureIdx] = fInfo.features[0];
                        ready(genomeInfo);
                    },
                        function (error) {
                            console.error("Error loading genome subdata");
                            console.error(error);
                            panel1.empty();
                            self.showError(panel1, error);
                            cell2.empty();
                            cell3.empty();
                        });
                } else {
                    panel1.empty();
                    self.showError(panel1, "Feature " + scope.fid + " is not found in genome");
                    cell2.empty();
                    cell3.empty();
                }
            },
                function (error) {
                    console.error("Error loading genome subdata");
                    console.error(error);
                    panel1.empty();
                    self.showError(panel1, error);
                    cell2.empty();
                    cell3.empty();
                });
        },
        makePleaseWaitPanel: function () {
            return $('<div>').html(html.loading('loading...'));
        },
        makeDecoration: function ($panel, title, $widgetDiv) {
            var id = this.genUUID();
            $panel.append(
                $('<div class="panel-group" id="accordion_' + id + '" role="tablist" aria-multiselectable="true">')
                .append($('<div class="panel panel-default kb-widget">')
                    .append('' +
                        '<div class="panel-heading" role="tab" id="heading_' + id + '">' +
                        '<h4 class="panel-title">' +
                        '<span data-toggle="collapse" data-parent="#accordion_' + id + '" data-target="#collapse_' + id + '" aria-expanded="false" aria-controls="collapse_' + id + '" style="cursor:pointer;">' +
                        ' ' + title +
                        '</span>' +
                        '</h4>' +
                        '</div>'
                        )
                    .append($('<div id="collapse_' + id + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading_' + id + '" area-expanded="true">')
                        .append($('<div class="panel-body">').append($widgetDiv))
                        )
                    )
                );
        },
        getData: function () {
            return {
                type: "Gene Page",
                id: this.options.genomeID + "/" + this.options.featureID,
                workspace: this.options.workspaceID,
                title: "Gene Page"
            };
        },
        showError: function (panel, e) {
            panel.empty();
            panel.append("Error: " + JSON.stringify(e));
        },
        genUUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    });
});