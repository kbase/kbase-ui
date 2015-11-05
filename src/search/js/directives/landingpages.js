
/*
 *  Directives
 *  
 *  These can be thought of as the 'widgets' on a page.  
 *  Scope comes from the controllers.
 *
*/


angular.module('lp-directives', []);
angular.module('lp-directives')
.directive('objectlist', function($location) {
    return {
        link: function(scope, element, attr) {
            if (scope.type == 'models') {
                var ws = scope.ws ? scope.ws : "KBaseCDMModels";

                var p = $(element).kbasePanel({title: 'KBase Models', 
                                                   rightLabel: ws});
                p.loading();
                var prom = kb.req('ws', 'list_workspace_objects',
                                    {type: 'Model', workspace: ws})
                $.when(prom).done(function(d){
                    $(p.body()).kbaseWSModelTable({ws: ws, data: d});
                    $(document).on('modelClick', function(e, data) {
                        var url = '/models/'+ws+'/'+data.id;
                        scope.$apply( $location.path(url) );
                    });
                })
            } else if (scope.type == 'media') {
                var ws = scope.ws ? scope.ws : "KBaseMedia"; 

                var p = $(element).kbasePanel({title: 'KBase Media', 
                                                   rightLabel: ws});
                p.loading();
                var prom = kb.req('ws', 'list_workspace_objects',
                                    {type: 'Media', workspace: ws});

                $.when(prom).done(function(d){
                    $(element).kbaseWSMediaTable({ws: ws, data: d});
                    $(document).on('mediaClick', function(e, data) {
                        var url = '/media/'+ws+'/'+data.id;
                        scope.$apply( $location.path(url) );
                    });
                })
            } else if (scope.type == 'rxns') {
                var p = $(element).kbasePanel({title: 'Biochemistry Reactions'});
                p.loading();

                var bioTable = $(p.body()).kbaseBioRxnTable(); 

                var prom = getBio('rxns', p.body(), function(data) {
                    bioTable.loadTable(data);
                });
            } else if (scope.type == 'cpds') {
                var p = $(element).kbasePanel({title: 'Biochemistry Compounds'});
                p.loading();

                var bioTable = $(p.body()).kbaseBioCpdTable();

                var prom = getBio('cpds', p.body(), function(data) {
                    bioTable.loadTable(data);
                });
            }
        }
        
    };
})
.directive('memelist', function($location) {
    return {
        link: function(scope, element, attr) {
            var ws = scope.ws ? scope.ws : "AKtest"; 

            $(element).kbaseMemeTable({ws: ws, auth: scope.USER_TOKEN, userId: scope.USER_ID});
            $(document).on('memeClick', function(e, data) {
                var url = '/meme/'+ws+'/'+data.id;
                scope.$apply( $location.path(url) );
            });
        }
        
    };
})
.directive('modelmeta', function() {
    return {
        link: function(scope, element, attrs) {
            var p = $(element).kbasePanel({title: 'Model Info', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();

            var prom = kb.req('ws', 'get_objectmeta',
                        {type:'Model', id: scope.id, workspace: scope.ws});
            $.when(prom).done(function(data){
                $(p.body()).kbaseModelMeta({data: data});
            })
        }
    };
})

.directive('modeltabs', function($location, $rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var ws = scope.ws;
            var id = scope.id;
            /*var p = $(element).kbasePanel({title: 'Model Details', 
                                           rightLabel: ws ,
                                           subText: id,
                                           type: 'FBAModel', 
                                           widget: 'modeltabs'});
                */
            $(ele).loading();

            //var prom = kb.req('fba', 'get_models',
            //            {models: [id], workspaces: [ws]});

            var prom = kb.get_model(scope.ws, scope.id)
            $.when(prom).done(function(data){
                $(ele).rmLoading();

                $rootScope.org_name = data[0].data.name;
                scope.$apply();

                $(ele).kbaseModelTabs({modelsData: data, api: kb.fba, ws: ws});
                $(document).on('rxnClick', function(e, data) {
                    var url = '/rxns/'+data.ids;
                    scope.$apply( $location.path(url) );
                });
                $(document).on('cpdClick', function(e, data) {
                    var url = '/cpds/'+data.ids;
                    scope.$apply( $location.path(url) );
                });                 
            }).fail(function(e){
                $(ele).rmLoading();
                $(ele).append('<div class="alert alert-danger">'+
                                e.error.message+'</div>')
            });
        }
    };
})
.directive('modelcore', function($location) {
    return {
        link: function(scope, element, attrs) {
            var ws = scope.ws;
            var id = scope.id;
            var p = $(element).kbasePanel({title: 'Core Metabolic Pathway', 
                                           rightLabel: ws,
                                           subText: id, 
                                           type: 'FBAModel', 
                                           widget: 'modelcore'});
            p.loading();

            var prom = kb.req('fba', 'get_models',
                        {models: [id], workspaces: [ws]})
            $.when(prom).done(function(data) {
                $(p.body()).kbaseModelCore({ids: [id], 
                                            workspaces : [ws],
                                            modelsData: data});
                $(document).on('coreRxnClick', function(e, data) {
                    var url = '/rxns/'+data.ids.join('&');
                    scope.$apply( $location.path(url) );
                });  
            })
        }
    };
})
.directive('modelopts', function() {
    return {
        link: function(scope, element, attrs) {
            $(element).kbaseModelOpts({ids: scope.id, 
                                       workspaces : scope.ws})
        }
    };
})
.directive('fbameta', function() {
    return {
        link: function(scope, element, attrs) {
            var p = $(element).kbasePanel({title: 'FBA Info', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            var prom = kb.req('ws', 'get_objectmeta',
                        {type:'FBA', id: scope.id, workspace: scope.ws});
            $.when(prom).done(function(data){
                $(p.body()).kbaseFbaMeta({data: data});                    
            });
        }
    };
})

.directive('models', function($location, $rootScope, $stateParams) {
    return {
        link: function(scope, element, attrs) {
            element.kbaseModelTabs({ws: $stateParams.ws, name: $stateParams.id})
        }
    };
})
.directive('fbas', function($location, $rootScope, $stateParams) {
    return {
        link: function(scope, element, attrs) {
            element.kbaseFbaTabs({ws: $stateParams.ws, name: $stateParams.id});            
        }
    }
})

.directive('fbatabs', function($location, $rootScope, $stateParams) {
    return {
        link: function(scope, element, attrs) {
            $(element).loading();
            
            var run_fba_message = "<h5>There are currently no FBA "+
                                  "results associated with this model. "+
                                  "You may want to run FBA analysis.</h5>";
            $.when(scope.ref_obj_prom).done(function() {
                loadPanel(scope.fba_refs)
            }).fail(function() {
                $(element).html(run_fba_message)
            })

            function loadPanel(fba_refs) {
                // reload table when 
                if (fba_refs.length) {
                    var row = verSelector(fba_refs);
                    $(element).prepend(row)                    
                    loadTabs(fba_refs[0].ws, fba_refs[0].name)
                } else {
                    $(element).rmLoading();
                    $(element).html(run_fba_message)                    
                }
            }

            function verSelector(fba_refs) {
                var ver_selector = $('<select class="form-control fba-selector">');
                for (var i in fba_refs) {
                    var ref = fba_refs[i];

                    if ($stateParams.fba == ref.name) {
                        ver_selector.append('<option data-name="'+ref.name+'" data-ws="'+ref.ws+'" selected>'
                                                +ref.name+' | '+ref.ws+' | '+ref.date+'</option>')
                    } else {
                        ver_selector.append('<option data-name="'+ref.name+'" data-ws="'+ref.ws+'">'
                                                +ref.name+' | '+ref.ws+' | '+ref.date+'</option>')                        
                    }
                }

                ver_selector.change(function() {
                    var gif_container = $('<div>');
                    $(this).after(gif_container);
                    gif_container.loading();

                    var selected = $(this).find('option:selected')
                    var name = selected.data('name');
                    var ws = selected.data('ws');                    

                    loadTabs(ws, name);
                })

                // form for options on tabs
                var form = $('<div class="col-xs-5">');
                form.append(ver_selector);
                var row = $('<div class="row">');
                row.append(form);
                return row;
            }


            function loadTabs(fba_ws, fba_name) {
                var p1 = kb.get_fba(fba_ws, fba_name)
                //var p2 = kb.ws.get_object_info([{workspace: fba_refs[0].ws, 
                //                                 name: fba_refs[0].name}], 1);
                $.when(p1).done(function(data){
                    $(element).rmLoading();

                    $('.fba-container').remove();
                    var container = $('<div class="fba-container">');
                    $(element).append(container);
                    container.kbaseFbaTabs({fbaData: data});

                    $rootScope.org_name = data[0].org_name;
                    scope.$apply();

                    $(document).on('rxnClick', function(e, data) {
                        var url = '/rxns/'+data.ids;
                        scope.$apply( $location.path(url) );
                    });        
                    $(document).on('cpdClick', function(e, data) {
                        var url = '/cpds/'+data.ids;
                        scope.$apply( $location.path(url) );
                    });                            
                })
            }



        } /* end link */
    };
})
.directive('associatedmodel', function($compile) {
    return {
        link: function(scope, ele, attrs) {
            // fixme: this just needs to be rewritten
            var fba_id = scope.id;

            $(ele).loading();


            var p = kb.ws.get_referenced_objects([scope.ws+'/'+scope.id])
            $.when(p).done(function(data){
                console.log('data', data)


            })

            var prom = kb.get_fba(scope.ws, scope.id);
            $.when(prom).done(function(data) {
                var refs = data[0].obj_refs

                var obj_refs = []
                for (var i in refs) {
                    obj_refs.push({ref: refs[i]})
                }
                var p = kb.ws.get_object_info(obj_refs)

                $.when(p).done(function() {
                    var reference_list = arguments[0]

                    for (var i in reference_list) {
                        var info = reference_list[i];
                        var full_type = info[2];
                        var type = full_type.slice(full_type.indexOf('.')+1);
                        var kind = type.split('-')[0];

                        if (kind == "FBAModel") {
                            var ws = info[7];
                            var id = info[1];
                            break;
                        }
                    }

                    var url = 'ws.mv.fba'+"({ws:'"+ws+"', id:'"+id+"', fba:'"+fba_id+"'})";
                    var link = $('<h5><a ui-sref="'+url+'">'+fba_id+'</a></h5>');
                    $compile(link)(scope);
                    $(ele).append(link)

                    $(ele).append('<br><br>')
                    $(ele).append('<h5>Referenced Objects</h5>')

                    var data = [];
                    var labels = []
                    $(ele).rmLoading();
                    for (var i in reference_list) {
                        var info = reference_list[i]
                        var full_type = info[2];

                        var ws = info[7]
                        var id = info[1]
                        var module = full_type.split('.')[0];
                        var type = full_type.slice(full_type.indexOf('.')+1);
                        var kind = type.split('-')[0];

                        switch (kind) {
                            case 'FBA': 
                                route = 'ws.fbas';
                                break;
                            case 'FBAModel': 
                                route = 'ws.mv.model';
                                break;
                            case 'Media': 
                                route = 'ws.media';
                                break;
                            case 'MetabolicMap': 
                                route = 'ws.maps';
                                break;
                            case 'Media': 
                                route = 'ws.media';
                                break; 
                        }


                        var url = route+"({ws:'"+ws+"', id:'"+id+"'})";
                        var link = '<a ui-sref="'+url+'">'+id+'</a>'
                        data.push(link)
                        labels.push(kind)
                    }

                    var table = kb.ui.listTable({array: data, labels: labels})
                    $compile(table)(scope);
                    $(ele).append(table)
                    //scope.$apply();
                        //$compile(link)(scope);
                        //var row = $('<div>')
                        //row.append('<b>'+kind+'</b>: ')
                        //row.append(link)
//
                        //$(ele).append(row);

                })

            })

        }
    }
})
.directive('fbacore', function($location) {
    return {
        link: function(scope, element, attrs) {
            var p = $(element).kbasePanel({title: 'Core Metabolic Pathway', 
                                           rightLabel: scope.ws,
                                           subText: scope.id, 
                                           type: 'FBA', 
                                           widget: 'fbacore'});
            p.loading();

            var prom1 = kb.req('fba', 'get_fbas',
                        {fbas: [scope.id], workspaces: [scope.ws]});
            $.when(prom1).done(function(fbas_data) {
                var model_ref = fbas_data[0].modelref;
                var wsid = parseInt(model_ref.split('/')[0]);
                var objid = parseInt(model_ref.split('/')[1]);

                var prom2 = kb.req('fba', 'get_models',
                        {models: [objid], workspaces: [wsid]});
                $.when(prom2).done(function(models_data){
                    $(p.body()).kbaseModelCore({ids: [scope.id],
                                                workspaces : [scope.ws],
                                                modelsData: models_data,
                                                fbasData: fbas_data});
                    $(document).on('coreRxnClick', function(e, data) {
                        var url = '/rxns/'+data.ids.join('&');
                        scope.$apply( $location.path(url) );
                    }); 
                })
            })
        }
    };
})


.directive('fbapathways', function($location) {
    return {
        link: function(scope, element, attrs) {
            var map_ws = 'nconrad:paths';
            var p = $(element).kbasePanel({title: 'Pathways', 
                                           type: 'Pathway',
                                           rightLabel: map_ws,
                                           subText: scope.id});
            p.loading();

            var prom1 = kb.get_models(scope.ws, scope.id);
            $.when(prom1).done(function(fbas_data) {
                $(p.body()).pathways({fbaData: fbas_data, 
                            ws: map_ws, defaultMap: scope.defaultMap,
                            scope: scope})

            }).fail(function(e){
                    $(p.body()).append('<div class="alert alert-danger">'+
                                e.error.message+'</div>')
            });
        } //end link
    }
})

.directive('pathway', function() {
    return {
        link: function(scope, element, attrs) {
            var p = $(element).kbasePanel({title: 'Metabolic Pathway', 
                                           type: 'Pathway',
                                           rightLabel: 'N/A',
                                           subText: scope.id});
            p.loading();
            var p1 = kb.req('ws', 'get_objects',
                        [{name: scope.id, workspace: scope.ws}]);
            $.when(p1).done(function(d) {
                var d = d[0].data;
                $(p.body()).kbasePathway({ws: scope.ws,
                                          mapID: scope.id, 
                                          mapData: d, 
                                          editable:true})
            }).fail(function(e){
                    $(p.body()).append('<div class="alert alert-danger">'+
                                e.error.message+'</div>');
            });

        }
    };
})    

.directive('mediadetail', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Media Details', 
                                           type: 'Media',
                                           rightLabel: scope.ws,
                                           subText: scope.id,
                                           widget: 'mediadetail'});
            p.loading();

            var prom = kb.req('fba', 'get_media',
                    {medias: [scope.id], workspaces: [scope.ws]})
            //var prom = kb.ws.get_objects([{workspace:scope.ws, name: scope.id}])
            $.when(prom).done(function(data) {
                $(p.body()).kbaseMediaEditor({ids: [scope.id], 
                                              workspaces : [scope.ws],
                                              data: data});
            }).fail(function(e){
                $(ele).rmLoading();
                $(ele).append('<div class="alert alert-danger">'+
                                e.error.message+'</div>')
            });
        }
    };
})


