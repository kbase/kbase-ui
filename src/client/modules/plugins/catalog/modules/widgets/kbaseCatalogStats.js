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
        'kb_common/dynamicTable',
        'kb_common/jsonRpc/dynamicServiceClient',
        'datatables',
        'kb_widget/legacy/authenticatedWidget',
        'bootstrap',
        'datatables_bootstrap',
    ],
    function ($, Promise, NarrativeMethodStore, Catalog, NarrativeJobService, CatalogUtil, DynamicTable, DynamicService) {

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
            numHours : 48,  /* there are two ways to call get_app_metrics - either set a thenDate and nowDate to use as the range, or numHours here which is
                               how many hours before whatever the current timestamp is through to current */

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

                self.adminRecentRuns = [];

                return this;
            },

            /*
              I feel like I'm using the kbase dynamicTable widget wrong. This'll produce an update function for each of the 3 tables which are used
              on the page, and also dynamically make a new update function for the admin stats as we change the filtering range. Presumably, that step
              isn't required and there's a way to just bake a single updateFunction and call it for everything, given a little bit of config info.
            */
            createDynamicUpdateFunction : function ( config, rows ) {

              return function(pageNum, query, sortColId, sortColDir) {

                var reducedRows = rows;

                if (query) {
                  query = query.replace(/ /g, '|');
                  reducedRows = reducedRows.filter( function(row) {
                    return row.query.match(query);
                  });
                }

                if (sortColId) {

                  var sortIdx = config.headers.reduce( function(acc, curr, idx) {
                    if (curr.id === sortColId) {
                      acc = idx;
                    }
                    return acc;
                  }, 0);

                  reducedRows = reducedRows
                    .sort( function(a,b) {

                      var aX = sortColDir === -1 ? b[sortIdx] : a[sortIdx];
                      var bX = sortColDir === -1 ? a[sortIdx] : b[sortIdx];

                      if (!$.isNumeric(aX)) { aX = aX.toString().toLowerCase(); }
                      if (!$.isNumeric(bX)) { bX = bX.toString().toLowerCase(); }

                           if ( aX < bX ) { return -1 }
                      else if ( aX > bX ) { return 1 }
                      else                { return 0 }

                    })
                  ;
                };

                reducedRows = reducedRows.slice(pageNum * config.rowsPerPage, (pageNum + 1) * config.rowsPerPage);

                return Promise.try(function() {
                  return {
                    rows  : reducedRows,
                    start : pageNum * config.rowsPerPage,
                    query : query,
                    total : rows.length,
                  };
                });
              }

            },

            // this just takes the rows that come back from the various stats methods and reformats them into the arrays of arrays that dynamicTable likes.
            restructureRows : function(config, rows) {
              if (!rows) { return [] }
              return rows.map( function(row) {
                var rowArray = [];
                config.headers.forEach( function (header) {
                  rowArray.push(row[header.id]);
                });
                rowArray.query = rowArray.join(',');
                return rowArray;
              });
            },

            /* takes a timestamp and turns it into a locale string. If no timestamp is present, then it'll put in ...
               atm, the only place this should happen is the finish_time on an unfinished job. */
            reformatDateInTD : function($td) {
              var timestamp = parseInt($td.text(), 10);
              if (Number.isNaN(timestamp)) {
                $td.text('...');
              }
              else {
                var date = new Date(timestamp).toLocaleString();
                $td.text(date);
              }
            },

            reformatIntervalInTD : function($td) {
              var timestamp = parseInt($td.text(), 10);
              if (Number.isNaN(timestamp)) {
                $td.text('...');
              }
              else {
                $td.text( this.getNiceDuration(timestamp) );
              }
            },

            render: function () {
                var self = this;

                if (self.isAdmin) {

                    /*
                      the admins have a lot of extra toys. First of all, there's the list of flags across the top of the page.
                      Each of those flags maps to a filter function, which is used to remove rows from the table. This keeps
                      track of those filter functions.
                    */
                    var filters = {
                      finished  : function(row) { return row.complete === true },
                      queued    : function(row) { return row.exec_start_time === undefined },
                      running   : function(row) { return row.complete === false },
                      success   : function(row) { return row.complete === true && row.error !== true },
                      error     : function(row) { return row.complete === true && row.error === true }
                    };

                    // this one is a list of any filters which are active.
                    var activeFilters = {};


                    // and this function is a wrapper to restructure the rows based on the recent runs config, and strip out anything
                    // that doesn't meet a filter.
                    var makeRecentRunsTableRows = function() {
                      return self.restructureRows(
                        adminRecentRunsConfig,
                        self.adminRecentRuns.filter( function (row) {
                          var result = true;
                          Object.keys(activeFilters).forEach( function(filter) {
                            if (activeFilters[filter]) {
                              result = result && filters[filter](row);
                            }
                          })
                          return result;
                        } )
                      )
                    }

                    /* the checkboxes at the top need functions to filter on them. This creates the div that contains them, plus a custom onClick
                       tied to the filter.
                       You give it the string which is the VISIBLE name of the filter, and its bootstrap column width. It'll add it in and create the clicker.
                       It'll re-style the label with something that looks like the jgi search classes.
                       Then it'll create a new updateFunction with the reduced rows as per the function up above, and finally call getNewData.
                       Again, seems convoluted.
                    */
                    var createDivForFilter = function(filterLabel, width) {

                      var filter = filterLabel.toLowerCase();


                       return $.jqElem('div')
                        .addClass('col-sm-' + width)
                        .append(
                          $('<label>')
                            .append(
                              $('<input>')
                                .attr('type', 'checkbox')
                                .addClass('form-check-input')
                            )
                            .append(' ' + filterLabel + ' ')
                            .on('click',  function(e) {
                              var $target = $(e.target);
                              var $container = $target.prop('tagName') === 'LABEL'
                                ? $target
                                : $target.parent()
                              ;

                              activeFilters[filter] = $target.prop('checked');

                              if (activeFilters[filter]) {
                                $container.addClass('kbcb-active-filter');
                              }
                              else {
                                $container.removeClass('kbcb-active-filter');
                              }

                              var rows = makeRecentRunsTableRows();
                              $adminRecentRunsTable.currentPage = 0;
                              $adminRecentRunsTable.options.updateFunction = self.createDynamicUpdateFunction( adminRecentRunsConfig, rows);
                              $adminRecentRunsTable.getNewData();
                            })
                        )

                    }

                    /* yet another function, this one is called when the user changes the date range. It updates the thenDate/nowDate fields
                       and re-calls the get_app_metrics() function. It'll blank out the table and show the loading element and then re-call
                       the function. Once it's back, it'll update the updateFunction and re-populate the table.
                    */
                    var getLatestRunsInCustomRange = function(fromDate, toDate) {
                      self.thenDate = fromDate;
                      self.nowDate  = toDate;

                      $adminRecentRunsTable.$tBody.empty();
                      $adminRecentRunsTable.$loadingElement.show();

                      self.getAdminLatestRuns()
                        .then( function() {
                          var rows = makeRecentRunsTableRows();
                          $adminRecentRunsTable.currentPage = 0;
                          $adminRecentRunsTable.options.updateFunction = self.createDynamicUpdateFunction( adminRecentRunsConfig, rows);
                          $adminRecentRunsTable.getNewData();
                        });
                    }

                    var $adminRecentRunsFilterContainer = $('<div>')
                      .addClass('row')
                      .css('margin-bottom', '10px')
                      .append( createDivForFilter('Finished', 2) )
                      .append( createDivForFilter('Queued', 2) )
                      .append( createDivForFilter('Running', 2) )
                      .append( createDivForFilter('Success', 2) )
                      .append( createDivForFilter('Error', 1) )
                      .append(
                        /* This final element is a selector to change the range and update the admin table.
                           If the user chooses "Custom", it'll make two date fields visible. It'd probably be good to re-visit these and
                           turn them into calendar pop ups. Only so many hours in a day.
                        */
                        $.jqElem('div')
                          .addClass('col-sm-3')
                          .append(
                            $.jqElem('select')
                              .addClass('form-control')
                              .append( $.jqElem('option').attr('value', 48).append('Last 48 hours') )
                              .append( $.jqElem('option').attr('value', 24 * 7).append('Last week') )
                              .append( $.jqElem('option').attr('value', 24 * 30).append('Last month') )
                              .append( $.jqElem('option').attr('value', 'custom').append('Custom Range') )
                              .on('change', function(e) {

                                var $customDiv = $(e.target).next();
                                self.numHoursField.text($(e.target).find('option:selected').text().toLowerCase());

                                if ($(e.target).val() === 'custom') {
                                  var now = (new Date()).getTime();
                                  var then = now - self.numHours * 60 * 60 * 1000;
                                  $customDiv.show();
                                  var inputs = $customDiv.find('input');

                                  $(inputs[0]).val((new Date(then)).toLocaleString());
                                  $(inputs[1]).val((new Date(now)).toLocaleString());
                                }
                                else {
                                  self.nowDate = undefined;
                                  self.thenDate = undefined;
                                  $customDiv.hide();

                                  self.numHours = $(e.target).val();

                                  getLatestRunsInCustomRange(undefined, undefined);
                                }
                              })
                          )
                          .append(
                            /* And this div contains the range input boxes, which are hidden below the selectbox until
                               custom is chosen.
                            */
                            $.jqElem('div')
                            .css('display', 'none')
                            .append(
                              'From: ',
                              $.jqElem('input')
                                .attr('type', 'date')
                                .on('input', function(e) {
                                  var fromVal = $(e.target).val();
                                  var fromDate = Date.parse(fromVal);

                                  var toVal = $(e.target).next().val();
                                  var toDate = Date.parse(toVal);

                                  if (!Number.isNaN(fromDate) && !Number.isNaN(toDate)) {
                                    getLatestRunsInCustomRange(fromDate, toDate);
                                  }
                                })
                              ,
                              'To: ',
                              $.jqElem('input')
                                .attr('type', 'date')
                                .on('input', function(e) {
                                  var fromVal = $(e.target).prev().val();
                                  var fromDate = Date.parse(fromVal);

                                  var toVal = $(e.target).val();
                                  var toDate = Date.parse(toVal);

                                  if (!Number.isNaN(fromDate) && !Number.isNaN(toDate)) {
                                    getLatestRunsInCustomRange(fromDate, toDate);
                                  }
                                })
                            )
                          )
                      )
                    ;


                    // prep the container + data for admin recent runs stats
                    var $adminRecentRunsContainer = $('<div>').css('width', '100%');

                    var adminRecentRunsConfig = {
                      rowsPerPage : 50,
                      headers : [
                        { text : 'User', id : 'user_id', isSortable : true },
                        { text : 'App ID', id : 'app_id', isSortable : true },
                        { text : 'Job ID', id : 'job_id', isSortable : true },
                        { text : 'Module', id : 'app_module_name', isSortable : true },
                        { text : 'Submission Time', id : 'creation_time', isSortable : true },
                        { text : 'Start Time', id : 'exec_start_time', isSortable : true },
                        { text : 'End Time', id : 'finish_time', isSortable : true },
                        { text : 'Run Time', id : 'run_time', isSortable : true },
                        { text : 'Status', id : 'result', isSortable : true },
                      ],
                    };

                    var adminRecentRunsRestructuredRows = makeRecentRunsTableRows();

                    var $adminRecentRunsTable = new DynamicTable($adminRecentRunsContainer,
                      {
                        headers : adminRecentRunsConfig.headers,
                        rowsPerPage : adminRecentRunsConfig.rowsPerPage,
                        enableDownload : false,
                        updateFunction : self.createDynamicUpdateFunction(adminRecentRunsConfig, adminRecentRunsRestructuredRows),
                        rowFunction : function($row) {

                          self.reformatDateInTD( $row.children().eq(4) );
                          self.reformatDateInTD( $row.children().eq(5) );
                          self.reformatDateInTD( $row.children().eq(6) );
                          self.reformatIntervalInTD( $row.children().eq(7) );

                          var $jobLogButton = $row.children().eq(8).find('button');
                          var job_id = $jobLogButton.data('job-id');

                          /* The Status field has a button which'll show the job log. This wires it up to do so.
                             Note that it cheats out the ass - it'll manually append a new row to the table, which is outside
                             of the purview of dynamicTable. That means that if you sort the table or change the parameters that
                             the job info row will disappear. This is by design.

                             If you click on the button and already have a job-log row next, it'll remove it instead.
                          */
                          $jobLogButton.on('click', function(e) {
                            if ($row.next().data('job-log')) {
                              $row.next().remove();
                            }
                            else {
                              var $tr = $.jqElem('tr').data('job-log', 1).append(
                                $.jqElem('td')
                                  .attr('colspan', 9)
                                  .append(self.renderJobLog(job_id))
                              );
                              $row.after($tr);
                            }
                          });

                          return $row;
                        }
                      }
                    );
                    // done prep the container + data for admin recent runs stats


                    // prep the container + data for admin user stats
                    var $adminUserStatsContainer = $('<div>').css('width', '100%');

                    var adminUserStatsConfig = {
                      rowsPerPage : 50,
                      headers : [
                        { text : 'User', id : 'u', isSortable : true },
                        { text : 'App ID', id : 'id', isSortable : true },
                        { text : 'Module', id : 'module', isSortable : true },
                        { text : 'Total Runs', id : 'n', isSortable : true },
                      ],
                    };

                    var adminUserStatsRestructuredRows = self.restructureRows(adminUserStatsConfig, self.adminStats);

                    var $adminUserStatsTable = new DynamicTable($adminUserStatsContainer,
                      {
                        headers : adminUserStatsConfig.headers,
                        rowsPerPage : adminUserStatsConfig.rowsPerPage,
                        enableDownload : false,
                        updateFunction : self.createDynamicUpdateFunction(adminUserStatsConfig, adminUserStatsRestructuredRows)
                      }
                    );
                    // done prep the container + data for admin recent runs stats

                    // we need to update the length of time that displays in the section header. Note that this is
                    // somewhat manually wired and may deviate from what's in the select box. A more clever solution would be handy.
                    self.numHoursField = $('<span>').text('last ' + self.numHours + ' hours');
                    var $adminContainer = $('<div>').addClass('container-fluid')
                        .append($('<div>').addClass('row')
                            .append($('<div>').addClass('col-md-12')
                                .append(
                                  $('<h4>')
                                    .append('(Admin View) Recent Runs (submitted in ')
                                  .append(self.numHoursField)
                                  .append('):')
                                )
                                .append( $adminRecentRunsFilterContainer )
                                .append( $adminRecentRunsContainer)
                                .append('<br><br>')
                                .append('<h4>(Admin View) User Run Summary:</h4>')
                                .append($adminUserStatsContainer)
                                .append('<br><br>')
                                .append('<h4>Public Stats:</h4>')));

                    self.$basicStatsDiv.append($adminContainer);

                }

                // prep the container + data for basic stats
                var $basicStatsContainer = $('<div>').css('width', '100%');

                var basicStatsConfig = {
                  rowsPerPage : 50,
                  headers : [
                    { text : 'ID', id : 'id', isSortable : true },
                    { text : 'Module', id : 'module', isSortable : true },
                    { text : 'Total Runs', id : 'nCalls', isSortable : true },
                    { text : 'Errors', id : 'nErrors', isSortable : true },
                    { text: "Success %", id: "success", isSortable : true },
                    { text: "Avg Run Time", id: "meanRunTime", isSortable : true },
                    { text: "Avg Queue Time", id: "meanQueueTime", isSortable : true },
                    { text: "Total Run Time", id: "totalRunTime", isSortable : true },
                  ],
                };

                var basicStatsRestructuredRows = self.restructureRows(basicStatsConfig, self.allStats);

                var $basicStatsTable = new DynamicTable($basicStatsContainer,
                  {
                    headers : basicStatsConfig.headers,
                    rowsPerPage : basicStatsConfig.rowsPerPage,
                    enableDownload : false,
                    updateFunction : self.createDynamicUpdateFunction(basicStatsConfig, basicStatsRestructuredRows),
                    rowFunction : function($row) {

                      self.reformatIntervalInTD( $row.children().eq(5) );
                      self.reformatIntervalInTD( $row.children().eq(6) );
                      self.reformatIntervalInTD( $row.children().eq(7) );

                      return $row;
                    }
                  }
                );
                // done prep the container + id for basic stats

                var $container = $('<div>').addClass('container-fluid')
                    .append($('<div>').addClass('row')
                        .append($('<div>').addClass('col-md-12')
                            .append($basicStatsContainer)));

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
                // set up the metrics client. NOTE that this is only used for the admin view recent run stats ATM.
                this.metricsClient = new DynamicService({
                  url: this.runtime.getConfig('services.service_wizard.url'),
                  token: token,
                  version : 'dev',
                  module : 'kb_Metrics',
                });
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
                                meanRunTime: meanRunTime,
                                meanQueueTime: meanQueueTime,
                                totalRunTime: s.total_exec_time,
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

            /* This is the only method that uses the new kb_metrics get_app_metrics method.
               Call it with a millisecond time range, which is either now - numHours to now
               or the thenDate to the nowDate, should those be specified.
            */
            getAdminLatestRuns: function () {
                var self = this;
                if (!self.isAdmin) {
                    return Promise.try(function () {});
                }

                var seconds = (new Date().getTime() / 1000) - 172800;

                var now  = self.nowDate  || (new Date()).getTime();
                var then = self.thenDate || now - self.numHours * 60 * 60 * 1000;

                self.adminRecentRuns = [];


                return self.metricsClient.callFunc('get_app_metrics', [{epoch_range : [then, now]}]).then(function(data) {
                  var jobs = data[0].job_states;

                  jobs.forEach( function( job, idx ) {


                    // various tidying up and re-formatting of the results which came back from the service.
                    job.user_id = '<a href="#people/' + job.user + '" target="_blank">' + job.user + '</a>'

                    if (job.app_id) {
                      var appModule = job.app_id.split('/');
                      job.app_id           = '<a href="#catalog/apps/'    + appModule[0] + '/' + appModule[1] + '" target="_blank">' + appModule[1] + '</a>';
                      job.app_module_name  = '<a href="#catalog/modules/' + appModule[0] + '" target="_blank">' + appModule[0] + '</a>';
                    }
                    else if (job.method) {
                      var methodPieces = job.method.split('.');
                      job.app_id = '(API):' + methodPieces[1];
                      job.app_module_name  = '<a href="#catalog/modules/' + methodPieces[0] + '" target="_blank">' + methodPieces[0] + '</a>';
                    }
                    else {
                      job.app_id = 'Unknown';
                      job.app_module_name = 'Unknown';
                    }

                    if (job.error) {
                      job.result = '<span class="label label-danger">Error</span>';
                    }
                    else if (!job.finish_time) {
                      job.result = '<span class="label label-warning">Running</span>';
                    }
                    else {
                      job.result = '<span class="label label-success">Success</span>';
                    }

                    if (job.finish_time) {
                      job.result += ' <button class="btn btn-default btn-xs" data-job-id="' + job.job_id + '"> <i class="fa fa-file-text"></i></button>';
                    }

                    self.adminRecentRuns.push(job);

                  });

                  /*
                    user
                    app_id (SPLIT ON slashes - has module)
                    job_id
                    app_id (SPLIT ON slashes - has app_id)
                    creation_time
                    exec_start_time
                    finish_time
                    run_time
                    status
                  */
                })
                .catch(function(xhr) {
                  console.log("FAILED : ", [xhr.type, xhr.message].join(':') );
                });//*/

            },



            checkIsAdmin: function () {
                var self = this;
                self.isAdmin = true;

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
