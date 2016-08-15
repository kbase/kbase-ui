/**
 * Output widget to vizualize registered dynamic repo state.
 * Roman Sutormin <rsutormin@lbl.gov>
 * Michael Sneddon <mwsneddon@lbl.gov>
 * @public
 */

define(['jquery',
        'bluebird',
        'kb/service/client/catalog',
        'kb/widget/legacy/authenticatedWidget'
        ], function($, Promise, Catalog) {

    $.KBWidget({
        name: 'KBaseViewSDKRegistrationLog',
        parent: 'kbaseAuthenticatedWidget',
        version: '1.0.0',
        options: {
            registration_id: null,
            show_module_links: false,
            n_rows: 20
        },

        // Catalog client
        catalogClient: null,

        log: null,

        init: function(options) {
            this._super(options);

            if(options.registration_id) {
                this.registration_id = options.registration_id;
            }

            this.catalogClient = new Catalog(
                    this.runtime.getConfig('services.catalog.url'),
                    { token: this.runtime.service('session').getAuthToken() }
                );

            // Create a message pane
            this.$messagePane = $("<div/>").addClass("kbwidget-message-pane kbwidget-hide-message");
            this.$elem.append(this.$messagePane);
            this.loading(true);

            this.render();

            this.log = [];
            return this;
        },

        loggedInCallback: function(event, auth) {
            return this;
        },

        loggedOutCallback: function(event, auth) {
            return this;
        },

        render: function() {
            var self = this;
            var container = this.$elem;

            var $table = $('<table class="table table-striped table-bordered" style="margin-left: auto; margin-right: auto;" />');

            container.append($table);
            var width = "15%"

            $table.append('<tr><td width="'+width+'">Registration ID</td><td><a href="#catalog/register/'+self.registration_id+'">'
                +self.registration_id+'</a></td></tr>');

            self.$registration_state_td = $('<td></td>')
            $table.append(
                $('<tr>')
                    .append($('<td width="'+width+'">Progress</td>'))
                    .append(self.$registration_state_td));

            self.$log_window = $('<textarea style="width:100%;font-family:Monaco,monospace;font-size:9pt;color:#555;resize:vertical;" rows="'+self.options.n_rows+'" readonly>')
            container.append(self.$log_window);

            self.$track_checkbox= $('<input type="checkbox">').prop('checked', true);;
            var $checkboxContainer = $('<div>').addClass('checkbox').css({width:"100%"})
                .append($('<label>')
                    .append(self.$track_checkbox)
                    .append('Auto scroll to new log output'));
            
            container.append($checkboxContainer)

            self.getLogAndState(self.registration_id,0);
        },
        

        getState: function() {
            return null;
        },

        loadState: function(state) {
        },



        // should load up all the way to the end
        getParsedLog: function(skip) {
            var self = this;
            var chunk_size = 5000;
            return self.catalogClient.get_parsed_build_log({
                                            'registration_id':self.registration_id,
                                            'skip':skip,
                                            'limit':chunk_size
                                        })
                        .then(function(build_info) {
                            var log_length = skip+build_info.log.length;
                            self.last_log_line = log_length;

                            var new_content = '';
                            for(var k=0; k<build_info.log.length; k++) {
                                new_content += build_info.log[k].content;
                            }
                            self.appendLineToLog(self.escapeHtml(new_content));

                            if(build_info.log.length == chunk_size) {
                                //try to get more
                                return self.getParsedLog(self.last_log_line);
                            } else {
                                // set state and render
                                self.updateBuildState(build_info.registration, build_info.error_message, build_info);
                            }
                        });


        },

        escapeHtml: function(text) {
            'use strict';
            return text.replace(/[\"&<>]/g, function (a) {
                return { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' }[a];
            });
        },


        getLogAndState: function(registration_id, skip) {
            var self = this;
            return self.getParsedLog(skip);
        },


        appendLineToLog: function(line) {
            self = this;
            self.$log_window.append(line)

            if(self.$track_checkbox.prop('checked')) {
                self.$log_window.scrollTop(self.$log_window[0].scrollHeight); // scroll to bottom
            }
        },

        updateBuildState: function(state, error, build_info) {
            var self = this;
            self.loading(false);
            self.$registration_state_td
            if (state === 'error') {
                self.$registration_state_td.empty()
                    .append($('<span>').addClass('label label-danger').append(state))
                    .append('<br><br>')
                    .append(error);
            } else if (state !== 'complete') {
                self.$registration_state_td.empty().append(state)
                setTimeout(function(event) {
                    self.getLogAndState(self.registration_id, self.last_log_line);
                }, 1000);
            } else {
                self.$registration_state_td.empty()
                    .append($('<span>').addClass('label label-success').append(state))
                if(self.options.show_module_links) {
                    self.$registration_state_td.append('&nbsp;&nbsp;&nbsp;');
                    self.$registration_state_td.append(
                            'Successfully registered <a href="#catalog/modules/'+build_info.module_name_lc+'">'+build_info.module_name_lc+'</a> '
                        );
                    self.$registration_state_td.append(
                            'from <a href="'+build_info.git_url+'" target="_blank">'+build_info.git_url+'</a>.'
                        );
                }
            }
        },

        loading: function(isLoading) {
            if (isLoading)
                this.showMessage($('<i>').addClass('fa fa-spinner fa-2x fa-spin'));
            else
                this.hideMessage();                
        },

        showMessage: function(message) {
            var span = $("<span/>").append(message);
            this.$messagePane.append(span);
            this.$messagePane.show();
        },

        hideMessage: function() {
            this.$messagePane.hide();
            this.$messagePane.empty();
        }
    });
});
