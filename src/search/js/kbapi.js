

function KBCacheClient(token) {
    var self = this;
    var auth = {};
    auth.token = token;

    var urls = null;
    if (typeof configJSON != 'undefined' && configJSON.setup) {
    	urls = configJSON[configJSON.setup];
    	fba_url = urls.fba_url;
    	ws_url = urls.workspace_url;
    	//ujs_url = urls.user_job_state_url;
    	search_url = urls.search_url;
    } else {
        fba_url = "http://kbase.us/services/KBaseFBAModeling/"
        ws_url = "https://kbase.us/services/ws/"
        //ujs_url = "http://140.221.84.180:7083"
        search_url = "http://dev07.berkeley.kbase.us/search/"
    }
    self.urls = urls;
    
    //console.log('FBA URL is:', fba_url);
    //console.log('Workspace URL is:', ws_url);
    //console.log('User Job State URL is:', ujs_url);
    //console.log('Search Service URL is:', search_url);    

    var fba = new fbaModelServices(fba_url, auth);
    var kbws = new Workspace(ws_url, auth);
    //var ujs = new UserAndJobState(ujs_url, auth);

    var cache = new Cache();

    // some kbase apis
    self.fba = fba;
    self.ws = kbws;
    //self.ujs = ujs;
    self.nar = new ProjectAPI(ws_url, token);

    // some accessible variables
    self.ws_url = ws_url;
    self.search_url = search_url;    
    self.token = token;
    self.nar_type = 'KBaseNarrative.Narrative';
    self.metagenome_url = "./communities/metagenome.html?metagenome=";

    // some accessible helper methods
    self.ui = new UIUtils();

    // this is an experiment in caching promises 
    self.req = function(service, method, params) {
        // see if api call has already been made        
        var data = cache.get(service, method, params);

        // return the promise ojbect if it has
        if (data) return data.prom;

        // otherwise, make request
        var prom = undefined;
        if (service == 'fba') {
            console.log('Making request:', 'fba.'+method+'('+JSON.stringify(params)+')');
            var prom = fba[method](params);
        } else if (service == 'ws') {
            console.log('Making request:', 'kbws.'+method+'('+JSON.stringify(params)+')');
            var prom = kbws[method](params);
        }

        // save the request and it's promise objct
        cache.put(service, method, params, prom)
        return prom;
    }

    self.narrative_prom = undefined;
    self.my_narratives = false;
    self.shared_narratives = false;
    self.public_narratives = false;        

    this.getNarratives = function() {
        // if narratives have been cached, return;
        //if (self.narratives) {
        //    return self.narratives;
        //}

        // get all workspaces, filter by mine, shared, and public
        var prom = kb.ws.list_workspace_info({});    
        var p = $.when(prom).then(function(workspaces) {
            var my_list = [];
            var shared_list = [];
            var public_list = [];

            for (var i in workspaces) {
                var a = workspaces[i];
                var ws = a[1];
                var owner = a[2];
                var perm = a[5];
                var global_perm = a[6]

                if (owner == USER_ID) {
                    my_list.push(ws)
                }

                // shared lists need to be filtered again, as a shared narrative
                // is any narrative you have 'a' or 'w', but also not your own
                if ( (perm == 'a' || perm == 'w') && owner != USER_ID) {
                    shared_list.push(ws)
                }
                if (global_perm == 'r') {
                    public_list.push(ws)
                }
            }


            return [my_list, shared_list, public_list];
        })


        // next get all narratives from these "project" workspaces
        // fixme: backend!
        var last_prom = $.when(p).then(function(data) {
            var mine_ws = data[0];
            var shared_ws = data[1];
            var public_ws = data[2];

            var my_nar_prom = kb.ws.list_objects({workspaces: mine_ws, 
                                              type: self.nar_type,
                                              showHidden: 1});

            var shared_nar_prom = kb.ws.list_objects({workspaces: shared_ws, 
                                                  type: self.nar_type,
                                                  showHidden: 1});        

            var public_nar_prom = kb.ws.list_objects({workspaces: public_ws, 
                                                  type: self.nar_type,
                                                  showHidden: 1});

            // filter down to unique workspaces that have narrative objects, 
            // and also make get_permissions calls
            var ws_prom = $.when(my_nar_prom, shared_nar_prom, public_nar_prom)
                           .then(function(d1, d2, d3) {

                var ws1 = [];
                for (var i in d1) {
                    ws1.push(d1[i][7])
                }
                var my_ws_list = ws1.filter( unique )

                var ws2 = [];
                for (var i in d2) {
                    ws2.push(d2[i][7])
                }
                var shared_ws_list = ws2.filter( unique )

                return my_ws_list.concat(shared_ws_list);//[my_ws_list, shared_ws_list];
            })


            function unique(value, index, self) { 
                return self.indexOf(value) === index;
            }

            var ws_list;
            var all_proms = $.when(ws_prom).then(function(ws_list) {
                ws_list = ws_list;
                // get permissions on all workspaces if logged in
                var perm_proms = [];
                if (USER_ID) {
                    for (var i in ws_list) {
                        var prom =  kb.ws.get_permissions({workspace: ws_list[i]});
                        perm_proms.push(prom);
                    }
                } 

                var all_proms = [my_nar_prom, shared_nar_prom, public_nar_prom].concat(perm_proms)                

                var p = $.when.apply($, all_proms).then(function() { 
                    // fill counts now (since there's no api for this)

                    var mine = arguments[0];
                    var shared = arguments[1];
                    var pub = arguments[2];

                    var perms = {};


                    for (var i = 0; i<ws_list.length; i++) {
                        perms[ws_list[i]] = arguments[3+i]
                    }


                    $('.my-nar-count').addClass('badge').text(mine.length)
                    $('.shared-nar-count').addClass('badge').text(shared.length);  
                    $('.public-nar-count').addClass('badge').text(pub.length);            

                    var all_data = {my_narratives: mine, 
                                    shared_narratives: shared, 
                                    public_narratives: pub, 
                                    perms: perms};

                    return all_data;
                });

                return p
            }) 
            return all_proms
        })

        // cache prom
        //self.narratives = last_prom;

        // bam, return promise for [my_nars, shared_nars, public_nars]
        self.narrative_prom = last_prom
        return last_prom;
    }


    self.getNarrativeDeps = function(params) {
        var ws = params.ws;
        var name = params.name;

        var p = self.ws.get_object_info([{workspace: ws, name: name}], 1)
            .then(function(info) {
                var deps = JSON.parse(info[0][10].data_dependencies);

                var d = [];
                for (var i in deps) {
                    var obj = {};
                    var o = deps[i].split(' ');
                    obj.type = o[0];
                    obj.name = o[1];
                    d.push(obj)
                }

                return d;
            })
        return p;
    }


    // cached objects
    var c = new WSCache();
    self.get_fba = function(ws, name) {

        // if reference, get by ref
        if (ws.indexOf('/') != -1) {
            // if prom already exists, return it
            //var prom = c.get({ref: ws});
            //if (prom) return prom;

            var p = self.ws.get_objects([{ref: ws}]);
            //c.put({ref: ws, prom: p});            
        } else {
            //var prom = c.get({ws: ws, name: name, type: 'FBA'});
            //if (prom) return prom;            

            var p = self.ws.get_objects([{workspace: ws, name: name}]);
            //c.put({ws: ws, name:name, type: 'FBA', prom: prom});            
        }

        // get fba object
        var prom =  $.when(p).then(function(f_obj) {
            var model_ref = f_obj[0].data.fbamodel_ref;

            // get model object from ref in fba object
            var modelAJAX = self.get_model(model_ref).then(function(m) {
                var rxn_objs = m[0].data.modelreactions
                var cpd_objs = m[0].data.modelcompounds

                // for each reaction, get reagents and 
                // create equation by using the model compound objects
                var eqs = self.createEQs(cpd_objs, rxn_objs, 'modelReactionReagents')

                // add equations to fba object
                var rxn_vars = f_obj[0].data.FBAReactionVariables;
                for (var i in rxn_vars) {
                    var obj = rxn_vars[i];
                    var id = obj.modelreaction_ref.split('/')[5];
                    obj.eq = eqs[id]
                }

                // fixme: hack to get org name, should be on backend
                f_obj[0].org_name = m[0].data.name;

                return f_obj;
            })
            return modelAJAX;
        })

        return prom;
    }

    self.get_model = function(ws, name){

        if (ws && ws.indexOf('/') != -1) {
            //var prom = c.get({ref: ws});
            //if (prom) return prom; 

            var p = self.ws.get_objects([{ref: ws}]);
            //c.put({ref: ws, prom: p}); 
        } else {
            //var prom = c.get({ws: ws, name: name, type: 'Model'});
            //if (prom) return prom; 

            var p = self.ws.get_objects([{workspace: ws, name: name}]);
            //c.put({ws: ws, name:name, type:'Model', prom:p});              
        }

        var prom = $.when(p).then(function(m) {
            console.log('model', m)
            var m_obj = m[0].data
            var rxn_objs = m_obj.modelreactions;
            var cpd_objs = m_obj.modelcompounds

            // for each reaction, get reagents and 
            // create equation by using the model compound objects
            var eqs = self.createEQs(cpd_objs, rxn_objs, 'modelReactionReagents')

            // add equations to modelreactions object
            var rxn_vars = m_obj.modelreactions;
            for (var i in rxn_vars) {
                var obj = rxn_vars[i];
                obj.eq = eqs[obj.id];
            }

            // add equations to biomasses object

            var biomass_objs = m_obj.biomasses;
            var eqs = self.createEQs(cpd_objs, biomass_objs, 'biomasscompounds')
            for (var i in biomass_objs) {
                var obj = biomass_objs[i];
                obj.eq = eqs[obj.id];
            }

            return m;
        })

        return prom;
    }


    self.createEQs = function(cpd_objs, rxn_objs, key) {
        // create a mapping of cpd ids to names
        var mapping = {};
        for (var i in cpd_objs) {
            mapping[cpd_objs[i].id.split('_')[0]] = cpd_objs[i].name.split('_')[0];
        }

        var eqs = {}
        for (var i in rxn_objs) {
            var rxn_obj = rxn_objs[i];
            var rxn_id = rxn_obj.id;

            var rxnreagents = rxn_obj[key];
            var direction = rxn_obj.direction;

            var lhs = []
            var rhs = []
            for (var j in rxnreagents) {
                var reagent = rxnreagents[j];
                var coef = reagent.coefficient;
                var ref = reagent.modelcompound_ref;
                var cpd = ref.split('/')[3].split('_')[0]
                var human_cpd = mapping[cpd];
                var compart = ref.split('_')[1]

                if (coef < 0) { 
                    lhs.push( (coef == -1 ? human_cpd+'['+compart+']' 
                                : '('+(-1*coef)+')'+human_cpd+'['+compart+']') );
                } else {
                    rhs.push( (coef == 1 ? human_cpd+'['+compart+']' 
                                : '('+coef+')'+human_cpd+'['+compart+']')  );
                }
            }

            var arrow;
            if (direction === '=' || direction === '<=>') arrow = ' <=> ';
            if (direction === '<' || direction === '<=') arrow = ' <= ';
            if (direction === '>' || direction === '=>') arrow = ' => ';

            var eq = lhs.join(' + ')+arrow+rhs.join(' + ');
            eqs[rxn_id] = eq
        }
        return eqs
    }


    self.getRoute = function(kind) {
        switch (kind) {
            case 'FBA': 
                return 'ws.fbas';
            case 'FBAModel': 
                return 'ws.models';
            case 'Media': 
                return 'ws.media';
            case 'MetabolicMap': 
                return 'ws.maps';
            case 'Media': 
                return 'ws.media';
            case 'PromConstraint':
                return 'ws.promconstraint';
            case 'Regulome':
                return 'ws.regulome';
            case 'ExpressionSeries':
                return 'ws.expression_series';
            case 'PhenotypeSet':
                return 'ws.phenotype';
            case 'PhenotypeSimulationSet': 
                return 'ws.simulation';
            case 'Pangenome':
                return 'ws.pangenome';
            case 'Genome': 
                return 'genomesbyid';
            case 'MAKResult':
                return 'mak';
            case 'FloatDataTable':
                return 'floatdatatable';
            case 'Metagenome':
                return 'ws.metagenome';
            case 'Collection':
                return 'ws.collection';
            case 'Profile':
                return 'ws.profile';
        }
        return undefined;
    }


    self.getWorkspaceSelector = function(all) {
        if (all) {
            var p = self.ws.list_workspace_info({});
        } else {
            var p = self.ws.list_workspace_info({perm: 'w'});            
        }
        
        var prom = $.when(p).then(function(workspaces){
            var workspaces = workspaces.sort(compare)

            function compare(a,b) {
                var t1 = kb.ui.getTimestamp(b[3]) 
                var t2 = kb.ui.getTimestamp(a[3]) 
                if (t1 < t2) return -1;
                if (t1 > t2) return 1;
                return 0;
            }

            var wsSelect = $('<form class="form-horizontal" role="form">'+
                                '<div class="form-group">'+
                                    '<label class="col-sm-5 control-label">Workspace</label>'+                                
                                    '<div class="input-group col-sm-5">'+
                                        '<input type="text" class="select-ws-input form-control focusedInput" placeholder="search">'+
                                        '<span class="input-group-btn">'+
                                            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">'+
                                                '<span class="caret"></span>'+
                                            '</button>'+
                                        '</span>'+
                                    //'<a class="btn-new-ws pull-right">New WS</a>'+
                                    '</div>'+
                            '</div>');

            var select = $('<ul class="dropdown-menu select-ws-dd" role="menu">');
            for (var i in workspaces) {
                select.append('<li><a>'+workspaces[i][1]+'</a></li>');
            }

            wsSelect.find('.input-group-btn').append(select);

            var dd = wsSelect.find('.select-ws-dd');
            var input = wsSelect.find('input');

            var not_found = $('<li class="select-ws-dd-not-found"><a><b>Not Found</b></a></li>');
            dd.append(not_found);
            input.keyup(function() {
                dd.find('li').show();

                wsSelect.find('.input-group-btn').addClass('open');

                var input = $(this).val();
                dd.find('li').each(function(){
                    if ($(this).text().toLowerCase().indexOf(input.toLowerCase()) != -1) {
                        return true;
                    } else {
                        $(this).hide();
                    }
                });

                if (dd.find('li').is(':visible') == 1) {
                    not_found.hide();
                } else {
                    not_found.show();
                }
            }) 

            dd.find('li').click(function() {
                dd.find('li').removeClass('active');

                if (!$(this).hasClass('select-ws-dd-not-found')) {
                    $(this).addClass('active');                    

                    var val = $(this).text();
                    input.val(val);
                }
            })

            return wsSelect;
        })

        return prom;
    }

}


