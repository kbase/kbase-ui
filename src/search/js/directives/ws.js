
/*
 *  Workspace Directives
 *  
 *   This file has the left hand (wsselector)
 *   and right hand (objtable) directives of the workspace
 *   browser.
 *      
*/


angular.module('ws-directives', []);
angular.module('ws-directives')
.directive('wsselector', function($location, $compile, $state, $stateParams, modals) {
    return {
        templateUrl: 'views/ws/ws-selector.html',
        link: function(scope, element, attrs) {
            var perm_dict = {'a': 'Admin',
                             'r': 'Read',
                             'w': 'Write',
                             'o': 'Owner',
                             'n': 'None'};

            // Global list and dict of fetched workspaces
            var workspaces = []; 

            var nav_height = 80;

            // This method loads the sidebar data.  
            // Note: this is only called after instantiation when sidebar needs to be refreshed
            scope.loadWSTable = function() {
                $('#select-box .table').remove();
                var table = $('<table class="table table-bordered table-hover ws-selector-table">')
                $('#select-box').append(table)

                workspaces = []
                
                var prom = kb.ws.list_workspace_info({});
                $('.select-box').loading();
                $.when(prom).done(function(data) {

                    $('.select-box').rmLoading();

                    var sorted_ws = [];
                    var owned_ws = [];
                    for (var i in data) {
                        var ws = data[i];
                        var user = ws[2];

                        // hide search workspaces
                        if (user == "kbasesearch") continue;  

                        if (user == USER_ID) {
                            owned_ws.push(ws);
                        } else {
                            sorted_ws.push(ws)
                        }
                    }

                    // sort my last modified
                    var owned_ws = owned_ws.sort(compare)
                    var sorted_ws = sorted_ws.sort(compare)

                    function compare(a,b) {
                        var t1 = kb.ui.getTimestamp(b[3]) 
                        var t2 = kb.ui.getTimestamp(a[3]) 
                        if (t1 < t2) return -1;
                        if (t1 > t2) return 1;
                        return 0;
                    }

                    var data = owned_ws.concat(sorted_ws);
                    for (var i in data) {
                        var ws = data[i];
                        var name = ws[1];
                        var user = ws[2];
                        var obj_count = ws[4];
                        var perm = ws[5];
                        var global_perm = ws[6];
                        //var short_ws = ws[0].slice(0,12) + '...'

                        var selector = $('<tr data-perm="'+perm+
                                            '" data-global="'+global_perm+
                                            '" data-owner="'+user+'"><td class="select-ws table-ellipsis '
                                                +($stateParams.ws == name ? 'selected-ws ' : '' )+ 
                                            '" data-ws="'+name+'">'+
                                            '<span class="badge">'+obj_count+'</span> '+
                                            '<span> '+(user == USER_ID ? '<b>'+name+'</b>': name)+'</span></td></tr>');
                        

                        selector.find('td').append('<button type="button" class="btn \
                                            btn-default btn-xs btn-ws-settings hide" data-ws="'+name+'">\
                                            <div class="glyphicon glyphicon-cog"></div></button>');

                        // event for showing settings button
                        selector.hover(function() {
                            $(this).find('.btn-ws-settings').removeClass('hide');
                        }, function() {
                            $(this).find('.btn-ws-settings').addClass('hide');
                        })
                        var blah = $(".select-box table").append(selector);
                    }

                    workspaces = data;

                    $('.scroll-pane').css('height', $(window).height()-
                        $('.ws-selector-header').height() - nav_height )
                    events();
                });
            }

            // load the content of the ws selector
            scope.loadWSTable();

            // move up/down ws selector
            /*
            $(document).keydown(function(e) {

                // move down
                if (e.which == 40) {
                    $('.selected-ws').parent().next()
                    alert('move down')
                }

                e.preventDefault(); // prevent the default action (scroll / move caret)
            });*/            

            function events() {
                var filterCollapse = $('.perm-filters');
                var filterOwner = filterCollapse.find('#ws-filter-owner').change(filter);
                var filterAdmin = filterCollapse.find('#ws-filter-admin').change(filter);
                var filterWrite = filterCollapse.find('#ws-filter-write').change(filter);
                var filterRead  = filterCollapse.find('#ws-filter-read').change(filter);
                //var filterProjects  = filterCollapse.find('#ws-filter-projects').change(filter);                

                // event for clicking on 'create new workspace'
                $('.btn-new-ws').unbind('click');
                $('.btn-new-ws').click(function() {
                    modals.createWS({submit_cb: function() {
                        scope.loadWSTable();
                    }});
                });

                $('.btn-show-fav').unbind('click');
                $('.btn-show-fav').click(function() {
                    if ($(this).hasClass('active')) return;

                    $('.btn-new-ws').fadeOut();
                    $('.btn-filter-ws').fadeOut(function() {
                        $('.fav-toolbar').show();
                    });


                    $('#select-box').toggle('slide', {
                                     direction: 'left',
                                     duration: 'fast',
                                         complete: function() {
                                         $('#favorite-sidebar').toggle('slide', {
                                             direction: 'right',
                                             duration: 'fast'
                                         });
                                     }
                                 })
                    $(this).parent().children().removeClass('active');
                    $(this).addClass('active');
                })

                $('.btn-show-ws').unbind('click');
                $('.btn-show-ws').click(function() {
                    if ($(this).hasClass('active')) return;

                    $('.fav-toolbar').hide()
                    $('.btn-new-ws').fadeIn();
                    $('.btn-filter-ws').fadeIn();


                    $('#favorite-sidebar').toggle('slide', {
                                     direction: 'right',
                                     duration: 'fast',
                                         complete: function() {
                                         $('#select-box').toggle('slide', {
                                             direction: 'right',
                                             duration: 'fast'
                                         });
                                     }
                                 })

                    $(this).parent().children().removeClass('active');
                    $(this).addClass('active');                    

                })                


                // events for search box
                $('.wb-search').unbind('click');
                $('.wb-search').keyup(function() {
                    $('.select-box').find('td').show();
                        var input = $(this).val();
                        $('.select-box').find('td').each(function(){
                        if ($(this).text().toLowerCase().indexOf(input.toLowerCase()) != -1) {
                            return true;
                        } else {
                            $(this).hide();
                        }
                    });
                });

                // events for filters at top of ws selector
                $('.show-filters').unbind('click');
                $('.show-filters').click(function() {
                    $(this).parent().find('.perm-filters').slideToggle(function() {

                        // if filters are shown, adjust scrollbox height.
                        if ( $('.perm-filters').css('display') == "none") {
                            $('.scroll-pane').css('height', $(window).height()-
                                $('.ws-selector-header').height() - nav_height  );                                
                        } else {
                            $('.scroll-pane').css('height', $(window).height()-
                                $('.ws-selector-header').height() - nav_height );                                
                        }

                    });
                });

                // event for selecting a workspace on the sidebar
                $('.select-ws').not('.btn-ws-settings').unbind('click');
                $('.select-ws').not('.btn-ws-settings').click(function() {
                    var ws = $(this).data('ws');
                    $('.select-ws').removeClass('selected-ws');
                    $(this).addClass('selected-ws');
                    $state.transitionTo("ws.id", {ws: ws});
                    scope.$apply();
                });

                // event for settings (manage modal) button
                $('.btn-ws-settings').unbind('click')
                $('.btn-ws-settings').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var name = $(this).parent('td').data('ws');
                    modals.manageWS({ws: name, 
                                     copy_cb: function() {
                                        scope.loadWSTable();
                                        kb.ui.notify('Copied workspace: <i>'+name+'</i>');
                                     }, 
                                     delete_cb: function(){
                                        scope.loadWSTable();
                                        kb.ui.notify('Deleted workspace: <i>'+name+'</i>');
                                     }
                    });
                })

                // event for resizing ws selector scroll bars //fixme
                $(window).resize(function () {
                    // only adjust of ws selector is visible
                    if ($(element).is(':visible')) {
                        setTimeout(function() {
                            $('.scroll-pane').css('height', $(window).height()
                                - $('.ws-selector-header').height() - nav_height )   
                        }, 250); 
                    }
                });              

                // function that filters when a filter is selected
                function filter() {
                    $('.select-box table tr').show();
                    $('.no-ws-alert').remove()

                    //var projects_cb  = filterRead.prop('checked');
                    var owner_cb = filterOwner.prop('checked');
                    var admin_cb = filterAdmin.prop('checked');
                    var write_cb = filterWrite.prop('checked');
                    var read_cb  = filterRead.prop('checked');


                    for (var i=0; i< workspaces.length; i++) {
                        var ws = workspaces[i];
                        var name = ws[1];
                        var user = ws[2];
                        var obj_count = ws[4];
                        var perm = ws[5];
                        var global_perm = ws[6];
                        var is_project = ws[10]

                        var j = i+1;

                        var show = false;
                        if (admin_cb && perm === 'a') show = true;
                        if (write_cb && perm === 'w') show = true;
                        if (read_cb && perm === 'r') show = true;

                        // these filters can be combined with the above 
                        if (!show && read_cb && global_perm === 'r') show = true;
                        if (show && owner_cb && user != USER_ID) show = false;
                        //if (show && projects_cb && is_project == false) show = false;   

                        if (!show) {
                            $('.select-box table tr:nth-child('+j+')').hide();
                        }
                    }

                    if ($('.select-box table tr:visible').length == 0) {
                        $('.select-box table').append('<tr class="no-ws-alert"><td>No Workspaces</td></tr>');
                    } 
                }


                // help tooltips
                $('.btn-ws-settings').tooltip({title: 'Workspace Settings', placement: 'left', delay: {show: 800}})                     

            } /* end events */

        }  /* end link */
    };
})


