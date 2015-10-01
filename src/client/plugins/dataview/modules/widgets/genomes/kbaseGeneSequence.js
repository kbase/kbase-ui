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
    'kb.runtime',
    'kb.html',
    'kb.jquery.widget'
], function ($, R, html) {
    'use strict';
    $.KBWidget({
        name: "KBaseGeneSequence",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            featureID: null,
            embedInCard: false,
            auth: null,
            genomeID: null,
            workspaceID: null,
            kbCache: null,
            width: 950,
            seq_cell_height: 208,
            genomeInfo: null
        },
        init: function (options) {
            this._super(options);

            if (this.options.featureID === null) {
                //throw an error.
                return this;
            }

            this.cdmiClient = new CDMI_API(R.getConfig('services.cdmi.url'));
            this.entityClient = new CDMI_EntityAPI(R.getConfig('services.cdmi.url'));

            this.render();
            if (this.options.workspaceID) {
                this.renderWorkspace();
            } else
                this.renderError;

            return this;
        },
        render: function () {
            this.$messagePane = $("<div/>")
                .addClass("kbwidget-message-pane kbwidget-hide-message");
            this.$elem.append(this.$messagePane);

            this.$infoPanel = $("<div>").css("overflow", "auto");
            this.$infoTable = $("<table>")
                .addClass("table table-striped table-bordered");

            this.$elem.append(this.$infoPanel.append(this.$infoTable));
        },
        makeRow: function (name, value, color) {
            var $row = $("<tr>")
                .append($("<th>").append(name))
                .append($("<td>").append($("<div style='max-height:" + this.options.seq_cell_height + "px; overflow:scroll; font-family:monospace; background-color:" + color + "; border:1px solid transparent'>").append(value)));
            //.append("<td style='max-height: 100px; overflow:scroll; font-family: monospace'>").append($("<div style='max-height:100px; overflow:scroll; font-family: monospace'>").append(value));
            return $row;
        },
        renderWorkspace: function () {
            var self = this;
            this.showMessage(html.loading());
            this.$infoPanel.hide();

            if (this.options.genomeInfo) {
                self.ready(this.options.genomeInfo);
            } else {
                if (!this.options.kbCache) {
                    if (kb)
                        this.options.kbCache = kb;
                    else
                        console.debug("No cache service found. D'oh!");
                }
                var obj = this.buildObjectIdentity(this.options.workspaceID, this.options.genomeID);

                var prom = this.options.kbCache.req('ws', 'get_objects', [obj]);
                // on ws error
                $.when(prom).fail($.proxy(function (error) {
                    this.renderError(error);
                }, this));
                // on cache success
                $.when(prom).done($.proxy(function (genome) {
                    genome = genome[0];
                    self.ready(genome);
                }, this));
            }
        },
        ready: function (genome) {
            var self = this;
            if (genome.data.features) {
                var feature = null;
                for (var i = 0; i < genome.data.features.length; i++) {
                    if (genome.data.features[i].id === this.options.featureID) {
                        feature = genome.data.features[i];
                        break;
                    }
                }

                // Gene sequence
                //
                var dnaSequenceStr = "No gene sequence found.";
                if (feature.dna_sequence) { // get dna_sequence from object
                    dnaSequenceStr = feature.dna_sequence;
                    // wrap seq
                    var seq_width = 50;
                    if (dnaSequenceStr.length > seq_width) {
                        var dnaDispStr = "";
                        var start_pos = 0;
                        var end_pos = 0;
                        for (var i = 0; (i + 1) * seq_width - 1 < dnaSequenceStr.length; i++) {
                            start_pos = i * seq_width;
                            end_pos = (i + 1) * seq_width - 1;
                            dnaDispStr += dnaSequenceStr.substring(start_pos, end_pos) + '<br>';
                        }
                        start_pos += seq_width;
                        end_pos = dnaSequenceStr.length - 1;
                        if (start_pos < dnaSequenceStr.length) {
                            dnaDispStr += dnaSequenceStr.substring(start_pos, end_pos) + '<br>';
                        }
                        dnaSequenceStr = dnaDispStr;
                    }

                    //this.$infoTable.append(this.makeRow("Gene", dnaSequenceStr));
                    this.$infoTable.append(
                        this.makeRow("Gene", dnaSequenceStr, 'white')
                        //.each(function(){$(this).css('font-family','monospace')})
                        );

                } else {   // HACK!!! use central store (temporary solution?)
                    var self = this;
                    self.cdmiClient.fids_to_dna_sequences
                        (
                            [self.options.featureID],
                            function (dna_sequences) {
                                if (dna_sequences[self.options.featureID]) {
                                    dnaSequenceStr = dna_sequences[self.options.featureID];
                                }
                                // wrap seq
                                var seq_width = 50;
                                if (dnaSequenceStr.length > seq_width) {
                                    var dnaDispStr = "";
                                    var start_pos = 0;
                                    var end_pos = 0;
                                    for (var i = 0; (i + 1) * seq_width - 1 < dnaSequenceStr.length; i++) {
                                        start_pos = i * seq_width;
                                        end_pos = (i + 1) * seq_width - 1;
                                        dnaDispStr += dnaSequenceStr.substring(start_pos, end_pos) + '<br>';
                                    }
                                    start_pos += seq_width;
                                    end_pos = dnaSequenceStr.length - 1;
                                    if (start_pos < dnaSequenceStr.length) {
                                        dnaDispStr += dnaSequenceStr.substring(start_pos, end_pos) + '<br>';
                                    }
                                    dnaSequenceStr = dnaDispStr;
                                }

                                //self.$infoTable.append(self.makeRow("Gene", dnaSequenceStr));
                                self.$infoTable.append(
                                    self.makeRow("Gene", dnaSequenceStr, 'white')
                                    //.each(function(){$(this).css('font-family','monospace')})
                                    );

                                //self.hideMessage();
                                //self.$infoPanel.show();
                            },
                            self.renderError
                            );
                }
                // end gene sequence


                // Protein sequence (for peg) (do first for bottom-up table build?)
                //
                var proteinTranslationStr = "No protein sequence found.";
                if (feature.protein_translation) {
                    proteinTranslationStr = feature.protein_translation;
                    // wrap seq
                    var seq_width = 50;
                    if (proteinTranslationStr.length > seq_width) {
                        var protDispStr = "";
                        var start_pos = 0;
                        var end_pos = 0;
                        for (var i = 0; (i + 1) * seq_width - 1 < proteinTranslationStr.length; i++) {
                            start_pos = i * seq_width;
                            end_pos = (i + 1) * seq_width - 1;
                            protDispStr += proteinTranslationStr.substring(start_pos, end_pos) + '<br>';
                        }
                        start_pos += seq_width;
                        end_pos = proteinTranslationStr.length - 1;
                        if (start_pos < proteinTranslationStr.length) {
                            protDispStr += proteinTranslationStr.substring(start_pos, end_pos) + '<br>';
                        }
                        proteinTranslationStr = protDispStr;
                    }
                }
                this.$infoTable.append(
                    this.makeRow("Protein", proteinTranslationStr, '#f9f9f9')
                    //.each(function(){$(this).css('font-family','monospace')})
                    );

                // SOMETHING SIMILAR, BUT NOT RIGHT this.$infoTable.append(this.makeRow("Protein", proteinTranslationStr).find("td")[1].style="font-family:Courier");

                // end protein sequence

            } else {
                this.renderError({error: "No genetic features found in the genome with object id: " +
                        this.options.workspaceID + "/" +
                        this.options.genomeID});
            }

            this.hideMessage();
            this.$infoPanel.show();
        },
        buildObjectIdentity: function (workspaceID, objectID) {
            var obj = {};
            if (/^\d+$/.exec(workspaceID))
                obj['wsid'] = workspaceID;
            else
                obj['workspace'] = workspaceID;

            // same for the id
            if (/^\d+$/.exec(objectID))
                obj['objid'] = objectID;
            else
                obj['name'] = objectID;
            return obj;
        },
        getData: function () {
            return {
                type: "Feature",
                id: this.options.featureID,
                workspace: this.options.workspaceID,
                title: "Gene Sequence"
            };
        },
        showMessage: function (message) {
            var span = $("<span/>").append(message);

            this.$messagePane.empty()
                .append(span)
                .removeClass("kbwidget-hide-message");
        },
        hideMessage: function () {
            this.$messagePane.addClass("kbwidget-hide-message");
        },
        renderError: function (error) {
            errString = "Sorry, an unknown error occurred";
            if (typeof error === "string")
                errString = error;
            else if (error.error && error.error.message)
                errString = error.error.message;


            var $errorDiv = $("<div>")
                .addClass("alert alert-danger")
                .append("<b>Error:</b>")
                .append("<br>" + errString);
            this.$elem.empty();
            this.$elem.append($errorDiv);
        },
    })
});