.directive('phenotype', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Phenotype Set Data', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});

            $(p.body()).kbasePhenotypeSet({ws: scope.ws, name: scope.id})

        }
    }
})

.directive('promconstraint', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'PROM Constraint Data', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});

            $(p.body()).kbasePromConstraint({ws: scope.ws, name: scope.id})

        }
    }
})

.directive('regulome', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Regulome Data', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});

            $(p.body()).kbaseRegulome({ws: scope.ws, name: scope.id})

        }
    }
})

.directive('expressionseries', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Expression Series', 
                                           rightLabel: scope.ws,
                                           subText: scope.id});

            $(p.body()).kbaseExpressionSeries({ws: scope.ws, name: scope.id})

        }
    }
})

.directive('pangenome', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Pangenome ', 
                                       rightLabel: scope.ws,
                                       subText: scope.id});

            p.loading();
            $(p.body()).kbasePanGenome({ws: scope.ws, name:scope.id});
    

        }
    };
})

.directive('simulation', function() {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Simulation Set Data', 
                                       rightLabel: scope.ws,
                                       subText: scope.id});
            p.loading();
            $(p.body()).kbaseSimulationSet({ws: scope.ws, name: scope.id})
        }
    };
})

.directive('rxndetail', function() {
    return {
        link: function(scope, ele, attrs) {
            var ids = scope.ids;

            var tabs = $(ele).kbTabs()
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];

                var content = $('<div>');
                content.kbaseRxn({id: id});
                tabs.addTab({name: ids[i], 
                             content: content, 
                             active: (i == 0 ? true : false),
                             animate: false
                            })
            }
        }
    };
})
.directive('cpddetail', function() {
    return {
        link: function(scope, ele, attrs) {
            var ids = scope.ids;

            var tabs = $(ele).kbTabs()
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];

                var content = $('<div>');
                content.kbaseCpd({id: id});
                tabs.addTab({name: ids[i], 
                             content: content, 
                             active: (i == 0 ? true : false),
                             animate: false
                            })
            }
        }
    };
})
.directive('jsonviewer', function() {
    return {
        link: function(scope, ele, attrs) {
            $(ele).append('<b>Sorry!</b>  No landing page is available for this object. \
                            In the meantime, view the JSON below or consider contributing.')

            $(ele).loading()
            var p = kb.req('ws', 'get_object', 
                    {workspace: scope.ws, id: scope.id})
            $.when(p).done(function(data) {
                var data = data;
                $(ele).rmLoading();
                scope.data = data;
                displayData(data);
            }).fail(function(e){
                $(ele).rmLoading();
                $(ele).append('<div class="alert alert-danger">'+
                                e.error.message+'</div>')
            });

            function displayData(data) {
                $(ele).append('<h3>Metadata</h3><br>');
                var c = $('<div id="metadata">');
                $(ele).append(c);
                c.JSONView(JSON.stringify(data.metadata));

                $(ele).append('<h3>Data</h3><br>');
                var c = $('<div id="data">');
                $(ele).append(c);
                c.JSONView(JSON.stringify(data.data))
            }
        }
    };
})


