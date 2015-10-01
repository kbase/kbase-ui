/**
 * Just a simple example widget to display an expression series
 * 
 */
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'bluebird',
    'kb.html',
    'kb.utils',
    'kb.runtime',
    'kb.service.workspace',
    'kb.client.workspace',
    'kb.jquery.widget',
    'kb.jquery.kb-tabs'
], function ($, Promise, html, Utils, R, Workspace, workspaceClient) {
    'use strict';
    $.KBWidget({
        name: "kbaseExpressionSeries",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            color: "black"
        },
        init: function (options) {
            this._super(options);
            var workspace = new Workspace(R.getConfig('services.workspace.url'), {
                token: R.getAuthToken()
            });
            var wsClient = Object.create(workspaceClient).init();
            var name = options.name;

            var container = this.$elem;

            container.html(html.loading());

            Promise.resolve(workspace.get_objects([{workspace: options.ws, name: options.name}]))
                .then(function (data) {
                    var reflist = data[0].refs;
                    return new Promise.all([data, wsClient.translateRefs(reflist)]);
                })
                .then(function (data, refhash) {
                    buildTable(data, refhash);
                })
                .then(function () {
                    // nothing to do, I guess.
                })
                .catch(function (e) {
                    // container.rmLoading();
                    console.log('ERROR');
                    console.log(e);
                    container.append('<div class="alert alert-danger">' +
                        e.error.message + '</div>')
                })
                .done();


            function buildTable(data, refhash) {
                return new Promise(function (resolve) {
                    // setup tabs

                    container.empty();
                    var tabs = container.kbTabs({tabs: [
                            {name: 'Overview', active: true},
                            {name: 'ExpressionSeries', content: html.loading()}]
                    });


                    // Code to displaying overview data
                    var keys = [
                        {key: 'wsid'},
                        {key: 'ws'},
                        {key: 'kbid'},
                        {key: 'source'},
                        {key: 'genome'},
                        {key: 'type'},
                        {key: 'errors'},
                        {key: 'owner'},
                        {key: 'date'}
                    ];

                    var wsObj = data[0][0];
                    var genome = Object.keys(wsObj.data.genome_expression_sample_ids_map)[0];
                    var phenooverdata = {
                        wsid: wsObj.info[1],
                        ws: wsObj.info[7],
                        kbid: wsObj.data.regulome_id,
                        source: wsObj.data.source,
                        genome: genome,
                        type: wsObj.data.type,
                        errors: wsObj.data.importErrors,
                        owner: wsObj.creator,
                        date: wsObj.created
                    };
                    var labels = ['Name', 'Workspace', 'KBID', 'Source', 'Genome', 'Type', 'Errors', 'Owner', 'Creation date'];
                    var table = Utils.objTable({obj: phenooverdata, keys: keys, labels: labels});
                    tabs.tabContent('Overview').append(table)

                    var series = wsObj.data.genome_expression_sample_ids_map[genome];

                    var sample_refs = [];
                    for (var i = 0; i < series.length; i++) {
                        sample_refs.push({ref: series[i]});
                    }
                    Promise.resolve(workspace.get_objects(sample_refs))
                        .then(function (sample_data) {
                            // container.rmLoading();
                            //container.empty();
                            //container.append(pcTable);
                            // create a table from the sample names
                            var pcTable = $('<table class="table table-bordered table-striped" style="width: 100%;">');
                            tabs.setContent({name: 'ExpressionSeries', content: pcTable});
                            var tableSettings = {
                                sPaginationType: "full_numbers",
                                iDisplayLength: 10,
                                aaData: sample_data,
                                aaSorting: [[0, "asc"]],
                                aoColumns: [{
                                        sTitle: "Gene Expression Samples",
                                        mData: function (d) {
                                            return d.data.id
                                        }
                                    }],
                                oLanguage: {
                                    sEmptyTable: "No objects in workspace",
                                    sSearch: "Search: "
                                }
                            };
                            pcTable.dataTable(tableSettings);
                            // container.html(tabs);

                            resolve();
                        })
                        .catch(function (e) {
                            // container.rmLoading();
                            tabs.setContent({
                                name: 'ExpressionSeries',
                                content: $('<div class="alert alert-danger">' +
                                    e.error.message + '</div>')
                            });
                            reject(e);
                        })
                        .done();
                });
            }
            return this;
        }
    });
});