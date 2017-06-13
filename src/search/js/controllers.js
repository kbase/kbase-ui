/*  Controllers
 *
 *  These are the 'glue' between models and views.
 *  See: https://docs.angularjs.org/guide/controller
 *  
 */
app
    .controller('methodAccordion', function ($scope, narrative, $http) {})
    .controller('Analysis', function ($scope, $state, $stateParams, $location, narrative, $http) {
        // service for narrative (builder) state
        $scope.narrative = narrative;

        // selected workpsace
        $scope.ddSelected = narrative.current_ws;
        $scope.ws = $scope.ddSelected; // scope.ws variable for workspace browser

        // let's make this happen: 
        // http://ngmodules.org/modules/angularjs-json-rpc
        if (!narrative.ws_objects) {
            var p = kb.ws.list_objects({ workspaces: [$scope.ddSelected] });
            $.when(p).done(function (data) {
                $scope.$apply(function () {
                    narrative.ws_objects = data;

                    var types = {};
                    for (var i in data) {
                        var type = data[i][2].split('-')[0];
                        var obj = { name: data[i][1], id: data[i][0] };

                        if (type in types) {
                            types[type].push(obj);
                        } else {
                            types[type] = [obj];
                        }
                    }

                    narrative.wsObjsByType = types
                })
            })
        }

        var prom = kb.ws.list_workspace_info({ perm: 'w' });
        $.when(prom).then(function (workspaces) {
            var workspaces = workspaces.sort(compare)

            function compare(a, b) {
                var t1 = kb.ui.getTimestamp(b[3])
                var t2 = kb.ui.getTimestamp(a[3])
                if (t1 < t2) return -1;
                if (t1 > t2) return 1;
                return 0;
            }

            var ws_list = [];
            for (var i in workspaces) {
                ws_list.push({ name: workspaces[i][1], id: workspaces[i][0] })
            }

            $scope.$apply(function () {
                narrative.ws_list = ws_list
            })
        });

        // update workspace objects if dropdown changes
        $scope.$watch('ddSelected', function (new_ws) {
            var p = kb.ws.list_objects({ workspaces: [new_ws] });
            $.when(p).done(function (data) {
                $scope.$apply(function () {
                    narrative.ws_objects = data;

                    // if newly selected workspace is not the same
                    // as current, go to workspace browser view 
                    if (narrative.current_ws != new_ws) {
                        narrative.current_ws = new_ws;
                        $state.go('analysis.objects', null, { reload: true });
                    }
                })
            })
        })

    })

.controller('Upload', function ($scope, $state, $stateParams, $http) {
    $scope.shockURL = "http://140.221.67.190:7078"

    // improve by using angular http
    $scope.uploadFile = function (files) {
        $scope.$apply(function () {
            $scope.uploadComplete = false;
        })

        //SHOCK.init({ token: USER_TOKEN, url: $scope.shockURL })
        //SHOCK.upload('uploader')

        var form = new FormData($('form')[0]);
        $.ajax({
            url: $scope.shockURL + '/node', //Server script to process data
            type: 'POST',
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', updateProgress, false);
                }
                return myXhr;
            },
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", SHOCK.auth_header.Authorization);
            },
            success: function (data) {
                $scope.$apply(function () {
                    $scope.uploadProgress = 0;
                    $scope.uploadComplete = true;
                })

            },
            error: function (e) {
                console.log('fail', e)
            },
            data: form,
            cache: false,
            contentType: false,
            processData: false
        });

        function updateProgress(oEvent) {
            if (oEvent.lengthComputable) {
                var percent = oEvent.loaded / files[0].size;
                $scope.$apply(function () {
                    $scope.uploadProgress = Math.floor(percent * 100);
                })
            }
        }

    }

})



.controller('RxnDetail', function ($scope, $stateParams) {
    $scope.ids = $stateParams.ids.split('&');
})

.controller('CpdDetail', function ($scope, $stateParams) {
    $scope.ids = $stateParams.ids.split('&');
})