.directive('backbutton', function() {
    return {
        link: function(scope, ele, attrs) {
            $(ele).on('click', function() {
                window.history.back();
            });
        }

    };
})

.directive('genomeoverview', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Genome Overview',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading(); 
            $(p.body()).KBaseGenomeOverview({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb})
        }
    };
})
.directive('genomewiki', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Genome Wiki',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            $(p.body()).KBaseWikiDescription({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb})
        }
    };
})



/* START new placement in sortable rows for genome landing page */

.directive('sortablegenomeoverview', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            var p = $(ele).kbasePanel({title: 'Overview',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            $(p.body()).KBaseGenomeWideOverview({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
/*.directive('sortablegenomewikidescription', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Description',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseWikiDescription({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})*/

.directive('sortableimport', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Copy To My Workspace',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3";}

            $(p.body()).KBaseWSButtons({objNameOrId: scope.id, wsNameOrId: scope.ws});
        }
    };
})

.directive('sortablegenometaxonomy', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Taxonomy',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeWideTaxonomy({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortabletaxonomyinfo', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Taxonomy',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeLineage({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortabletree', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Species Tree',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();

            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }

            
        }
    };
})

.directive('sortablegenomeassemannot', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Assembly and Annotation',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeWideAssemAnnot({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortablecontigbrowser', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Contig Browser',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseMultiContigBrowser({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortablegenetable', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Gene List',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeGeneTable({genome_id: scope.id, ws_name: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortableseedannotations', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Functional Categories',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseSEEDFunctions({objNameOrId: scope.id, wsNameOrId: scope.ws, objVer: null, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortablegenomecompleteness', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Genome Completeness',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeCompleteness({genome_id: scope.id, ws_name: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortablerelatedpublications', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Related Publications',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            
            var objId = scope.ws + "/" + scope.id;
	    kb.ws.get_object_subset( [ {ref:objId, included:["/scientific_name"]} ], function(data) {
                    var searchTerm = "";
                    if (data[0]) {
                        if (data[0]['data']['scientific_name']) {
                            searchTerm = data[0]['data']['scientific_name'];
                        }
                    }
                    $(p.body()).KBaseLitWidget({literature:searchTerm, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
                },
                function(error) {
                    console.error("Trying to get scientific name for genome for related publication widget");
                    console.error(error);
                    $(p.body()).KBaseLitWidget({literature:"", kbCache: kb});
                });
        }
    };
})