// Collection of simple (Bootstrap/jQuery based) UI helper methods
function UIUtils() {

    // this method will display an absolutely position notification
    // in the app on the 'body' tag.  This is useful for api success/failure 
    // notifications
    this.notify = function(text, type, keep) {
        var ele = $('<div id="notification-container">'+
                        '<div id="notification" class="'+type+'">'+
                            (keep ? ' <small><div class="close">'+
                                        '<span class="glyphicon glyphicon-remove pull-right">'+
                                        '</span>'+
                                    '</div></small>' : '')+
                            text+
                        '</div>'+
                    '</div>');

        $(ele).find('.close').click(function() {
             $('#notification').animate({top: 0}, 200, 'linear');
        })

        $('body').append(ele)
        $('#notification')
              .delay(200)
              .animate({top: 50}, 400, 'linear',
                        function() {
                            if (!keep) {
                                $('#notification').delay(2000)
                                                  .animate({top: 0}, 200, 'linear', function() {
                                                    $(this).remove();
                                                  })

                            }
                        })
    }

    var msecPerMinute = 1000 * 60;
    var msecPerHour = msecPerMinute * 60;
    var msecPerDay = msecPerHour * 24;
    var dayOfWeek = {0: 'Sun', 1: 'Mon', 2:'Tues',3:'Wed',
                     4:'Thurs', 5:'Fri', 6: 'Sat'};
    var months = {0: 'Jan', 1: 'Feb', 2: 'March', 3: 'April', 4: 'May',
                  5:'June', 6: 'July', 7: 'Aug', 8: 'Sept', 9: 'Oct', 
                  10: 'Nov', 11: 'Dec'};
    this.formateDate = function(timestamp) {
        var date = new Date()

        var interval =  date.getTime() - timestamp;

        var days = Math.floor(interval / msecPerDay );
        interval = interval - (days * msecPerDay);

        var hours = Math.floor(interval / msecPerHour);
        interval = interval - (hours * msecPerHour);

        var minutes = Math.floor(interval / msecPerMinute);
        interval = interval - (minutes * msecPerMinute);

        var seconds = Math.floor(interval / 1000);

        if (days == 0 && hours == 0 && minutes == 0) {
            return seconds + " secs ago";
        } else if (days == 0 && hours == 0) {
            if (minutes == 1) return "1 min ago";
            return  minutes + " mins ago";
        } else if (days == 0) {
            if (hours == 1) return "1 hour ago";
            return hours + " hours ago"
        } else if (days == 1) {
            var d = new Date(timestamp);
            var t = d.toLocaleTimeString().split(':');        
            return 'yesterday at ' + t[0]+':'+t[1]+' '+t[2].split(' ')[1]; //check
        } else if (days < 7) {
            var d = new Date(timestamp);        
            var day = dayOfWeek[d.getDay()]
            var t = d.toLocaleTimeString().split(':');
            return day + " at " + t[0]+':'+t[1]+' '+t[2].split(' ')[1]; //check
        } else  {
            var d = new Date(timestamp);
            return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); //check
        }
    }

    // takes mod date time (2014-03-24T22:20:23)
    // and returns unix (epoch) time
    this.getTimestamp = function(datetime){
        if (!datetime) return; 
        var ymd = datetime.split('T')[0].split('-');
        var hms = datetime.split('T')[1].split(':');
        hms[2] = hms[2].split('+')[0];  
        return Date.UTC(ymd[0],ymd[1]-1,ymd[2],hms[0],hms[1],hms[2]);  
    }

    // interesting solution from http://stackoverflow.com/questions
    // /15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript 
    this.readableSize = function(bytes) {
       var units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
       if (bytes == 0) return '0 Bytes';
       var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
       return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + units[i];
    };    

    this.objTable = function(p) {
        var obj = p.obj;
        var keys = p.keys;

        // option to use nicely formated keys as labels
        if (p.keysAsLabels ) {
            var labels = []            
            for (var i in keys) {
                var str = keys[i].key.replace(/(id|Id)/g, 'ID')
                var words = str.split(/_/g);
                for (var j in words) {
                    words[j] = words[j].charAt(0).toUpperCase() + words[j].slice(1)
                }
                var name = words.join(' ')
                labels.push(name);
            }
        } else if ('labels' in p) {
            var labels = p.labels;
        } else {
            // if labels are specified in key objects, use them
            for (var i in keys) {
                var key_obj = keys[i];
                if ('label' in key_obj) {
                    labels.push(key_obj.label);                    
                } else {
                    labels.push(key_obj.key)
                }   

            }
        }


        var table = $('<table class="table table-striped table-bordered">');
//        style="margin-left: auto; margin-right: auto;"

        for (var i in keys) {
            var key = keys[i];
            var row = $('<tr>');

            if (p.bold) {
                var label = $('<td><b>'+labels[i]+'</b></td>')
            } else {
                var label = $('<td>'+labels[i]+'</td>');
            }

            var value = $('<td>');

            if ('format' in key) {
                var val = key.format(obj)
                value.append(val)
            } else if (key.type == 'bool') {
                value.append((obj[key.key] == 1 ? 'True' : 'False'))
            } else {
                value.append(obj[key.key])
            }
            row.append(label, value);

            table.append(row);
        }

        return table;
    }

    this.listTable = function(p) {
        var array = p.array;
        var labels = p.labels;
        var bold = (p.bold ? true : false);

        var table = $('<table class="table table-striped table-bordered" \
                              style="margin-left: auto; margin-right: auto;"></table>');
        for (var i in labels) {
            table.append('<tr><td>'+(bold ? '<b>'+labels[i]+'</b>' : labels[i])+'</td> \
                          <td>'+array[i]+'</td></tr>');
        }

        return table;
    }

    // this takes a list of refs and creates <workspace_name>/<object_name>
    // if links is true, hrefs are returned as well
    this.translateRefs = function(reflist, links) {
        var obj_refs = []
        for (var i in reflist) {
            obj_refs.push({ref: reflist[i]})
        }

        var prom = kb.ws.get_object_info(obj_refs)
        var p = $.when(prom).then(function(refinfo) {
            var refhash = {};
            for (var i=0; i<refinfo.length; i++) {
                var item = refinfo[i];
                var full_type = item[2];
                var module = full_type.split('.')[0];
                var type = full_type.slice(full_type.indexOf('.')+1);
                var kind = type.split('-')[0];
                var label = item[7]+"/"+item[1];
                var route;
                switch (kind) {
                    case 'FBA': 
                        sub = 'fbas/';
                        break;
                    case 'FBAModel': 
                        sub = 'models/';
                        break;
                    case 'Media': 
                        route = 'media/';
                        break;
                    case 'Genome': 
                        route = 'genomes/';
                        break;
                    case 'MetabolicMap': 
                        route = 'maps/';
                        break;
                    case 'PhenotypeSet': 
                        route = 'phenotype/';
                        break; 
                }

                var link = '<a href="#/'+route+label+'">'+label+'</a>';
                refhash[reflist[i]] = {link: link, label: label};
            }
            return refhash
        })
        return p;
    }

    this.refsToJson = function(ref_list) {
        var obj_refs = []
        for (var i in ref_list) {
            obj_refs.push({ref: ref_list[i]})
        }

        var obj = {}
        var prom = kb.ws.get_object_info(obj_refs)
        var p = $.when(prom).then(function(refinfo) {
            for (var i=0; i<refinfo.length; i++) {
                var item = refinfo[i];
                var full_type = item[2];
                var module = full_type.split('.')[0];
                var type = full_type.slice(full_type.indexOf('.')+1);
                var kind = type.split('-')[0];
                var label = item[7]+"/"+item[1];

                if ( !(kind in obj) )  obj[kind] = [];

                obj[kind].push(label);
            }
            return obj;
        })
        return p;
    }

           
    this.formatUsers = function(perms, mine) {
        var users = []
        for (var user in perms) {
            if (user == USER_ID && !mine && !('*' in perms)) {
                users.push('You');
                continue;
            } else if (user == USER_ID) {
                continue;
            } 
            users.push(user);
        }

        // if not shared, return 'nobody'
        if (users.length == 0) {
            return 'Nobody';
        };

        // number of users to show before +x users link
        var n = 3;
        var share_str = ''
        if (users.length > n) {
            /*if (users.slice(n).length == 1) {*/
                share_str = users.slice(0, n).join(', ')+', '+
                        ' <a class="btn-share-with" data-users="'+users+'">+'
                        +users.slice(n).length+' user</a>';  
            /*} else if (users.slice(2).length > 1) {
                share_str = users.slice(0, n).join(', ')+ ', '+
                        ' <a class="btn-share-with" data-users="'+users+'"> +'
                        +users.slice(n).length+' users</a>';
            }*/

        } else if (users.length > 0 && users.length <= n) {
            share_str = users.slice(0, n).join(', ');
        }
        return share_str;
    }

    this.globalPermDropDown = function(perm) {
        var dd = $('<select class="form-control create-permission" data-value="n">\
                        <option value="n">None</option>\
                        <option value="r">Read</option>\
                    </select>')
        if (perm == 'n') {
            dd.find("option[value='n']").attr('selected', 'selected');
        } else if (perm == 'r') {
            dd.find("option[value='r']").attr('selected', 'selected');                        
        } else {
            dd.find("option[value='n']").attr('selected', 'selected');
        }

        return $('<div>').append(dd).html();
    }

    // jQuery plugins that you can use to add and remove a 
    // loading giff to a dom element.
    $.fn.loading = function(text, big) {
        $(this).rmLoading()

        if (big) {
            if (typeof text != 'undefined') {
                $(this).append('<p class="text-center text-muted loader"><br>'+
                     '<img src="assets/img/ajax-loader-big.gif"> '+text+'</p>');
            } else {
                $(this).append('<p class="text-center text-muted loader"><br>'+
                     '<img src="assets/img/ajax-loader-big.gif"> loading...</p>')        
            }
        } else {
            if (typeof text != 'undefined') {
                $(this).append('<p class="text-muted loader">'+
                     '<img src="assets/img/ajax-loader.gif"> '+text+'</p>');
            } else {
                $(this).append('<p class="text-muted loader">'+
                     '<img src="assets/img/ajax-loader.gif"> loading...</p>')        
            }

        }
        return this;
    }
    $.fn.rmLoading = function() {
        $(this).find('.loader').remove();
    }




}

