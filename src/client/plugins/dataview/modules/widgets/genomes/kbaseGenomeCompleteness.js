(function( $, undefined ) {
    $.KBWidget({
        name: "KBaseGenomeCompleteness",
        parent: "kbaseAuthenticatedWidget",
        version: "1.0.0",
        genome_id: null,
        ws_name: null,
        kbCache: null,
        width: 800,
	table_height: 656,
        options: {
            genome_id: null,
            ws_name: null,
            kbCache: null,
            loadingImage: "assets/img/ajax-loader.gif"
        },
        wsUrl: "https://kbase.us/services/ws/",
	markerRoles:[],
	markerRolesOrder:[],


        init: function(options) {
            this._super(options);
            this.ws_name = this.options.ws_name;
            this.genome_id = this.options.genome_id;
            this.kbCache = this.options.kbCache;

	    this.markerRoles = [];
	    this.markerRolesOrder = [];

	    // store universal genes
	    this.loadMarkerRoles (this.wait_for_marker_roles);

            return this;
        },
		
	wait_for_marker_roles : function () {
		this.render();
	},

	loadMarkerRoles : function (wait_for_marker_roles) {
		var markerRoles = this.markerRoles;
		var markerRolesOrder = this.markerRolesOrder;
		var self = this;
		var GROUP_INDEX = 0;
		var ROLE_INDEX = 1;

		d3.text("assets/data/universal_markers_SEED_Roles.txt", function(text) {
			var data = d3.tsv.parseRows(text);
			var tax_group = "";
			var seed_role = "";
			for (var i=0; i < data.length; i++) {

			    if (data[i][GROUP_INDEX] === "" || data[i][ROLE_INDEX] === "")
				continue;
			    tax_group = data[i][GROUP_INDEX];
			    seed_role = data[i][ROLE_INDEX];
			    //if (markerRoles[tax_group] === undefined)
			    //	markerRoles[tax_group] = [];
			    markerRolesOrder.push(seed_role);
			    markerRoles[seed_role] = tax_group;
			}
			
			// wait to enforce completion of async parse
			self.wait_for_marker_roles();
		    });

		return true;
	},
		
        render: function() {
            var self = this;
            var pref = this.uuid();
	    
            var container = this.$elem;

            container.append("<div><img src=\""+self.options.loadingImage+"\">&nbsp;&nbsp;loading genes data...</div>");

            var genomeRef = "" + this.options.ws_name + "/" + this.options.genome_id;
        	
            var objId = {ref: genomeRef};
            if (this.options.kbCache)
                prom = this.options.kbCache.req('ws', 'get_objects', [objId]);
            else
                prom = kb.ws.get_objects([objId]);

            var self = this;
            
	    var data = [];
            $.when(prom).done($.proxy(function(data) {
            		container.empty();
            		var gnm = data[0].data;
			var tax_domain = gnm.domain;

			// doesn't work for Euks yet
			if (tax_domain === "Eukaryota") {
			    container.prepend(('<b>Genome Completeness not yet available for '+tax_domain+'</b>'));
			    return this;
			}

            		////// Genome Completeness Tab //////
            		var genesData = [];
            		var geneMap = {};
            		var contigMap = {};
			var markerRolesToGenes = {};
			var group_tally = {};
			var group_total = {};
			var multi_cnts_msg = {};

            		if (gnm.contig_ids && gnm.contig_lengths && gnm.contig_ids.length == gnm.contig_lengths.length) {
            			for (var pos in gnm.contig_ids) {
            				var contigId = gnm.contig_ids[pos];
            				var contigLen = gnm.contig_lengths[pos];
            				contigMap[contigId] = {name: contigId, length: contigLen, genes: []};
            			}
            		}
            		
			// determine which features are markers
            		for (var genePos in gnm.features) {
            			var gene = gnm.features[genePos];
            			var geneId = gene.id;
				if (gene['function'] === undefined)
				    continue;
				var geneFunc = gene['function'];
				var cleanGeneFunc = geneFunc.replace(/\s+\/.+/,"").replace(/\s+\#.*/, "");
				// just take first element of subsystem_data list
				// typedef tuple<string subsystem, string variant, string role> subsystem_data;
				//var seed_role = gene.subsystem_data[0][2];
				var seed_role = cleanGeneFunc;  // not really, but subsystem_data is not behaving for me for some unknown reason.  furthermore, it's not yet populated for uploaded genomes!!!

				if (self.markerRoles[seed_role] === undefined)
				    continue;

				if (markerRolesToGenes[seed_role] === undefined)
				    markerRolesToGenes[seed_role] = [];
				markerRolesToGenes[seed_role].push(geneId);
			}

			// get tally and total
			var something_seen = false;
			for (var i=0; i < self.markerRolesOrder.length; i++) {
			    var seed_role = self.markerRolesOrder[i];
			    var tax_group = self.markerRoles[seed_role];
			    if (group_tally[tax_group] === undefined)
				group_tally[tax_group] = 0;
			    if (group_total[tax_group] === undefined)
				group_total[tax_group] = 0;
			    if (multi_cnts_msg[tax_group] === undefined)
				multi_cnts_msg[tax_group] = "";

			    group_total[tax_group] += 1;
			    if (markerRolesToGenes[seed_role]) {
				//group_tally[tax_group] += markerRolesToGenes[seed_role].length;
				group_tally[tax_group] += 1;
				something_seen = true;
				if (markerRolesToGenes[seed_role].length !== 1)
				    multi_cnts_msg[tax_group] = " (Warning: multiple counts)";
			    }
			}

			// build table
			for (var i=0; i < self.markerRolesOrder.length; i++) {
			    var seed_role = self.markerRolesOrder[i];
			    var tax_group = self.markerRoles[seed_role];

			    // make sure we handle empty case at least somewhat gracefully
			    if (something_seen === false) {
				if (tax_group === "Universal") {
				    genesData[genesData.length] = {
					num: 0,
					id: '-',
					group: tax_group,
					func: seed_role
				    };
				}
				continue;
			    }
			    if (group_tally[tax_group] === 0)
				continue;

			    if (markerRolesToGenes[seed_role] === undefined) {
            			genesData[genesData.length] = {
				    num: 0,
				    id: '-',
				    group: tax_group,
				    func: seed_role
				};
				continue;
			    }
			    for (var j=0; j < markerRolesToGenes[seed_role].length; j++) {
				var geneId = markerRolesToGenes[seed_role][j];
				var geneCnt = markerRolesToGenes[seed_role].length;
            			genesData[genesData.length] = {
				    num: geneCnt,
				    id: '<a class="'+pref+'gene-click" data-geneid="'+geneId+'">'+geneId+'</a>', 
				    group: tax_group,
				    func: seed_role
				};
			    }
            		}

            		var genesSettings = {
            				//"sPaginationType": "full_numbers",
            				"iDisplayLength": 100,
					"aaSorting" : [[3, 'asc']],
					"sDom": 't<fip>',
            				"aoColumns": [
			                               {sTitle: "Count", mData: "num", sWidth: "10%"}, 
			                               {sTitle: "Gene ID", mData: "id"}, 
			                               {sTitle: "Group", mData: "group"},
			                               {sTitle: "Function", mData: "func", sWidth: "50%"}
            				              ],
            				              "aaData": [],
            				              "oLanguage": {
            				            	  "sSearch": "&nbsp&nbsp&nbsp&nbspSearch gene:",
            				            	  "sEmptyTable": "No genes found."
            				              },
            				              "fnDrawCallback": geneEvents
            		};


			// show totals
			for (var tax_group in group_total) {
			    if (group_tally[tax_group] === 0)
				continue;
			    container.append(('<div />'+tax_group+' Single-copy Markers Seen: '+group_tally[tax_group]+' / '+group_total[tax_group]+multi_cnts_msg[tax_group]));
			}
			if (something_seen === false) {
			    tax_group = "Universal";
			    container.append(('<div />'+tax_group+' Single-copy Markers Seen: '+group_tally[tax_group]+' / '+group_total[tax_group]+multi_cnts_msg[tax_group]));
			}

			// show table
            		//container.append($('<div />').css("overflow","auto").append('<table cellpadding="0" cellspacing="0" border="0" id="'+pref+'genome-completeness-table" \
			container.append($('<div />').css("height",this.table_height+"px").css("overflow","scroll").append('<table cellpadding="0" cellspacing="0" border="0" id="'+pref+'genome-completeness-table" \
            		class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;"/>'));

            		function geneEvents() {
            			$('.'+pref+'gene-click').unbind('click');
            			$('.'+pref+'gene-click').click(function() {
            				var geneId = [$(this).data('geneid')];
            				window.open("#/genes/" + genomeRef + "/" + geneId, "_blank");
            			});            
            		}

			// display table
            		var genesTable = $('#'+pref+'genome-completeness-table').dataTable(genesSettings);
            		genesTable.fnAddData(genesData);
            }, this));
            $.when(prom).fail($.proxy(function(data) {
            		container.empty();
            		container.append('<p>[Error] ' + data.error.message + '</p>');
            }, this));
            return this;
        },
        
        getData: function() {
        	return {
        		type: "KBaseGenomeCompleteness",
        		id: this.options.ws_name + "." + this.options.genome_id,
        		workspace: this.options.ws_name,
        		title: "Genome Completeness"
        	};
        },

        uuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
                function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
        }
    });
})( jQuery );