.directive('objtable', function($location, $compile, modals) {
    return {
        link: function(scope, element, attrs) {
            var ws = scope.ws;

            var table;
            scope.favs;
            scope.checkedList = [];

            scope.updateFavStars = function() {
                $xml.find("td").each(function(index){        
                    var row =             
                    oTable.fnUpdate( [c1, c2, c3], index ); // Row
                });  
            }

            scope.$watch('checkedList', function() {
                $('.obj-check-box').each(function() {
                    var c = scope.checkedList;
                    var found = false
                    for (var i in c) {
                        if (c[i].name == $(this).data('name')
                            && c[i].ws == $(this).data('ws')
                            && c[i].type == $(this).data('type') ){
                            $(this).addClass('ncheck-checked');
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        $(this).removeClass('ncheck-checked')
                    }
                })

                var count = (scope.checkedList.length ? scope.checkedList.length : '');
                $('.checked-count').text(count);

                if (scope.checkedList.length == 1) {
                    $('.object-options, .btn-rename-obj').removeClass('hide');
                } else if (scope.checkedList.length > 1) {
                    $('.object-options').removeClass('hide');
                    // hide options that can only be done on 1 object at a time
                    $('.btn-rename-obj').addClass('hide');
                } else {
                    $('.object-options').addClass('hide');
                }
            }, true)

            function removeCheck(name, ws, type) {
                var c = scope.checkedList
                for (var i = 0; i < c.length; i++) {

                    if (c[i].name == name 
                        && c[i].ws == ws
                        && c[i].type == type) {
                        c.splice(i,1);
                        scope.$apply();
                    }
                }
            }


            scope.loadObjTable = function() {
                var table_id = "obj-table";                  


                var checkbox = '<div class="ncheck check-option btn-select-all"></div>'
                var columns =  [ (USER_ID ? { sTitle: checkbox, bSortable: false, "sWidth": "1%"} 
                                          : { bVisible: false, sWidth: "1%"}),
                                { sTitle: "Name", sContentPadding: "xxxxxxxMore",}, //"sWidth": "10%"
                                { sTitle: "Type"},
                                { sTitle: "Last Modified", iDataSort: 5},
                                { sTitle: "Modified By", bVisible: true},
                                { sTitle: "Timestamp", bVisible: false, sType: 'numeric'},
                                { sTitle: "Size", iDataSort: 7 },
                                { sTitle: "Byte Size", bVisible: false },
                                { sTitle: "Module", bVisible: false }];

                var tableSettings = {
                    //sPaginationType: "bootstrap",
                    sPaginationType: "full_numbers",
                    stateSave: (USER_ID ? true : false),
                    stateSaveParams: function (settings, data) {
                        //don't save search filter
                        data.search.search = "";
                    },
                    oColReorder: {
                        "iFixedColumns": (USER_ID ? 1 :0 ),
                    },
                    iDisplayLength: 10,
                    aaData: [],
                    fnDrawCallback: events,
                    aaSorting: [[ 3, "desc" ]],
                    aoColumns: columns,
                    oLanguage: {
                        sEmptyTable: "No objects in workspace",
                        sSearch: "Search: "
                    }
                }

                // clear object view every load
                $(element).html('');
                $(element).loading('<br>loading<br>'+ws+'...', true);

                var p = kb.ws.list_objects({workspaces: [ws]});
                var p2 = kb.ws.list_objects({workspaces: [ws], showOnlyDeleted: 1});
                //var p3 = (USER_ID ? kb.ujs.get_has_state('favorites', 'queue', 0) : undefined);
                var p3 = undefined;
                var p4 = $.getJSON('landing_page_map.json');

                $.when(p, p2, p3, p4).done(function(objs, deleted_objs, favs, obj_mapping){
                    if (favs) {
                        scope.favs = (favs[0] == 1 ? favs[1] : []);                        
                    }

                    scope.deleted_objs = deleted_objs;
                    scope.obj_mapping = obj_mapping[0];

                    $(element).rmLoading();

                    var table_ele = $('<table id="'+table_id+'" class="table table-bordered table-striped" style="width: 100%;">')
                    $(element).append(table_ele);

                    // format and create object datatable
                    var tableobjs = formatObjs(objs, obj_mapping);
                    var wsobjs = tableobjs[0];
                    var kind_counts = tableobjs[1];
                    tableSettings.aaData = wsobjs;
                    table = table_ele.dataTable(tableSettings);       
                    $compile(table)(scope);
                    //new FixedHeader( table , {offsetTop: 110, "zTop": 500});

                    // reset filter; critical for ignoring cached filter
                    table.fnFilter((scope.type ? scope.type+'-.*' : ''), getCols(table, 'Type'), true)

                    // add trashbin
                    var trash_btn = getTrashBtn();
                    $('.dataTables_filter').after(trash_btn);

                    // add show/hide column settings button
                    var settings_btn = getSettingsBtn(table)
                    $('.table-options').append(settings_btn);
                    // ignore close on click inside of *any* settings button
                    $('.settings-dropdown').click(function(e) {
                        e.stopPropagation();
                    });                    

                    // show these options if logged in.
                    if (USER_ID) {
                        trash_btn.removeClass('hide');
                    }

                    // if there are objects add type filter,
                    if (objs.length) {
                        var type_filter = getTypeFilterBtn(table, kind_counts, scope.type)
                        $('.table-options').append(type_filter);
                    }

                    //searchColumns()
                    addOptionButtons();

                    // resinstantiate all events.
                    events();

                }).fail(function(e){
                    $(element).html('<div class="alert alert-danger">'+e.error.message+'</div>');
                })

            } // loadObjTable


            scope.loadNarTable = function(tab) {
                var checkbox = '<div class="ncheck check-option btn-select-all"></div>'
                var columns =  [ (USER_ID ? { sTitle: checkbox, bSortable: false, "sWidth": "1%"} 
                                          : { bVisible: false, "sWidth": "1%"}),
                                { sTitle: "Narrative", sType: "html", sContentPadding: "xxxxxxxMore"},
                                { sTitle: "Workspace", sType: "html", sContentPadding: "btn"},
                                { sTitle: "Last Modified", iDataSort: 5},
                                { sTitle: "Modified by", bVisible: true},
                                { sTitle: "Timestamp", bVisible: false, sType: 'numeric'},
                                { sTitle: "Size", bVisible: false, iDataSort: 7 },
                                { sTitle: "Byte Size", bVisible: false },
                                { sTitle: "Module", bVisible: false },
                                ];

                if (tab != 'public'){
                    columns.push({ "sTitle": "Shared With" })
                }

                var tableSettings = {
                    sPaginationType: "full_numbers",
                    stateSave: (USER_ID ? true : false),
                    stateSaveParams: function (settings, data) {
                        //don't save search filter
                        data.search.search = "";
                    },
                    oColReorder: {
                        iFixedColumns: (USER_ID ? 1 :0 ),
                    },
                    iDisplayLength: 10,
                    aaData: [],
                    fnDrawCallback: events,
                    aaSorting: [[ 3, "desc" ]],
                    //sDom: "R<'row'<'col-xs-12 table-options'f>r>t<'row'<'col-xs-12'ilp>>",
                    aoColumns: columns,
                    oLanguage: {
                        sEmptyTable: "No narratives",
                        sSearch: "Search: "
                    }
                }

                // clear object view every load
                $(element).html('');
                $(element).loading('<br>Loading<br>Narratives...', 'big');

                var p = kb.getNarratives();
                $.when(p).done(function(nars){
                    $(element).rmLoading();             

                    if (tab == "my-narratives") {
                        var narratives = nars.my_narratives;
                        var isOwner = true;
                        var table_id = 'my-nar-table';
                    } else if (tab == "shared") {
                        var narratives = nars.shared_narratives;
                        var table_id = 'shared-nar-table';
                    } else if (tab == "public") {
                        var narratives = nars.public_narratives;
                        var table_id = 'public-nar-table';                        
                    }
                    var perms = nars.perms;

                    var table_ele = $('<table id="'+table_id+'" class="table table-bordered table-striped" style="width: 100%;">')
                    $(element).append(table_ele);

                    //scope.deleted_objs = deleted_objs;   

                    // if not cached. format and create object datatable
                    if (tab != 'public') {
                        var wsobjs = formatNarObjs(narratives, isOwner, perms);
                    } else {
                        var wsobjs = formatNarObjs(narratives, isOwner);
                    }

                    tableSettings.aaData = wsobjs;
                    table = table_ele.dataTable(tableSettings);       
                    $compile(table)(scope);
                    //new FixedHeader( table , {offsetTop: 90, "zTop": 500});                    

                    // add trashbin
                    //var trash_btn = getTrashBtn();
                    //$('.dataTables_filter').after(trash_btn);
                    // show these options if logged in.

                    // add show/hide column settings button
                    var settings_btn = getSettingsBtn(table, 'nar');
                    $('.table-options').append(settings_btn);
                    // ignore close on click inside of *any* settings button
                    $('.settings-dropdown').click(function(e) {
                        e.stopPropagation();
                    });                    

                    //searchColumns()
                    addOptionButtons();

                    // resinstantiate all events.
                    events();


                }).fail(function(e){
                    $(element).html('<div class="alert alert-danger">'+e.error.message+'</div>');
                })
            } // end scope.loadNarTable


            // load the appropriate table
            if (scope.tab && scope.tab != 'featured') {
                scope.loadNarTable(scope.tab);
            } else {
                scope.loadObjTable();
            }

            function getSettingsBtn(table) {
                var settings_btn = $('<div class="btn-table-settings dropdown pull-left">'+
                          '<a class="btn btn-default" data-toggle="dropdown">'+
                            '<span class="glyphicon glyphicon-cog"></span> <span class="caret"></span>'+
                          '</a>'+
                        '</div>');

                var dd = $('<ul class="dropdown-menu settings-dropdown" role="menu"></ul>');

                dd.append('Columns:<br>');
                settings_btn.append(dd);

                var cols = getCols(table)
                for (var i in cols) {
                    if (cols[i].sTitle.indexOf('ncheck') != -1) continue;  // ignore checkbox col
                    dd.append('<div class="btn-settings-opt">'+
                                 '<label><input type="checkbox" data-col="'+cols[i].sTitle+'" '+
                                        (cols[i].bVisible == false ? '' : 'checked="checked"')+ 
                                 '> '+cols[i].sTitle+'</label>\
                               </div>');
                }
                dd.append('<hr class="hr">');
                var reset_btn = $('<button class="btn btn-default btn-settings-opt">Default Settings</button>');

                dd.append(reset_btn);

                dd.find('input').change(function() {
                    var col_name = $(this).data('col')
                    fnShowHide(table, col_name);
                }) 
                reset_btn.click( function () {
                    reset_dt_view(table);
                    if (scope.tab) {
                        scope.loadNarTable(scope.tab);
                    } else {
                        scope.loadObjTable();
                    }
                } );

                return settings_btn;
            }

            function getTypeFilterBtn(table, type_counts, selected) {
                var type_filter = $('<select class="type-filter form-control">\
                                    <option selected="selected">All Types</option> \
                                </select>');
                for (var type in type_counts) {
                    type_filter.append('<option data-type="'+type+'" '+
                                    (type == selected ? 'selected' : '')+
                                    '>'+type+'  ('+type_counts[type]+')</option>'); 
                }
                type_filter.change( function () {
                    var curr = getCols(table, 'Type')
                    if ($(this).val() == "All Types") {
                        // look for type column (init column 2) in current order
                        table.fnFilter('', curr);
                    } else {
                        table.fnFilter( $(this).find('option:selected').data('type')+'-.*', curr, true);
                    }    
                });

                return type_filter;
            }

            function getTrashBtn() {
                var trash_btn = $('<a class="btn-trash pull-right hide">Trash \
                            <span class="badge trash-count">'+scope.deleted_objs.length+'</span><a>');
                trash_btn.tooltip({title: 'View trash bin', placement: 'bottom', delay: {show: 700}});

                trash_btn.unbind('click');
                trash_btn.click(function(){
                    displayTrashBin();
                });

                return trash_btn;          
            }

            function fnShowHide(table, col_name ){
                var cols = table.fnSettings().aoColumns;
                var bVis;
                for (i=0; i<cols.length; i++) {
                    if (cols[i].sTitle == col_name) {
                        bVis = cols[i].bVisible;
                        break;
                    }
                }
                table.fnSetColumnVis( i, bVis ? false : true );
            }

            function formatNarObjs(objs, isOwner, perms) {
                var wsobjs = [];
                var kind_counts = {};

                for (var i in objs) {
                    var obj = objs[i];
                    var id = obj[0]
                    var name = obj[1];
                    var full_type = obj[2];
                    var module = full_type.split('.')[0];
                    var type = full_type.slice(full_type.indexOf('.')+1);
                    var kind = type.split('-')[0];
                    var timestamp = kb.ui.getTimestamp(obj[3].split('+')[0]);
                    var date = kb.ui.formateDate(timestamp);
                    var instance = obj[4];
                    var modby = obj[5];
                    var wsid = obj[6];
                    var ws = obj[7];
                    var bytesize = obj[9];
                    var size = kb.ui.readableSize(bytesize);

                    var check = '<div class="ncheck obj-check-box check-option"'
                            + ' data-wsid="' + wsid + '"'
                            + ' data-ws="' + ws + '"'
                            + ' data-type="' + type + '"'
                            + ' data-module="' + module + '"'
                            + ' data-name="' + name + '"'
                            + ' data-id="' + id + '"></div>';

                    var wsarray = [check, 
                                   name,
                                   ws,
                                   date,
                                   modby,
                                   timestamp,
                                   size,
                                   bytesize,
                                   module];
                    if (perms) {
                        wsarray.push(kb.ui.formatUsers(perms[ws], isOwner))
                    }

                    // determine if saved to favorites
                    var isFav = false;
                    for (var i in scope.favs) { 
                        if (scope.favs[i].ws != ws) continue;
                        if (scope.favs[i].id == name) {
                            isFav = true;
                            break;
                        } 
                    }

                    var url = '/narrative/ws.'+wsid+'.obj.'+id
                    var new_id = '<a '+(USER_ID ? 'href="'+url+'"' : '')+' target="_blank" class="obj-id nar-id" data-ws="'+ws+'"  data-wsid="'+wsid+'" data-id="'+id+'"'+
                                    ' data-name="'+name+'" data-type="'+type+'" data-kind="'+kind+'" data-module="'+module+'" ><b><i>'+
                                        name+'</i></b></a> (<a class="show-versions">'+instance+'</a>)'+
                                (isFav ? ' <span class="glyphicon glyphicon-star btn-fav"></span>': '')+
                                '<a class="btn-show-info pull-right invisible" >More</a>';

                    wsarray[1] = new_id;
                    url = "ws.id({ws:"+"'"+ws+"'})";
                    ws_link  = $('<div><a data-ws="'+ws+'" ui-sref="'+url+'">'+ws+'</a></div>');


                    ws_link.append(' <button type="button" '+
                            'class="btn btn-default btn-xs btn-nar-ws-settings pull-right" data-ws="'+name+'">'+
                            '<div class="glyphicon glyphicon-cog"></div></button>');
                    wsarray[2] = ws_link.html()
                    wsobjs.push(wsarray);
                }
                return wsobjs;
            }


            // function that takes json for the object table and formats
            function formatObjs(objs, obj_mapping) {
                var wsobjs = [];
                var kind_counts = {};

                for (var i in objs) {
                    var obj = objs[i];
                    var id = obj[0]
                    var name = obj[1];
                    var full_type = obj[2];
                    var module = full_type.split('.')[0];
                    var type = full_type.slice(full_type.indexOf('.')+1);
                    var kind = type.split('-')[0];
                    var timestamp = kb.ui.getTimestamp(obj[3].split('+')[0]);
                    var date = kb.ui.formateDate(timestamp);
                    var instance = obj[4];
                    var owner = obj[5];
                    var wsid = obj[6];
                    var ws = obj[7];
                    var bytesize = obj[9];
                    var size = kb.ui.readableSize(bytesize);

                    var check = '<div class="ncheck obj-check-box check-option"'
                            + ' data-wsid="' + wsid + '"'
                            + ' data-ws="' + ws + '"'
                            + ' data-type="' + type + '"'
                            + ' data-module="' + module + '"'
                            + ' data-id="' + id + '"'
                            + ' data-name="'+name+'"></div>';

                    var wsarray = [check, 
                                   name,
                                   type,
                                   date,
                                   owner,
                                   timestamp,
                                   size,
                                   bytesize,
                                   module];

                    if (kind in kind_counts) {
                        kind_counts[kind] = kind_counts[kind] + 1;
                    } else {
                        kind_counts[kind] = 1;
                    }

                    // determine if saved to favorites
                    /*
                    var isFav = false;
                    for (var i in scope.favs) { 
                        if (scope.favs[i].ws != ws) continue;
                        if (scope.favs[i].id == name) {
                            isFav = true;
                            break;
                        } 
                    }*/

                    // get url path specified in landing_page_map.json
                    if (module in scope.obj_mapping && scope.obj_mapping[module] 
                        && scope.obj_mapping[module][kind] ) {
                        var sub = scope.obj_mapping[module][kind];
                    } else {
                        var sub = undefined
                    }                    

                    //var sortable = ['FBAModel', 'FBA'];
                    //var mv = ['Media', 'MetabolicMap', 'ETC'];
                    //var route = (sortable.indexOf(kind) != -1 ? 'ws.mv' : sub)  //+sub : sub);
                    var route = sub;

                    // overwrite routes for pages that are displayed in the workspace browser
                    var routeInner = kb.getRoute(kind);
                    if (routeInner)
                    	route = routeInner;
                                                                                 
                    var link = $('<a class="obj-id" data-ws="'+ws+'" data-wsid="'+wsid+
                                    '" data-id="'+id+'" data-name="'+name+'" ' +
                                    'data-type="'+type+'" data-kind="'+kind+
                                    '" data-module="'+module+'" '+'data-sub="'+sub+'">'+
                                    name+'</a>');
                    var ver_link = $('<a class="show-versions">'+instance+'</a>');
                    var more_link = $('<a class="btn-show-info pull-right invisible" >More</a>');

                    if (route) {
                        var url = route+"({ws:'"+ws+"', id:'"+name+"'})";
                        link.attr('ui-sref', url);
                        var new_id =  $('<div>').append(link, ' (', ver_link, ')', more_link).html();
                    } else if (kind == "Narrative") {
                        var url = '/narrative/ws.'+wsid+'.obj.'+id;
                        if (USER_ID) {
                            link.attr('href', url);
                            link.attr('target', '_blank');
                        }
                        var new_id =  $('<div>').append(link, ' (', ver_link, ')', more_link).html();
                    } else {
                        var url = "ws.json({ws:'"+ws+"', id:'"+name+"'})"
                        link.attr('ui-sref', url).attr('target', '_blank');
                        var new_id =  $('<div>').append(link, ' (', ver_link, ')', more_link).html();
                    }

                    //else if (kind == 'Metagenome') {
                    //    var new_id =  $('<div>').append(link, ' (', ver_link, ')', more_link).html();
                    //}

                    wsarray[1] = new_id;
                    wsobjs.push(wsarray);
                }
                return [wsobjs, kind_counts];
            }

            // events for object table.  
            // This is reloaded on table change/pagination
            function events() {
                $compile(table)(scope);

                // if not logged in, and a narrative is clickd, display login for narratives
                $('.nar-id').unbind('click');
                $('.nar-id').click(function(e) {
                    e.stopPropagation();
                    if (!USER_ID) {
                        var mustLogin = $('<div class="must-login-modal">').kbasePrompt({
                                    title : 'Please login',
                                    body : '<b>You must login to view narratives at this time.</b>',
                                    modalClass : '', 
                                    controls : ['closeButton']
                        })
                        mustLogin.openPrompt();
                    }
                })

                // events for favorite (start) button
                $('.btn-fav').hover(function() {
                    $(this).addClass('glyphicon-star-empty');
                }, function() {
                    $(this).removeClass('glyphicon-star-empty');
                })

                $('.btn-fav').unbind('click');
                $('.btn-fav').click(function(e) {
                    e.stopPropagation();

                    var link = $(this).parent('td').find('.obj-id');
                    var name = link.data('name');
                    var ws = link.data('ws');
                    var type = link.data('type');

                    $('.fav-loading').loading();
                    var p = favoriteService.remove(ws, name, type);

                    $.when(p).done(function(){
                        scope.updateFavs();
                    });
                    $(this).remove()

                })

                // event for objtect 'more' button
                $('.btn-show-info').unbind('click');
                $('.btn-show-info').click(function(e) {
                    e.stopPropagation();
                    var link = $(this).parent('td').find('.obj-id');
                    var name = link.data('name');
                    var ws = link.data('ws')
                    showObjectInfo(ws, name);
                })

                // event for showing object history
                $('.show-versions').unbind('click')
                $('.show-versions').click(function(e) {
                    e.stopPropagation();
                    var link = $(this).parent('td').find('.obj-id');                    
                    var ws = link.data('ws');
                    var name = link.data('name');
                    showObjectVersions(ws, name);
                })

                  // if select all checkbox was clicked
                $('.btn-select-all').unbind('click') 
                $('.btn-select-all').click(function(){
                    // if select all button is already checked, removed all checked
                    if ($(this).hasClass('ncheck-checked')) {
                        $('.obj-check-box').removeClass('ncheck-checked');
                        $(this).removeClass('ncheck-checked');
                        scope.checkedList = [];
                        scope.$apply();
                    // otherwise, check all
                    } else {
                        $('.obj-check-box').addClass('ncheck-checked');
                        $(this).removeClass('ncheck-minus');
                        $(this).addClass('ncheck-checked');

                        scope.checkedList = [];
                        $('.obj-check-box').each(function(){
                            var id = $(this).data('id');
                            var name = $(this).data('name');
                            var wsid = $(this).data('wsid');                                                       
                            var dataWS = $(this).data('ws');
                            var dataType = $(this).data('type');
                            var module = $(this).data('module');                            
                            scope.checkedList.push({id: id, name: name, wsid: wsid,
                                                    ws: dataWS, type: dataType, module:module });
                            scope.$apply();
                        })
                    }


                })

                // effect for highlighting checkbox on hover
                $('.obj-table tbody tr').hover(function() {
                    $(this).children('td').eq(0).find('.ncheck').addClass('ncheck-hover');
                    $(this).find('.btn-show-info').removeClass('invisible');
                }, function() {
                    $(this).children('td').eq(0).find('.ncheck').removeClass('ncheck-hover');
                    $(this).find('.btn-show-info').addClass('invisible');

                })

                // checkbox click event
                $('.obj-table tbody tr').unbind('click');
                $('.obj-table tbody tr').click(function(e) {
                    // don't select if link is clicked
                    if ($(e.target).hasClass('obj-id')) return;

                    if (!USER_ID) return;
                    var checkbox = $(this).children('td').eq(0).find('.ncheck');
                    var id = checkbox.data('id');
                    var name = checkbox.data('name');
                    var wsid = checkbox.data('wsid');                                    
                    var dataWS = checkbox.data('ws');
                    var dataType = checkbox.data('type');
                    var module = checkbox.data('module');

                    if (checkbox.hasClass('ncheck-checked')) {
                        removeCheck(name, dataWS, dataType)
                    } else {
                        scope.checkedList.push({id: id, name:name, wsid: wsid,
                                                ws: dataWS, type: dataType, module: module});
                        scope.$apply();
                    }

                })

                // event for settings (manage modal) button
                // this is special to the narrative pages
                $('.btn-nar-ws-settings').unbind('click')
                $('.btn-nar-ws-settings').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var name = $(this).parent('td').find('a').data('ws');
                    modals.manageWS({ws: name, 
                                     copy_cb: function() {
                                        scope.loadNarTable(scope.tab);
                                        kb.ui.notify('Copied workspace: <i>'+name+'</i>');
                                     }, 
                                     delete_cb: function(){
                                        scope.loadNarTable(scope.tab)
                                        kb.ui.notify('Deleted workspace: <i>'+name+'</i>');
                                     }
                    });
                })

                // help tooltips
                $('.show-versions').tooltip({title: 'Show history', placement: 'bottom', delay: {show: 700}});
                $('.nar-id').tooltip({title: 'Open Narrative', placement: 'bottom', delay: {show: 700}});
                $('.obj-id').tooltip({title: 'View object', placement: 'bottom', delay: {show: 700}});
                $('.btn-show-info').tooltip({title: 'Meta data/spec, download, etc.', placement: 'bottom', delay: {show: 700}});

                // event for putting fixed header back on page
                //    this special event uses .row since that container should be 
                //    replaced via angular when view changes
                //$('body').not('.obj-table tr').unbind('click')
                //$('body').not('.obj-table tr').click(function() {
                //    $('.fixedHeader').remove();
                //    $('.obj-table tr').removeClass('nar-selected');
                //    new FixedHeader( table , {offsetTop: 50, "zTop": 500});       
                //})
            }


            function addOptionButtons() {
                var options = $('<span class="object-options hide"></span>');

                var delete_btn = $('<button class="btn btn-danger btn-delete-obj">\
                    <span class="glyphicon glyphicon-trash"></span></button>')
                delete_btn.click(function() {
                    deleteObjects()
                })

                var copy_btn = $('<span class="dropdown"><button class="btn btn-default btn-mv-dd" \
                                    data-toggle="dropdown">\
                                <span class="glyphicon glyphicon-folder-open"></span>\
                                <span class="caret"></span></button>\
                                <ul class="dropdown-menu" role="menu">\
                                    <li><a class="btn-cp-obj">Copy</a></li>\
                                </ul></span>');

                var rename_btn = $('<button class="btn btn-default btn-rename-obj">\
                    <span class="glyphicon glyphicon-edit"></span></button>');

                var mv_btn = $('<button class="btn btn-default">\
                    <span class="glyphicon glyphicon-star"></span>\
                    <span class="checked-count"></span></button>');                                      

                if (scope.tab) {
                    options.append(delete_btn, rename_btn)
                    copy_btn.find('.btn-cp-obj').on('click', copyNarObjects);
                } else {
                    options.append(delete_btn, copy_btn, rename_btn)                    
                    copy_btn.find('.btn-cp-obj').on('click', copyObjects);
                }

                copy_btn.find('.btn-mv-obj-to-nar').on('click', copyObjectsToNarrative);                                        
                rename_btn.on('click', renameObject);
                //mv_btn.on('click', addToMV);

                var container = $('.table-options').append(options);

                delete_btn.tooltip({title: 'Delete selected objects', placement: 'bottom', delay: {show: 700}});
                //copy_btn.tooltip({title: 'Copy; click for options', placement: 'bottom', delay: {show: 700}});  
                rename_btn.tooltip({title: 'Rename (first) selected object', placement: 'bottom', delay: {show: 700}})                                      
            }


            function showObjectVersions(ws, id) {
                var historyModal = $('<div class="history-modal"></div>').kbasePrompt({
                        title : 'History of '+id,
                        modalClass : '', 
                        controls : ['cancelButton']
                    }
                );

                historyModal.openPrompt();
                var modal_body = historyModal.data('dialogModal').find('.modal-body').loading();
                historyModal.data('dialogModal').find('.modal-dialog').css('width', '800px');

                var prom = kb.ws.get_object_history({workspace: ws, name: id});
                $.when(prom).done(function(data) {
                    modal_body.rmLoading();
                    modal_body.append('<span class="h5"><b>Name</b></span>: '+id+'<br>')                            
                    modal_body.append('<span class="h5"><b>Database ID</b></span>: '+data[0][0]+'<br>')
                    var info = $('<table class="table table-striped table-bordered table-condensed">');
                    var header = $('<tr class="table-header"><th>Mod Date</th>\
                                        <th>Vers</th>\
                                        <th>Type</th>\
                                        <th>Owner</th>\
                                        <th>Checksum</th></tr>');
                    info.append(header);
                    for (var i=data.length-1; i >= 0; i--) {
                        var ver = data[i];
                        var row = getRow(ver);
                        info.append(row);
                    }

                    revert_btn = $('<a class="btn btn-primary btn-revert-object" disabled>Revert</a>')

                    modal_body.append(info);
                    info.find('tbody tr').not('.table-header').click( function(e) {
                        e.stopPropagation();                        
                        info.find('tbody tr').removeClass('selected');
                        $(this).addClass('selected');
                        revert_btn.removeAttr('disabled');
                    })
                    /* fixme: need modal api for this.  too much code */
                    var modal_content = historyModal.data('dialogModal').find('.modal-content');
                    modal_content.click(function(e) {
                        info.find('tbody tr').removeClass('selected');
                        revert_btn.attr('disabled', '')
                    })

                    revert_btn.click(function() {
                        var ver = info.find('.selected').data('ver');

                        historyModal.addCover().getCover().loading();
                        var p = kb.ws.revert_object({workspace: ws, name: id, ver: ver})
                        $.when(p).done(function(data) {
                            var row = getRow(data);
                            // insert new version
                            info.find('.table-header').after(row);
                            historyModal.addCover('Reverted to version '+ver);
                            historyModal.getCover().delay(2000).fadeOut(500);
                        }).fail(function(e) {
                            historyModal.addCover(e.error.message, 'danger');
                        })
                    })

                    modal_body.append(revert_btn)
                }).fail(function(e){
                    modal_body.append('<div class="alert alert-danger">'+
                            e.error.message+'</div>');
                });

                function getRow(ver) { 
                    var row = $('<tr data-ver="'+ver[4]+'">');                    
                    row.append('<td>' + ver[3].split('+')[0].replace('T',' ') + '</td>'
                               + '<td>' + ver[4] + '</td>'
                               + '<td>' + ver[2] + '</td>'
                               + '<td>' + ver[5] + '</td>'
                               + '<td>' + ver[8] + '</td>');
                    return row;
                }
            }

            function showObjectInfo(ws, id) {
                var info_modal = $('<div></div>').kbasePrompt({
                        title : id,
                        modalClass : '', 
                        controls : ['closeButton']
                    })

                info_modal.openPrompt();
                info_modal.data('dialogModal').find('.modal-dialog').css('width', '500px');
                var modal_body = info_modal.data('dialogModal').find('.modal-body');

                var params = [{workspace: ws, name: id}]
                var prom = kb.ws.get_object_info(params, 1);
                modal_body.loading();
                $.when(prom).done(function(data) {
                    modal_body.rmLoading();
                    var data = data[0];  // only 1 object was requested

                    modal_body.append('<h4>User Meta Data</h4>');
                    var usermeta = data[10];
                    if ($.isEmptyObject(usermeta)) {
                        modal_body.append('none');
                    } else {
                        var container = $('<div class="scroll-pane overflow-x">');
                        var table = $('<table class="table table-striped table-bordered table-condensed">');
                        var keys = [];
                        for (var key in usermeta) {
                            table.append('<tr><td><b>'+key+'</b></td><td>'+ usermeta[key]+'</td></tr>')
                        }
                        container.append(table)
                        modal_body.append(container);
                    }

                    // add properties table
                    var labels = ['ID', 'Name', 'Type', 'Moddate', 'Instance','Owner',
                                    'Workspace ID', 'Workspace', 'Checksum']
                    modal_body.append('<h4>Object Info</h4>');
                    var table = kb.ui.listTable({array: data, labels: labels, bold: true})
                    table.append('<tr><td><b>Size</b></td><td>'+data[9]+
                                ' Bytes ('+kb.ui.readableSize(data[9])+')</td></tr>');
                    modal_body.append(table);                        

                    var download = $('<a class="btn btn-default pull-left">Download\
                                <span class="glyphicon glyphicon-download-alt"></span></a>')

                    download.click(function() {
                        var saveData = (function () {
                            var a = document.createElement("a");
                            document.body.appendChild(a);
                            a.style = "display: none";
                            return function (data, fileName) {
                                var json = JSON.stringify(data),
                                    blob = new Blob([json], {type: "octet/stream"}),
                                    url = window.URL.createObjectURL(blob);
                                a.href = url;
                                a.download = fileName;
                                a.click();
                                window.URL.revokeObjectURL(url);
                            };
                        }());

                        var prom = kb.ws.get_objects([{workspace: ws, name:id}])
                        $.when(prom).done(function(json) {
                            var fileName = id+'.'+data[4]+'.json';
                            saveData(json[0], fileName);
                        })

                    })
                    info_modal.data('dialogModal').find('.modal-footer .text-left').append(download);

                    var open = $('<a class="open-obj pull-left">View JSON</a>')
                    open.click(function() {
                        var fileName = id+'.'+data[4]+'.json';
                        var jsonWindow = window.open(fileName,"_blank");
                        jsonWindow.document.write('loading...  This may take several seconds or minutes.');
                        var prom = kb.ws.get_objects([{workspace: ws, name:id}])
                        $.when(prom).done(function(json) {
                            jsonWindow.document.body.innerHTML = ''
                            jsonWindow.document.write(JSON.stringify(json[0]));
                        })
                    })
                    info_modal.data('dialogModal').find('.modal-footer .text-left').append(open);
                }).fail(function(e){
                    modal_body.append('<div class="alert alert-danger">'+
                        e.error.message+'</div>');
                });
            }

            var trashbin;
            function displayTrashBin() {
                var tableSettings = {
                    //"sPaginationType": "bootstrap",
                    "sPaginationType": "full_numbers",
                    "iDisplayLength": 10,
                    "aaData": [],
                    //"fnDrawCallback": events,
                    "aaSorting": [[ 3, "desc" ]],
                  "aoColumns": [
                      { "sTitle": "", bSortable: false},
                      { "sTitle": "Name", "sType": 'html'}, //"sWidth": "10%"
                      { "sTitle": "Type", "sWidth": "20%"},
                      { "sTitle": "Last Modified", "iDataSort": 5},
                      { "sTitle": "Modified by"},
                      { "sTitle": "Time Stamp", "bVisible": false, "sType": 'numeric'}                   

                  ],                         
                    "oLanguage": {
                        "sEmptyTable": "No objects in workspace",
                        "sSearch": "Search: "
                    }
                }

                // hide the objecttable, add back button
                var table_id = 'obj-table';
                $('#'+table_id+'_wrapper').hide();
                $(element).prepend('<h4 class="trash-header"><a class="btn btn-primary">\
                    <span class="glyphicon glyphicon-circle-arrow-left"></span> Back</a> '+ws+' \
                    <span class="text-danger">Trash Bin</span> <small><span class="text-muted">(Undelete option coming soon)</span></small></h4>');



                // if trash table hasn't already been rendered, render it
                if (typeof trashbin == 'undefined') {
                    $(element).append('<table id="'+table_id+'-trash" \
                        class="table table-bordered table-striped" style="width: 100%;"></table>');

                    var tableobjs = formatObjs(scope.deleted_objs, scope.obj_mapping) //,fav);
                    var wsobjs = tableobjs[0];
                    var kind_counts = tableobjs[1];

                    tableSettings.aaData = wsobjs;

                    // load object table
                    trashbin = $('#'+table_id+'-trash').dataTable(tableSettings);

                    /*
                    if (scope.deleted_objs.length) {
                        var type_filter = getTypeFilterBtn(trashbin, kind_counts, scope.type)
                        $('.table-options').append(type_filter);
                    }
                    addOptionButtons();
                    */

                    // resinstantiate all events.
                    events();                     
                } else {
                    $('#'+table_id+'-trash_wrapper').show();
                }


                // event for back to workspace button
                $('.trash-header .btn').unbind('click');
                $('.trash-header .btn').click(function() {

                    if (typeof trashbin) { // fixme: cleanup
                        trashbin.find('.table-options').remove()
                        trashbin.fnDestroy();
                        $('#'+table_id+'-trash').remove();
                        trashbin = undefined;
                    }

                    $('.trash-header').remove();
                    $('#'+table_id+'_wrapper').show();
                })                
            }


            function deleteObjects() {
                var params = {};
                var obj_ids = [];
                for (var i in scope.checkedList) {
                    var obj = {};
                    obj.workspace = scope.checkedList[i].ws;
                    obj.name = scope.checkedList[i].name;
                    obj_ids.push(obj);
                }

                var prom = kb.ws.delete_objects(obj_ids);
                $.when(prom).done(function(data) {
                    kb.ui.notify('Moved '+obj_ids.length+' object(s) to trashbin')                     
                    if (scope.tab) {
                        scope.loadNarTable(scope.tab);
                    } else {
                        scope.loadObjTable();
                    }
                    scope.checkedList = [];
                    scope.$apply();
                })
                return prom;
            }

            function addToMV() {
                $('.fav-loading').loading()
                var count = scope.checkedList.length;
                var p = favoriteService.addFavs(scope.checkedList);
                $.when(p).done(function() {
                    scope.updateFavs();
                })

                // add stars to table
                for (var i in scope.checkedList) {
                    var name = scope.checkedList[i].name;
                    var ws = scope.checkedList[i].ws;
                    var type = scope.checkedList[i].type;

                    $('.obj-id').each(function() {
                        if ($(this).data('ws')== ws 
                            && $(this).data('name') == name 
                            && $(this).data('type') == type
                            && !$(this).parent().find('.btn-fav').length) {
                            $(this).parent().append(' <span class="glyphicon glyphicon-star btn-fav"></span>');
                        }
                    })
                }

                // uncheck everything that is checked in that table ( this var is watched )
                scope.checkedList = [];
                scope.$apply();

                events();
            }

            // event for rename object button
            function renameObject() {
                var links = $('.ncheck-checked').eq(0).parents('tr').find('td').eq(1);
                var obj_id = links.find('.obj-id');
                var proj = obj_id.data('ws');
                var nar = obj_id.data('name');
                var version = $('.ncheck-checked').eq(0).parents('tr').find('.show-versions');
                var more = $('.ncheck-checked').eq(0).parents('tr').find('.btn-show-info');

                // add editable input to table
                var input = $('<input type="text" class="form-control">');
                var form = $('<div class="col-sm-4 input-group input-group-sm"></div>');
                form.append(input);
                input.val(nar);
                obj_id.parents('td').html(input);                            
                
                input.keypress(function (e) {
                    if (e.which == 13) {
                        $(this).blur();
                    }
                })

                // save new name when focus is lost or when key entered
                input.focusout(function() {
                    var new_name = $(this).val();

                    // if new name is actually new
                    if (new_name != nar) {
                        var notice = $('<span>saving...</span>');
                        input.parents('td').html(notice);

                        var p = kb.ws.rename_object({obj: {workspace: proj, name: nar}, new_name: new_name})
                        $.when(p).done(function(data) {
                            //change link on page
                            obj_id.data('name', new_name)
                            obj_id.text(new_name);
                            links.html('')
                            links.append(obj_id, ' (', version, ')', more);
                            notice.parents('td').html(links);
                            events();
                            //new FixedHeader( table , {offsetTop: 50, "zTop": 1000}); // no fixed header yet
                        }).fail(function(e){
                            notice.parents('td').html(links);
                            links.append(' <span class="text-danger">'+e.error.message+'</span>');
                            links.find('span').delay(3000).fadeOut(400, function(){
                                //$(this).remove();
                                links.html('')
                                links.append(obj_id, ' (', version, ')', more);
                                events();
                            });
                        })
                    } else {  // if didn't change name, replace link;
                        links.html('')
                        links.append(obj_id, ' (', version, ')', more);
                        events();
                    }
                });

                $('.nar-selected .nar-link').parent().html(form);
                input.focus();
            }

            function copyObjects(){
                var workspace = ws; // just getting current workspace

                var content = $('<form class="form-horizontal" role="form">\
                                    <div class="form-group">\
                                    </div>\
                                 </div>').loading()

                var copyObjectsModal = $('<div></div>').kbasePrompt({
                        title : 'Copy Objects',
                        body: content,
                        modalClass : '', 
                        controls : ['cancelButton',
                            {name : 'Copy',
                            type : 'primary',
                            callback : function(e, $prompt) {
                                var ws = $('.select-ws-input').val()
                                confirmCopy(ws, $prompt);
                            }
                        }]
                    }
                );
                copyObjectsModal.openPrompt();

                var p = kb.getWorkspaceSelector();
                $.when(p).done(function(selector) {
                    content.rmLoading();
                    content.find('.form-group').append(selector);
                })
            }


            function copyNarObjects(){
                var workspace = ws; // just getting current workspace
                var content = $('<form class="form-horizontal" role="form">\
                                        <div class="form-group">\
                                          <label class="col-sm-5 control-label">Destination Workspace</label>\
                                        </div>\
                                     </div>').loading()

                var copyObjectsModal = $('<div></div>').kbasePrompt({
                        title : 'Copy Objects',
                        body: content,
                        modalClass : '', 
                        controls : ['cancelButton',
                            {name : 'Copy',
                            type : 'primary',
                            callback : function(e, $prompt) {
                                var ws = $('.select-ws option:selected').val();
                                confirmCopy(ws, $prompt);
                            }
                        }]
                    }
                );
                copyObjectsModal.openPrompt();


                var prom = kb.getNarrativeDeps({ws: ws, name: name})
                $.when(prom).done(function(deps) {
                    content.append('<h5>Objects to be copied:</h5>');
                    var table = $('<table class="table table-striped table-nar-deps">');
                    table.append("<tr><th>Name</th><th>Type</th></tr>");
                    table.append("<tr><td>" + scope.checkedList[0].name + "</td><td>Narrative</td></tr>");
                    for (var i in deps) {
                        var d = deps[i];
                        table.append('<tr data-name="'+d.name+'" data-type="'+d.type+'"><td>'
                                          + d.name + '</td><td>'
                                          + d.type +
                                     '</td></tr>');
                    }
                    content.append(table);

                })


                var prom = kb.ws.list_workspace_info({});
                $.when(prom).done(function(workspaces) {
                    content.rmLoading();
                    var wsSelect = $('<form class="form-horizontal" role="form">\
                                        <div class="form-group">\
                                          <label class="col-sm-5 control-label">Destination Workspace</label>\
                                        </div>\
                                     </div>');

                    var select = $('<select class="form-control select-ws"></select>');
                    for (var i in workspaces) {
                        select.append('<option>'+workspaces[i][1]+'</option>');
                    }
                    select = $('<div class="col-sm-5">').append(select);
                    content.find('.form-group').append(select);
                })
            }


            function copyObjectsToNarrative() {
                confirmCopy(USER_ID+':home');
            }


            function confirmCopy(new_ws, $copyprompt) {
                var alert = '<div class="alert alert-danger"><strong>Warning</strong> Are you sure you want to copy these <b>'
                        +scope.checkedList.length+'</b> objects to <i>'+new_ws+'</i>?';

                var confirmCopy = $('<div></div>').kbasePrompt({
                        title : 'Confirm',
                        body: alert,
                        modalClass : '',
                        controls : [{
                            name: 'No',
                            type: 'default',
                            callback: function(e, $prompt) {
                                $prompt.closePrompt();
                                }
                            },
                            {name : 'Yes',
                            type : 'primary',
                            callback : function(e, $prompt) {
                                var proms = [];
                                for (var i in scope.checkedList) {
                                    var obj_name = scope.checkedList[i].name;
                                    var params = {from: {workspace: ws, name: obj_name},
                                                  to: {workspace: new_ws, name: obj_name}}

                                    var prom = kb.ws.copy_object(params);
                                    proms.push(prom);
                                }

                                $.when.apply($, proms).done(function() {
                                    scope.loadWSTable();
                                    kb.ui.notify('Copied objects to: <i>'+new_ws+'</i>');
                                    $copyprompt.closePrompt();
                                    $prompt.closePrompt();
                                    //var btn = $('<button type="button" class="btn btn-primary">Close</button>');
                                    //btn.click(function() { $prompt.closePrompt(); })
                                    //$prompt.data('dialogModal').find('.modal-footer').html(btn);
                                }).fail(function(e) {
                                    $prompt.addCover('Could not copy some or all of the objects. '
                                                        +e.error.message, 'danger');
                                })
                            }
                        }]
                    }
                );
                confirmCopy.openPrompt();
            } 

        }

    };
})