// This saves a request by service name, method, params, and promise
// Todo: Make as module
function Cache() {
    var cache = [];

    this.get = function(service, method, params) {
        for (var i in cache) {
            var obj = cache[i];
            if (service != obj['service']) continue;
            if (method != obj['method']) continue;
            if ( angular.equals(obj['params'], params) ) { return obj; }
        }
        return undefined;
    }

    this.put = function(service, method, params, prom) {
        var obj = {};
        obj['service'] = service;    
        obj['method'] = method;
        obj['prom'] = prom;
        obj['params'] = params;
        cache.push(obj);
        //console.log('Cache after the last "put"', cache)
    }
}


// this is another experiment in caching but for particular objects.
function WSCache() {
    // Todo: only retrieve and store by object ids.

    // cache object
    var c = {};

    this.get = function(params) {

        if (params.ref) {
            return c[params.ref];
        } else {
            var ws = params.ws,
                type = params.type,
                name = params.name;

            if (ws in c && type in c[ws] && name in c[ws][type]) {
                return c[ws][type][name];
            }
        }
    }

    this.put = function(params) {
        // if reference is provided
        if (params.ref) {
            if (params.ref in c) {
                return false;
            } else {
                c[params.ref] = params.prom;
                return true;
            }

        // else, use strings
        } else { 
            var ws = params.ws,
                name = params.name,
                type = params.type;

            if (ws in c && type in c[ws] && name in c[ws][type]) {
                return false;
            } else {
                if ( !(ws in c) ) c[ws] = {};                    
                if ( !(type in c[ws]) ) c[ws][type] = {};
                c[ws][type][name] = params.prom;
                return true;
            }
        }
    }
}

