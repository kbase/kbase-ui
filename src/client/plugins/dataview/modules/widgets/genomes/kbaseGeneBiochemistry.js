/**
 * Shows general gene info.
 * Such as its name, synonyms, annotation, publications, etc.
 *
 * Gene "instance" info (e.g. coordinates on a particular strain's genome)
 * is in a different widget.
 */
(function( $, undefined ) {
    $.KBWidget({
        name: "KBaseGeneBiochemistry",
        parent: "kbaseWidget",
        version: "1.0.0",

        options: {
            featureID: null,
            embedInCard: false,
            auth: null,
            loadingImage: "assets/img/loading.gif",
            genomeID: null,
            workspaceID: null,
            kbCache: null,
            genomeInfo: null
        },

        cdmiURL: "https://kbase.us/services/cdmi_api",

        init: function(options) {
            this._super(options);

            if (this.options.featureID === null) {
                //throw an error.
                return this;
            }

            this.cdmiClient = new CDMI_API(this.cdmiURL);
            this.entityClient = new CDMI_EntityAPI(this.cdmiURL);

            this.render();
            if (this.options.workspaceID) {
                this.renderWorkspace();
            }
            else
                this.renderCentralStore();

            return this;
        },

        render: function() {
            this.$messagePane = $("<div/>")
                                .addClass("kbwidget-message-pane kbwidget-hide-message");
            this.$elem.append(this.$messagePane);

            this.$infoPanel = $("<div>").css("overflow","auto");
            this.$infoTable = $("<table>")
                              .addClass("table table-striped table-bordered");

            this.$elem.append(this.$infoPanel.append(this.$infoTable));
        },

        renderCentralStore: function() {
            var self = this;
            this.$infoPanel.hide();
            this.showMessage("<img src='" + this.options.loadingImage + "'>");

            this.cdmiClient.fids_to_roles([this.options.featureID],
                function(roles) {
                    roles = roles[self.options.featureID];
                    var rolesStr = "None found";
                    if (roles) {
                        rolesStr = roles.join("<br>");
                    }
                    self.$infoTable.append(self.makeRow("Roles", rolesStr));

                    self.cdmiClient.fids_to_subsystems([self.options.featureID],
                        function(subsystems) {
                            subsystems = subsystems[self.options.featureID];
                            var subsysStr = "None found";
                            if (subsystems) {
                                subsysStr = subsystems.join("<br/>");
                            }
                            self.$infoTable.append(self.makeRow("Subsystems", subsysStr));

                            self.hideMessage();
                            self.$infoPanel.show();
                        },

                        self.renderError
                    )
                },

                this.renderError
            );

        },

        makeRow: function(name, value) {
            var $row = $("<tr>")
                       .append($("<th>").append(name))
                       .append($("<td>").append(value));
            return $row;
        },

        renderWorkspace: function() {
            var self = this;
            this.showMessage("<img src='" + this.options.loadingImage + "'>");
            this.$infoPanel.hide();

            if (this.options.genomeInfo) {
                self.ready(this.options.genomeInfo);
            } else {
                if (!this.options.kbCache) {
                    if (kb)
                        this.options.kbCache = kb;
                    else
                        console.debug("No cache service found. D'oh!");
                }
                var obj = this.buildObjectIdentity(this.options.workspaceID, this.options.genomeID);

                var prom = this.options.kbCache.req('ws', 'get_objects', [obj]);
                // on ws error
                $.when(prom).fail($.proxy(function(error) {
                    this.renderError(error);
                }, this));
                // on cache success
                $.when(prom).done($.proxy(function(genome) {
                    genome = genome[0];
                    self.ready(genome);
                }, this));
            }
        },

        ready: function(genome) {
            var self = this;
            if (genome.data.features) {
                var feature = null;
                for (var i=0; i<genome.data.features.length; i++) {
                    if (genome.data.features[i].id === this.options.featureID) {
                        feature = genome.data.features[i];
                        break;
                    }
                }

                // Function
                var func = feature['function'];
                if (!func)
                    func = "Unknown";
                this.$infoTable.append(this.makeRow("Function", func));

                // Subsystems, single string
                //var subsysSumStr = "No subsystem summary found.";
                //if (feature.subsystems) {
                //subsysSumStr = feature.subsystems;
                //}
                //this.$infoTable.append(this.makeRow("Subsystems Summary", subsysSumStr));

                // Subsystem, detailed
                var subsysDataStr = "No subsystem data found.";
                if (feature.subsystem_data) {
                    subsysDataStr = "";
                    for (var i=0; i<feature.subsystem_data.length; i++) {
                        var subsys = feature.subsystem_data[i];
                        // typedef tuple<string subsystem, string variant, string role> subsystem_data;
                        subsysDataStr += "<p>" + "Subsystem: " + subsys[0] + "<br>" + "Variant: " + subsys[1] + "<br>" + "Role: " + subsys[2];
                    }
                }
                this.$infoTable.append(this.makeRow("Subsystems", subsysDataStr));

                // Annotation
                var annotationsStr = "No annotation comments found.";
                if (feature.annotations) {
                    annotationsStr = "";
                    for (var i=0; i<feature.annotations.length; i++) {
                        var annot = feature.annotations[i];
                        // typedef tuple<string comment, string annotator, int annotation_time> annotation;
                        annotationsStr += annot[0] + " (" + annot[1] + ", timestamp:" + annot[2] + ")" + "<br>";
                    }
                }
                this.$infoTable.append(this.makeRow("Annotation Comments", annotationsStr));

                // Protein families list.
                //var proteinFamilies = "None found";
                //if (feature.protein_families) {
                //proteinFamilies = "";
                //for (var i=0; i<feature.protein_families.length; i++) {
                //    var fam = feature.protein_families[i];
                //    proteinFamilies += fam.id + ": " + fam.subject_description + "<br>";
                //}
                //}
                //this.$infoTable.append(this.makeRow("Protein Families", proteinFamilies));

            }
            else {
                this.renderError({ error: "No genetic features found in the genome with object id: " + 
                    this.options.workspaceID + "/" + 
                    this.options.genomeID });
            }

            this.hideMessage();
            this.$infoPanel.show();
        },
        
        buildObjectIdentity: function(workspaceID, objectID) {
            var obj = {};
            if (/^\d+$/.exec(workspaceID))
                obj['wsid'] = workspaceID;
            else
                obj['workspace'] = workspaceID;

            // same for the id
            if (/^\d+$/.exec(objectID))
                obj['objid'] = objectID;
            else
                obj['name'] = objectID;
            return obj;
        },

        getData: function() {
            return {
                type: "Feature",
                id: this.options.featureID,
                workspace: this.options.workspaceID,
                title: "Biochemical Function"
            };
        },

        showMessage: function(message) {
            var span = $("<span/>").append(message);

            this.$messagePane.empty()
                             .append(span)
                             .removeClass("kbwidget-hide-message");
        },

        hideMessage: function() {
            this.$messagePane.addClass("kbwidget-hide-message");
        },

        renderError: function(error) {
            errString = "Sorry, an unknown error occurred";
            if (typeof error === "string")
                errString = error;
            else if (error.error && error.error.message)
                errString = error.error.message;

            
            var $errorDiv = $("<div>")
                            .addClass("alert alert-danger")
                            .append("<b>Error:</b>")
                            .append("<br>" + errString);
            this.$elem.empty();
            this.$elem.append($errorDiv);
        },
    })
})( jQuery );