.directive('sortablenarrativereflist', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Narratives using this Genome',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseNarrativesUsingData({objNameOrId: scope.id, wsNameOrId: scope.ws, objVer: null, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortableuserreflist', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'People using this Genome',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseWSObjRefUsers({objNameOrId: scope.id, wsNameOrId: scope.ws, objVer: null, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablereferencelist', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'List of data objects referencing this Genome',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseWSReferenceList({objNameOrId: scope.id, wsNameOrId: scope.ws, objVer: null, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif" });
        }
    };
})
.directive('sortableobjrefgraphview', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Object Reference and Provenance Graph',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseWSObjGraphCenteredView({objNameOrId: scope.id, wsNameOrId: scope.ws, kbCache: kb});
        }
    };
})
.directive('sortablegenomecommunity', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'KBase Community',
                                           rightLabel: scope.ws,
                                           subText: scope.id});
            p.loading();
            // hack until search links directly to WS objects
            if (scope.ws === "CDS") { scope.ws = "KBasePublicGenomesV3" }
            $(p.body()).KBaseGenomeWideCommunity({genomeID: scope.id, workspaceID: scope.ws, kbCache: kb});
        }
    };
})
.directive('sortablegenomepage', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            $(ele).KBaseGenomePage({genomeID: scope.id, workspaceID: scope.ws});
        }
    };
})