function getBio(type, loaderDiv, callback) {
    var fba = new fbaModelServices('https://kbase.us/services/fba_model_services/');
//    var kbws = new workspaceService('http://kbase.us/services/workspace_service/');
//    var kbws = new workspaceService('http://140.221.84.209:7058');    

    var kbws = new Workspace('http://kbase.us/services/ws');
    
    // This is not cached yet; waiting to compare performanced.
    loaderDiv.append('<div class="progress">\
          <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 3%;">\
          </div>\
        </div>')

    var bioAJAX = fba.get_biochemistry({});

    var chunk = 250;
    k = 1;
    $.when(bioAJAX).done(function(d){
        if (type == 'cpds') {
            var objs = d.compounds; 
        } else if (type == 'rxns') {
            var objs = d.reactions;
        }
        var total = objs.length;
        var iterations = parseInt(total / chunk);
        var data = [];
        for (var i=0; i<iterations; i++) {
            var cpd_subset = objs.slice( i*chunk, (i+1)*chunk -1);
            if (type == 'cpds') {
                var prom = fba.get_compounds({compounds: cpd_subset });
            } else if (type == 'rxns') {
                var prom = fba.get_reactions({reactions: cpd_subset });
            }

            $.when(prom).done(function(obj_data){
                k = k + 1;
                data = data.concat(obj_data);
                var percent = (data.length / total) * 100+'%';
                $('.progress-bar').css('width', percent);

                if (k == iterations) {
                    $('.progress').remove();                        
                    callback(data)
                }
            });
        }
    })
}




