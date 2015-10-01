/**
 * Shows info for a workspace object.
 *
 */
(function( $, undefined ) {
	$.KBWidget({
		name: "KBaseObjectMeta",
		parent: "kbaseWidget",
		version: "1.0.0",

		wsUrl:"https://kbase.us/services/ws",

		options: {
			objNameOrId: null,
			wsNameOrId: null,
			objVer: null,
			loadingImage: "assets/img/loading.gif",
			kbCache:{},			
			width:900			
		},
		
		objName:"",
		wsName:"",
		
		//cdmiURL: "https://kbase.us/services/cdmi_api",

		/**
		 * Initialize the widget.
		 */
		init: function(options) {
			this._super(options);
			var self = this;			
			
			console.log(this.options.objNameOrId+"   "+this.options.wsNameOrId);
						
			if (options.wsUrl) {
			    self.wsUrl = options.wsUrl;
			}
			var kbws;
			
			if (self.options.kbCache.ws_url) {
			    self.wsUrl = self.options.kbCache.ws_url;
			}
			if (self.options.kbCache.token) {
			    kbws = new Workspace(self.wsUrl, {token: self.options.kbCache.token});
			} else {
			    kbws = new Workspace(self.wsUrl);
			}
			
			self.objName = options.objNameOrId;
			self.wsName = options.wsNameOrId;
			
			self.$elem.append('<div id="loading-mssg"><p class="muted loader-table"><center><img src="assets/img/ajax-loader.gif"><br><br>Finding metadata for this object...</center></p></div>');
			self.$elem.append('<div id="mainview">')
            	    
			/*
			 this.$infoPanel = $("<div>");
			 this.$infoTable = $("<table>")
                              .addClass("table table-striped table-bordered");
			 this.$infoPanel.append(this.$infoTable)
                           .append(this.$buttonPanel);

			this.$elem.append(this.$infoPanel);
			*/
			
			console.log("objVer "+options.objVer);
			
			  var objectIdentity = self.getObjectIdentity(options.wsNameOrId, options.objNameOrId, options.objVer);
			  console.log(objectIdentity);
			  console.log([objectIdentity]);
			  
			  var pass = {workspace:options.wsNameOrId,name:options.objNameOrId};
			  console.log(pass);
			 //kbws.get_objects([objectIdentity], function(data) {
			 //kbws.get_objects([{workspace: this.options.wsNameOrId, name: this.options.objNameOrId}], function(data) {
			//kbws.list_referencing_objects([pass], function(data) {								
			kbws.get_object_info([objectIdentity]).fail(function (xhr, status, error) {
                            console.log(xhr);
                            console.log(status);
                            console.log(error);
                        })
                        .done(function (info, status, xhr) {
                            setTimeout(function() { ; }, 200);                        
                            //console.log(info);
			    console.log(info[0]);
			    var objinfo = info[0];
                            var refList = {};													
				// load the data into a data object
				
				var refTableData = [];		
				var savedate = new Date(objinfo[3]);					    
				refTableData.push({
				  na:objinfo[1],
				  ve:objinfo[6]+"/"+objinfo[0]+"/"+objinfo[4],
				  ty:objinfo[2],
				  ow:objinfo[5],
				  da:self.monthLookup[savedate.getMonth()]+" "+savedate.getDate()+", "+savedate.getFullYear(),
			          si:Math.round((objinfo[9]/1048576.0)*10.0)/10.0+" MB",
				  ch:objinfo[8]
				})
											
				self.$elem.find('#loading-mssg').remove();
				
				var $maindiv = self.$elem.find('#mainview');
				$maindiv.append('<table cellpadding="0" cellspacing="0" border="0" id="ref-table" \
				    class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;"/>');
	
				var tblSettings = {
						//"sPaginationType": "full_numbers",
						//"iDisplayLength": 10,
						"autoWidth": true,
						"sDom": 't<>',
						"ordering": false,
						"aoColumns": [
							      {sTitle: "Object Name", mData: "na", sWidth:"30%"},
							      {sTitle: "WS Id/Obj Id/Version", mData: "ve"},
							      {sTitle: "Type", mData: "ty"},
							      {sTitle: "Owner", mData: "ow"},
							      {sTitle: "Last modified", mData: "da"},
							      {sTitle: "Size", mData: "si"},
							      {sTitle: "Checksum", mData: "ch"}
							      ],
							      "aaData": refTableData            				              
				};
				var refTable = self.$elem.find('#ref-table').dataTable(tblSettings);	     
			  });		     
			
	return this;
        },
		
		
	getData: function() {
            return {title:"Metadata for :",id:this.objName, workspace:this.wsName};
        },
        
		/**
		 *Returns the full workspace identifier, optionally with the version.
		 */
		getObjectIdentity: function(wsNameOrId, objNameOrId, objVer) {
			console.log(wsNameOrId +" "+objNameOrId +" "+ objVer);
			if (objVer) { return {ref:wsNameOrId+"/"+objNameOrId +"/"+objVer}; }
			return {ref:wsNameOrId+"/"+objNameOrId } ;
		},
		
		monthLookup : ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"]
	
	});
})( jQuery );