/* END new placement in sortable rows for genome landing page */



/* START new placement in sortable rows for gene landing page */
.directive('sortablegeneoverview', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Gene Overview',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneInstanceInfo(
                            {featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws, kbCache: kb, hideButtons:true,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})

.directive('sortablegenecontigbrowser', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Contig Location',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseContigBrowser(
                            {centerFeature: scope.fid, genomeId: scope.gid, workspaceId: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablebiochemistry', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Biochemistry',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneBiochemistry(
                            {featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablesequence', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Sequence',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneSequence(
                            {featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablegenedomains', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Domains',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneDomains(
                            {featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablepdbstructure', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Structure',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneStructureMatches(
                            {featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws, kbCache: kb,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortableexprlineplot', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Gene Expression Data',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();
            $(p.body()).KBaseGeneExprLinePlot(
                            {featureID: scope.fid,
                                            loadingImage: "assets/img/ajax-loader.gif"});
        }
    };
})
.directive('sortablegenetree', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var p = $(ele).kbasePanel({title: 'Gene Tree',
                                           rightLabel: scope.ws,
                                           subText: scope.fid});
            p.loading();

            if (scope.ws === "CDS") { 
                $(p.body()).empty();
                $(p.body()).append('<b>There are no gene trees created for this gene.</b>');
            	return; 
            }

            var wsName = scope.ws;
            var genomeId = scope.gid;
            var featureId = scope.fid;
            $(p.body()).empty();
            $(p.body()).append("Object ref: " + wsName + "/" + genomeId + "/" + featureId + "<br>");
            var expectedGeneFullName = genomeId + "/" + featureId;
            
            kb.ws.list_objects({workspaces: [wsName], type: "KBaseTrees.Tree", includeMetadata: 1}, function(data) {
            	var get_object_subset_params = [];
            	for (var i in data) {
            		var objInfo = data[i]
            		if (objInfo[10].type === 'SpeciesTree')
            			continue;
                    var objName = objInfo[1];
            		get_object_subset_params.push({ref: wsName + "/" + objName, included: ["default_node_labels"]});
            		if (get_object_subset_params.length > 100)
            			break;
            	}
            	if (get_object_subset_params.length == 0) {
    				$(p.body()).empty();
    				$(p.body()).append('<b>There are no gene trees created for this gene.</b>');
            	} else {
            		kb.ws.get_object_subset(get_object_subset_params, function(data) {
            			var treeName = null;
            			for (var i in data) {
            				for (var key in data[i].data.default_node_labels) {
            					var geneFullName = data[i].data.default_node_labels[key];
            					if (geneFullName === expectedGeneFullName) {
            						treeName = data[i].info[1];
            						break;
            					}
            				}
            				if (treeName)
            					break;
            			}
            			if (treeName) {
            				$(p.body()).empty();
            				$(p.body()).kbaseTree({treeID: treeName, workspaceID: scope.ws});           		
            			} else {
            				$(p.body()).empty();
            				$(p.body()).append('<b>There are no gene trees created for this gene.</b>');
            			}
            		},
            		function(error) {
            			var err = '<b>Sorry!</b>  Error retreiveing species trees info';
            			if (typeof error === "string") {
            				err += ": " + error;
            			} else if (error.error && error.error.message) {
            				err += ": " + error.error.message;
            			}
            			$(p.body()).empty();
            			$(p.body()).append(err);
            		});
            	}
            },
            function(error) {
        		var err = '<b>Sorry!</b>  Error retreiveing species trees info';
        		if (typeof error === "string") {
                    err += ": " + error;
        		} else if (error.error && error.error.message) {
                    err += ": " + error.error.message;
        		}
                $(p.body()).empty();
                $(p.body()).append(err);
            });
        }
    };
})
.directive('sortablegenepage', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            $(ele).KBaseGenePage({featureID: scope.fid, genomeID: scope.gid, workspaceID: scope.ws});
        }
    };
})




