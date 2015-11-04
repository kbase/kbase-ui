(function( $, undefined ) {
    $.KBWidget({
        name: "KBaseNarrativeStoreView",
        parent: "kbaseAuthenticatedWidget",

        options: {
            type: null, // either app or method
            id: null,
            loadingImage: "assets/img/ajax-loader.gif",
	    narrativeStoreUrl:"https://kbase.us/services/narrative_method_store"
        },

        $mainPanel: null,
        $errorPanel: null,

        narstore: null,

        init: function(options) {
            this._super(options);


            this.$errorPanel = $('<div>').addClass('alert alert-danger').hide();
            this.$elem.append(this.$errorPanel);

            this.$mainPanel = $("<div>");
            this.$elem.append(this.$mainPanel);

            this.$narMethodStoreInfo = $("<div>").css({margin:'10px', padding:'10px'});
            this.$elem.append(this.$narMethodStoreInfo);

            this.narstore = new NarrativeMethodStore(this.options.narrativeStoreUrl+"/rpc");
            this.getNarMethodStoreInfo();

            if (options.type==='app') {
                this.fetchAppInfoAndRender();
            } else if (options.type==='method') {
                this.fetchMethodInfoAndRender();
            } else {
                this.showError({error:{message:'Must specify either "app" or "method" in url, as in narrativestore/app/app_id.'}});
            }

            return this;
        },

        getParameterByName : function(name) {
          name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          var regexS = "[\\?&]" + name + "=([^&#]*)";
          var regex = new RegExp(regexS);
          var results = regex.exec(window.location.search);
          if(results == null)
            return "";
          else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        },

        getNarMethodStoreInfo: function() {
            var self = this;

            this.narstore.status(
                    function(status) {
                        var url = status.git_spec_url+"/tree/"+status.git_spec_branch;
                        if (self.options.type==='app') {
                            url+="/apps/"+self.options.id;
                        }
                        if (self.options.type==='method') {
                            url+="/methods/"+self.options.id;
                        }

                        //truncate out the commit comments. We're guesing about where those start...
                        //assume first four lines are valid header info.
                        var commit = status.git_spec_commit.split(/\r\n|\r|\n/);
                        commit = [ commit[0], commit[1], commit[2], commit[3] ].join('<br>\n');


                        self.$narMethodStoreInfo.append(
                            $('<table>').css({border:'1px solid #bbb', margin:'10px', padding:'10px'})
                                /*.append($('<tr>')
                                            .append($('<th>').append('Method Store URL  '))
                                            .append($('<td>').append(self.options.narrativeStoreUrl)))
                                .append($('<tr>')
                                            .append($('<th>').append('Method Spec Repo  '))
                                            .append($('<td>').append(status.git_spec_url)))
                                .append($('<tr>')
                                            .append($('<th>').append('Method Spec Branch  '))
                                            .append($('<td>').append(status.git_spec_branch)))*/
                                .append($('<tr>')
                                            .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Yaml/Spec Location '))
                                            .append($('<td>').append('<a href="'+url+'" target="_blank">'+url+"</a>")))
                                .append($('<tr>')
                                            .append($('<th style = "vertical-align : top; padding-right : 5px">').append('Method Spec Commit  '))
                                            .append($('<td>').append(commit)))
                                );
                    },
                    function(err) {
                        this.showError(err);
                    });
        },


        appFullInfo: null,
        appSpec: null,
        appMethodSpecs: null,
        fetchAppInfoAndRender: function() {
	    var self = this;
	    self.narstore.get_app_full_info({ids:[self.options.id]},
		    function(data) {
			self.appFullInfo = data[0];
                        self.narstore.get_app_spec({ids:[self.options.id]},
                            function(spec) {
                                self.appSpec = spec[0];
                                var methodIds = [];
                                for(var s=0; s<self.appSpec.steps.length; s++) {
                                    methodIds.push(self.appSpec.steps[s].method_id);
                                }
                                self.narstore.get_method_brief_info({ids:methodIds},
                                    function(methods) {
                                        self.appMethodSpecs = {};
                                        for(var m=0; m<methods.length; m++) {
                                            self.appMethodSpecs[methods[m].id] = methods[m];
                                        }
                                        self.renderApp();
                                    },
                                    function(err) {
                                        self.showError(err);
                                        console.error(err);
                                    });
                            },
                            function(err) {
                                self.showError(err);
                                console.error(err);
                            });
		    },
		    function(err) {
			self.showError(err);
			console.error(err);
		    });
	},


        methodFullInfo: null,
        methodSpec: null,
        fetchMethodInfoAndRender: function() {
	    var self = this;
	    self.narstore.get_method_full_info({ids:[self.options.id]},
		    function(data) {
			self.methodFullInfo = data[0];
                        self.narstore.get_method_spec({ids:[self.options.id]},
                            function(spec) {
                                self.methodSpec = spec[0];
                                self.renderMethod();
                            },
                            function(err) {
                                self.showError(err);
                                console.error(err);
                            });
		    },
		    function(err) {
                        // try loading it as an app, temp hack since app page is new ...
			console.error(err);
                        if (err.error.message.indexOf('No such file or directory')>=0) {
                            // if it could not be found, then check if it is an app
                            self.fetchAppInfoAndRender();
                        } else {
                            self.showError(err);
                        }
		    });
	},

        renderApp: function() {
	    var self = this;
	    var m = self.appFullInfo;
	    var spec = self.appSpec;
            var methodSpecs = self.appMethodSpecs;

        var $header =
            $.jqElem('div')
                .addClass('row')
                .css('width', '95%')
        ;

        var $basicInfo =
            $.jqElem('div')
                .addClass('col-md-8')
        ;

	    var $header = $('<div>').addClass("row").css("width","95%");
	    var $basicInfo = $('<div>').addClass("col-md-8");

	    $basicInfo
	        .append(
	            $.jqElem('div')
	                .append($.jqElem('h2').append('App - ' + m.name))
	        )
	    ;

	    if (m.subtitle) {
	        $basicInfo
	            .append(
	                $.jqElem('div')
	                    .append($.jqElem('h4').append(m.subtitle))
	            )
	    };


	    //if (m['ver']) {
		//$basicInfo.append('<div><strong>Version: </strong>&nbsp&nbsp'+m['ver']+"</div>");
	    //}

	    if (m.contact) {
		    $basicInfo
		        .append('<div>')
		            .append('<strong>Help or Questions? Contact: </strong>&nbsp&nbsp')
                    .append(
                        $.jqElem('a')
                        .attr('href', 'mailto:' + m.contact)
                        .append(m.contact))
	    }


        /*if (m['authors']) {
		var $authors = $('<div>');
		for(var k=0; k<m['authors'].length; k++) {
		    if (k==0) {
			$authors.append('<strong>Authors: </strong>&nbsp&nbsp<a href="#/people/'+m['authors'][k]+'" target="_blank">'+m['authors'][k]+"</a>");
		    } else {
			$authors.append(', <a href="#/people/'+m['authors'][k]+'" target="_blank'>+m['authors'][k]+"</a>");
		    }
		}
		$basicInfo.append($authors);
	    }*/

        /*if (m['kb_contributers']) {
		var $authors = $('<div>');
		for(var k=0; k<m['kb_contributers'].length; k++) {
		    if (k==0) {
			$authors.append('<strong>KBase Contributers: </strong>&nbsp&nbsp<a href="#/people/'+m['kb_contributers'][k]+'" target="_blank">'+m['kb_contributers'][k]+"</a>");
		    } else {
			$authors.append(', <a href="#/people/'+m['kb_contributers'][k]+'" target="_blank'>+m['kb_contributers'][k]+"</a>");
		    }
		}
		$basicInfo.append($authors);
	    }*/


        var $topButtons =
            $.jqElem('div')
                .addClass('col-md-4')
                .css('text-align', 'right')
                .append(
                    $.jqElem('div')
                        .addClass('btn-group')
                        .append(
			    $('<a href="#/narrativemanager/new?app='+m.id+'" target="_blank">')
			    .append(
				$.jqElem('button')
				    .addClass('kb-primary-btn')
				    .append('<span class="fa fa-plus"></span> Launch in New Narrative')
			    )
                        )
                )
        ;

	    $header.append($basicInfo);
	    if (self.auth() && self.auth().token) {
		$header.append($topButtons);
	    }

	    self.$mainPanel.append($header);
	    //self.$mainPanel.append('<hr>');


        if (m.screenshots && m.screenshots.length) {
            var $ssPanel = $.jqElem('div');
            $.each(
                m.screenshots,
                function (idx, s) {
                    $ssPanel
                        .append(
                            $.jqElem('a')
                                //.attr('href', self.options.narrativeStoreUrl + s.url)
                                //.attr('target', '_blank')
                                .on('click', function(e) {

                                    var $img = $.jqElem('img')
                                        .attr('src', self.options.narrativeStoreUrl + s.url)
                                        .css('width', '100%')
                                    ;

                                    var $prompt = $.jqElem('div').kbasePrompt(
                                        {
                                            body : $img
                                        }
                                    );

                                    $prompt.dialogModal()
                                        .css('width', '100%')
                                    ;

                                    $prompt.dialogModal().find('.modal-dialog')
                                        .css('width', '100%')
                                    ;

                                    $prompt.openPrompt();
                                })
                                .append(
                                    $.jqElem('img')
                                        .attr('src', self.options.narrativeStoreUrl + s.url)
                                        .attr('width', '300')
                                )
                        )
                }
            );

            self.$mainPanel.append($ssPanel);
        }

        if (m.description) {
            self.$mainPanel
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
                                                .append(m.description)
                                        )
                            )
                )
                .append($.jqElem('hr'))
        }

        if (spec.steps && spec.steps.length) {
            var $stepsContainer =
                $.jqElem('div')
                    .css('width', '95%')
                    .append($.jqElem('h4').append('App Steps'))
            ;

            var $stepList = $.jqElem('ul')
                .css('list-style-type', 'none')
                .css('padding-left', '0px')
            ;
            $stepsContainer.append($stepList);

            $.each(
                spec.steps,
                function (idx, step) {
                    var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));

                    var method_spec = methodSpecs[step.method_id];

                    $li.append(
                        $.jqElem('ul')
                            .css('list-style-type', 'none')
                                .append(
                                    $.jqElem('li')
                                        .append($.jqElem('b').append('Step ' + (idx + 1) + '. '))
                                        .append(
                                            $.jqElem('a')
                                                .attr('href', "#/narrativestore/method/" + method_spec.id )
                                                .attr('target', '_blank')
                                                .append(method_spec.name)
                                        )
                                        .append(
                                            $.jqElem('ul')
                                                .css('list-style-type', 'none')
                                                .append($.jqElem('li').append(method_spec.subtitle))
                                        )
                                )
                    );

                    $stepList.append($li);

                }
            );

            self.$mainPanel.append($stepsContainer.append($stepList));
        }

        /*var $stepsContainer = $('<div>').css("width","95%");
	    if (spec.steps) {
		$stepsContainer.append("<h4>App Steps</h4>");
                for(var k=0; k<spec.steps.length; k++) {
                    var method_spec = methodSpecs[spec.steps[k].method_id];
                    var $step = $('<div>').addClass("col-md-12");
                    $step.append('<strong>Step '+(k+1)+' - <a href="#/narrativestore/method/'+method_spec.id+'">'+method_spec.name + '</a></strong><br>');
                    $step.append($('<div>').css({margin:'5px', 'margin-bottom':'10px'}).append(method_spec.subtitle));
                    $stepsContainer.append($('<div>').addClass('row').append($step));
                }
	    }
	    self.$mainPanel.append($stepsContainer);

	    }*/

        $.each(
            self.$mainPanel.find('[data-method-id]'),
            function (idx, link) {
                var method_id = $(link).data('method-id');
                $(link).attr('target', '_blank');
                $(link).attr('href', "#/narrativestore/method/" + method_id);
            }
        );

	},


        renderMethod: function() {
	    var self = this;
	    var m = self.methodFullInfo;
	    var spec = self.methodSpec;

        var $header =
            $.jqElem('div')
                .addClass('row')
                .css('width', '95%')
        ;

        var $basicInfo =
            $.jqElem('div')
                .addClass('col-md-8')
        ;

	    var $header = $('<div>').addClass("row").css("width","95%");
	    var $basicInfo = $('<div>').addClass("col-md-8");

	    $basicInfo
	        .append(
	            $.jqElem('div')
	                .append($.jqElem('h2').append('Method - ' + m.name))
	        )
	    ;

	    if (m.subtitle) {
	        $basicInfo
	            .append(
	                $.jqElem('div')
	                    .append($.jqElem('h4').append(m.subtitle))
	            )
	    };

	    //if (m['ver']) {
		//$basicInfo.append('<div><strong>Version: </strong>&nbsp&nbsp'+m['ver']+"</div>");
	    //}

	    if (m.contact) {
		    $basicInfo
		        .append('<div>')
		            .append('<strong>Help or Questions? Contact: </strong>&nbsp&nbsp')
                    .append(
                        $.jqElem('a')
                        .attr('href', 'mailto:' + m.contact)
                        .append(m.contact))
	    }


        /*if (m['authors']) {
		var $authors = $('<div>');
		for(var k=0; k<m['authors'].length; k++) {
		    if (k==0) {
			$authors.append('<strong>Authors: </strong>&nbsp&nbsp<a href="#/people/'+m['authors'][k]+'" target="_blank">'+m['authors'][k]+"</a>");
		    } else {
			$authors.append(', <a href="#/people/'+m['authors'][k]+'" target="_blank'>+m['authors'][k]+"</a>");
		    }
		}
		$basicInfo.append($authors);
	    }*/

        /*if (m['kb_contributers']) {
		var $authors = $('<div>');
		for(var k=0; k<m['kb_contributers'].length; k++) {
		    if (k==0) {
			$authors.append('<strong>KBase Contributers: </strong>&nbsp&nbsp<a href="#/people/'+m['kb_contributers'][k]+'" target="_blank">'+m['kb_contributers'][k]+"</a>");
		    } else {
			$authors.append(', <a href="#/people/'+m['kb_contributers'][k]+'" target="_blank'>+m['kb_contributers'][k]+"</a>");
		    }
		}
		$basicInfo.append($authors);
	    }*/


        var $topButtons =
            $.jqElem('div')
                .addClass('col-md-4')
                .css('text-align', 'right')
                .append(
                    $.jqElem('div')
                        .addClass('btn-group')
                        /*.append(
                            $.jqElem('button')
                                .addClass('btn btn-default')
                                .append('Launch in New Narrative')
                                .on('click', function (e) {
                                    e.preventDefault(); e.stopPropagation();
                                    alert('Add it to narrative, somehow!');
                                })
                        )*/
                )
        ;


	    $header.append($basicInfo);
	    $header.append($topButtons);

	    self.$mainPanel.append($header);
	    //self.$mainPanel.append('<hr>');

        if (m.screenshots && m.screenshots.length) {
            var $ssPanel = $.jqElem('div');
            $.each(
                m.screenshots,
                function (idx, s) {
                    $ssPanel
                        .append(
                            $.jqElem('a')
                                //.attr('href', self.options.narrativeStoreUrl + s.url)
                                //.attr('target', '_blank')
                                .on('click', function(e) {

                                    var $img = $.jqElem('img')
                                        .attr('src', self.options.narrativeStoreUrl + s.url)
                                        .css('width', '100%')
                                    ;

                                    var $prompt = $.jqElem('div').kbasePrompt(
                                        {
                                            body : $img
                                        }
                                    );

                                    $prompt.dialogModal()
                                        .css('width', '100%')
                                    ;

                                    $prompt.dialogModal().find('.modal-dialog')
                                        .css('width', '100%')
                                    ;

                                    $prompt.openPrompt();
                                })
                                .append(
                                    $.jqElem('img')
                                        .attr('src', self.options.narrativeStoreUrl + s.url)
                                        .attr('width', '300')
                                )
                        )
                }
            );

            self.$mainPanel.append($ssPanel);
        }


        if (m.description) {
            self.$mainPanel
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
                                                .append(m.description)
                                        )
                            )
                )
                .append($.jqElem('hr'))
        }


        if (spec.parameters && spec.parameters.length) {

            var $parametersDiv =
                $.jqElem('div')
                //    .append($.jqElem('h4').append('Parameters'))
            ;

            var $paramList = $.jqElem('ul')
                .css('list-style-type', 'none')
                .css('padding-left', '0px')
            ;
            $parametersDiv.append($paramList);

            var sortedParams = {
                inputs       : [],
                outputs      : [],
                parameters   : []
            };

            $.each(
                spec.parameters,
                function (idx, param) {
                    if (param.ui_class == 'input') {
                        sortedParams.inputs.push(param);
                    }
                    else if (param.ui_class == 'output') {
                        sortedParams.outputs.push(param);
                    }
                    else {
                        sortedParams.parameters.push(param);
                    }
                }
            );

            var ucfirst = function(string) {
                if (string != undefined && string.length) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
            }

            $.each(
                ['inputs', 'outputs', 'parameters'],
                function (idx, ui_class) {

                    if (sortedParams[ui_class].length == 0) {
                        return;
                    };

                    var $li = $.jqElem('li').append($.jqElem('h4').append(ucfirst(ui_class)));
                    var $ui_classList = $.jqElem('ul')
                        .css('list-style-type', 'none')
                        .css('padding-left', '0px')
                    ;
                    $li.append($ui_classList);
                    $paramList.append($li);

                    $.each(
                        sortedParams[ui_class],
                        function (idx, param) {

                            var types = '';

                            if (param.text_options && param.text_options.valid_ws_types) {
                                types = $.jqElem('i')
                                    .append(' ' + param.text_options.valid_ws_types.join(', '))
                                ;
                            }

                            var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));
                            $li.append(
                                $.jqElem('ul')
                                    .css('list-style-type', 'none')
                                        .append(
                                            $.jqElem('li')
                                                .append(
                                                    $.jqElem('b').append(param.ui_name)
                                                )
                                                .append(types)
                                                .append(
                                                    $.jqElem('ul')
                                                        .css('list-style-type', 'none')
                                                        .append($.jqElem('li').append(param.short_hint))
                                                        .append($.jqElem('li').append(param.long_hint))
                                                )
                                        )
                            );

                            $ui_classList.append($li);
                        }
                    );


                }
            );

            self.$mainPanel.append($parametersDiv.append('<hr>'));


        }

        if (spec.fixed_parameters && spec.fixed_parameters.length) {

            var $parametersDiv =
                $.jqElem('div')
                    .append($.jqElem('h4').append('Fixed parameters'))
            ;

            var $paramList = $.jqElem('ul')
                .css('list-style-type', 'none')
                .css('padding-left', '0px')
            ;
            $parametersDiv.append($paramList);

            $.each(
                spec.fixed_parameters,
                function (idx, param) {
                    var $li = $.jqElem('li');//.append('Parameter ' + (idx + 1)));
                    $li.append(
                        $.jqElem('ul')
                            .css('list-style-type', 'none')
                                .append(
                                    $.jqElem('li')
                                        .append(
                                            $.jqElem('b').append(param.ui_name)
                                        )
                                        .append(
                                            $.jqElem('ul')
                                                .css('list-style-type', 'none')
                                                .append($.jqElem('li').append(param.description))
                                        )
                                )
                    );

                    $paramList.append($li);


                }
            );

            self.$mainPanel.append($parametersDiv.append('<hr>'));


        }

        if (m.publications && m.publications.length) {
            var $pubsDiv =
                $.jqElem('div')
                    .append($.jqElem('strong').append('Related publications'))
            var $publications =
                $.jqElem('ul')
                    //.css('list-style-type', 'none')
                    //.css('padding-left', '0px')
            ;
            $.each(
                m.publications,
                function (idx, pub) {
                    $publications.append(
                        $.jqElem('li')
                            .append(pub.display_text)
                            .append(
                                $.jqElem('a')
                                    .attr('href', pub.link)
                                    .attr('target', '_blank')
                                    .append(pub.link)
                            )
                    );
                }
            );

            self.$mainPanel.append($pubsDiv.append($publications));
        }

        if (m.kb_contributors != undefined && m.kb_contributors.length) {
            var $contributorsDiv =
                $.jqElem('div')
                    .append($.jqElem('strong').append('Team members'))
            var $contributors =
                $.jqElem('ul')
                    //.css('list-style-type', 'none')
                    //.css('padding-left', '0px')
            ;
            $.each(
                m.publications,
                function (idx, name) {
                    $publications.append(
                        $.jqElem('li')
                            .append(name)
                    );
                }
            );

            self.$mainPanel.append($pubsDiv.append($publications));
        }

        $.each(
            self.$mainPanel.find('[data-method-id]'),
            function (idx, link) {
                var method_id = $(link).data('method-id');
                $(link).attr('target', '_blank');
                $(link).attr('href', "#/narrativestore/method/" + method_id);
            }
        );

	    /*if (m['technical_description']) {
		var $techDetailsDiv = $('<div>')
					.append("<hr><h4>Technical Details</h4>")
					.append(m['technical_description']+"<br>");
		self.$mainPanel.append($techDetailsDiv);
	    }


            var $entireInfo = $('<div>')
					.append("<hr><h4>Full Method Info</h4>")
					.append($("<pre>").append(JSON.stringify(m, null, '\t')));
	    self.$mainPanel.append($entireInfo);

            var $entireSpec = $('<div>')
					.append("<hr><h4>Full Method Specification</h4>")
					.append($("<pre>").append(JSON.stringify(spec, null, '\t')));
	    self.$mainPanel.append($entireSpec);*/
	},


        loggedInCallback: function(event, auth) {
            return this;
        },
        loggedOutCallback: function(event, auth) {
            return this;
        },

        refresh: function() {
        },

        showError: function(error) {
            this.$errorPanel.empty();
            this.$errorPanel.append('<strong>Error when fetching App/Method information.</strong><br><br>');
            this.$errorPanel.append(error.error.message);
            this.$errorPanel.append('<br>');
            this.$errorPanel.show();
        }
    });
})( jQuery );



