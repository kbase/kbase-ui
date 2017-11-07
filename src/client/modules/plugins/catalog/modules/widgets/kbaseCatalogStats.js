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
        'kb_service/client/narrativeMethodStore',
        'kb_service/client/catalog',
        'kb_service/client/narrativeJobService',
        '../catalog_util',
        'datatables',
        'kb_widget/legacy/authenticatedWidget',
        'bootstrap',
        'datatables_bootstrap'
    ],
    function ($, Promise, NarrativeMethodStore, Catalog, NarrativeJobService, CatalogUtil) {

        function renderDate ( date, type, full ) {
          if(type == "display"){
            date = new Date(date * 1000).toLocaleString();
          }
          return date;
        }

        $.KBWidget({
            name: "KBaseCatalogStats",
            parent: "kbaseAuthenticatedWidget", // todo: do we still need th
            options: {},

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            util: null,
            njs: null,

            // main panel and elements
            $mainPanel: null,
            $loadingPanel: null,
            $basicStatsDiv: null,

            allStats: null,

            adminStats: null,

            init: function (options) {
                this._super(options);

                var self = this;

                // new style we have a runtime object that gives us everything in the options
                self.runtime = options.runtime;
                self.setupClients();
                self.util = new CatalogUtil();

                // initialize and add the main panel
                self.$loadingPanel = self.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                self.$mainPanel = mainPanelElements[0];
                self.$basicStatsDiv = mainPanelElements[1];
                self.$elem.append(self.$mainPanel);
                self.showLoading();

                // get the module information
                var loadingCalls = [];
                loadingCalls.push(self.getStats());
                loadingCalls.push(self.getAdminStats());

                // when we have it all, then render the list
                Promise.all(loadingCalls).then(function () {
                    self.render();
                    self.hideLoading();
                });

                return this;
            },

            render: function () {
                var self = this;

                // Custom data tables sorting function, that takes a number in an html comment
                // and sorts numerically by that number
                $.extend($.fn.dataTableExt.oSort, {
                    "hidden-number-stats-pre": function (a) {
                        // extract out the first comment if it exists, then parse as number
                        var t = a.split('-->');
                        if (t.length > 1) {
                            var t2 = t[0].split('<!--');
                            if (t2.length > 1) {
                                return Number(t2[1]);
                            }
                        }
                        return Number(a);
                    },

                    "hidden-number-stats-asc": function (a, b) {
                        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                    },

                    "hidden-number-stats-desc": function (a, b) {
                        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
                    }
                });

                if (self.isAdmin) {

                    var $adminUserStatsTable = $('<table>').addClass('table').css('width', '100%');
                    var $adminRecentRunsTable = $('<table>').addClass('table').css('width', '100%');


                    var $adminContainer = $('<div>').addClass('container-fluid')
                        .append($('<div>').addClass('row')
                            .append($('<div>').addClass('col-md-12')
                                .append('<h4>(Admin View) Recent Runs (completed in last 48h):</h4>')
                                .append($adminRecentRunsTable)
                                .append('<br><br>')
                                .append('<h4>(Admin View) User Run Summary:</h4>')
                                .append($adminUserStatsTable)
                                .append('<br><br>')
                                .append('<h4>Public Stats:</h4>')));

                    var adminRecentRunsTblSettings = {
                        "bFilter": true,
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 50,
                        "sDom": 'ft<ip>',
                        "aaSorting": [
                            [3, "dsc"]
                        ],
                        "columns": [
                            { sTitle: 'User', data: "user_id" },
                            { sTitle: "App Id", data: "app_id" },
                            { sTitle: "Job Id", data: "job_id" },
                            { sTitle: "Module", data: "app_module_name" },
                            { sTitle: "Submission Time", data: "creation_time", mRender : renderDate },
                            { sTitle: "Start Time", data: "exec_start_time", mRender : renderDate },
                            { sTitle: "End Time", data: "finish_time", mRender : renderDate },
                            { sTitle: "Run Time", data: "run_time" },
                            { sTitle: "Result", data: "result", className: "job-log" },
                        ],
                        "columnDefs": [
                            { "type": "hidden-number-stats", targets: [7] }
                        ],
                        "data": self.adminRecentRuns,
                        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                            $('td:eq(8)', nRow).find('.btn').on('click', function (e) {
                                var row = renderedTable.row(nRow);
                                if (row.child.isShown()) {
                                    row.child.hide();
                                } else {
                                    row.child(self.renderJobLog(aData.job_id)).show();
                                }
                            })
                        }
                    };
                    var renderedTable = $adminRecentRunsTable.DataTable(adminRecentRunsTblSettings);
                    $adminRecentRunsTable.find('th').css('cursor', 'pointer');

                    //
                    // $adminRecentRunsTable.find('tbody').on('click', 'td.job-log', function() {
                    //     var tr = $(this).closest('tr');
                    //     var row = renderedTable.row('tr');
                    //     if (row.child.isShown()) {
                    //         row.child.hide();
                    //         tr.removeClass('shown');
                    //     } else {
                    //         row.child("i'm a log! job id " + (row.data())['job_id']).show();
                    //         tr.addClass('shown');
                    //     }
                    // })


                    var adminUserStatsTblSettings = {
                        "bFilter": true,
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 50,
                        "sDom": 'ft<ip>',
                        "aaSorting": [
                            [3, "dsc"],
                            [1, "asc"]
                        ],
                        "columns": [
                            { sTitle: 'User', data: "u" },
                            { sTitle: "App Id", data: "id" },
                            { sTitle: "Module", data: "module" },
                            { sTitle: "Total Runs", data: "n" }
                        ],
                        "data": self.adminStats
                    };
                    $adminUserStatsTable.DataTable(adminUserStatsTblSettings);
                    $adminUserStatsTable.find('th').css('cursor', 'pointer');

                    self.$basicStatsDiv.append($adminContainer);

                }


                var $table = $('<table>').addClass('table').css('width', '100%');

                var $container = $('<div>').addClass('container-fluid')
                    .append($('<div>').addClass('row')
                        .append($('<div>').addClass('col-md-12')
                            .append($table)));

                var tblSettings = {
                    "bFilter": true,
                    "sPaginationType": "full_numbers",
                    "iDisplayLength": 50,
                    "sDom": 'ft<ip>',
                    "aaSorting": [
                        [2, "dsc"],
                        [1, "asc"]
                    ],
                    "columns": [
                        { sTitle: 'ID', data: "id" },
                        { sTitle: "Module", data: "module" },
                        { sTitle: "Total Runs", data: "nCalls" },
                        { sTitle: "Errors", data: "nErrors" },
                        { sTitle: "Success %", data: "success" },
                        { sTitle: "Avg Run Time", data: "meanRunTime" },
                        { sTitle: "Avg Queue Time", data: "meanQueueTime" },
                        { sTitle: "Total Run Time", data: "totalRunTime" }
                    ],
                    "columnDefs": [
                        { "type": "hidden-number-stats", targets: [5, 6, 7] }
                    ],
                    "data": self.allStats
                };
                $table.DataTable(tblSettings);
                $table.find('th').css('cursor', 'pointer');

                self.$basicStatsDiv.append($container);
            },

            renderJobLog: function (jobId) {
                var logLine = function (lineNum, text, isError) {
                    var $line = $('<div>').addClass('kblog-line');
                    $line.append($('<div>').addClass('kblog-num-wrapper').append($('<div>').addClass('kblog-line-num').append(lineNum)));
                    $line.append($('<div>').addClass('kblog-text').append(text));
                    if (isError === 1) {
                        $line.addClass('kb-error');
                    }
                    return $line;
                }
                var $log = $('<div>').addClass('kbcb-log-view').append('loading logs...');
                this.njs.get_job_logs({ job_id: jobId, skip_lines: 0 })
                    .then(function (logs) {
                        $log.empty();
                        for (var i = 0; i < logs.lines.length; i++) {
                            $log.append(logLine(i, logs.lines[i].line, logs.lines[i].is_error));
                        }
                    });
                return $log;
            },

            setupClients: function () {
                var token = this.runtime.service('session').getAuthToken();
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'), { token: token }
                );
                this.njs = new NarrativeJobService(
                    this.runtime.getConfig('services.narrative_job_service.url'), { token: token }
                );
            },

            initMainPanel: function ($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container-fluid');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                    .append($('<a href="#catalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog Index')));

                var $basicStatsDiv = $('<div>');
                $mainPanel.append($basicStatsDiv);

                $mainPanel.append('<br><br>');

                return [$mainPanel, $basicStatsDiv];
            },

            initLoadingPanel: function () {
                var $loadingPanel = $('<div>').addClass('kbcb-loading-panel-div');
                $loadingPanel.append($('<i>').addClass('fa fa-spinner fa-2x fa-spin'));
                return $loadingPanel;
            },

            showLoading: function () {
                var self = this;
                self.$loadingPanel.show();
                self.$mainPanel.hide();
            },
            hideLoading: function () {
                var self = this;
                self.$loadingPanel.hide();
                self.$mainPanel.show();
            },

            getNiceDuration: function (seconds) {
                var hours = Math.floor(seconds / 3600);
                seconds = seconds - (hours * 3600);
                var minutes = Math.floor(seconds / 60);
                seconds = seconds - (minutes * 60);

                var duration = '';
                if (hours > 0) {
                    duration = hours + 'h ' + minutes + 'm';
                } else if (minutes > 0) {
                    duration = minutes + 'm ' + Math.round(seconds) + 's';
                } else {
                    duration = (Math.round(seconds * 100) / 100) + 's';
                }
                return duration;

            },


            getStats: function () {
                var self = this

                return self.catalog.get_exec_aggr_stats({})
                    .then(function (stats) {
                        self.allStats = [];

                        for (var k = 0; k < stats.length; k++) {
                            var s = stats[k];

                            var id = s.full_app_id;
                            if (s.full_app_id.split('/').length == 2) {
                                id = s.full_app_id.split('/')[1];
                            }

                            var goodCalls = s.number_of_calls - s.number_of_errors
                            var successPercent = ((goodCalls) / s.number_of_calls) * 100;

                            var meanRunTime = s.total_exec_time / s.number_of_calls;
                            var meanQueueTime = s.total_queue_time / s.number_of_calls;

                            var stat = {
                                id: '<a href="#catalog/apps/' + s.full_app_id + '/dev">' + id + '</a>',
                                module: '<a href="#catalog/modules/' + s.module_name + '">' + s.module_name + '</a>',
                                nCalls: s.number_of_calls,
                                nErrors: s.number_of_errors,
                                success: successPercent.toPrecision(3),
                                meanRunTime: '<!--' + meanRunTime + '-->' + self.getNiceDuration(meanRunTime),
                                meanQueueTime: '<!--' + meanQueueTime + '-->' + self.getNiceDuration(meanQueueTime),
                                totalRunTime: '<!--' + s.total_exec_time + '-->' + self.getNiceDuration(s.total_exec_time),
                            }
                            self.allStats.push(stat);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            getAdminStats: function () {
                var self = this;

                return self.checkIsAdmin()
                    .then(function () {
                        if (self.isAdmin) {
                            return self.getAdminUserStats()
                                .then(function () {
                                    return self.getAdminLatestRuns();
                                })
                        } else {
                            return Promise.try(function () {});
                        }
                    }).catch(function (err) {
                        // do nothing if this fails
                        console.error(err)
                        return Promise.try(function () {});
                    });
            },


            getAdminUserStats: function () {
                var self = this;
                if (!self.isAdmin) {
                    return Promise.try(function () {});
                }

                return self.catalog.get_exec_aggr_table({})
                    .then(function (adminStats) {

                        self.adminStats = [];

                        for (var k = 0; k < adminStats.length; k++) {
                            var s = adminStats[k];

                            var id = s.app;
                            var module = 'l.m';
                            if (id) {
                                if (s.app.split('/').length == 2) {
                                    module = s.app.split('/')[0];
                                    id = s.app.split('/')[1];
                                }
                                id = '<a href="#catalog/apps/' + module + '/' + id + '/dev">' + id + '</a>';
                                module = '<a href="#catalog/modules/' + module + '">' + module + '</a>';
                            } else {
                                if (s.func) {
                                    id = 'API Call: ' + s.func;
                                } else {
                                    id = 'API Call: unknown!';
                                }
                                if (s.func_mod) {
                                    module = 'API Call: ' + s.func_mod;
                                } else {
                                    module = 'API Call: unknown!';
                                }
                            }

                            var stat = {
                                id: id,
                                module: module,
                                n: s.n,
                                u: '<a href="#people/' + s.user + '">' + s.user + '</a>'
                            }
                            self.adminStats.push(stat);
                        }
                    });
            },

            getAdminLatestRuns: function () {
                var self = this;
                if (!self.isAdmin) {
                    return Promise.try(function () {});
                }

                var seconds = (new Date().getTime() / 1000) - 172800;

                return self.catalog.get_exec_raw_stats({ begin: seconds })
                    .then(function (data) {
                        self.adminRecentRuns = [];
                        for (var k = 0; k < data.length; k++) {
                            var rt = data[k]['finish_time'] - data[k]['exec_start_time'];
                            data[k]['user_id'] = '<a href="#people/' + data[k]['user_id'] + '">' + data[k]['user_id'] + '</a>'
                            data[k]['run_time'] = '<!--' + rt + '-->' + self.getNiceDuration(rt);

                            if (data[k]['is_error']) {
                                data[k]['result'] = '<span class="label label-danger">Error</span>';
                            } else {
                                data[k]['result'] = '<span class="label label-success">Success</span>';
                            }
                            data[k]['result'] += '<span class="btn btn-default btn-xs"><i class="fa fa-file-text"></i></span>';

                            if (data[k]['app_id']) {
                                var mod = ''; //data[k]['app_module_name'];
                                if (data[k]['app_module_name']) {
                                    mod = data[k]['app_module_name'];
                                    data[k]['app_module_name'] = '<a href="#catalog/modules/' + mod + '">' +
                                        mod + '</a>';
                                }
                                data[k]['app_id'] = '<a href="#catalog/apps/' + mod + '/' + data[k]['app_id'] + '">' +
                                    data[k]['app_id'] + '</a>';
                            } else {
                                if (data[k]['func_name']) {
                                    data[k]['app_id'] = '(API):' + data[k]['func_name'];
                                    if (data[k]['func_module_name']) {
                                        mod = data[k]['func_module_name'];
                                        data[k]['app_module_name'] = '<a href="#catalog/modules/' + mod + '">' +
                                            mod + '</a>';
                                    } else {
                                        data[k]['app_module_name'] = 'Unknown'
                                    }

                                } else {
                                    data[k]['app_id'] = 'Unknown'
                                    data[k]['app_module_name'] = 'Unknown'
                                }
                            }

                        }
                        self.adminRecentRuns = data;
                    });
            },



            checkIsAdmin: function () {
                var self = this;
                self.isAdmin = false;

                var me = self.runtime.service('session').getUsername();
                return self.catalog.is_admin(me)
                    .then(function (result) {
                        if (result) {
                            self.isAdmin = true;
                        }
                    }).catch(function () {
                        return Promise.try(function () {});
                    });
            }


        });
    });