.directive('newnarrativebtn', function($state, modals) {
    return {
        template: '<a class="btn-new-narrative" ng-click="createNewNarrative()">'+
                    '<b><span class="glyphicon glyphicon-plus"></span> New Narrative</b>'+
                  '</a>',
        controller: 'WB',
        link: function(scope, ele, attrs) {

            scope.createNewNarrative = function() {
                var body = $('<form class="form-horizontal" role="form">');

                body.loading();
                var newNarrativeModal = $('<div>').kbasePrompt({
                        title : 'Create New Narrative',
                        body : body,
                        modalClass : '', 
                        controls : [{
                            name: 'Cancel',
                            type: 'default',
                            callback: function(e, $prompt) {
                                    $prompt.closePrompt();
                                }
                            },
                            {
                            name : 'Create',
                            type : 'primary',
                            callback : function(e, $prompt) {
                                var selected_ws = $('.select-ws-input').val();
                                var name = $('.new-nar-id').val();
                                var perm = $('.create-permission option:selected').val();
                                var descript = $('.nar-description option:selected').val();

                                var params = {narrative_id: name, 
                                              project_id: selected_ws, 
                                              description: descript}

                                if (name === '') {
                                    $prompt.addAlert('must enter a narrative name');
                                    $('.new-nar-id').focus();
                                    return;
                                }                   

                                var p = kb.nar.new_narrative(params)

                                $prompt.addCover();
                                $prompt.getCover().loading();
                                $.when(p).done(function(){
                                    if (scope.tab == 'my-narratives') {
                                        $state.go('narratives.mynarratives', null, {reload: true});
                                        scope.$apply();
                                    } else {
                                        $state.go('narratives.mynarratives');
                                        scope.$apply();
                                    }

                                    //ascope.loadNarTable();
                                    kb.ui.notify('Created new narrative: <i>'+name+'</i>');
                                    $prompt.closePrompt();
                                }).fail(function(e) {
                                    $prompt.addCover(e.error.message, 'danger');
                                })
                            }
                        }]
                    }
                )
                newNarrativeModal.openPrompt();

                var p = kb.getWorkspaceSelector()
                $.when(p).done(function(selector) {
                    body.rmLoading();

                    var new_ws_btn = $('<a class="btn btn-link">New WS</a>');
                    new_ws_btn.click(function() {
                        newNarrativeModal.closePrompt();
                        modals.createWS({cancel_cb: function(){
                            scope.createNewNarrative();
                        }, submit_cb: function() {
                            scope.createNewNarrative();
                        }});
                        return;
                    })

                    selector.find('.form-group').append(new_ws_btn);
                    body.append(selector);

                    body.append('<div class="form-group">'+
                                    '<label class="col-sm-5 control-label">Narrative Name</label>'+
                                    '<div class="col-sm-4">'+
                                        '<input type="text" class="form-control new-nar-id">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="form-group">'+
                                        '<label class="col-sm-5 control-label">Description</label>'+
                                        '<div class="col-sm-7">'+
                                            '<textarea class="form-control nar-descript" rows="3"></textarea>'+
                                        '</div>'+
                                '</div>');
                });
            }

        }
    }
})

