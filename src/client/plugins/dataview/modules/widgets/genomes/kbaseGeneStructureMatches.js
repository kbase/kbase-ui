/**
 * Shows general gene info.
 * Such as its name, synonyms, annotation, publications, etc.
 *
 * Gene "instance" info (e.g. coordinates on a particular strain's genome)
 * is in a different widget.
 */
(function( $, undefined ) {
    $.KBWidget({
        name: "KBaseGeneStructureMatches",
        parent: "kbaseWidget",
        version: "1.0.0",

        options: {
            featureID: null,
            embedInCard: false,
            auth: null,
            loadingImage: "assets/img/ajax-loader.gif",
            genomeID: null,
            workspaceID: null,
            kbCache: null,
        },

        cdmiURL: "https://kbase.us/services/cdmi_api",
        // kbprotstructURL: "http://140.221.67.170:7088",  // test service
        kbprotstructURL: "https://kbase.us/services/protein_structure_service",

        init: function(options) {
            this._super(options);

            if (this.options.featureID === null) {
                //throw an error.
                return this;
            }
            this.cdmiClient = new CDMI_API(this.cdmiURL);
            this.entityClient = new CDMI_EntityAPI(this.cdmiURL);

            this.kbprotstruct = new KBaseProteinStructure( this.kbprotstructURL );
            this.render();
            if (this.options.workspaceID) 
               {
                //this.renderWorkspace();      // I noticed at least one widget had special
                                               // handling for workspace invocation, so I've put in 
                                               // this as a reminder.
                this.renderCentralStore(); 
               }
            else
               {
                this.renderCentralStore();
               }

            return this;
        },

        render: function() {
            this.$messagePane = $("<div/>")
                                .addClass("kbwidget-message-pane kbwidget-hide-message");
            this.$elem.append(this.$messagePane);
            //this.showMessage( "<p>TUBE  TUBE    TUBE</p>" ).delay(5000);

            this.$infoPanel = $("<div>");
            //this.$infoTable = $("<table>")
            //                  .addClass("table table-striped table-bordered");
            //this.$elem.append(this.$infoPanel.append(this.$infoTable));
            this.$infoPara = $("<p>");
            this.$morePara = $("<p>");
            this.$structTable = $("<div>");
            this.$elem.append(this.$infoPanel.append(this.$infoPara).append(this.$morePara).append(this.$structTable));
        },

        renderCentralStore: function() 
           {
            this.$infoPanel.hide();
            lookup_prom = this.kbprotstruct.lookup_pdb_by_fid( [ this.options.featureID ] );

            this.pdburl = function( pdbid, chains )
                             {
                              var r;
                              r = "<a href='http://www.rcsb.org/pdb/explore.do?structureId=" + pdbid + 
                                        "' target='_blank'>" + pdbid + "</a>";
                              if ( ! chains.match( /^\s*$/ ) )
                                 { r = r + " " + chains; }
                              return( r );
                             };
            this.pdbimage = function( pdbid )
                             {
                              //return( "<span class='rcsb_image' title='" + pdbid + "|bio|80|" + 
                              //	           pdbid + "'></span>" );
                              return( "<img src='http://www.rcsb.org/pdb/images/" + pdbid + "_bio_r_80.jpg'>");
                             };
            this.rightj = function( s, width )  // right justify a string to size "width", needed to ensure
                             {                  // string sorting of numeric columns acts like numeric sort
                              var t = "              " + s;
                              return( t.substring( t.length - width, t.length ) );
                             };
            self = this;
            this.matchtab = [];   // array of row objects to go into the kbaseTable
            $.when(lookup_prom).fail(
				    function(error) {
					console.log("PDB structure widget could not perform lookup");
					console.log(error);
					self.$elem.append("<b>Structure match not yet computed for this feature.  Soon, you will soon be able to compute structure matches for your genome in the Narrative interface.");
				    }
				)
			       .done(
                                      function( lookup_res )
                                         {
                                           var fidkey;
                                           var i;
                                           var nhits;
                                           var max_show = 1000;  // 5;
                                           //console.log( "lookup done, lookup_res is " );
                                           //console.log( lookup_res );

                                           // lookup_pdb_by_fid() returns an object with keys
                                           // corresponding to the fids given to it.   The value
                                           // for each fid "key" is a list of objects.
                                           // Since we only send one fid, we really only need to get
                                           // the first key, but I'm putting into a loop anyway:
                                           for ( fidkey in lookup_res )
                                               {
                                                if ( lookup_res.hasOwnProperty( fidkey ) )
                                                    {
                                                     //console.log( "processing key" );
                                                     //console.log( fidkey );
                                                     hits = lookup_res[fidkey];  // hits is array of hit objects
                                                     //console.log( "number of hits is");
                                                     //console.log( hits.length );
                                                     nhits = hits.length;
                                                     for ( i = 0; i < hits.length; i++ )
                                                        {
                                                         //console.log( typeof( hits[i].align_length ));
                                                         //console.log( "[" + hits[i].align_length  + "]" );
                                                         console.log( typeof( hits[i].percent_id ));
                                                         console.log( "[" + self.rightj( hits[i].percent_id.toFixed(2), 6 )  + "]" );
                                                         if ( i < max_show )
                                                             self.matchtab.push( { 'image': self.pdbimage( hits[i].pdb_id ),
                                                             	                   'PDB id': self.pdburl( hits[i].pdb_id, hits[i].chains ),
                                                                                   '% identity': self.rightj( hits[i].percent_id.toFixed( 2 ), 6),
                                                                                   //'align. len.': hits[i].align_length.toString()
                                                                                   'align. len.': self.rightj( hits[i].align_length.toString(), 5 )
                                                                                  } 
                                                                                );
                                                        }
                                                    }
                                               }
                                           //console.log( "self.matchtab is");
                                           //console.log( self.matchtab );
                                           if ( nhits <= 0 )
                                              {  
                                               self.$infoPara.append( "No PDB Sequence matches"); 
                                              }
                                           else
                                           	  {
                                        	   self.$infoPara.append( "PDB Sequence matches");
                                               self.$structTable.kbaseTable( 
                                                                             {
                                                                               structure : 
                                                                                   {
                                                                                    header : [
                                                                                             { 'value' : 'image' },
                                                                                             { 'value' : 'PDB id',    'sortable' : true },
                                                                                             { 'value' : '% identity', 'sortable' : true },
                                                                                             { 'value' : 'align. len.',  'sortable' : true }
                                                                                             ],
                                                                                    rows : self.matchtab
                                                                                    }
                                                                             }
                                                                          );
                                                if ( nhits >= max_show )
                                                	self.$infoPara.append( "<BR>(" + max_show + " of " + nhits + " matches shown)")
                                                if ( nhits >= 4 )
                                                    self.$structTable.height( 400 );
                                                    self.$structTable.addClass( "scroll-pane vertical-only" );
                                               }
                                           self.hideMessage();
                                           self.$infoPanel.show();
                                         }
                                    );
            // console.log("done renderCentralStore");
           },

        
        makeRow: function(name, value) {
            var $row = $("<tr>")
                       .append($("<td>").append(name))
                       .append($("<td>").append(value));
            return $row;
        },

        renderWorkspace: function() {
            // at least one widget had special handling for workspace 
            // so I've put this placeholder as a reminder.  
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
                title: "Matching Structures"
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