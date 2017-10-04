define([
    'jquery',
    'bluebird',
    'kb_service/client/narrativeMethodStore',
    'kb_service/client/catalog',
    '../catalog_util',
    'kb_widget/legacy/authenticatedWidget',
    'bootstrap',
], function ($, Promise, NarrativeMethodStore, Catalog, CatalogUtil) {
    $.KBWidget({
        name: 'KBaseCatalogFunctionViewer',
        parent: 'kbaseAuthenticatedWidget',
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
            if (options.ver) {
                self.ver = options.ver;
            }

            // initialize and add the main panel
            //self.$elem.addClass('container-fluid');
            self.$errorPanel = $('<div>');
            self.$elem.append(self.$errorPanel);

            self.$loadingPanel = self.util.initLoadingPanel();
            self.$elem.append(self.$loadingPanel);
            var mainPanelElements = self.initMainPanel();
            // [$mainPanel, $header, $descriptionPanel, $paramsPanel, $specPanel, $infoPanel];
            self.$mainPanel = mainPanelElements[0];
            self.$headerPanel = mainPanelElements[1];
            self.$descriptionPanel = mainPanelElements[2];
            self.$paramsPanel = mainPanelElements[3];
            self.$specPanel = mainPanelElements[4];
            self.$infoPanel = mainPanelElements[5];

            self.$elem.append(self.$mainPanel);
            self.showLoading();

            // get the module information first, then get the app spec info
            self.getFunctionInfo()
                .then(function () {
                    self.hideLoading();
                    if (self.functionInfo) {
                        self.renderInfo();
                        self.renderParseInfo();
                    }
                });
            return this;
        },


        setupClients: function () {
            this.catalog = new Catalog(
                this.runtime.getConfig('services.catalog.url'), { token: this.runtime.service('session').getAuthToken() }
            );
        },



        getFunctionInfo: function () {
            var self = this;

            var params = {
                module_name: self.module,
                function_id: self.function_id
            }
            if (self.ver) {
                if (self.ver === 'dev' || self.ver === 'beta' || self.ver === 'release') {
                    params['release_tag'] = self.ver;
                } else {
                    params['git_commit_hash'] = self.ver;
                }
            }


            return self.catalog.get_local_function_details({ functions: [params] })
                .then(function (info_list) {
                    if (info_list.length === 0) {
                        console.error('ERROR: could not find function');
                        self.showError({ error: { message: 'Function not found.' } });
                        return;
                    }
                    self.functionInfo = info_list[0];
                    return self.getModuleInfo(self.functionInfo.info.module_name, self.functionInfo.info.git_commit_hash);
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                    self.showError(err);
                    return err;
                });
        },


        getModuleInfo: function (module_name, git_commit_hash) {
            var self = this;
            return self.catalog.get_module_version({
                    module_name: module_name,
                    git_commit_hash: git_commit_hash,
                    'include_compilation_report': 1
                })
                .then(function (module_version) {
                    if (!module_version === 0) {
                        console.error('ERROR: could not fetch module information');
                        self.showError({ error: { message: 'Module not found.' } });
                        return;
                    }
                    self.module_version = module_version;
                })
                .catch(function (err) {
                    console.error('ERROR');
                    console.error(err);
                    self.showError(err);
                    return err;
                });
        },


        initMainPanel: function ($appListPanel, $moduleListPanel) {
            var $mainPanel = $('<div>').addClass('container-fluid');

            var $header = $('<div>').css('margin', '1em');
            var $descriptionPanel = $('<div>').css('margin', '1em');
            var $paramsPanel = $('<div>').css('margin', '1em');
            var $specPanel = $('<div>').css('margin', '1em');
            var $infoPanel = $('<div>').css('margin', '1em');

            $mainPanel.append($('<div>').addClass('kbcb-back-link')
                .append($('<a href="#catalog/functions">').append('<i class="fa fa-chevron-left"></i> back to the Function Catalog')));

            $mainPanel
                .append($header)
                .append($descriptionPanel)
                .append($paramsPanel)
                .append($specPanel)
                .append($infoPanel)
                .append('<br><br><br>');

            return [$mainPanel, $header, $descriptionPanel, $paramsPanel, $specPanel, $infoPanel];
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

        showError: function (error) {
            this.$errorPanel.empty();

            var $alert = $('<div>').addClass('col-md-12 alert alert-danger');
            this.$errorPanel.append($('<div>').addClass('container-fluid')
                .append($('<div>').addClass('row')
                    .append($alert)));

            $alert.append('<strong>Error when fetching function information.</strong><br><br>');
            if (error.error) {
                if (error.error.message) {
                    $alert.append(error.error.message);
                }
            }
            $alert.append('<br>');
            this.$errorPanel.show();
        },


        renderInfo: function () {

            var self = this;

            var info = self.functionInfo.info;
            var description = self.functionInfo.long_description;
            var module_version = self.module_version;


            // HEADER - contains logo, title, module link, authors
            var $header = $('<div>').addClass('kbcb-app-page');
            var $topDiv = $('<div>').addClass('kbcb-app-page-header');
            var $logoSpan = $('<div>').addClass('kbcb-app-page-logo');

            var $titleSpan = $('<div>').addClass('kbcb-app-page-title-panel');

            var version_string = info.version;

            if (module_version.release_tags) {
                version_string += ' ' + module_version.release_tags.join(', ');;
            }

            $titleSpan.append($('<div>').addClass('kbcb-app-page-title').append(info.name).append(
                $('<span>').css({ 'font-size': '0.5em', 'margin-left': '0.5em' })
                .append(version_string)));


            $titleSpan.append($('<div>').addClass('kbcb-app-page-module').append(
                $('<a href="#catalog/modules/' + info.module_name + '">')
                .append(info.module_name)));





            if (info.authors.length > 0) {
                var $authorDiv = $('<div>').addClass('kbcb-app-page-authors').append('by ');
                for (var k = 0; k < info.authors.length; k++) {
                    if (k >= 1) {
                        $authorDiv.append(', ');
                    }
                    $authorDiv.append($('<a href="#people/' + info.authors[k] + '">')
                        .append(info.authors[k])
                        .on('click', function (event) {
                            // have to stop propagation so we don't go to the app page first
                            event.stopPropagation();
                        }));
                }
                $titleSpan.append($authorDiv);
            }



            $header.append(
                $topDiv
                .append($('<table>').css('width', '100%')
                    .append($('<tr>')
                        .append($('<td>')
                            .css({ 'width': '20px', 'vertical-align': 'top' })
                            .append()) // logo would go here..
                        .append($('<td>')
                            .append($titleSpan))
                    )));


            var $footerRow = $('<div>').addClass('row');

            // spacer used to be favorites area...
            var $spacer = $('<div>').addClass('col-xs-2');
            var $nRuns = $('<div>').addClass('kbcb-runs').addClass('col-xs-10');


            if (self.isLegacyMethod || self.isLegacyApp) {
                $nRuns.append('<small>Run statistics cannot be displayed for this method.</small>').css('text-align', 'left');
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

            if (self.module_version) {
                var git_url = self.module_version.git_url;
                if (git_url.indexOf('.git', git_url.length - '.git'.length) !== -1) {
                    git_url = git_url.substring(0, git_url.length - '.git'.length);
                }
                var $gitDiv = $('<div>');
                if (git_url.indexOf('github.com') > -1) {
                    $gitDiv.append('<b>Github Source Commit:</b>&nbsp; &nbsp; <a href="' + git_url + '/tree/' + self.functionInfo.info.git_commit_hash +
                        '" target="_blank">' + git_url + '/tree/' + self.functionInfo.info.git_commit_hash + '</a><br>');

                    var specUrl = git_url + '/tree/' + self.functionInfo.info.git_commit_hash +
                        '/ui/local_functions/' + self.functionInfo.info.function_id + '.json';
                    $gitDiv.append('<b>Github Documentation Spec:</b>&nbsp; &nbsp; <a href="' + specUrl + '" target="_blank">' + specUrl + '</a><br>');

                    if (self.module_version.compilation_report) {
                        if (self.module_version.compilation_report.function_places &&
                            self.module_version.compilation_report.impl_file_path) {

                            var start = 0;
                            var stop = 0;
                            if (self.module_version.compilation_report.function_places[self.functionInfo.info.function_id]) {
                                var places = self.module_version.compilation_report.function_places[self.functionInfo.info.function_id];
                                var impl_path = self.module_version.compilation_report.impl_file_path;


                                var implUrl = git_url + '/tree/' + self.functionInfo.info.git_commit_hash +
                                    '/' + impl_path + '#L' + places.start_line + '-' + places.end_line;
                                $gitDiv.append('<b>Implementation:</b>&nbsp; &nbsp; <a href="' + implUrl + '" target="_blank">' + implUrl + '</a><br>');


                            }
                        }
                    }



                } else {
                    $gitDiv.append('<b>Git URL:</b> ' + git_url + '<br>');
                    $gitDiv.append('<b>Source Commit:</b> ' + version.git_commit_hash + '<br>');
                }
                self.$infoPanel.append($('<h3>').append('Function Source Files')).append($gitDiv);
            }
        },



        renderParseInfo: function () {
            var self = this;


            if (self.functionInfo.info.kidl) {
                if (self.functionInfo.info.kidl.parse) {
                    self.$paramsPanel.append('<h3>Function Specification</h3>');
                    var parse = self.functionInfo.info.kidl.parse;

                    var code = $('<div>').addClass('kbcb-function-prototype-title').css({ 'margin': '5px', 'font-size': '1.1em' });

                    code.append('<br>');

                    var inputs = '';
                    var input_comments = $('<div>').css({ 'margin-left': '1em' });
                    var has_input_comments = false;
                    for (var i = 0; i < parse.input.length; i++) {
                        if (parse.input[i].type) {
                            var type = parse.input[i].type;
                            var tokens = type.split('.');
                            if (tokens.length === 2) {
                                if (tokens[0] === self.functionInfo.info.module_name) {
                                    type = tokens[1];
                                }
                            }
                            if (i > 0) { inputs += ', ' }
                            inputs += type;
                            if (parse.input[i].comment) {
                                has_input_comments = true;
                                input_comments.append(type).append(' -- <br>').append(
                                    $('<div>').css({ 'margin-left': '1em' }).append(self.escapeHtml(parse.input[i].comment)));
                            }
                        }
                    }

                    var outputs = '';
                    var output_comments = $('<div>').css({ 'margin-left': '1em' });
                    var has_output_comments = false;
                    for (var i = 0; i < parse.output.length; i++) {
                        if (parse.output[i].type) {
                            var type = parse.output[i].type;
                            var tokens = type.split('.');
                            if (tokens.length === 2) {
                                if (tokens[0] === self.functionInfo.info.module_name) {
                                    type = tokens[1];
                                }
                            }
                            if (i > 0) { inputs += ', ' }
                            outputs += type;
                            if (parse.output[i].comment) {
                                has_output_comments = true;
                                output_comments.append(type).append(' -- <br>').append(
                                    $('<div>').css({ 'margin-left': '1em' }).append(self.escapeHtml(parse.output[i].comment)));
                            }
                        }
                    }

                    var color = '#888';
                    var comment = $('<div>').css({ 'color': color, 'margin-left': '2em', 'white-space': 'pre-wrap' });
                    if (parse.comment) {
                        comment.append(self.escapeHtml(parse.comment)).append('<br>');
                    }
                    if (has_input_comments) {
                        comment.append('<br>Inputs:<br>');
                        comment.append(input_comments);
                    }
                    if (has_output_comments) {
                        comment.append('<br>Outputs:<br>');
                        comment.append(output_comments);
                    }

                    code.append($('<span>').css({ 'color': color }).append('/*'));
                    code.append(comment);
                    code.append($('<span>').css({ 'color': color }).append('*/'));

                    code.append('<br>funcdef ');
                    code.append($('<span style="font-weight:bold">').append(parse.name));
                    code.append('(').append(inputs).append(')').append('<br>');
                    code.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
                    code.append('returns (').append(outputs).append(');');

                    self.$paramsPanel.append(code);
                }
            }
        },

        escapeHtml: function (text) {
            'use strict';
            return text.replace(/[\"&<>]/g, function (a) {
                return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
            }).replace(/(?:\r\n|\r|\n)/g, '<br />');;
        }

    });
});
