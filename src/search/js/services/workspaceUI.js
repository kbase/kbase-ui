
/* 
 * colllection of workspace modals
 *
*/

app.service('modals', function() {
    var self = this;

    //  params.cancel_cb : callback for cancel button
    //  params.submit_cb : callback for submit button
    this.createWS = function(params) {
        var body = $('<form class="form-horizontal" role="form">'+
                        '<div class="form-group">'+
                            '<label class="col-sm-4 control-label">Workspace Name</label>'+
                            '<div class="col-sm-6">'+                                 
                                '<div class="input-group">'+
                                    '<span class="input-group-addon">'+USER_ID+':</span>'+
                                    '<input type="text" class="form-control create-id focusedInput">'+
                                '</div>'+
                            '</div>\
                          </div>\
                          <div class="form-group">\
                            <label class="col-sm-4 control-label">Global Permission</label>\
                            <div class="col-sm-3">'+
                                kb.ui.globalPermDropDown('n')+
                            '</div>'+
                          '</div>'+
                          '<div class="form-group">'+
                            '<label class="col-sm-4 control-label">Description</label>'+
                            '<div class="col-sm-7">'+
                               '<textarea class="form-control create-descript" rows="3"></textarea>'+
                            '</div>'+
                          '</div>'+
                      '</div>')


        var createModal = $('<div>').kbasePrompt({
                title : 'Create Workspace',
                body : body,
                modalClass : '', 
                controls : [{
                    name: 'Cancel',
                    callback: function(e, $prompt) {
                            $prompt.closePrompt();
                            if (params.cancel_cb) params.cancel_cb();
                        }
                    },
                    {
                    name : 'Create',
                    type : 'primary',
                    callback : function(e, $prompt) {
                        var new_ws_name = $('.create-id').val();
                        var perm = $('.create-permission option:selected').val();
                        var descript = $('.create-descript').val();

                        if (new_ws_name === '') {
                            $prompt.addAlert('must enter a workspace name');
                            $('.create-id').focus();
                            return;
                        }                   

                        // check to see if there's a colon in the user project name already
                        // if there is and it's the user's username, use it. If it's not throw error.
                        // Otherwise, append "username:"
                        var s_ws = new_ws_name.split(':');
                        var error;
                        if (s_ws.length > 1) {
                            if (s_ws[0] == USER_ID) {
                                var proj = USER_ID+':'+s_ws[1];
                            }  else {
                                error = 'Only your username ('+USER_ID+') may be used before a colon';
                            }
                        } else {
                            var name = USER_ID+':'+new_ws_name
                        }

                        if (error) {
                            $prompt.addCover(error, 'danger');
                        } else {
                            var args = {
                                workspace: name,
                                globalread: perm,
                                description: descript
                            };                                            
                            var prom = kb.ws.create_workspace(args);
                            $prompt.data('dialogModal').find('.modal-body').loading()
                            $.when(prom).done(function(){                                            
                                if (params.submit_cb) params.submit_cb();
                                kb.ui.notify('Created workspace: '+new_ws_name, 'success');                                            
                                $prompt.closePrompt(); 
                            }).fail(function(e) {
                                $prompt.data('dialogModal').find('.modal-body').rmLoading()
                                $prompt.addCover(e.error.message, 'danger');                                            
                            })
                        }
                    }
                }]
            }
        );
        createModal.openPrompt();
    }

    /*
    var modal = $('<div>').kbaseModal({title: 'Create Workspace',
                                       body: body,
                                       buttons: [{text: 'Cancel'},
                                                 {text: 'Create', kind: 'primary'}]
                                     })
    */

    //  params.ws : workspace to copy
    //  params.cancel_cb : callback for cancel button
    //  params.submit_cb : callback for submit button
    this.copyWS = function(params) {
        var ws_name = params.ws;
        var body = $('<form class="form-horizontal" role="form">'+
                          '<div class="form-group">'+
                            '<label class="col-sm-5 control-label">New Workspace Name</label>'+
                            '<div class="col-sm-6">'+
                                '<div class="input-group">'+
                                    '<span class="input-group-addon">'+USER_ID+':</span>'+
                                    '<input type="text" class="form-control new-ws-id focusedInput">'+
                                '</div>'+
                            '</div>'+
                          '</div>'+
                          '<div class="form-group">'+
                            '<label class="col-sm-5 control-label">Global Permission</label>'+
                            '<div class="col-sm-3">'+
                             '<select class="form-control create-permission" data-value="n">'+
                                '<option value="n" selected="selected">none</option>'+
                                '<option value="r">read</option></select>'+
                            '</div>'+
                          '</div>'+
                     '</div>');
        

        var copyWSModal = $('<div>').kbasePrompt({
                title : 'Copy Workspace <i>'+ws_name+'</i>',
                body : body,
                modalClass : '', 
                controls : [{
                    name: 'Cancel',
                    type: 'default',
                    callback: function(e, $prompt) {
                            $prompt.closePrompt();
                            if (params.cancel_cb) params.cancel_cb()
                        }
                    },
                    {
                    name : 'Copy',
                    type : 'primary',
                    callback : function(e, $prompt) {
                        var new_ws_name = $('.new-ws-id').val();
                        var perm = $('.create-permission option:selected').val();


                        if (new_ws_name === '') {
                            $prompt.addAlert('must enter a workspace name');
                            $('.new-ws-id').focus();
                            return;
                        }                                                         

                        // check to see if there's a colon in the user project name already
                        // if there is and it's the user's username, use it. If it's not throw error.
                        // Otherwise, append "username:"
                        var s_ws = new_ws_name.split(':');
                        var error;
                        if (s_ws.length > 1) {
                            if (s_ws[0] == USER_ID) {
                                var proj = USER_ID+':'+s_ws[1];
                            }  else {
                                error = 'Only your username ('+USER_ID+') may be used before a colon';
                            }
                        } else {
                            var new_ws_name = USER_ID+':'+new_ws_name
                        }

                        if (error) {
                            $prompt.addCover(error, 'danger');
                        } else {
                            var p = {
                                wsi: {workspace: ws_name},
                                workspace: new_ws_name,
                                globalread: perm
                            };                               
                            var prom = kb.ws.clone_workspace(p);
                            $prompt.addCover()
                            $prompt.getCover().loading()
                            $.when(prom).done(function(){
                                $prompt.closePrompt();
                                if (params.submit_cb) params.submit_cb();
                                $prompt.closePrompt();
                            }).fail(function() {
                                $prompt.addCover('This workspace name already exists.', 'danger');
                            })
                        }
                    }
                }]
            }
        )
        copyWSModal.openPrompt();
    }

    //  params.ws : workspace to delete
    //  params.cancel_cb : callback for cancel button
    //  params.submit_cb : callback for submit button
    this.deleteWS = function(params) {
        var ws_name = params.ws;
        var body = $('<div style="text-align: center;">Are you sure you want to delete this workspace?<h3>'
                        +ws_name+'</h3>This action is irreversible.</div>');

        var deleteModal = $('<div>').kbasePrompt({
                title : 'Delete Workspace',
                body : body,
                modalClass : '', 
                controls : [{
                    name: 'No',
                    type: 'default',
                    callback: function(e, $prompt) {
                            $prompt.closePrompt();
                            if (params.cancel_cb) params.cancel_cb();
                        }
                    },
                    {
                    name : 'Yes',
                    type : 'primary',
                    callback : function(e, $prompt) {
                        var p = {workspace: ws_name}

                        var prom = kb.ws.delete_workspace(p);
                        $prompt.addCover()
                        $prompt.getCover().loading()
                        $.when(prom).done(function(){
                            params.submit_cb()
                            $prompt.closePrompt();
                        }).fail(function() {
                            $prompt.addCover('Could not delete workspace.', 'danger');
                        })

                    }
                }]
            }
        );
        deleteModal.openPrompt();
        deleteModal.addAlert('<strong>Warning</strong> All objects in the workspace will be deleted!');
    }


    // modal for managing workspace permissions, clone, and delete
    // params:
    //      ws: name_of_workspace,
    //      copy_cb: callback for when a copy has finished
    //      delete_cb: callback for a delete has finished }
    this.manageWS = function(params) {
        var ws_name = params.ws;

        var perm_dict = {'a': 'Admin',
                         'r': 'Read',
                         'w': 'Write',
                         'o': 'Owner',
                         'n': 'None'};

        var content = $('<div>');

        var permData;
        var manage_modal = $('<div>').kbasePrompt({
                title : 'Manage Workspace '+
                    (USER_ID ? '<a class="btn btn-primary btn-xs btn-edit">Edit <span class="glyphicon glyphicon-pencil"></span></a>' : ''),
                body : content,
                modalClass : '',
                controls : [{
                    name: 'Close',
                    type: 'default',
                    callback: function(e, $prompt) {
                            $prompt.closePrompt();
                        }
                    }, {
                    name : 'Save',
                    type : 'primary',
                    callback : function(e, $prompt) { //Fixme: yyyeeeahh.
                        $prompt.addCover();
                        $prompt.getCover().loading();

                        var prom = savePermissions(ws_name);
                        prompt = $prompt;

                        // save permissions, then save description, then the global perm //fixme
                        $.when(prom).done(function() {
                            // if description textarea is showing, saving description
                            var d = $('.descript-container textarea').val();

                            // saving description
                            var p1 = kb.ws.set_workspace_description({workspace: ws_name, 
                                description: d})

                            $.when(p1).done(function() {
                                var new_perm = $('.btn-global-perm option:selected').val();
                                // saving global perm
                                var p1 = kb.ws.set_global_permission({workspace: ws_name, 
                                    new_permission: new_perm})
                                $.when(p1).done(function() {
                                    prompt.addCover('Saved.');
                                    prompt.closePrompt();
                                    self.manageWS(params);
                                }).fail(function(e){
                                    prompt.addCover(e.error.message, 'danger');
                                })                      
                            }).fail(function(e){
                                prompt.addCover(e.error.message, 'danger');
                            })

                        }).fail(function(e){
                            prompt.addCover(e.error.message, 'danger');
                        })
                    }
                }]
            })

        manage_modal.openPrompt();
        var dialog = manage_modal.data('dialogModal').find('.modal-dialog');
        dialog.css('width', '500px');
        var modal_body = dialog.find('.modal-body');  //fixme: an api to the 
                                                      // widget would be nice for this stuff
        var modal_footer = dialog.find('.modal-footer');
        var save_btn = modal_footer.find('.btn-primary');
        save_btn.attr('disabled', true);


        var copyWS = $('<button class="btn btn-link pull-left">Copy</button>');
        copyWS.click(function() {
            manage_modal.closePrompt();
            self.copyWS({ws: ws_name, 
                         cancel_cb: function() {
                             self.manageWS(params);
                         }, 
                         submit_cb: function() {
                             params.copy_cb();
                         }
            });
        });

        var deleteWS = $('<button class="btn btn-link pull-right">Delete</button>');
        deleteWS.click(function() {
            manage_modal.closePrompt();
            self.deleteWS({ws: ws_name, 
                           cancel_cb: function() {
                                self.manageWS(params);
                           }, 
                           submit_cb: function() {
                               params.delete_cb();
                           }
            });
        });

        // add editable global permisssion
        kb.ws.get_workspace_info({workspace: ws_name}).done(function(info) {
            if (info[5] == 'a') {
                var isAdmin = true;
            } else {
                var isAdmin = false;
            }

            // table of meta data
            var table = $('<table class="table table-bordered table-condensed table-striped manage-table">');                
            var data = [
                ['Name', info[1]],
                ['Objects', '~ ' + info[4] ],
                ['Owner', info[2] ],
                ['Your Permission', perm_dict[info[5]] ],
                //['Global Permission', perm_dict[settings[5]] ]
            ];
            for (var i=0; i<data.length; i++) {
                var row = $('<tr>');
                row.append('<td><strong>' + data[i][0] + '</strong></td>'
                          +'<td>'+data[i][1]+'</td>');
                table.append(row);
            }

            content.append('<div class="ws-description">\
                                <h5>Description</h5>\
                                <div class="descript-container"></div>\
                           </div>\
                           <div class="ws-info">\
                                <h5>Info</h5>\
                           </div>'+
                           ( (USER_ID && info[5] != 'n') ?
                           '<div class="ws-perms">\
                                <h5>Other User Permissions</h5>\
                                <div class="perm-container"></div>\
                           </div>' : ''));

            var perm = info[6];


            var row = $('<tr>');
            row.append('<td><strong>Global Permission</strong></td>'
                    + '<td class="btn-global-perm">' + perm_dict[perm] + '</td>');
            table.append(row);

            // event for editable global perm
            $('.btn-edit').click(function() {
                if ($(this).hasClass('editable')) {
                    $('.btn-global-perm').html(kb.ui.globalPermDropDown(perm));   
                } else {
                    $('.btn-global-perm').html('')  //fixme: create editable form plugin
                    $('.btn-global-perm').text(perm_dict[perm]);
                }
            })

            modal_body.append(copyWS);
            modal_body.append(deleteWS);    


            modal_body.find('.ws-info').append(table)

            // if user is logged in (going to allow write access viewing soon)
            //if (USER_ID ) {
                var prom = kb.ws.get_permissions({workspace: ws_name});

                //var newPerms;
                var placeholder = $('<div>').loading()
                modal_body.append(placeholder);                        
                $.when(prom).done(function(data) {
                    permData = data

                    //newPerms = $.extend({},data)
                    placeholder.rmLoading();

                    perm_container = modal_body.find('.perm-container');

                    var perm_table = getPermTable(data)
                    perm_container.append(perm_table);

                    $('.btn-edit').click(function() {
                        if ($(this).hasClass('editable')) {
                            perm_table.remove();
                            perm_table = getEditablePermTable(data);
                            perm_container.html(perm_table);
                        } else {
                            perm_table.remove();
                            perm_table = getPermTable(data);
                            perm_container.html(perm_table);
                        }
                    })

                }).fail(function(e){
                    placeholder.rmLoading();
                    modal_body.append('<div class="alert alert-danger">'+
                        '<b>Error:</b> Can not fetch WS permissions: '+
                            e.error.message+'</div>');
                });
            //} 


        }).fail(function(e){
            modal_body.append('<div class="alert alert-danger">'+
                    '<b>Error</b> Can not fetch WS info: '+
                        e.error.message+'</div>');
        });


        // editable status
        $('.btn-edit').click(function(){
            $(this).toggleClass('editable');

            // if not editable, make editable
            if ($(this).hasClass('editable')) {
                save_btn.attr('disabled', false);  
                $(this).html('Cancel');
            } else {
                save_btn.attr('disabled', true);                              
                $(this).html('Edit');
            }
        })

        // get and display editable description
        var prom = kb.ws.get_workspace_description({workspace:ws_name})
        $.when(prom).done(function(descript) {
            var d = (descript ? descript : '(none)')+'<br>';
            modal_body.find('.descript-container')
                .append(d);

            $('.btn-edit').click(function(){
                if ($(this).hasClass('editable')) {
                    var editable = getEditableDescription(descript);
                    $('.descript-container').html(editable);
                } else {
                    $('.descript-container').html(descript);
                }
            })
        }).fail(function(e){
            modal_body.append('<div class="alert alert-danger">'+
                    '<b>Error</b> Can not fetch description: '+
                        e.error.message+'</div>');
        });



        function getEditableDescription(d) {
            var d = $('<form role="form">\
                       <div class="form-group">\
                        <textarea rows="4" class="form-control" placeholder="Description">'+d+'</textarea>\
                      </div>\
                      </form>');
            return d;
        }

        //table for displaying user permissions
        function getPermTable(data) {
            var table = $('<table class="table table-bordered perm-table"></table>');
            // if there are no user permissions, display 'none'
            // (excluding ~global 'user' and owner)
            var perm_count = Object.keys(data).length;

            if (perm_count <= 1 || (perm_count == 2 && '*' in data)) {
                var row = $('<tr><td>(None)</td></tr>');
                table.append(row);
                return table;
            }

            // create table of permissions
            for (var key in data) {
                // ignore user's perm, ~global, and users with no permissions
                if (key == '*' || key == USER_ID || data[key] == 'n') continue;
                var row = $('<tr><td class="perm-user" data-user="'+key+'">'+key+'</td><td class="perm-value" data-value="'+data[key]+'">'+
                                 perm_dict[data[key]]+'</td></tr>');

                table.append(row);
            }

            return table;
        }

        // table for editing user permissions
        function getEditablePermTable(data) {
            var table = $('<table class="table table-bordered edit-perm-table"></table>');

            // create table of permissions
            for (var key in data) {
                // ignore user's perm, ~global, and users with no permissions
                if (key == '*' || key == USER_ID || data[key] == 'n') continue;
                var row = $('<tr><td><input type="text" class="form-control perm-user" value="'+key+'"></input></td>\
                    <td class="perm-value">'+permDropDown(data[key])+'</td>\
                    <td><button class="form-control rm-perm" data-user="'+key+'">\
                    <span class="glyphicon glyphicon-trash"></span></button></tr>');

                row.find('.rm-perm').click(function(){
                    $(this).closest('tr').remove();                            
                });

                table.append(row);
            }

            // if there are no user permissions, display 'none'
            // (excluding ~global 'user' and owner)
            var perm_count = Object.keys(data).length;
            if (perm_count == 2) {
                var row = $('<tr>None</tr>');
                table.append(row);
            }                    

            var newrowhtml = '<tr class="perm-row"><td><input type="text" class="form-control perm-user" placeholder="Username"></td><td>'+
                    permDropDown(data[key])+'</td></tr>'
            var row = $(newrowhtml);

            var addOpt = $('<td><button type="button" class="form-control add-perm">\
                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button></td>');
            row.append(addOpt);
            table.append(row);
            
            table.find('.add-perm').click(function() {
                var new_user_id = $(this).parents('tr').find('.perm-user').val();
                var new_perm = $(this).parents('tr').find('.create-permission option:selected').val();
                //newPerms[new_user_id] = new_perm; //update model

                newRow(new_user_id, new_perm);

                $(this).parents('tr').find('.perm-user').val('')

                if (table.find('tr').length == 0) {
                   table.append('<tr>None</tr>');
                }
            });

            function newRow(new_user_id, new_perm) {  //onchange="newPerms[\''+new_user_id+'\'] = $(this).find(\'option:selected\').val();
                var rowToAdd = '<tr><td><input class="form-control perm-user" value="'+new_user_id+'"></input></td>\
                        <td class="perm-value">'+permDropDown(data[key], new_perm)+'</td>\
                        <td><button onclick="$(this).closest(&#39;tr&#39).remove();" class="form-control">\
                        <span class="glyphicon glyphicon-trash"></span></button></tr>';

                // add new row
                table.find('tr:last').before(rowToAdd);
            }

            return table;
        }


        function savePermissions(p_name) {
            var newPerms = {};
            var table = $('.edit-perm-table');
            table.find('tr').each(function() {
                var user = $(this).find('.perm-user').val()
                var perm = $(this).find('option:selected').val();
                if (!user) return;
                
                newPerms[user] = perm
            })

            // create new permissions for each user that does not currently have 
            // permsissions.
            var promises = [];
            for (var new_user in newPerms) {
                // ignore these
                if (new_user == '*' || new_user == USER_ID) continue;   

                // if perms have not change, do not request change
                if ( (new_user in permData) && newPerms[new_user] == permData[new_user]) {
                    continue;
                }


                var params = {
                    workspace: p_name,
                    new_permission: newPerms[new_user],
                    users: [new_user],
                    //auth: USER_TOKEN
                };

                var p = kb.ws.set_permissions(params);
                promises.push(p);
            };

            var rm_users = [];

            // if user was removed from user list, change permission to 'n'
            for (var user in permData) {
                if (user == '*' || user == USER_ID) continue;                            

                if ( !(user in newPerms) ) {

                    var params = {
                        workspace: p_name,
                        new_permission: 'n',
                        users: [user],
                        //auth: USER_TOKEN
                    };

                    var p = kb.ws.set_permissions(params);
                    promises.push(p);
                    rm_users.push(user);
                } 
            }

            return $.when.apply($, promises);
        }

        // dropdown for user permissions (used in getPermission Table) //fixme: cleanup
        function permDropDown(perm) {
            var dd = $('<select class="form-control create-permission" data-value="n">\
                            <option value="r">read</option>\
                            <option value="w">write</option>\
                            <option value="a">admin</option></select>\
                          </div>');

            if (perm == 'a') {
                dd.find("option[value='a']").attr('selected', 'selected');
            } else if (perm == 'w') {
                dd.find("option[value='w']").attr('selected', 'selected');
            } else {
                dd.find("option[value='r']").attr('selected', 'selected');
            }

            return $('<div>').append(dd).html();
        }

    }  // end manageWS

});


 