/* END new placement in sortable rows for gene landing page */

/* START placement for sortable rows for bicluster landing page */

.directive('sortablemakresult', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }
            var p = $(ele).kbasePanel({title: 'Bicluster Set Overview',
                                           rightLabel: scope.params.workspace,
                                           subText: scope.params.id});
			
			p.loading();
			
			$(p.body()).KBaseMAKResultCard({
				id: scope.params.id,
				workspace: scope.params.workspace,
				auth: $rootScope.USER_TOKEN, 
				userId: $rootScope.USER_ID,
				kbCache: kb,
				loadingImage: "assets/img/ajax-loader.gif"							
			});

        }
    };
})
.directive('sortablemaktiles', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }
            var p = $(ele).kbasePanel({title: 'Bicluster Set Tiles',
                                           rightLabel: scope.params.workspace,
                                           subText: scope.params.id});

			p.loading();
			
			$(p.body()).KBaseMAKTilingCard({
				id: scope.params.id,
				workspace: scope.params.workspace,
				scope: scope,
				auth: $rootScope.USER_TOKEN, 
				userId: $rootScope.USER_ID,
				kbCache: kb,
				loadingImage: "assets/img/ajax-loader.gif"							
			});
										
        }
    };
})

.directive('sortablemakterms', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }
            var p = $(ele).kbasePanel({title: 'Bicluster Set Enriched Terms',
                                           rightLabel: scope.params.workspace,
                                           subText: scope.params.id});
			
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					var biclusters = data[0].data.sets[0].biclusters
					var terms = {};
					for (i=0;i<biclusters.length;i++) {
						var enrichedTerms = []
						for (var term in biclusters[i].enriched_terms) {
							
							if (biclusters[i].enriched_terms[term] != "") {
								enrichedTerms.push(biclusters[i].enriched_terms[term])
								var termEntry = term+": "+biclusters[i].enriched_terms[term]
								if (termEntry in terms) terms[termEntry].push(biclusters[i].bicluster_id)
								else terms[termEntry] = [biclusters[i].bicluster_id]
							}
						}
					}
					p.loading();
					
					$(p.body()).KBaseBarChartCard({
						terms: terms,
						workspace: scope.params.workspace,
						auth: $rootScope.USER_TOKEN, 
						userId: $rootScope.USER_ID,
						kbCache: kb,
						loadingImage: "assets/img/ajax-loader.gif"							
					});
				}
			)
        }
    };
})
.directive('sortablemakbicluster', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }            
			
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					
					var biclusters = data[0].data.sets[0].biclusters
					var bicluster_info = data[0].data.sets[0]
					
					scope.params.id = biclusters[0].bicluster_id
					
					$("body").on("click", ".biclusterTile",
						function() {							
							
							scope.params.id = biclusters[$(this).val()].bicluster_id								
						
							p.header()[0].childNodes[6].childNodes[0].data = biclusters[$(this).val()].bicluster_id //very hardcoded. need change in future.							
																			
							p.loading()
							
							widget.options.bicluster = [biclusters,$(this).val(),bicluster_info]
							widget.__proto__.render(widget.options,widget)//very hardcoded. need change in future.

							$(p.body()).KBaseMAKBiclusterCard({ // Doesn't actually update the card, only here to remove the loading icon.
								bicluster: [biclusters,$(this).val(),bicluster_info],
								workspace: scope.params.workspace,
								auth: $rootScope.USER_TOKEN, 
								userId: $rootScope.USER_ID,
								kbCache: kb,
								loadingImage: "assets/img/ajax-loader.gif"
							});
						}
					)
					
					var p = $(ele).kbasePanel({title: 'Bicluster Overview',
												rightLabel: scope.params.workspace,
												subText: scope.params.id});					
										   
					p.loading();
					
					var widget = $(p.body()).KBaseMAKBiclusterCard({
						bicluster: [biclusters,0,bicluster_info],
						workspace: scope.params.workspace,
						auth: $rootScope.USER_TOKEN, 
						userId: $rootScope.USER_ID,
						kbCache: kb,
						loadingImage: "assets/img/ajax-loader.gif"
					});
					
				}
			)
        }
    };
})