.directive('showHideSidebar', function($location, $compile, $state, $stateParams) {
    return {
        template: '<button class="btn btn-default btn-xs btn-hide-sidebar">'+
                       '<span class="caret-left"></span> '+
                       '<span class="glyphicon glyphicon-th-list"></span>'+
                  '</button>',
        link: function(scope, ele, attrs) {
            //$(ele).tooltip({title: 'hide sidebar',
            //                placement: 'bottom',
            //                delay: {show: 800}})

            $(ele).click(function() {
                if ($('.sidebar').hasClass('col-sm-3') ) {
                    $(ele).parents('.sidebar').toggle('slide', {
                        direction: 'left',
                        duration: 'fast',
                        complete: function() {
                            // shide selector part
                            $('.ws-selector').hide();

                            // add fixed small sidebar
                            var sidebar = $('.sidebar');
                            sidebar.removeClass('col-sm-3 col-md-3');
                            sidebar.addClass('sidebar-minimized');
                            sidebar.show(); 

                            // adjust main layout
                            var main = $('.main').addClass('main-fullsize');
                            main.removeClass('col-sm-9 col-sm-offset-3 col-md-9 col-md-offset-3 main');
                            main.addClass('col-sm-12 col-md-12 main-fullsize');

                            // change icon
                            var caret = $(ele).find('.caret-left');
                            caret.remove();
                            $(ele).find('.btn-hide-sidebar').append(' <span class="caret-right"></span>');

                            // remove tooltip.  need to style
                            //$(ele).tooltip('destroy')                          
                        }
                    })
                } else {
                    $(ele).parents('.sidebar').toggle('slide', {
                        direction: 'right',
                        duration: 'fast',
                        complete: function() {
                            $('.ws-selector').show();

                            var sidebar = $('.sidebar');
                            sidebar.removeClass('sidebar-minimized');
                            sidebar.addClass('col-sm-3 col-md-3');
                            sidebar.show(); 

                            var main = $('.main-fullsize');
                            main.removeClass('col-sm-12 col-md-12');
                            main.addClass('col-sm-9 col-sm-offset-3 col-md-9 col-md-offset-3 main');
                            $('.main').removeClass('main-fullsize');

                            var caret = $(ele).find('.caret-right');
                            caret.remove();
                            $(ele).find('.btn-hide-sidebar').prepend('<span class="caret-left"></span> ');

                            //$(ele).tooltip({title: 'hide sidebar',
                            //               placement: 'bottom',
                            //                delay: {show: 800}})
                        }
                    })
                }
            })
        }
    }
})

