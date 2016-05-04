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
    'kb/widget/legacy/kbasePrompt',
    'kb/widget/legacy/authenticatedWidget',
    'bootstrap',
],
    function ($, Promise, NarrativeMethodStore, Catalog, CatalogUtil, KBasePrompt) {
        $.KBWidget({
            name: "KBaseCatalogFunctionViewer",
            parent: "kbaseAuthenticatedWidget",
            options: {
                module: null, // generally a module name
                function_id: null,
                ver: null
            },

            $mainPanel: null,
            $errorPanel: null,

            // clients to the catalog service and the NarrativeMethodStore
            catalog: null,

            functionInfo: null,

            init: function (options) {
                this._super(options);

                var self = this;
                self.runtime = options.runtime;
                self.setupClients();
                self.util = new CatalogUtil();


                self.module = options.module;
                self.function_id = options.function_id;
                self.ver = null;
                if(options.ver) {
                    self.ver = options.ver;
                }

                // initialize and add the main panel
                //self.$elem.addClass('container');
                self.$errorPanel = $('<div>');
                self.$elem.append(self.$errorPanel);

                self.$loadingPanel = self.util.initLoadingPanel();
                self.$elem.append(self.$loadingPanel);
                var mainPanelElements = self.initMainPanel();
                // [$mainPanel, $header, $screenshotsPanel, $descriptionPanel, $paramsPanel, $publicationsPanel, $infoPanel];
                self.$mainPanel = mainPanelElements[0];
                self.$headerPanel = mainPanelElements[1];
                self.$screenshotsPanel = mainPanelElements[2];
                self.$descriptionPanel = mainPanelElements[3];
                self.$paramsPanel = mainPanelElements[4];
                self.$publicationsPanel = mainPanelElements[5];
                self.$infoPanel = mainPanelElements[6];

                self.$elem.append(self.$mainPanel);
                self.showLoading();

                // get the module information first, then get the app spec info
                self.getFunctionInfo()
                    .then(function() {

                        self.hideLoading();
                        if(self.functionInfo) {
                            self.renderInfo();
                        }

                    });
                return this;
            },


            setupClients: function() {
                this.catalog = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );
            },



            getFunctionInfo: function() {
                var self = this;

                var params = {
                    module_name: self.module,
                    function_id: self.function_id
                }
                if(self.ver) {
                    if(self.ver === 'dev' || self.ver === 'beta' || self.ver === 'release') {
                        params['release_tag'] = self.ver;
                    } else {
                        params['git_commit_hash'] = self.ver;
                    }
                }


                return self.catalog.get_local_function_details({functions:[params]})
                    .then(function(info_list) {
                        console.log('Method full info:')
                        console.log(info_list);

                        if(info_list.length === 0 ) {
                            console.error('ERROR: could not find function');
                            self.showError({error:{message:'Function not found.'}});
                            return;
                        }
                        self.functionInfo = info_list[0];

                        return;
                    })
                    .catch(function (err) {
                        console.error('ERROR');
                        console.error(err);
                        self.showError(err);
                        return err;
                    });
            },


            initMainPanel: function($appListPanel, $moduleListPanel) {
                var $mainPanel = $('<div>').addClass('container');

                var $header = $('<div>').css('margin','1em');
                var $screenshotsPanel = $('<div>').css('margin','1em');
                var $descriptionPanel = $('<div>').css('margin','1em');
                var $paramsPanel = $('<div>').css('margin','1em');
                var $publicationsPanel = $('<div>').css('margin','1em');
                var $infoPanel = $('<div>').css('margin','1em');

                $mainPanel.append($('<div>').addClass('kbcb-back-link')
                        .append($('<a href="#catalog/functions">').append('<i class="fa fa-chevron-left"></i> back to the Function Catalog')));
                
                $mainPanel
                    .append($header)
                    .append($screenshotsPanel)
                    .append($descriptionPanel)
                    .append($paramsPanel)
                    .append($publicationsPanel)
                    .append($infoPanel)
                    .append('<br><br><br>');

                return [$mainPanel, $header, $screenshotsPanel, $descriptionPanel, $paramsPanel, $publicationsPanel, $infoPanel];
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

            showError: function (error) {
                this.$errorPanel.empty();

                var $alert = $('<div>').addClass('col-md-12 alert alert-danger');
                this.$errorPanel.append($('<div>').addClass('container')
                                            .append($('<div>').addClass('row')
                                                .append($alert)));

                $alert.append('<strong>Error when fetching function information.</strong><br><br>');
                if(error.error) {
                    if(error.error.message){
                        $alert.append(error.error.message);
                    }
                }
                $alert.append('<br>');
                this.$errorPanel.show();
            },


            renderInfo: function() {

                var self = this;

                var info = self.functionInfo.info;
                var description = self.functionInfo.long_description;


                // HEADER - contains logo, title, module link, authors
                var $header = $('<div>').addClass('kbcb-app-page');
                var $topDiv = $('<div>').addClass('kbcb-app-page-header');
                var $logoSpan = $('<div>').addClass('kbcb-app-page-logo');

                var $titleSpan = $('<div>').addClass('kbcb-app-page-title-panel');
                
                var version_string = info.version;

                if(info.release_tag) {
                    version_string += ' '+info.release_tag;
                }

                $titleSpan.append($('<div>').addClass('kbcb-app-page-title').append(info.name).append(
                    $('<span>').css({'font-size':'0.5em','margin-left':'0.5em'})
                        .append(version_string)));
                

                $titleSpan.append($('<div>').addClass('kbcb-app-page-module').append(
                                        $('<a href="#appcatalog/module/'+info.module_name+'">')
                                            .append(info.module_name)));





                if(info.authors.length>0) {
                    var $authorDiv = $('<div>').addClass('kbcb-app-page-authors').append('by ');
                    for(var k=0; k<info.authors.length; k++) {
                        if(k>=1) {
                            $authorDiv.append(', ');
                        }
                        $authorDiv.append($('<a href="#people/'+info.authors[k]+'">')
                                            .append(info.authors[k])
                                            .on('click',function(event) {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            }));
                    }
                    $titleSpan.append($authorDiv);
                }



                $header.append(
                    $topDiv
                        .append($('<table>').css('width','100%')
                                    .append($('<tr>')
                                        .append($('<td>')
                                            .css({'width':'20px', 'vertical-align':'top'})
                                            .append()) // logo would go here..
                                        .append($('<td>')
                                            .append($titleSpan))
                                        )));


                var $footerRow = $('<div>').addClass('row');

                // spacer used to be favorites area...
                var $spacer = $('<div>').addClass('col-xs-2');
                var $nRuns = $('<div>').addClass('kbcb-runs').addClass('col-xs-10');


                if(self.isLegacyMethod || self.isLegacyApp) {
                    $nRuns.append("<small>Run statistics cannot be displayed for this method.</small>").css('text-align','left');
                }

                $header.append(
                    $('<div>').addClass('kbcb-app-page-stats-bar container').append(
                        $('<div>').addClass('row')
                            .append($spacer)
                            .append($nRuns)));


                self.$headerPanel.append($header);


                // show subtitle information just below the other header information
                var $short_description = $('<div>').addClass('kbcb-app-page-subtitle').append(info.short_description)
                self.$headerPanel.append($short_description);



                self.$descriptionPanel
                        .append(
                            $.jqElem('div')
                            .addClass('row')
                            .css('width', '95%')
                            .append(
                                $.jqElem('div')
                                .addClass('col-md-12')
                                .append(
                                    $.jqElem('div')
                                    .append($.jqElem('hr'))
                                    .append(description)
                                    )
                                )
                            )
                        .append($.jqElem('hr'))


            }
        });
    });



