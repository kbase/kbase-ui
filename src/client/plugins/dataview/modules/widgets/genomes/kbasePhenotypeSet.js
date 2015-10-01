/**
 * Just a simple example widget to display phenotypedata
 * 
 */
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define(['jquery', 'kb.runtime', 'kb.utils', 'kb.html', 'kb.service.workspace', 'kb.client.workspace', 'kb.jquery.widget', 'kb.jquery.kb-tabs', 'kb.jquery.media-editor', 'datatables_bootstrap'],
    function ($, R, Utils, html, Workspace, WorkspaceClient) {
        'use strict';
        $.KBWidget({
            name: "kbasePhenotypeSet",
            parent: "kbaseWidget",
            version: "1.0.0",
            options: {
                color: "black"
            },
            init: function (options) {
                this._super(options);
                var ws = options.ws;
                var name = options.name;

                var container = this.$elem;

                container.loading();
                var workspace = new Workspace(R.getConfig('services.workspace.url'), {
                    token: options.token
                });
                Promise.resolve(workspace.get_objects'({
                    workspace: ws, name: name
                }))
                    .then(function (data) {
                        var reflist = data[0].refs;
                        reflist.push(data[0].data.genome_ref);
                        var workspaceClient = Object.create(WorkspaceClient).init();
                        workspaceClient.translateRefs(reflist)
                            .then(function (refhash) {
                                container.rmLoading();
                                buildTable(data, refhash);
                            })
                            .catch(function (err) {
                                container.rmLoading();
                                container.append('<div class="alert alert-danger">' +
                                    err.error.message + '</div>');
                            })
                            .done();
                    })
                    .catch(function (err) {
                        container.rmLoading();
                        container.append('<div class="alert alert-danger">' +
                            err.error.message + '</div>')
                    })
                    .done();


                function buildTable(data, refhash) {
                    // setup tabs
                    var phenoTable = $('<table class="table table-bordered table-striped" style="width: 100%;">');

                    var tabs = container.kbTabs({tabs: [
                            {name: 'Overview', active: true},
                            {name: 'Phenotypes', content: phenoTable}]
                    })

                    // Code to displaying phenotype overview data
                    var columns = [
                        {key: 'wsid', label: 'Name'},
                        {key: 'ws', label: 'Workspace'},
                        {key: 'kbid', label: 'KBID'},
                        {key: 'source', label: 'Source'},
                        {key: 'genome', label: 'Genome'},
                        {key: 'type', label: 'Type'},
                        {key: 'errors', label: 'Errors'},
                        {key: 'owner', label: 'Owner'},
                        {key: 'date', label: 'Creation Date'}
                    ];
                    var phenooverdata = [{
                            wsid: data[0].info[1],
                            ws: data[0].info[7],
                            kbid: data[0].data.id,
                            source: data[0].data.source,
                            genome: refhash[data[0].data.genome_ref].link, //data[0].data.genome_ref, 
                            type: data[0].data.type,
                            errors: data[0].data.importErrors,
                            owner: data[0].creator,
                            date: data[0].created
                        }];
                    var table = html.makeRotatedTable(phenooverdata, columns);
                    tabs.tabContent('Overview').append(table);

                    //Code for loading the phenotype list table
                    var pheno = data[0].data;
                    var tableSettings = {
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 10,
                        "aaData": pheno.phenotypes,
                        "aaSorting": [[3, "desc"]],
                        "aoColumns": [
                            {"sTitle": "Name", 'mData': 'name'},
                            {"sTitle": "Media", 'mData': function (d) {
                                    return '<a data-ref="' + refhash[d.media_ref].label +
                                        '" class="btn-show-media-tab">' +
                                        refhash[d.media_ref].label +
                                        '</a>'; //d.media_ref
                                }},
                            {"sTitle": "Gene KO", 'mData': function (d) {
                                    return d.geneko_refs.join("<br>");
                                }},
                            {"sTitle": "Additional compounds", 'mData': function (d) {
                                    return d.additionalcompound_refs.join("<br>");
                                }},
                            {"sTitle": "Growth", 'mData': 'normalizedGrowth'}
                        ],
                        "oLanguage": {
                            "sEmptyTable": "No objects in workspace",
                            "sSearch": "Search: "
                        },
                        'fnDrawCallback': events
                    };
                    phenoTable.dataTable(tableSettings);

                    function events() {
                        container.find('.btn-show-media-tab').unbind('click');
                        container.find('.btn-show-media-tab').click(function () {
                            var ref = $(this).data('ref');
                            var ele = $('<div>').loading();
                            tabs.addTab({name: ref, content: ele, removable: true});
                            mediaTab(ele, ref.split('/')[0], ref.split('/')[1]);
                        });
                    }

                    // this will be replaced with an consolidated media widget once 
                    // ui-common is a submodule
                    function mediaTab(ele, ws, id) {
                        var fba = new FBA(R.getConfig('services.fba.url'));
                        Promise.resolve(fba.get_media({
                            medias: [id], workspaces: [ws]
                        }))
                            .then(function (data) {
                                $(ele).rmLoading();
                                $(ele).kbaseMediaEditor({
                                    ids: [id],
                                    workspaces: [ws],
                                    data: data
                                });
                            })
                            .catch(function (err) {
                                $(ele).rmLoading();
                                $(ele).append('<div class="alert alert-danger">' +
                                    err.error.message + '</div>');
                            })
                            .done();
                    }
                }
                return this;
            }
        });
    });