.directive('wsDescription', function($location, $compile, $state) {
    return {
        link: function(scope, ele, attrs) {
            var p = kb.ws.get_workspace_description({workspace: scope.ws})
            $.when(p).done(function(data){
                if (!data) {
                    return;
                }

                scope.$apply(function() {
                    scope.description = data;
                });

                var container = $(ele);
                var text = $('<div class="ellipsis" data-toggle="popover">'+scope.description+'</div>')
                container.append(text);
                $(ele).append(container);
                text.popover({content: data,
                              trigger: 'hover', 
                              placement: 'bottom',
                              delay: {show: 1500}})

                //var edit = $('<div class="glyphicon glyphicon-pencil">')
                //container.append(edit);
            }).fail(function(e){
                $(ele).append('<div class="alert alert-danger">'+e.error.message+'</div>');
            });

        }
    }
})

.directive('wsmanage', function($location, $compile, $state, $stateParams) {
    return {
        link: function(scope, ele, attrs) {
            $(ele).append('<div class="h3 pull-left" style="margin-right: 30px;">Workspace Inspector</div>')
            var tableSettings = {

                    //"sPaginationType": "full_numbers",
                    "aaData": [],
                    //"fnDrawCallback": events,
                    "aaSorting": [[ 2, "desc" ]],
                    "iDisplayLength": 1000,                    
                    "aoColumns": [
                      { "sTitle": "Workspace"},
                      { "sTitle": "ID"},                      
                      { "sTitle": "Owner"}, //"sWidth": "10%"
                      { "sTitle": "Last Modified", "iDataSort": 4},
                      { "sTitle": "Count"},
                      { "sTitle": "Time Stamp", "bVisible": false, "sType": 'numeric'}                   

                    ],     
                    "sDom": "R<'row'<'col-xs-12 table-options'i>r>t<'row'<'col-xs-12'>>",
                    "oLanguage": {
                        "sEmptyTable": "No workspaces found",
                        "sSearch": "Search: ",
                        "sInfo": '_TOTAL_ workspaces, excluding "kbasesearch"',
                        "sInfoFiltered": ""
                    }
                }

            $(ele).loading();
            var prom = kb.ws.list_workspace_info({});
            $.when(prom).done(function(data) {
                $(ele).rmLoading()

                var rows = [];
                var total_count = 0;
                for (var i in data) {
                    var row = data[i];
                    var owner = row[2];
                    
                    if (owner == 'kbasesearch') continue;

                    var timestamp = kb.ui.getTimestamp(data[i][3].split('+')[0]);
                    var date = kb.ui.formateDate(timestamp);

                    var wsid = row[0];
                    var ws = row[1];
                    var count = row[4];
                    total_count = total_count+count;

                    var url = "ws.id({ws:'"+ws +"'})";
                    var link = '<a ui-sref="'+url+'" >'+ws+'</a>';
                    rows.push([link, wsid, owner, date, count, timestamp]);
                }
                tableSettings.aaData = rows;

                var container = $('<table id="ws-manage" class="table table-bordered" style="width: 100%;"></table>');

                $(ele).append(container);
                var table = $(container).dataTable(tableSettings);
                $compile(table)(scope);            

                $('.table-options').append('<span class="badge badge-primary pull-right">'
                                                +total_count+' Objects'+
                                           '</span>')

                $('#ws-manage thead th').each( function () {
                    var title = $('#ws-manage thead th').eq( $(this).index() ).text();
                    $(this).append(' <div><input type="text" class="select-filter" placeholder="Search '+title+'" ></input></div>' );
                } );
                /*
                 * Support functions to provide a little bit of 'user friendlyness' to the textboxes
                 */
                $("thead input").click(function(e) {
                    e.stopPropagation()
                    e.preventDefault()
                    $(this).focus()
                })

                $("input").keyup( function () {
                    /* Filter on the column (the index) of this element */
                    table.fnFilter( this.value, table.oApi._fnVisibleToColumnIndex( 
                        table.fnSettings(), $("thead input").index(this) ), true );
                } );
                        
            })                
        }
    }
})


