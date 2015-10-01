(function( $, undefined ) { 
    $.KBWidget({ 
        name: "KBaseGenomeWideCommunity", 
        parent: "kbaseWidget", 
        version: "1.0.0",

        options: {
            genomeID: null,
            workspaceID: null,
            loadingImage: "assets/img/ajax-loader.gif",
            kbCache: null,
            genomeInfo: null
        },

        init: function(options) {
            this._super(options);
            this.render();
            return this;
        },

        render: function() {
            var self = this;
            var row1 = $('<div class="row">');
            self.$elem.append(row1);
            var narrativereflist = $('<div class="col-md-4 panel panel-default">');
            row1.append(narrativereflist);
            var referencelist = $('<div class="col-md-4 panel panel-default">');
            row1.append(referencelist);
            var userreflist = $('<div class="col-md-4 panel panel-default">');
            row1.append(userreflist);
            narrativereflist.KBaseNarrativesUsingData({objNameOrId: self.options.genomeID, 
            	wsNameOrId: self.options.workspaceID, objVer: null, kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage, genomeInfo: self.options.genomeInfo});
            referencelist.KBaseWSReferenceList({objNameOrId: self.options.genomeID, 
            	wsNameOrId: self.options.workspaceID, objVer: null, kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage, genomeInfo: self.options.genomeInfo});
            userreflist.KBaseWSObjRefUsers({objNameOrId: self.options.genomeID, 
            	wsNameOrId: self.options.workspaceID, objVer: null, kbCache: self.options.kbCache,
                loadingImage: self.options.loadingImage, genomeInfo: self.options.genomeInfo});
            var row2 = $('<div class="row">');
            self.$elem.append(row2);
            var objrefgraphview = $('<div class="col-md-12 panel panel-default">');
            row2.append(objrefgraphview);
            objrefgraphview.KBaseWSObjGraphCenteredView({objNameOrId: self.options.genomeID, 
            	wsNameOrId: self.options.workspaceID, kbCache: self.options.kbCache, 
            	genomeInfo: self.options.genomeInfo});
        },

        getData: function() {
            return {
                type: "Genome Community",
                id: this.options.genomeID,
                workspace: this.options.workspaceID,
                title: "KBase Community"
            };
        }

    });
})( jQuery );