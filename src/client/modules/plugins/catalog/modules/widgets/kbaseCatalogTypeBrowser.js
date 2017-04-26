define([
    'jquery',
    'bluebird',
    'kb_service/client/workspace',
    '../catalog_util',
    'datatables',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap'
], function ($, Promise, Workspace, CatalogUtil) {
    $.KBWidget({
        name: 'KBaseCatalogTypeBrowser',
        parent: 'kbaseAuthenticatedWidget', // todo: do we still need th
        options: {},

        // clients to the catalog service and the NarrativeMethodStore
        catalog: null,
        util: null,

        // main panel and elements
        $mainPanel: null,
        $loadingPanel: null,

        typeList: null,

        init: function (options) {
            this._super(options);

            var self = this;

            // new style we have a runtime object that gives us everything in the options
            self.runtime = options.runtime;
            self.util = new CatalogUtil();
            self.setupClients();

            // initialize and add the main panel
            self.$loadingPanel = self.util.initLoadingPanel();
            self.$elem.append(self.$loadingPanel);
            var mainPanelElements = self.initMainPanel();
            self.$mainPanel = mainPanelElements[0];
            self.$typeListPanel = mainPanelElements[1];
            self.$elem.append(self.$mainPanel);
            self.showLoading();

            var loadingCalls = [];
            loadingCalls.push(self.populateTypeList());

            // when we have it all, then render the list
            Promise.all(loadingCalls).then(function () {
                self.render();
                self.hideLoading();
            });

            return this;
        },

        render: function () {
            var self = this;

            var $typeTable = self.renderTable(self.typeList);
            self.$typeListPanel.append($typeTable);
            self.$typeListPanel.append($('<div>').css('height', '100px'));
        },

        renderTable: function (typeData) {

            // Custom data tables sorting function, that takes a number in an html comment
            // and sorts numerically by that number
            $.extend($.fn.dataTableExt.oSort, {
                'hidden-number-stats-pre': function (a) {
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

                'hidden-number-stats-asc': function (a, b) {
                    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
                },

                'hidden-number-stats-desc': function (a, b) {
                    return ((a < b) ? 1 : ((a > b) ? -1 : 0));
                }
            });

            var $table = $('<table>').addClass('table').css('width', '100%');

            var $container = $('<div>').addClass('container')
                .append($('<div>').addClass('row')
                    .append($('<div>').addClass('col-md-12')
                        .append($table)));

            var limit = 10000;
            var sDom = 'tipf';
            if (typeData.length < limit) {
                sDom = 'ift';
            }

            var tblSettings = {
                'bFilter': true,
                'sPaginationType': 'full_numbers',
                'iDisplayLength': limit,
                'sDom': sDom,
                'aaSorting': [
                    [0, 'asc']
                ],
                'columns': [
                    { sTitle: 'Type Name', data: 'type_link' },
                    { sTitle: 'Version', data: 'ver' },
                    { sTitle: 'Owners', data: 'owners_link' },
                    { sTitle: 'Released?', data: 'released' },
                    { sTitle: 'Timestamp', data: 'timestamp' }
                ],
                'columnDefs': [
                    { 'type': 'hidden-number-stats', targets: [4] }
                ],
                'data': typeData
            };
            $table.DataTable(tblSettings);
            $table.find('th').css('cursor', 'pointer');

            return $container;
        },


        setupClients: function () {
            this.ws = new Workspace(
                this.runtime.getConfig('services.workspace.url'), { token: this.runtime.service('session').getAuthToken() }
            );
        },

        initMainPanel: function () {
            var $mainPanel = $('<div>').addClass('container');

            $mainPanel.append($('<div>').addClass('kbcb-back-link')
                .append($('<a href="#catalog">').append('<i class="fa fa-chevron-left"></i> back to the Catalog Index')));

            var $typeListPanel = $('<div>');
            $mainPanel.append($typeListPanel);

            return [$mainPanel, $typeListPanel];
        },


        populateTypeList: function () {
            var self = this

            return self.ws.list_modules({})
                .then(function (types) {
                    self.typeList = [];
                    var moduleLookupCalls = [];
                    for (var t = 0; t < types.length; t++) {
                        moduleLookupCalls.push(
                            self.ws.get_module_info({ mod: types[t] })
                            .then(function (info) {
                                for (var name in info.types) {
                                    if (!info.types.hasOwnProperty(name)) continue;
                                    var tokens = name.split('-');
                                    var modName = tokens[0].split('.')[0];
                                    var typeName = tokens[0].split('.')[1];
                                    var ver = tokens[1]

                                    var released = '';
                                    if (info.is_released == 1) { released = 'yes'; }

                                    var owners = '';
                                    for (var o = 0; o < info.owners.length; o++) {
                                        if (o >= 1) { owners += ', '; }
                                        owners += '<a href="#people/' + info.owners[o] + '">' + info.owners[o] + '</a>';
                                    }
                                    var typeInfo = {
                                        'module': modName,
                                        'type': typeName,
                                        'type_link': '<a href="#spec/module/' + modName + '">' + modName + '</a>.<a href="#spec/type/' + modName + '.' + typeName + '">' + typeName + '</a>',
                                        'ver': ver,
                                        'timestamp': '<!--' + info.ver + '-->' + new Date(info.ver).toLocaleString(),
                                        'owners_link': owners,
                                        'released': released
                                    }
                                    self.typeList.push(typeInfo);
                                }

                            })
                            .catch(function (err) {
                                console.error(err.error.message);
                            }));
                    }
                    // when we have it all, then return
                    return Promise.all(moduleLookupCalls);
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                });
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
        }
    });
});