.directive('floatheatmap', function($rootScope) {
	return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }      
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					var bicluster = data[0].data
					
					scope.params.id = bicluster.id
							
					var p = $(ele).kbasePanel({title: 'Data Table',
												rightLabel: scope.params.workspace,
												subText: scope.params.id});					
										   
					p.loading();
					var widget = $(p.body()).KBaseHeatMapCard({			
						count: bicluster.id.replace(/\./g,'').replace(/\|/,''),
						bicluster: data[0].data,
						workspace: scope.params.workspace,
						auth: $rootScope.USER_TOKEN, 
						userId: $rootScope.USER_ID,
						kbCache: kb,
						loadingImage: "assets/img/ajax-loader.gif"
					})				
				}
			)
        }
    }
})
.directive('floatlinechart', function($rootScope) {	
	return {
		link: function(scope, ele, attrs) {
		
			if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }            
			
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					
					var bicluster = data[0].data
					scope.params.id = bicluster.id
						
					var widget;
					var p;
					var gene_index = null
					var gene_labels = bicluster.row_labels,
						conditions = bicluster.column_labels,
						expression = bicluster.data;
					var display = true
					$("body").on("click",".geneLabel"+bicluster.id.replace(/\./g,'').replace(/\|/,''),
						function() {
							gene_index = $(this).index()
							if (display) {
								p = $(ele).kbasePanel({title: 'Line Chart',
															rightLabel: scope.params.workspace,
															subText: scope.params.id});					
								
								p.loading();
								
								widget = $(p.body()).KBaseLineChartCard({
									id: scope.params.id.replace(/\./g,'').replace(/\|/,''),
									count: bicluster.id.replace(/\./g,'').replace(/\|/,''),
									row: [expression,conditions,gene_labels,gene_index],
									workspace: scope.params.workspace,
									auth: $rootScope.USER_TOKEN, 
									userId: $rootScope.USER_ID,
									kbCache: kb,
									loadingImage: "assets/img/ajax-loader.gif"
								});
								display = false
							}
						}
					)																		
				}
			)
		}
	};
})
.directive('sortableheatmap', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }      
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					var biclusters = data[0].data.sets[0].biclusters
					var bicluster_info = data[0].data.sets[0]
					
					scope.params.id = biclusters[0].bicluster_id
					
					$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
					.then(
						function(data) {
							
							$("body").on("click", ".biclusterTile",
								function() {																																	
									
									scope.params.id = biclusters[$(this).val()].bicluster_id										
								
									p.header()[0].childNodes[6].childNodes[0].data = biclusters[$(this).val()].bicluster_id //very hardcoded. need change in future.							
																					
									p.loading()
									
									$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
									.then(
										function(data) {
											var bicluster = data[0].data
											widget.options.bicluster = bicluster
											widget.options.count = bicluster.id.replace(/\./g,'').replace(/\|/,'')
											
											widget.$elem.empty()
											
											widget.render(widget.options,widget)//very hardcoded. need change in future.
											
											$(p.body()).KBaseHeatMapCard({ // Doesn't actually update the card, only here to remove the loading icon.
												count: biclusters[0].bicluster_id.replace(/\./g,'').replace(/\|/,''),
												bicluster: data[0].data,
												workspace: scope.params.workspace,
												auth: $rootScope.USER_TOKEN, 
												userId: $rootScope.USER_ID,
												kbCache: kb,
												loadingImage: "assets/img/ajax-loader.gif"
											});												
										}
									)
								}
							)
							
							var p = $(ele).kbasePanel({title: 'Data Table',
														rightLabel: scope.params.workspace,
														subText: scope.params.id});					
												   
							p.loading();
							
							var widget = $(p.body()).KBaseHeatMapCard({
								count: biclusters[0].bicluster_id.replace(/\./g,'').replace(/\|/,''), 
								bicluster: data[0].data,
								workspace: scope.params.workspace,
								auth: $rootScope.USER_TOKEN, 
								userId: $rootScope.USER_ID,
								kbCache: kb,
								loadingImage: "assets/img/ajax-loader.gif"
							});							
							
						}
					)
				}
			)
        }
    };
})
.directive('sortablelinechart', function($rootScope) {	
	return {
		link: function(scope, ele, attrs) {
		
			if (scope.params.workspace === "CDS") { scope.params.workspace = "KBaseBicluster" }            
			
			var workspaceClient = new Workspace("https://kbase.us/services/ws", { 'token' : $rootScope.USER_TOKEN, 'user_id' : $rootScope.USER_ID})
			$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
			.then(
				function(data) {
					
					var biclusters = data[0].data.sets[0].biclusters
					var bicluster_info = data[0].data.sets[0]
					
					scope.params.id = biclusters[0].bicluster_id
					
					$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
					.then(
						function(data) {
						
							var bicluster = data[0].data
							
							$("body").on("click", ".biclusterTile",
								function() {
									
									scope.params.id = biclusters[$(this).val()].bicluster_id									
									
									$.when(workspaceClient.get_objects([{workspace: scope.params.workspace, name: scope.params.id}]))
									.then(
										function(data) {
											var bicluster = data[0].data
											var gene_index = null
											var gene_labels = bicluster.row_labels,
												conditions = bicluster.column_labels,
												expression = bicluster.data;
											var display = true
											$("body").on("click",".geneLabel"+bicluster.id.replace(/\./g,'').replace(/\|/,''),
												function() {
													gene_index = $(this).index()
													if (display) {
														var newLineChart = $("<div sortablelinechart>")		
														$("#sortable-landing").append($("<div class='col-md-12'>").append(newLineChart))																																												
														
														var p = newLineChart.kbasePanel({title: 'Line Chart',
																				rightLabel: scope.params.workspace,
																				subText: scope.params.id})
														p.loading()
																							
														$(p.body()).KBaseLineChartCard({
															id: scope.params.id.replace(/\./g,'').replace(/\|/,''),
															count: bicluster.id.replace(/\./g,'').replace(/\|/,''),
															row: [expression,conditions,gene_labels,gene_index],
															workspace: scope.params.workspace,
															auth: $rootScope.USER_TOKEN, 
															userId: $rootScope.USER_ID,
															kbCache: kb,
															loadingImage: "assets/img/ajax-loader.gif"
														});	
														display = false
													}
												}
											)
										}
									)
								}
							)
							
							var widget;
							var p;
							var gene_index = null
							var gene_labels = bicluster.row_labels,
								conditions = bicluster.column_labels,
								expression = bicluster.data;															
							
							var display = true
							
							$("body").on("click",".geneLabel"+bicluster.id.replace(/\./g,'').replace(/\|/,''),
								function() {
									gene_index = $(this).index()
									if (display) {
										p = $(ele).kbasePanel({title: 'Line Chart',
																rightLabel: scope.params.workspace,
																subText: scope.params.id});					
							
										p.loading();
										widget = $(p.body()).KBaseLineChartCard({
											id: scope.params.id.replace(/\./g,'').replace(/\|/,''),
											count: biclusters[0].bicluster_id.replace(/\./g,'').replace(/\|/,''),
											row: [expression,conditions,gene_labels,gene_index],
											workspace: scope.params.workspace,
											auth: $rootScope.USER_TOKEN, 
											userId: $rootScope.USER_ID,
											kbCache: kb,
											loadingImage: "assets/img/ajax-loader.gif"
										});
										display = false
									}
								}
							)
						}
					)
				}
			)
		}
	};
})