function getEditableDescription(d) {
    var d = $('<form role="form">\
                   <div class="form-group">\
                    <textarea rows="4" class="form-control" placeholder="Description">'+d+'</textarea>\
                  </div>\
              </form>');
    return d;
}

function parse_name(name) {
    if (name.indexOf(USER_ID+':') != -1) {
        return name.split(':')[1];
    } else {
        return name;
    }
}
function save_dt_view (oSettings, oData) {
  localStorage.setItem( 'DataTables_'+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings) {
  return JSON.parse( localStorage.getItem('DataTables_'+window.location.pathname) );
}
function reset_dt_view(table) {
    var id = 'DataTables_'+table[0].id+'_'+window.location.pathname 
    localStorage.removeItem(id);
}

function searchColumns() {
    /* Add the events etc before DataTables hides a column */
    $("thead input").keyup( function () {
        /* Filter on the column (the index) of this element */
        oTable.fnFilter( this.value, oTable.oApi._fnVisibleToColumnIndex( 
            oTable.fnSettings(), $("thead input").index(this) ) );
    } );
    
    /*
     * Support functions to provide a little bit of 'user friendlyness' to the textboxes
     */
    $("thead input").each( function (i) {
        this.initVal = this.value;
    } );
    
    $("thead input").focus( function () {
        if ( this.className == "search_init" )
        {
            this.className = "";
            this.value = "";
        }
    } );
    
    $("thead input").blur( function (i) {
        if ( this.value == "" )
        {
            this.className = "search_init";
            this.value = this.initVal;
        }
    } );
}

function getCols(table, title) {
    var cols = table.fnSettings().aoColumns;

    if (title) {
        var col_num;

        for (var i in cols) {
            if (cols[i].sTitle == title) {
                col_num = i;
                break;
            }
        }
        return col_num
    }

    return cols;
}