.controller('MVHelp', function ($scope, $stateParams, $location) {
    // Fixme: move out of controller
    $('.api-url-submit').click(function () {
        var form = $(this).parents('form');
        var url = '/' + form.attr('type') + '/' + form.find('#input1').val();
        if (form.find('#input2').val()) {
            url = url + '/' + form.find('#input2').val();
        }

        $scope.$apply($location.path(url));
    });
})

.controller('GenomeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'genomeID': $stateParams.id,
        'workspaceID': $stateParams.ws,
        'kbCache': kb
    }
})

.controller('GeneDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.gid + '?sub=Feature&subid=' + $stateParams.fid);
    $scope.params = {
        'genomeID': $stateParams.gid,
        'featureID': $stateParams.fid,
        'workspaceID': $stateParams.ws,
        'version': $stateParams.ver,
        'kbCache': kb
    }
})


.controller('MediaDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('ModelDetailCards', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('MemeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('CmonkeyDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('InferelatorDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('MAKDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'workspace': $stateParams.ws,
        'kbCache': kb
    };
})

.controller('FloatDataTable', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'workspace': $stateParams.ws,
        'kbCache': kb
    };
})

.controller('RegpreciseDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('BambiDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'bambi_run_result_id': $stateParams.id,
        'workspace_id': $stateParams.ws
    }
})

.controller('PPIDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('SpecDetail', function ($scope, $stateParams) {
    $scope.params = {
        'kind': $stateParams.kind,
        'id': $stateParams.id
    };
    require(['kb.widget.navbar'], function (NAVBAR) {
        NAVBAR.clearMenu()
            .addDefaultMenu({
                search: true,
                narrative: true
            });
    });
})