.directive('jgiobjinfo', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            
            
            /* don't use the draggable rows style because there is just one row!
            /*var p = $(ele).kbasePanel({title: 'Imported JGI Data',
                                           rightLabel: '', //scope.params.ws,
                                           subText: '' }); //scope.params.obj});*/
            
            /* simplified panel that cannot be closed or dragged */
            var $panel = $('<div class="panel panel-default">'+
                                '<div class="panel-heading">'+
                                    '<span class="panel-title"></span>'+
                                '</div>'+
                                '<div class="panel-body"></div>'+
                           '</div>');
            $(ele).append($panel).css({'margin':'10px'});;
            
            $panel.find('.panel-title').append('Imported JGI Data');
            $panel.find('.panel-body').KBaseJgiDataImportView({
                    ws:   scope.params.ws,
                    obj:  scope.params.obj,
                    loadingImage: "assets/img/ajax-loader.gif"
                });
        }
    };
})



.directive('narrativestore', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            
            
            /* don't use the draggable rows style because there is just one row!
            /*var p = $(ele).kbasePanel({title: 'Imported JGI Data',
                                           rightLabel: '', //scope.params.ws,
                                           subText: '' }); //scope.params.obj});*/
            
            /* simplified panel that cannot be closed or dragged */
            var $panel = $('<div class="panel panel-default">'+
                                '<div class="panel-heading">'+
                                    '<span class="panel-title"></span>'+
                                '</div>'+
                                '<div class="panel-body"></div>'+
                           '</div>').css({'margin':'10px'});
            $(ele).append($panel);
            $panel.find('.panel-title').append('Narrative Apps and Methods Documentation');
            $panel.find('.panel-body').KBaseNarrativeStoreView({
                    type:   scope.params.type,
                    id:  scope.params.id,
                    loadingImage: "assets/img/ajax-loader.gif"
                });
        }
    };
})


.directive('jsoncards', function($rootScope) {
    return {
        link: function(scope, ele, attrs) {
            var $panel = $('<div class="panel panel-default">'+
                                '<div class="panel-heading">'+
                                    '<span class="panel-title"></span>'+
                                '</div>'+
                                '<div class="panel-body"></div>'+
                           '</div>').css({'margin':'10px'});;
            $(ele).append($panel);
            $panel.find('.panel-title').append('Raw Data JSON Viewer');
            $panel.find('.panel-body').kbaseJsonView({
                    ws: scope.params.ws,
            	    id: scope.params.id
                });
        }
    };
})

;