function ProjectAPI(ws_url, token) {
    var self = this;

    var auth = {}
    auth.token = token;
    var ws_client = new Workspace(ws_url, auth);


    // We probably don't want to do error handeling in api functions, 
    // so we should deprecate these as well. 
    var legit_ws_id = /^\w+$/;
    // regex for a numeric workspace id of the form "ws.####.obj.###"
    var legit_narr_ws_id = /^ws\.(\d+)\.obj\.(\d+)$/;

    // Fields in a workspace metadata object
    var ws_meta_fields = ['id','owner','moddate','objects',
              'user_permission','global_permission'];

    // function used in reduce() to map ws_meta array into a dict
    var ws_meta_dict = function (ws_meta){
        return ws_meta.reduce ( function( prev, curr, index){
                        prev[ws_meta_fields[index]] = curr;
                        return(prev);
                },{});
    };

    // Fields in an workspace object metadata object
    obj_meta_fields = ['id','type','moddate','instance','command',
               'lastmodifier','owner','workspace','ref','chsum',
               'metadata', 'objid'];

    // function to map obj_meta array into a dict
    var obj_meta_dict = function (obj_meta) {
        return obj_meta.reduce( function( prev, curr, index){
                        prev[obj_meta_fields[index]] = curr;
                        return(prev);
                    },{});
    };
    // Fields in an workspace object metadata object
    obj_meta_fields2 = ['id','type','moddate','instance','command',
               'lastmodifier','owner','workspace','ref','chsum',
               'metadata'];

    // function to map obj_meta array into a dict
    var obj_meta_dict2 = function (obj_meta) {
        return obj_meta.reduce( function( prev, curr, index){
                        prev[obj_meta_fields[index]] = curr;
                        return(prev);
                    },{});
    };

    // We are tagging workspaces with _SOMETHING objects to distinguish
    // project workspaces from other containers. Using this in case we
    // decide to include other types of workspaces
    var ws_tag = {
        project : '_project'
    };

    var ws_tag_type = 'KBaseNarrative.Metadata';
    var narrative_type = 'KBaseNarrative.Narrative';


    // Fields in an empty narrative
    var empty_narrative = {type: narrative_type,
                           data: {nbformat: 3,
                                  nbformat_minor: 0,
                                  metadata: { format: "ipynb", 
                                           creator: "",
                                           ws_name: "",
                                           name: "", 
                                           type: "Narrative",
                                           description: "",
                                           data_dependencies: [ ]
                                        },
                                  worksheets: [
                                               {
                                                   cells: [
                                                       {
                                                           collapsed: false,
                                                           input: "",
                                                           outputs: [ ],
                                                           language: "python",
                                                           metadata: { },
                                                           cell_type: "code"
                                                       }
                                                   ],
                                                   metadata: { }
                                               }
                                           ]
                                 },
                        }




    // Empty project tag template
    var empty_proj_tag = {
        id : ws_tag.project,
        type : ws_tag_type,
        data : { description : 'Tag! You\'re a project!' },
        workspace : undefined,
        metadata : {},
        auth : undefined
    };

    // Empty ws2 project tag template
    var empty_ws2_proj_tag = {
        name : ws_tag.project,
        type : ws_tag_type,
        data : { description : '' },
        workspace : undefined,
        meta : {},
    provenance : [],
    hidden : 1
    };


    /**
     * Ensures that a USER_ID:home workspace exists and is tagged as a project.
     * If one does not exist, it calls 'new_project' and makes one.
     */
    this.ensure_home_project = function(userId) {
        alert('ensure_home_project has been removed!')
    };

    // Get all the workspaces that match the values of the
    // permission array. Defaults to only workspaces that the
    // currently logged in user owns/administers
    // The callback will recieve a hash keyed on workspace
    // name, where the values are dictionaries keyed on ws_meta_fields
    // if a specific workspace name is given its metadata will be
    // returned
    this.get_projects = function( p_in ) {
        var prom = ws_client.list_objects({type: 'KBaseNarrative.Metadata', 
                                           showHidden: 1});
        return prom;
    };


    // Get the object metadata for the specified workspace id and return a
    // dictionary keyed on "objectId" where the
    // value is a dictionary keyed on obj_meta_fields
    this.get_project = function( p_in ) {
        var def_params = { callback : undefined,
                   workspace_id : undefined };

        var p = $.extend( def_params, p_in);

        var ws_meta = ws_client.list_workspace_objects( {workspace: p.workspace_id});
        $.when( ws_meta).then( function (results) {
                       var res = {};
                       $.each( results, function (index, val) {
                               var obj_meta = obj_meta_dict( val);
                               res[val[0]] = obj_meta;
                           });
                       p.callback( res);
                       });
    };



    // Get the individual workspace object named. Takes names
    // in 2 parts, in the workspace_id and object_id
    // fields, and the type in the type field. Returns the
    // object as the workspace service would return it,
    // as a dict with 'data' and 'metadata' fields
    // if the type is given, it will save one RPC call,
    // otherwise we fetch the metadata for it and then
    // grab the type
    this.get_object = function( p_in ) {
        var def_params = { callback : undefined,
                   workspace_id : undefined,
                   object_id : undefined,
                   //type : undefined,
                   error_callback: error_handler
                 };
        var p = $.extend( def_params, p_in);

        var del_fn = ws_client.get_object( { type: p.type,
                                             workspace: p.workspace,
                                             id: p.object_id });

        $.when( del_fn).then( p.callback, p.error_callback);
    
    };

    // Delete the object in the specified workspace/object id and return a
    // dictionary keyed on the obj_meta_fields for the result
    this.delete_object = function( p_in ) {
        console.error('project.delete_object was removed since due to redundancy . use set_workspace_permissions in workspace api');
    };

    // Create an new workspace and tag it with a project tag. The name
    // *must" conform to the future workspace rules about object naming,
    // the it can only contain [a-zA-Z0-9_]. We show the error prompt
    // if it fails to conform
    // If it is passed the id of an existing workspace, add the _project
    // tag object to it
    this.new_project = function( p_in ) {
        var def_params = { project_id : undefined,
                           def_perm : 'n',
                           description: ''};

        var p = $.extend( def_params, p_in);

        function tag_ws() {
            var proj = $.extend(true,{},empty_ws2_proj_tag);
            proj.data.description = p_in.description;

            var params = { objects : [proj] };
            params.workspace = p.project_id;
            var ws_fn2 = ws_client.save_objects( params);

            return ws_fn2;
        };

        var ws_exists = ws_client.get_workspacemeta( {workspace : p.project_id });
        var prom =  $.when(ws_exists).then(tag_ws, function() {
            var ws_fn = ws_client.create_workspace( { workspace : p.project_id,
                                                      globalread : p.def_perm })
            var prom = $.when(ws_fn).done(function() {
                return tag_ws();
            })
            return prom;
        });

        return prom;
    };


    // returns a project description (out of the project object)
    this.get_project_description = function(proj_name) {
        var prom = ws_client.get_object({ type: ws_tag_type,
                                          workspace: proj_name,
                                          id: ws_tag.project });
        var p = $.when(prom).then(function(r) {
            return r.data.description;
        })
        return p;
    }

    // returns a project description (out of the project object)
    this.set_project_description = function(proj_name, descript) {
        var proj = $.extend({}, empty_ws2_proj_tag);
        proj.data.description = descript;
        var p = ws_client.save_objects( {workspace: proj_name, objects: [proj]}); 

        return p;
    }


    // Delete a workspace(project)
    // will wipe out everything there, so make sure you prompt "Are you REALLY SURE?"
    // before calling this.
    // the callback gets the workspace metadata object of the deleted workspace
    this.delete_project = function( p_in ) {
        var def_params = { callback : undefined,
                           project_id : undefined,
                           error_callback: error_handler };

        var p = $.extend( def_params, p_in);


        //if ( legit_ws_id.test(p.project_id)) {
            var ws_def_fun = ws_client.delete_workspace({
                                      workspace: p.project_id});
            $.when( ws_def_fun).then( p.callback,
                          p.error_callback
                        );
        //} else {
        //    console.error( "Bad project id: ",p.project_id);
        //}
    };

    // Get the permissions for a project, returns a 2 element
    // hash identical to get_workspacepermissions
    // 'default' : perm // default global perms
    // 'user_id1' : perm1 // special permission for user_id1
    // ...
    // 'user_idN' : permN // special permission for user_idN
    this.get_project_perms = function( p_in ) {
        var def_params = { callback : undefined,
                   project_id : undefined,
                   error_callback : error_handler
                 };
        var p = $.extend( def_params, p_in);

        var perm_fn =  ws_client.get_permissions( {
                                          workspace : p.project_id });
        return $.when( perm_fn).fail(function(){p.error_callback});

    };


    // Set the permissions for a project, takes a project_id
    // and a perms hash that is the same as the return format
    // from get_project_perms
    // 'default' : perm // default global perms
    // 'user_id1' : perm1 // special permission for user_id1
    // ...
    // 'user_idN' : permN // special permission for user_idN
    // The return results seem to be broken
    this.set_project_perms = function( p_in ) {
        console.error('set_project_perms was removed since due to redundancy . use set_workspace_permissions in workspace api')

    };



    // Will search the given list of project_ids for objects of type narrative
    // if no project_ids are given, then all a call will be made to get_projects
    // first - avoid doing this if possible as it will be miserably slow.
    // an array of obj_meta dictionaries will be handed to the callback
    this.get_narratives = function(p) {
        var p = $.extend(p, {project_ids: undefined})

        if (p.project_ids) {
            return all_my_narratives( p.project_ids);
        } else {
            var proj_prom = self.get_projects().then( function(pdict) {
                var project_names = []
                for (var i=0; i <pdict.length;i++) {
                    project_names.push(pdict[i][7]);
                }
                return all_my_narratives(project_names);
            });
            return proj_prom
        }

        function all_my_narratives(project_ids) {

            if (p.showOnlyDeleted) {
                var prom = ws_client.list_objects({
                     workspaces: project_ids, type: p.type, showHidden: 1});
            } else {
                var prom = ws_client.list_objects({
                     workspaces: project_ids, type: p.type, showHidden: 1});                
            }

            return prom
        };

    };
    
    this._parse_object_id_string = function(p) {
        if (p.fq_id != undefined) {
            var re = p.fq_id.match( legit_narr_ws_id);
            if (re) {
                p.project_id = re[1];
                p.narrative_id = re[2];
            } else {
                p.error_callback("Cannot parse fq_id: " + p.fq_id);
            }
        }
    }

    //copy a narrative and dependencies to the home workspace
    //
    // The inputs are based on the numeric workspace id and numeric objid, which
    // are using the narrative URLs. Alternative you can just pass in a string
    // like "ws.637.obj.1" in the fq_id (fully qualified id) and this will parse
    // it out into the necessary components.
    // returns a dicts with the following keys:
    // fq_id - the fully qualified id the new narrative of the form "ws.####.obj.###"
    // 
    // known issues: in the case of a name collision in a narrative dependency,
    // the dependency is renamed by appending a timestamp. This is not currently
    // altered in the narrative or in the narrative object metadata.
    this.copy_narrative = function (p_in) {
        //TODO all these functions need some cleanup, they're nasty
        var def_params = {
                project_id : undefined, // numeric workspace id
                narrative_id : undefined, //numeric object id
                fq_id : undefined, // string of the form "ws.{numeric ws id}.obj.{numeric obj id}"
                callback: undefined,
                error_callback: error_handler
                };
        var p = $.extend( def_params, p_in);
        this._parse_object_id_string(p);
        var self = this;
        var metadata_fn = ws_client.get_object_info([{wsid: p.project_id, objid : p.narrative_id}], 1);
        $.when(metadata_fn).then(function(list_obj_info) {
            if (list_obj_info.length != 1) {
                p.error_callback( "Error: narrative ws." + p.project_id +
                        ".obj." + p.narrative_id + " not found");
            } else {
                var obj_info = list_obj_info[0];
                var narname = obj_info[1];
                var home = USER_ID + ":home";
                self._get_narrative_deps_from_obj_info({
                    obj_info: obj_info,
                    callback: function(deps) {
                        var copynar = function(newname) {
                            self._copy_one_object(obj_info[6], obj_info[1],
                                    obj_info[4], home, newname,
                                    function(res) {
                                        var fq = "ws." + res[6] + ".obj." + res[0];
                                        p.callback({fq_id: fq})
                                    }, p.error_callback
                                );
                        };
                        var ts = self._get_time_stamp();
                        $.when(ws_client.get_object_info(
                            [{workspace: home, name: narname}], 0,
                            function(result) { //success, the object exists
                                copynar(narname + "-" + ts);
                            },
                            function(result) { //fail
                                if (!/^No object with .+ exists in workspace [:\w]+$/
                                        .test(result.error.message)) {
                                    p.error_callback(result.error.message);
                                }
                                //everything's cool, the object doesn't exist in home
                                copynar(narname)
                            })
                        );
                        
                        $.each(deps.deps, function(key, val) {
                            var newdep = deps.deps[key].overwrite ? deps.deps[key].name
                                    + "-" + ts : deps.deps[key].name;
                            self._copy_one_object(obj_info[6], key, null,
                                    home, newdep, function() {}, p.error_callback);
                        });
                    }
                });
            }
        });
    };
    
    this._copy_one_object = function(ws, obj, ver, wstar, objtar, callback,
            error_callback) {
        if (ver == null) {
            var prom = ws_client.get_object_info([{ref: ws + "/" + obj}], 0);
            $.when(prom).done(
                function(list_obj_info) {
                    if (list_obj_info.length != 1) {
                        error_callback( "Error: narrative ws." + p.project_id +
                                ".obj." + p.narrative_id + " not found");
                    } else {
                        ver = list_obj_info[0][4];
                        ws = list_obj_info[0][6];
                        obj = list_obj_info[0][0];
                        ws_client.copy_object({from: {ref: ws + "/" + obj + "/" + ver},
                            to: {ref: wstar + "/" + objtar}},
                            callback,
                            function(result) {//failed
//                                console.log("error copying object");
                                error_callback(result.error.message);
                            }
                       );
                    }
                });
            $.when(prom).fail(
                function(res) {
//                    console.log("error copying object: " + res.error.message);
                    error_callback(res.error.message);
                }
            );
        } else {
            ws_client.copy_object(
                {from: {ref: ws + "/" + obj + "/" + ver},
                 to: {ref: wstar + "/" + objtar}},
                callback,
                function(result) {//failed
                    error_callback(result.error.message);
                }
           );
        }
    };
    
    this._get_time_stamp = function() {
        var d = new Date();
        var width2 = function(s) {
            if (s.length == 1) {
                return "0" + s;
            }
            return s;
        }
        return  d.getUTCFullYear().toString() +
                width2((d.getUTCMonth() + 1).toString()) +
                width2(d.getUTCDate().toString()) +
                width2(d.getUTCHours().toString()) +
                width2(d.getUTCMinutes().toString()) +
                width2(d.getUTCSeconds().toString())
                
    };

    // Examine a narrative object's metadata and return all its dependencies
    // The inputs are based on the numeric workspace id and numeric objid, which
    // are using the narrative URLs. Alternative you can just pass in a string
    // like "ws.637.obj.1" in the fq_id (fully qualified id) and this will parse
    // it out into the necessary components.
    // what is returns is a dictionary with the following keys
    // fq_id - the fully qualified id of the form "ws.####.obj.###"
    // description - the description of the narrative
    // name - the name of the narrative
    // deps - a dictionary keyed on the dependencies names (based on ws.####.obj.### format)
    //        where the subkeys are:
    //        name - textual name
    //        type - textual type of the object
    //        overwrite - a boolean that indicates if there is already
    this.get_narrative_deps = function (p_in) {
        var def_params = { callback : undefined,
                project_id : undefined, // numeric workspace id
                narrative_id : undefined, //numeric object id
                fq_id : undefined, // string of the form "ws.{numeric ws id}.obj.{numeric obj id}",
                callback: undefined,
                error_callback: error_handler };
        var p = $.extend( def_params, p_in);
        this._parse_object_id_string(p);
        var self = this;
        var metadata_fn = ws_client.get_object_info([{wsid: p.project_id, objid : p.narrative_id}], 1);
        $.when( metadata_fn).then( function( obj_info) {
            if (obj_info.length != 1) {
                p.error_callback( "Error: narrative ws." + p.project_id +
                        ".obj." + p.narrative_id + " not found");
            } else {
                var oi = {obj_info: obj_info[0],
                          callback: p.callback
                          };
                self._get_narrative_deps_from_obj_info(oi)
            }
        });
    };
    
    this._get_narrative_deps_from_obj_info = function(p) {
        var res = {};
        var obj_info = p.obj_info;
        var meta = obj_info[10]
        res.fq_id = "ws." + obj_info[6] + ".obj." + obj_info[0];
        res.description = meta.description;
        res.name = meta.name;
        var temp = $.parseJSON(meta.data_dependencies);

        //deps should really be stored as an id, not a name, since names can change
        var deps = temp.reduce( function(prev,curr,index) {
            var dep = curr.split(" ");
            prev[dep[1]] = {};
            prev[dep[1]].type = dep[0];
            prev[dep[1]].name = dep[1];
            prev[dep[1]].overwrite = false;
            return(prev);
        },{});
        var home = USER_ID + ":home";
        var proms = []
        //TODO use has_objects when it exists rather than multiple get_objects calls
        $.each(deps, function(key, val) {
            proms.push(ws_client.get_object_info(
                    [{workspace: home, name: key}], 0,
                    function(result) { //success, the object exists
                        deps[key].overwrite = true;
                    },
                    function(result) { //fail
                        console.log(result.error.message);
                        if (!/^No object with .+ exists in workspace [:\w]+$/
                                .test(result.error.message)) {
                            //p.error_callback(result.error.message);
                        }
                        //everything's cool, the object doesn't exist in home
                    })
            );
            
        });
        //this wraps all the promise objects in another promise object
        //that forces all the original POs to resolve in a $.when()
        proms = $.map(proms, function(p) {
            var dfd = $.Deferred();
            p.always(function() { dfd.resolve(); });
            return dfd.promise();
        });
        res.deps = deps;
        $.when.apply($, proms).done(function() {
                p.callback(res);
        });
    };

    // Create an empty narrative object with the specified name. The name
    // *must" conform to the future workspace rules about object naming,
    // the it can only contain [a-zA-Z0-9_]. We show the error prompt
    // if it fails to conform
    this.new_narrative = function( p_in ) {
        var def_params = { project_id : USER_ID+":home",
                           narrative_id : undefined,
                           description : "A KBase narrative" };

        var p = $.extend( def_params, p_in);

        var nar = $.extend(true,{},empty_narrative);
        nar.data.metadata.ws_name = p.project_id;
        nar.name = p.narrative_id; 
        nar.data.metadata.name = p.narrative_id; 
        nar.data.metadata.creator = USER_ID;

        var ws_fn = ws_client.save_objects( {workspace: p.project_id, objects: [nar]});
        return $.when( ws_fn ).then( function(obj_meta) {
                      return obj_meta_dict(obj_meta);
                  });
    };

}