.controller('GPTypeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})

.controller('GTTypeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})

.controller('GVTypeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})

.controller('GGLTypeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})

.controller('GTVTypeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})


.controller('ModelDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('ModelDetailCards', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('FBADetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('FBADetailCards', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('WSObjects', function ($scope, $stateParams, $location) {
    var type = $location.path().match(/\/\w*\/*/g)[0]
        .replace('/', '').replace('/', '');

    $scope.type = type;
    $scope.ws = $stateParams.ws;
})

.controller('WsRefViewer', function ($scope, $stateParams) {
        $scope.params = {
            'id': $stateParams.id,
            'ws': $stateParams.ws,
            'version': $stateParams.version,
            'kbCache': kb
        }
    })
    .controller('WsRefUsersViewer', function ($scope, $stateParams) {
        $scope.params = {
            'id': $stateParams.id,
            'ws': $stateParams.ws,
            'version': $stateParams.version,
            'kbCache': kb
        }
    })

.controller('WsObjGraphView', function ($scope, $stateParams) {
        $scope.params = { 'ws': $stateParams.ws, 'kbCache': kb }
    })
    .controller('WsObjGraphCenteredView', function ($scope, $stateParams) {
        $scope.params = { 'ws': $stateParams.ws, 'id': $stateParams.id, 'kbCache': kb }
    })

// .controller('People', function($scope, $stateParams, $location) {
//     $scope.params = { 'userid':$stateParams.userid, 'kbCache' : kb }

//     // NB need to use KBaseSessionSync here and not kb -- because kb is only valid at page load
//     // time. On angular path changes, it will not have been updated. So, e.g., after a user logs 
//     // out and goes backing over their history...
//     if (!$.KBaseSessionSync.isLoggedIn()) {
//         var hash = window.location.hash;
//         var path = '/login/';
//         if (hash && hash.length > 0) {
//             path += '?nextPath=' + encodeURIComponent(hash.substr(1));
//         } 
//         $location.url(path);
//         return;
//     }


//     // Set the styles for the user page
//     $('<link>')
//     .appendTo('head')
//     .attr({type: 'text/css', rel: 'stylesheet'})
//     .attr('href', 'views/social/user-page/style.css');

//     // Set up the navbar menu
//     require(['kb.widget.navbar'], function (NAVBAR) {
//       NAVBAR.clearMenu()
//       .addDefaultMenu({
//         search: true, narrative: true
//       });
//       /*
//       .addHelpMenuItem({
//         type: 'divider'
//       })
//       .addHelpMenuItem({
//         name: 'featurerequest',
//         label: 'Request Feature',
//         external: true,
//         icon: 'thumbs-o-up',
//         url: 'https://atlassian.kbase.us/secure/CreateIssueDetails!init.jspa?pid=10200&issuetype=2&priority=4&components=10108&assignee=eapearson&summary=Feature%20Request%20on%20User%20Page'
//       })
//       .addHelpMenuItem({
//         name: 'bugreport',
//         label: 'Report BUG',
//         icon: 'bug',
//         external: true,
//         url: 'https://atlassian.kbase.us/secure/CreateIssueDetails!init.jspa?pid=10200&issuetype=1&priority=3&components=10108&assignee=eapearson&summary=Bug%20on%20User%20Page'
//       });
//        */

//       /*
//       .addHelpMenuItem({
//         name: 'navtest',
//         label: 'Navbar Test',
//         icon: 'bug',
//         url: '#/navtest/x'
//       })
//       */


//     });


// })

// .controller('Dashboard', function($scope, $stateParams, $location) {
//     $scope.params = { 'kbCache' : kb }

//     if (!$.KBaseSessionSync.isLoggedIn()) {
//         $location.url('/login/');
//        return;
//     }

//     // Set the styles for the dashboard page
//     $('<link>')
//     .appendTo('head')
//     .attr({type: 'text/css', rel: 'stylesheet'})
//     .attr('href', 'views/dashboard/style.css');

//     $('<link>')
//     .appendTo('head')
//     .attr({type: 'text/css', rel: 'stylesheet'})
//     .attr('href', '/src/widgets/dashboard/style.css');

//     // Set up the navbar menu.
//    // Note that the navbar is a singleton. There is only one per page/view, and it is as persistent
//    // as the page/view is. It does maintain some state, notably the dom node it is attached to. This is
//    // the primary reason it is a singleton.
//     require(['kb.widget.navbar', 'kb.statemachine'], function (NAVBAR, StateMachine) {
//       NAVBAR.clearMenu()
//       .addDefaultMenu({
//         search: true, narrative: true, dashboard: false
//       })
//       .setTitle('Dashboard');

//        /*
//       .addHelpMenuItem({
//         type: 'divider'
//       })
//       .addHelpMenuItem({
//         name: 'featurerequest',
//         label: 'Request Feature',
//         external: true,
//         icon: 'thumbs-o-up',
//         url: 'https://atlassian.kbase.us/secure/CreateIssueDetails!init.jspa?pid=10200&issuetype=2&priority=4&components=10108&assignee=eapearson&summary=Feature%20Request%20on%20UDashboard'
//       })
//       .addHelpMenuItem({
//         name: 'bugreport',
//         label: 'Report BUG',
//         icon: 'bug',
//         external: true,
//         url: 'https://atlassian.kbase.us/secure/CreateIssueDetails!init.jspa?pid=10200&issuetype=1&priority=3&components=10108&assignee=eapearson&summary=Bug%20on%20Dashboard'
//       })
//       */

//        // Set up the main State machine for this view.
//        $scope.viewState = Object.create(StateMachine).init();

//         // a cheap hartbeat for now... and just for the dashboard.
//         var heartbeat = 0;
//         $scope.heartbeatTimer = window.setInterval(function () {
//                 heartbeat++;
//                 postal.channel('app').publish('heartbeat', {heartbeat: heartbeat});
//         }, 100);

//         // Now remove them.
//         $scope.$on('$destroy', function () {
//                        // tear down the state machine
//                        // Umm, this happen naturally when the object goes out of scope.

//                 // But the heartbeat timer will need to be stopped manually.
//                 window.clearInterval($scope.heartbeatTimer);
//         });

//     });

// })

.controller('NavTest', function ($scope, $stateParams) {
    $scope.params = { 'appid': $stateParams.appid, 'kbCache': kb }

})

.controller('App', function ($scope, $stateParams) {
    $scope.params = { 'appid': $stateParams.appid, 'kbCache': kb }
    $("#sortable-landing").sortable({
        placeholder: "drag-placeholder",
        handle: '.panel-heading',
        cancel: '.panel-title,.panel-subtitle,.label,.glyphicon',
        start: function () {
            $(this).find('.panel-body').addClass('hide');
            $(this).sortable('refreshPositions');
        },
        stop: function () {
            $(this).find('.panel-body').removeClass('hide');
        }
    });
})

.controller('Trees', function ($scope, $stateParams) {
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})


.controller('Taxonomy', function ($scope, $stateParams) {
    $scope.params = {
        'taxonname': $stateParams.taxonname,
        'ws': $stateParams.ws,
        'kbCache': kb
    }
})


.controller('WB', function ($scope, $stateParams, $location) {
    $scope.ws = $stateParams.ws;
    $scope.type = $stateParams.type;

    require(['kb.widget.navbar'], function (NAVBAR) {
        NAVBAR.clearMenu()
            .addDefaultMenu({
                search: true,
                narrative: true
            });
    });

    $scope.nar_url = configJSON.narrative_url;

    var sub = $location.path().split('/')[1];

    if (sub == 'narratives') {
        $scope.tab = $location.path().split('/')[2];
    }

    $scope.showPreviousChanges = function () {
        $('#previous-changes').slideToggle();
    }

    $scope.hideSidebar = function (route) {
        $('#ws-sidebar').toggle('slide', {
            direction: 'left',
            duration: 'fast',
            complete: function () {
                $state.transitionTo(route, { ws: ws, id: id })
            }
        })
    }

})


.controller('Login', function ($scope, $stateParams, $location, kbaseLogin) {

    // If we are logged in and landing here we redirect to the dashboard.
    if ($.KBaseSessionSync.isLoggedIn()) {
        if ($stateParams.nextPath) {
            $location.url($stateParams.nextPath);
        } else {
            $location.path('/search/');
        }
        return;
    }

    // Add a stripped down nav bar for the login page.
    require(['kb.widget.navbar'], function (NAVBAR) {
        NAVBAR.clear()
            .addDefaultMenu({
                search: false,
                narrative: false,
                dashboard: false
            })
            .setTitle("Sign In to KBase");
    });

    // Set up some scope properties.
    $scope.nar_url = configJSON.narrative_url; // used for links to narratives    

    // ignore nextPath which is ... the login page.
    if ($stateParams.nextPath == '/login') {
        $scope.nextPath = null;
    } else {
        $scope.nextPath = $stateParams.nextPath;
    }

    // callback for ng-click 'loginUser':
    $scope.loginUser = function (user, nextPath, nextURL) {
        require(['kb.session', 'postal', 'jquery'], function (Session, Postal, $) {
            // TODO: this should not be an ID!!
            $("#loading-indicator").show();
            // Angular does not populate the user property if nothing
            // was filled in.
            var username = user ? user.username : null;
            var password = user ? user.password : null;
            $("#login_error").hide();
            // Note that the login page does not handle login success -- the 
            // app does that. 
            //kbaseLogin.login(
            //   username,
            //    password
            //);
            Session.login({
                    username: username,
                    password: password
                })
                .then(function (session) {
                    Postal.channel('session').publish('login.success', {
                        session: Session,
                        nextPath: nextPath,
                        nextURL: nextURL
                    });

                })
                .catch(function (errorMsg) {
                    // All error handling is handled locally.
                    $("#loading-indicator").hide();
                    if (errorMsg === "LoginFailure: Authentication failed.") {
                        errorMsg = "Login Failed: your username/password is incorrect.";
                    }
                    $("#login_error").html(errorMsg);
                    $("#login_error").show();
                })
                .done();
        });
    };

    $scope.$on('$destroy', function () {
        // remove the postal subscriptions.
        //subs.forEach(function (sub) {
        //    sub.unsubscribe();
        //})
    });
})

.controller('WBLanding', function ($scope, $stateParams) {

    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id)
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;

    $("#sortable-landing").sortable({
        placeholder: "drag-placeholder",
        handle: '.panel-heading',
        cancel: '.panel-title,.panel-subtitle,.label,.glyphicon',
        start: function () {
            $(this).find('.panel-body').addClass('hide');
            $(this).sortable('refreshPositions');
        },
        stop: function () {
            $(this).find('.panel-body').removeClass('hide');
        }
    });

    //$( "#sortable-landing" ).disableSelection();
})


.controller('WBGeneLanding', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.gid + '?sub=Feature&subid=' + $stateParams.fid);

    $scope.ws = $stateParams.ws;
    $scope.fid = $stateParams.fid;
    $scope.gid = $stateParams.gid;

    if ($scope.ws == "CDS") {
        $scope.ws = "KBasePublicGenomesV3";
    }
    if (!$scope.gid) {
        var temp = $scope.fid.split(".");
        if (temp.length > 3) {
            $scope.gid = temp[0] + "." + temp[1];
        }
    }
    $scope.id = $scope.gid;

    $("#sortable-landing").sortable({
        placeholder: "drag-placeholder",
        handle: '.panel-heading',
        cancel: '.panel-title,.panel-subtitle,.label,.glyphicon',
        start: function () {
            $(this).find('.panel-body').addClass('hide');
            $(this).sortable('refreshPositions');
        },
        stop: function () {
            $(this).find('.panel-body').removeClass('hide');
        }
    });

    //$( "#sortable-landing" ).disableSelection();
})



.controller('WBModelLanding', function ($scope, $stateParams, $location) {

    var type = $location.path().split('/')[2];
    if (type == 'fbas') {
        type = "FBA";
    } else if (type == "models") {
        type = "Model";
    }

    $scope.type = type;
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
    $scope.selected = [{ workspace: $scope.ws, name: $scope.id }]

    $scope.defaultMap = $stateParams.map;


    $("#sortable-landing").sortable({
        placeholder: "drag-placeholder",
        handle: '.panel-heading',
        cancel: '.panel-title,.panel-subtitle,.label,.glyphicon',
        start: function () {
            $(this).find('.panel-body').addClass('hide');
            $(this).sortable('refreshPositions');
        },
        stop: function () {
            $(this).find('.panel-body').removeClass('hide');
        }
    });
})

.controller('WSManage', function ($scope, $stateParams) {


})

.controller('MV', function ($scope, $rootScope, $stateParams, $location, MVService) {
    var type = $location.path().split('/')[2];

    //if ($stateParams.tab == 'FBA') {
    //    $scope.tabs[1].active = true;
    //} else if ($stateParams.tab == "Model") {
    //    $scope.tabs[0].active = true;        
    //}

    $scope.type = type;
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;

    //$scope.name = 'loading';
    $rootScope.org_name = 'loading';

    $scope.selected = [{ workspace: $scope.ws, name: $scope.id }]

    $scope.fba_refs = [];

    $scope.ref_obj_prom = kb.ws.list_referencing_objects($scope.selected)
    $.when($scope.ref_obj_prom).done(function (data) {
        // only care about first object
        var data = data[0]

        for (var i in data) {
            var meta = data[i];
            var type = meta[2].split('-')[0]

            if (type == "KBaseFBA.FBA") {
                $scope.fba_refs.push({
                    ws: meta[7],
                    name: meta[1],
                    date: kb.ui.formateDate(meta[3]),
                    timestamp: kb.ui.getTimestamp(meta[3])
                });
            }
        }

        $scope.fba_refs.sort(compare)
    })

    //$scope.defaultMap = $stateParams.map;
    function compare(a, b) {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        return 0;
    }

})

.controller('WBJSON', function ($scope, $stateParams) {
    $scope.ws = $stateParams.ws;
    $scope.id = $stateParams.id;
})

.controller('WBTour', function ($scope, $state, $stateParams, $location) {
    $scope.ws = 'chenryExample'; // workspace to use for tour

    // if not logged in, prompt for login
    if (!USER_ID) {
        var signin_btn = $('#signin-button');
        signin_btn.popover({
            content: "You must login before taking the tour",
            trigger: 'manual',
            placement: 'bottom'
        })
        signin_btn.popover('show');

        // otherwise, do the tour
    } else {
        function checkSomething() {
            $scope.checkedList.push(['kb|g.0.fbamdl', 'chenryExample', 'FBAModel-2.0']);
            $scope.$apply();
            $('.ncheck').eq(2).addClass('ncheck-checked');
        }

        var tour = [{ element: '.btn-new-ws', text: 'Create a new workspace here', placement: 'bottom' },
            {
                element: '.btn-ws-settings',
                n: 2,
                text: 'Manage workspsace sharing and other settings, as \
                        well as clone and delete workspaces using the gear button.',
                bVisible: true,
                time: 4000
            },
            {
                element: '.obj-id',
                n: 2,
                text: 'View data about the object, including visualizations and KBase widgets'
            },
            { element: '.show-versions', n: 2, text: 'View the objects history.' },
            {
                element: '.btn-show-info',
                n: 2,
                text: 'View meta data,  download the objects, etc',
                bVisible: true
            },
            {
                element: '.ncheck',
                n: 2,
                text: 'Select objects by using checkboxes<br> and see options appear above',
                event: checkSomething
            },
            { element: '.btn-table-settings', text: 'Show and hide columns and set other object table settings' },
            { element: '.type-filter', text: 'Filter objects by type' },
            { element: '.btn-delete-obj', text: 'Delete the objects selected in the table' },
            { element: '.btn-mv-dd', text: 'Go ahead, copy your colleague\'s objects to your own workspace' },
            { element: '.btn-rename-obj', text: 'Rename a selected object' },
            { element: '.btn-trash', text: 'View the trash bin for this workspace.<br>  \
                                    Unreferenced objects will be deleted after 30 days.' }
        ]

        function exit_callback() {
            $scope.$apply($state.go('ws'));
        }

        new Tour({ tour: tour, exit_callback: exit_callback });
    }
})

.controller('Favorites', function ($scope, $state, $stateParams, favoriteService, $compile) {
    $scope.selected = [{
        workspace: 'chenrydemo',
        name: 'kb|g.9.fbamdl.25.fba.55'
    }];
    //$scope.type = 'FBA';

    // model for state of favorites in application
    $scope.fav;

    // this updates the dom with favorites from the service
    // "favoriteService" communicates with the server
    $scope.updateFavs = function () {
        $scope.prom = kb.ujs.get_has_state('favorites', 'queue', 0);
        var p = $.getJSON('landing_page_map.json');

        $.when($scope.prom, p).done(function (data, obj_mapping) {
            $scope.obj_mapping = obj_mapping[0];
            $scope.favs = (data[0] ? data[1] : []);
            $scope.fav_by_kind = $scope.processData();
            $scope.$apply();
        })
    }

    // update on first invocation
    //$scope.updateFavs();    

    $scope.processData = function () {
        fav_by_kind = {}

        var favs = $scope.favs;
        for (var i in favs) {
            var kind = favs[i].type.split('-')[0];
            var module = favs[i].module

            if (module in $scope.obj_mapping && $scope.obj_mapping[module] &&
                $scope.obj_mapping[module][kind]) {
                var sub = $scope.obj_mapping[module][kind];
            } else {
                var sub = undefined
            }

            //var sortable = ['FBAModel', 'FBA'];
            //var mv = ['Media', 'MetabolicMap', 'ETC'];
            //var route = (sortable.indexOf(kind) != -1 ? 'ws.mv' : sub)  //+sub : sub);

            var route = sub;
            switch (kind) {
            case 'FBA':
                route = 'ws.mv.fba';
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

            favs[i].route = route

            if (kind in fav_by_kind) {
                fav_by_kind[kind].push($scope.favs[i])
            } else {
                fav_by_kind[kind] = []
                fav_by_kind[kind].push($scope.favs[i])
            }
        }

        return fav_by_kind;
    }


    $scope.rmObject = function (ws, id, type, module) {
        for (var i in $scope.favs) {
            if ($scope.favs[i].ws == ws &&
                $scope.favs[i].id == id &&
                $scope.favs[i].type == type) {
                $scope.favs.splice(i, 1);
            }
        }
        favoriteService.remove(ws, id, type, module);
        $scope.fav_by_kind = $scope.processData();
    }

    $scope.clearList = function () {
        favoriteService.clear();
        $scope.fav_by_kind = [];
    }


    $scope.displayViewer = function (route, ws, id) {
        "ws.json({ws:'" + ws + "', id:'" + id + "'})"
        if (route) {
            $state.transitionTo(route, { ws: ws, id: id })
        } else {
            $state.transitionTo('ws.json', { ws: ws, id: id })
        }

        $scope.$apply();
    }


    //$scope.displayViewer('chenrydemo', 'kb|g.9.fbamdl.25.fba.55', 'FBA')

    $scope.AccordionCtrl = function ($scope) {
        $scope.oneAtATime = true;

        $scope.items = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addItem = function () {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };
    }



})


.controller('TreeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('PangenomeDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('MSADetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = {
        'id': $stateParams.id,
        'ws': $stateParams.ws
    };
})

.controller('KidlEdtDetail', function ($scope, $stateParams) {
    $scope.params = {
        'type': $stateParams.type,
        'mod': $stateParams.mod
    };
})

.controller('JGI', function ($scope, $stateParams) {
    $scope.params = {
        'ws': $stateParams.ws,
        'obj': $stateParams.obj
    };
    require(['kb.widget.navbar'], function (NAVBAR) {
        NAVBAR.clearMenu()
            .addDefaultMenu({
                search: true,
                narrative: true
            });
    });
})



.controller('narrativemanager', function ($scope, $stateParams, $location) {
    if (!$.KBaseSessionSync.isLoggedIn()) {
        var hash = window.location.hash;
        var path = '/login/';
        if (hash && hash.length > 0) {
            path += '?nextPath=' + encodeURIComponent(hash.substr(1));
        }
        $location.url(path);
    } else {
        $scope.params = $stateParams;
        require(['kb.widget.navbar'], function (NAVBAR) {
            NAVBAR.clearMenu()
                .addDefaultMenu({
                    search: true,
                    narrative: true
                });
        });
    }
})

.controller('NarrativeStore', function ($scope, $stateParams) {
    $scope.params = $stateParams;
    require(['kb.widget.navbar'], function (NAVBAR) {
        NAVBAR.clearMenu()
            .addDefaultMenu({
                search: true,
                narrative: true
            });
    });
})

.controller('JsonDetail', function ($scope, $stateParams) {
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})

.controller('ContigSetDetail', function ($scope, $stateParams) {
    window.location.replace("#/dataview/" + $stateParams.ws + '/' + $stateParams.id);
    $scope.params = { 'id': $stateParams.id, 'ws': $stateParams.ws }
})


function LPHelp($scope, $stateParams, $location) {
    // Fixme: move out of controller
    $('.api-url-submit').click(function () {
        var form = $(this).parents('form');
        var url = '/' + form.attr('type') + '/' + form.find('#input1').val();
        if (form.find('#input2').val()) {
            url = url + '/' + form.find('#input2').val();
        }
        if (form.find('#input3').val()) {
            url = url + '/' + form.find('#input3').val();
        }

        $scope.$apply($location.path(url));
    });
}


function ScrollCtrl($scope, $location, $anchorScroll) {
    $scope.gotoAnchor = function (id) {
        $location.hash(id);
        $anchorScroll();
    }
}


angular.module('angular-json-rpc', []).config(["$provide", function ($provide) {

    return $provide.decorator('$http', ['$delegate', function ($delegate) {
        $delegate.jsonrpc = function (url, method, parameters, config) {
            var data = { "jsonrpc": "2.0", "method": method, "params": parameters, "id": 1 };
            return $delegate.post(url, data, angular.extend({ 'headers': { 'Content-Type': 'application/json' } }, config));
        };
        return $delegate;
    }]);
}]);
