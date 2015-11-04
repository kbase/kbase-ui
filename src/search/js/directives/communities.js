

angular.module('communities-directives', []);
angular.module('communities-directives')
.directive('metagenome', function($stateParams) {
    return {
        link: function(scope, ele, attrs) {

            // fetch data to get metagenome id
            $(ele).loading();
            var prom = kb.ws.get_objects([{workspace: scope.ws, name: scope.id}])
            $.when(prom).done(function(d) {
                var metagenome_id = d[0].data.ref.ID;
                
                // use metagenome id to fetch metadata on obj
                var url = 'https://kbase.us/services/communities/'+metagenome_id+'?verbosity=mixs';
                $.get(url, function(data) {
                    $(ele).rmLoading();

                    var keys = [{key: 'PI_firstname'},
                                {key: 'status'},
                                {key: 'sequence_type'},
                                {key: 'collection_date'},
                                {key: 'feature'},
                                {key: 'PI_lastname'},
                                {key: 'latitude'},
                                {key: 'biome'},
                                {key: 'id', format: function(d) {
                                    return '<a href="'+kb.metagenome_url+d.id+'" target="_blank">'+d.id+'</a>';
                                }},
                                {key: 'project_name'},
                                {key: 'project_id'},
                                {key: 'env_package_type'},
                                {key: 'country'},
                                {key: 'longitude'},
                                {key: 'location'},
                                {key: 'name'},
                                {key: 'seq_method'},
                                {key: 'created'},
                                {key: 'material'}];

                    var table = kb.ui.objTable({keys: keys,
                                                obj: data,
                                                keysAsLabels: true,
                                                bold: true});
                    $(ele).append(table);
                })
            }).fail(function(e){
                $(ele).html('<div class="alert alert-danger">'+e.error.message+'</div>');
            })
        }
    }
})
.directive('communitiesCollection', function() {
    return {
        link: function(scope, ele, attrs) {
            $(ele).loading();

            var prom = kb.ws.get_objects([{workspace: scope.ws, name: scope.id}])
            $.when(prom).done(function(d) {
                $(ele).rmLoading();       
                var data = d[0].data;

                scope.name = data.name;
                scope.created = data.created;
                scope.members = data.members;
                scope.$apply();
            }).fail(function(e){
                $(ele).html('<div class="alert alert-danger">'+e.error.message+'</div>');
            })
        }
    }
})
.directive('communitiesProfile', function() {
    return {
        link: function(scope, ele, attrs) {
            $(ele).loading();

            var prom = kb.ws.get_objects([{workspace: scope.ws, name: scope.id}])
            $.when(prom).done(function(d) {
                $(ele).rmLoading();
                console.log('profile', d[0].data);
                var data = JSON.parse(d[0].data.data);

                $(ele).append('<b>Type:</b>', data.type)
                buildTable(data);
            }).fail(function(e){
                $(ele).html('<div class="alert alert-danger">'+e.error.message+'</div>');
            })

            function buildTable(data) {
                var cols = [];
                for (var i in data.columns) {
                    var obj = data.columns[i];
                    cols.push({sTitle: obj.id});
                }

                var tableSettings = {sPaginationType: "bootstrap",
                                     iaDisplayLength: 10,
                                     aaData: data.data,
                                     aoColumns: cols
                                    }


                var table = $('<table class="table table-bordered table-striped" style="width: 100%;">');
                $(ele).append(table);
                table.dataTable(tableSettings)
            }
        }
    }
})

