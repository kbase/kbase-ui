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
    'kb/service/client/narrativeMethodStore',
    'kb/service/client/catalog',
    './catalog_util',
    'datatables',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
    'datatables_bootstrap',
],
    function ($, Promise, NarrativeMethodStore, Catalog, CatalogUtil) {
        $.KBWidget({
            name: "KBaseCatalogStats",
            parent: "kbaseAuthenticatedWidget",  // todo: do we still need th
            options: {
            },

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,
            util: null,

            // main panel and elements
            $mainPanel: null,
            $loadingPanel: null,
            $basicStatsDiv: null,

            allStats: null,

            adminStats : null,

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
                Promise.all(loadingCalls).then(function() {
                    self.render();
                    self.hideLoading();
                });

                return this;
            },

            render: function() {
                var self = this;

                var $table = $('<table>').addClass('table').css('width','100%');


                var $container = $('<div>').addClass('container')
                        .append($('<div>').addClass('row')
                            .append($('<div>').addClass('col-md-12')
                                .append($table)));


                // Custom data tables sorting function, that takes a number in an html comment
                // and sorts numerically by that number
                $.extend( $.fn.dataTableExt.oSort, {
                    "hidden-number-stats-pre": function ( a ) {
                        // extract out the first comment if it exists, then parse as number
                        var t = a.split('-->');
                        if(t.length>1) {
                            var t2 = t[0].split('<!--');
                            if(t2.length>1) {
                                return Number(t2[1]);
                            }
                        }
                        return Number(a);
                    },
                 
                    "hidden-number-stats-asc": function( a, b ) {
                        return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                    },
                 
                    "hidden-number-stats-desc": function(a,b) {
                        return ((a < b) ? 1 : ((a > b) ? -1 : 0));
                    }
                } );


                var tblSettings = {
                    "bFilter": true,
                    "sPaginationType": "full_numbers",
                    "iDisplayLength": 100,
                    "sDom": 'ft<ip>',
                    "aaSorting": [[ 2, "dsc" ], [1, "asc"]],
                    "columns": [
                        {sTitle: 'ID', data: "id"},
                        {sTitle: "Module", data: "module"},
                        {sTitle: "Total Runs", data: "nCalls"},
                        {sTitle: "Errors", data: "nErrors"},
                        {sTitle: "Success %", data: "success"},
                        {sTitle: "Avg Run Time", data: "meanRunTime"},
                        {sTitle: "Avg Queue Time", data: "meanQueueTime"},
                        {sTitle: "Total Run Time", data: "totalRunTime"}
                    ],
                    "columnDefs": [
                        { "type": "hidden-number-stats", targets: [5,6,7] }
                    ],
                    "data": self.allStats
                };
                $table.DataTable(tblSettings);
                $table.find('th').css('cursor','pointer');

                self.$basicStatsDiv.append($container);

                if(self.isAdmin) {
                    var $adminTable = $('<table>').addClass('table').css('width','100%');


                    var $adminContainer = $('<div>').addClass('container')
                            .append($('<div>').addClass('row')
                                .append($('<div>').addClass('col-md-12')
                                    .append('<h4>Admin Accessible Stats</h4>')
                                    .append($adminTable)));

                    var adminTblSettings = {
                        "bFilter": true,
                        "sPaginationType": "full_numbers",
                        "iDisplayLength": 100,
                        "sDom": 'ft<ip>',
                        "aaSorting": [[ 3, "dsc" ], [1, "asc"]],
                        "columns": [
                            {sTitle: 'User', data: "u"},
                            {sTitle: "Id", data: "id"},
                            {sTitle: "Module", data: "module"},
                            {sTitle: "Total Runs", data: "n"}
                        ],
                        "data": self.adminStats
                    };
                    $adminTable.DataTable(adminTblSettings);
                    $adminTable.find('th').css('cursor','pointer');

                    self.$basicStatsDiv.append($adminContainer);
                }
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },

            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#appcatalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog')));

                var $basicStatsDiv = $('<div>');
                $mainPanel.append($basicStatsDiv);

                $mainPanel.append('<br><br>');

                return [$mainPanel, $basicStatsDiv];
            },

            initLoadingPanel: function() {
                var $loadingPanel = $('<div>').addClass('kbcb-loading-panel-div');
                $loadingPanel.append($('<i>').addClass('fa fa-spinner fa-2x fa-spin'));
                return $loadingPanel;
            },

            showLoading: function() {
                var self = this;
                self.$loadingPanel.show();
                self.$mainPanel.hide();
            },
            hideLoading: function() {
                var self = this;
                self.$loadingPanel.hide();
                self.$mainPanel.show();
            },

            getNiceDuration: function(seconds) {
                var hours = Math.floor(seconds / 3600);
                seconds = seconds - (hours * 3600);
                var minutes = Math.floor(seconds / 60);
                seconds = seconds - (minutes * 60);

                var duration = '';
                if(hours>0) {
                    duration = hours + 'h '+ minutes + 'm';
                } else if (minutes>0) {
                    duration = minutes + 'm ' + Math.round(seconds) + 's'; 
                }
                else {
                    duration = (Math.round(seconds*100)/100) + 's'; 
                }
                return duration;

            },


            getStats: function() {
                var self = this

                return self.catalog.get_exec_aggr_stats({})
                    .then(function (stats) {
                        self.allStats = [];

                        for(var k=0; k<stats.length; k++) {
                            var s = stats[k];

                            var id = s.full_app_id;
                            if(s.full_app_id.split('/').length==2) {
                                id = s.full_app_id.split('/')[1];
                            }

                            var goodCalls = s.number_of_calls - s.number_of_errors
                            var successPercent = ((goodCalls) / s.number_of_calls)*100;

                            var meanRunTime = s.total_exec_time/s.number_of_calls;
                            var meanQueueTime = s.total_queue_time/s.number_of_calls;

                            var stat = {
                                id: '<a href="#appcatalog/app/'+s.full_app_id+'/dev">'+id+'</a>',
                                module: '<a href="#appcatalog/module/'+s.module_name+'">'+s.module_name+'</a>',
                                nCalls: s.number_of_calls,
                                nErrors: s.number_of_errors,
                                success: successPercent.toPrecision(3),
                                meanRunTime:  '<!--'+meanRunTime+'-->'+ self.getNiceDuration(meanRunTime),
                                meanQueueTime: '<!--'+meanQueueTime+'-->'+ self.getNiceDuration(meanQueueTime),
                                totalRunTime: '<!--'+s.total_exec_time+'-->'+self.getNiceDuration(s.total_exec_time),
                            }
                            self.allStats.push(stat);
                        }
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                    });
            },


            getAdminStats: function() {
                var self = this;


                return self.checkIsAdmin()
                    .then(function() {
                        if(self.isAdmin) {
                            return self.catalog.get_exec_aggr_table({})
                                .then(function (adminStats) {

                                    //console.log(adminStats);
                                    self.adminStats = [];

                                    for(var k=0; k<adminStats.length; k++) {
                                        var s = adminStats[k];

                                        var id = s.app;
                                        var module = 'l.m';
                                        if(id) {
                                            if(s.app.split('/').length==2) {
                                                module = s.app.split('/')[0];
                                                id = s.app.split('/')[1];
                                            }
                                            id = '<a href="#appcatalog/app/'+module+'/'+id+'/dev">'+id+'</a>';
                                            module = '<a href="#appcatalog/module/'+module+'">'+module+'</a>';
                                        } else {
                                            if(s.func) {
                                                id = 'API Call: ' + s.func;
                                            } else {
                                                id = 'API Call: unknown!';
                                            }
                                            if(s.func_mod) {
                                                module = 'API Call: ' +s.func_mod;
                                            } else {
                                                module = 'API Call: unknown!';
                                            }
                                        }

                                        var stat = {
                                            id: id,
                                            module: module,
                                            n: s.n,
                                            u: '<a href="#people/'+s.user+'">'+s.user+'</a>'
                                        }
                                        self.adminStats.push(stat);
                                    }
                                });
                        } else {
                            return Promise.try(function() {});
                        }
                    }).catch(function(err) {
                        // do nothing if this fails
                        console.error(err)
                        return Promise.try(function() {});
                    });
            },

            checkIsAdmin: function() {
                var self = this
                self.isAdmin = false;

                var me = self.runtime.service('session').getUsername();
                return self.catalog.is_admin(me)
                    .then(function (result) {
                        if(result) {
                            self.isAdmin = true;
                        }
                    }).catch(function() {
                        return Promise.try(function() {});
                    });
            }


        });
    });



