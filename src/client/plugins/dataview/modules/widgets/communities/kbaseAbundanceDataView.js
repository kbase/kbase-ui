/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * KBase widget to display table and boxplot of BIOM data
 */
define([
    'jquery', 
    'kb.service.workspace', 
    'kb.runtime', 
    'kb.html', 
    'kb_widget_dataview_communities_graph', 
    
    'datatables_bootstrap',
    'kb.jquery.authenticatedwidget', 
],
    function ($, Workspace, R, html, Graph) {
        'use strict';
        $.KBWidget({
            name: 'AbundanceDataView',
            parent: "kbaseAuthenticatedWidget",
            version: '1.0.0',
            token: null,
            options: {
                id: null,
                ws: null,
                name: 0
            },
            ws_url: R.getConfig('services.workspace.url'),
            init: function (options) {
                this._super(options);
                return this;
            },
            render: function () {
                var self = this;
                var pref = this.uuidv4();

                var container = this.$elem;
                container.empty();
                if (self.token === null) {
                    container.append("<div>[Error] You're not logged in</div>");
                    return;
                }
                container.append(html.loading('loading data...'));

                var kbws = new Workspace(self.ws_url, {'token': self.token});
                kbws.get_objects([{ref: self.options.ws + "/" + self.options.id}], function (data) {
                    container.empty();
                    // parse data
                    if (data.length === 0) {
                        var msg = "[Error] Object " + self.options.id + " does not exist in workspace " + self.options.ws;
                        container.append('<div><p>' + msg + '>/p></div>');
                    } else {
                        var biom = data[0].data;
                        var matrix = [];
                        var colnum = biom.columns.length;
                        var rownum = biom.rows.length;
                        var tdata = [];
                        // get matrix
                        if (biom.matrix_type === 'sparse') {
                            matrix = self.sparse2dense(biom.data, biom.shape[0], biom.shape[1]);
                        } else {
                            matrix = biom.data;
                        }
                        // get column names
                        // build graph data
                        var divdata = new Array(colnum);
                        
                        /*
                         * TODO: re-enable this color palette feature
                          EAP disable for now
                          this is a dependency on "rgbcolor.js", just one of some one-off dependencies 
                        for communities. I can't even find this source anywayere.
                        Faked for now.
                        var colors = GooglePalette(colnum);
                        */
                        var colors = [];
                        for (var i = 0; i < colnum; i += 1) {
                            colors[i] = '#678C30';
                        }
                        var clength = colnum + 1;
                        var cnames = new Array(clength);
                        cnames[0] = "Annotation";
                        for (var c = 0; c < colnum; c++) {
                            if (self.options.name === 0) {
                                cnames[c + 1] = biom['columns'][c]['id'];
                                divdata[c] = {'name': biom['columns'][c]['id'], 'data': [], 'fill': colors[c]};
                            } else {
                                cnames[c + 1] = biom['columns'][c]['name'];
                                divdata[c] = {'name': biom['columns'][c]['name'], 'data': [], 'fill': colors[c]};
                            }
                        }
                        // add values
                        var maxval = 0;
                        var tdata = new Array(rownum);
                        for (var r = 0; r < rownum; r++) {
                            tdata[r] = new Array(clength);
                            tdata[r][0] = biom['rows'][r]['id'];
                            for (var c = 0; c < colnum; c++) {
                                maxval = Math.max(maxval, matrix[r][c]);
                                divdata[c]['data'].push(matrix[r][c]);
                                var value = Math.round(matrix[r][c] * 1000) / 1000;
                                if (!value) {
                                    value = "0";
                                }
                                tdata[r][c + 1] = value;
                            }
                        }
                        // set tabs
                        /*
                        var tlen = 0;
                        if (window.hasOwnProperty('rendererTable') && rendererTable.length) {
                            tlen = rendererTable.length;
                        }
                        var glen = 0;
                        if (window.hasOwnProperty('rendererGraph') && rendererGraph.length) {
                            glen = rendererGraph.length;
                        }
                        */
                        // Made tabs created through Javascript so they don't navigate
                        // you off of an Angular page
                        // ...but the button function needs to be set up manually as below.
                        var graphId = R.genId();
                        var tableId = R.genId();
                        var $graphTab = $('<a href="#outputGraph' + graphId + '">BoxPlots</a>')
                            .click(function (e) {
                                e.preventDefault();
                                $(this).tab('show');
                            });
                        var $tableTab = $('<a href="#outputTable' + graphId + '">Abundance Table</a>')
                            .click(function (e) {
                                e.preventDefault();
                                $(this).tab('show');
                            });
                        var $tabs = $('<ul>')
                            .addClass('nav nav-tabs')
                            .append($('<li>').addClass('active').append($graphTab))
                            .append($('<li>').append($tableTab));

                        var divs = "<div class='tab-content'>" +
                            "<div class='tab-pane active' id='outputGraph" + graphId + "' style='width: 95%;'></div>" +
                            "<div class='tab-pane' id='outputTable" + graphId + "' style='width: 95%;'></div></div>";
                        container.append($tabs).append(divs);
                        // TABLE
                        
                        /*
                         TODO: possibly, replace this standaloneTable thing,
                            for now, just use this simple table generator.
                        var tableTest = standaloneTable.create({index: tlen});
                        tableTest.settings.target = document.getElementById("outputTable" + tlen);
                        tableTest.settings.data = {header: cnames, data: tdata};
                        tableTest.settings.filter = {0: {type: "text"}};
                        var mw = [120];
                        for (var i = 1; i < cnames.length; i++) {
                            mw.push(130);
                        }
                        tableTest.settings.minwidths = mw;
                        tableTest.render(tlen);
                        */
                        var tableTest = html.makeTable({ 
                            columns: cnames,
                            rows: tdata, 
                            classes: ['table', 'table-striped']
                        });
                        document.getElementById('outputTable' + graphId).innerHTML = tableTest;
                         $('#' + 'outputTable' + graphId + '>table').dataTable();
                       
                        // DEVIATION PLOT
                        var ab_type = 'normalized';
                        if (maxval > 1) {
                            ab_type = 'raw';
                        }
                        console.log(divdata);
                        var devTest = Graph.create({
                            target: document.getElementById("outputGraph" + graphId),
                            data: divdata,
                            y_title: ab_type + ' abundance',
                            show_legend: false,
                            height: 400,
                            chartArea: [0.1, 0.1, 0.95, 0.8],
                            type: "deviation"
                        });
                        devTest.render();
                    }
                }, function (data) {
                    container.empty();
                    var main = $('<div>');
                    main.append($('<p>')
                        .css({'padding': '10px 20px'})
                        .text('[Error] ' + data.error.message));
                    container.append(main);
                });
                return self;
            },
            loggedInCallback: function (event, auth) {
                this.token = auth.token;
                this.render();
                return this;
            },
            loggedOutCallback: function (event, auth) {
                this.token = null;
                this.render();
                return this;
            },
            sparse2dense: function (sparse, rmax, cmax) {
                var dense = new Array(rmax);
                for (var i = 0; i < rmax; i++) {
                    dense[i] = Array.apply(null, new Array(cmax)).map(Number.prototype.valueOf, 0);
                }
                // 0 values are undefined
                for (var i = 0; i < sparse.length; i++) {
                    dense[ sparse[i][0] ][ sparse[i][1] ] = sparse[i][2];
                }
                return dense;
            },
            /*
             * TODO: use from library
             */
            uuidv4: function (a, b) {
                for (b = a = ''; a++ < 36; b += a * 51 & 52?(a ^ 15?8 ^ Math.random() * (a ^ 20?16:4):4).toString(16):'-')
                    ;
                return b;
            }
        });
    });
