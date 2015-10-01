/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb.html',
    'kb.service.workspace',
    'kb.utils',
    'datatables_bootstrap',
    'kb.jquery.authenticatedwidget'
], function ($, html, Workspace) {
    'use strict';
    $.KBWidget({
        name: "KBaseGenomeGeneTable",
        parent: "kbaseAuthenticatedWidget",
        version: "1.0.0",
        genome_id: null,
        ws_name: null,
        kbCache: null,
        width: 1150,
        options: {
            genome_id: null,
            ws_name: null,
            ver: null,
            kbCache: null,
            genomeInfo: null
        },
        init: function (options) {
            this._super(options);

            this.ws_name = this.options.ws_name;
            this.genome_id = this.options.genome_id;
            this.kbCache = this.options.kbCache;
            this.render();
            return this;
        },
        render: function () {
            var self = this;
            var pref = this.uuid();

            var container = this.$elem;

            container.append(html.loading('loading genes data...'));

            var genomeRef = String(this.options.ws_name) + "/" + String(this.options.genome_id);

            var showData = function (gnm, cfg) {
                function showGenes() {
                    container.empty();
                    ////////////////////////////// Genes Tab //////////////////////////////
                    container.append($('<div />')
                        .css("overflow", "auto")
                        .append('<table cellpadding="0" cellspacing="0" border="0" id="' + pref + 'genes-table" ' +
            		'class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;"/>'));
                    var genesData = [];
                    var geneMap = {};
                    var contigMap = {};

                    if (gnm.contig_ids && gnm.contig_lengths && gnm.contig_ids.length === gnm.contig_lengths.length) {
                        for (var pos in gnm.contig_ids) {
                            var contigId = gnm.contig_ids[pos];
                            var contigLen = gnm.contig_lengths[pos];
                            contigMap[contigId] = {name: contigId, length: contigLen, genes: []};
                        }
                    }

                    /*function geneEvents() {
                        $('.' + pref + 'gene-click').unbind('click');
                        $('.' + pref + 'gene-click').click(function () {
                            var geneId = [$(this).data('geneid')];
                            window.open("#/genes/" + genomeRef + "/" + geneId, "_blank");
                        });
                    }*/

                    for (var genePos in gnm.features) {
                        var gene = gnm.features[genePos];
                        var geneId = gene.id;
                        var contigName = null;
                        var geneStart = null;
                        var geneDir = null;
                        var geneLen = null;
                        if (gene.location && gene.location.length > 0) {
                            contigName = gene.location[0][0];
                            geneStart = gene.location[0][1];
                            geneDir = gene.location[0][2];
                            geneLen = gene.location[0][3];
                        }
                        var geneType = gene.type;
                        var geneFunc = gene['function'];
                        if (!geneFunc)
                            geneFunc = '-';
                        genesData.push({
                            id: '<a href="#dataview/' + genomeRef + '?sub=Feature&subid=' + geneId  + '" target="_blank">' + geneId + '</a>',
                            contig: contigName, 
                            start: geneStart, 
                            dir: geneDir, 
                            len: geneLen, 
                            type: geneType, 
                            func: geneFunc
                        });
                        geneMap[geneId] = gene;
                        var contig = contigMap[contigName];
                        if (contigName != null && !contig) {
                            contig = {name: contigName, length: 0, genes: []};
                            contigMap[contigName] = contig;
                        }
                        if (contig) {
                            var geneStop = Number(geneStart);
                            if (geneDir == '+')
                                geneStop += Number(geneLen);
                            if (contig.length < geneStop) {
                                contig.length = geneStop;
                            }
                            contig.genes.push(gene);
                        }
                    }
                    var genesSettings = {
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 10,
                        "aaSorting": [[1, 'asc'], [2, 'asc']], // [[0,'asc']],
                        "sDom": 't<fip>',
                        "aoColumns": [
                            {sTitle: "Gene ID", mData: "id"},
                            {sTitle: "Contig", mData: "contig"},
                            {sTitle: "Start", mData: "start", sWidth: "7%"},
                            {sTitle: "Strand", mData: "dir", sWidth: "7%"},
                            {sTitle: "Length", mData: "len", sWidth: "7%"},
                            {sTitle: "Type", mData: "type", sWidth: "10%"},
                            {sTitle: "Function", mData: "func", sWidth: "45%"}
                        ],
                        "aaData": genesData,
                        "oLanguage": {
                            "sSearch": "&nbsp&nbspSearch genes:",
                            "sEmptyTable": "No genes found."
                        }
                    };
                    $('#' + pref + 'genes-table').dataTable(genesSettings);
                }

                if (gnm.features.length > 35000) {
                    container.empty();
                    var btnId = "btn_show_genes" + pref;
                    container.append("There are many features in this genome, so displaying the full, " +
                        "sortable gene list may cause your web browser to run out of memory and become " +
                        "temporarily unresponsive.  Click below to attempt to show the gene list anyway.<br>" +
                        "<button id='" + btnId + "' class='btn btn-primary'>Show Gene List</button>");
                    $('#' + btnId).click(function (e) {
                        showGenes();
                    });
                } else {
                    showGenes();
                }
            };
            if (self.options.genomeInfo) {
                showData(self.options.genomeInfo.data);
            } else {
                var objId = {ref: genomeRef};
                if (this.options.kbCache)
                    prom = this.options.kbCache.req('ws', 'get_objects', [objId]);
                else
                    prom = kb.ws.get_objects([objId]);

                $.when(prom).done($.proxy(function (data) {
                    var gnm = data[0].data;
                    showData(gnm);
                }, this));
                $.when(prom).fail($.proxy(function (data) {
                    container.empty();
                    container.append('<p>[Error] ' + data.error.message + '</p>');
                }, this));
            }
            return this;
        },
        getData: function () {
            return {
                type: "KBaseGenomeGeneTable",
                id: this.options.ws_name + "." + this.options.genome_id,
                workspace: this.options.ws_name,
                title: "Gene list"
            };
        },
        uuid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
        }
    });
});
