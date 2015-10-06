define([],
    function () {
        /*
         * 
         * @param {type} workspace
         * @returns {Boolean}
         */
        function isValid(workspace) {
            if (workspace.metadata.narrative &&
                // corrupt workspaces may have narrative set to something other than the object id of the narrative
                /^\d+$/.test(workspace.metadata.narrative) &&
                workspace.metadata.is_temporary !== 'true') {
                return true;
            } else {
                return false;
            }
        }
        
        return {
            isValid: isValid
        }

        /*getPermissions: {
         value: function (narratives) {
         return Q.promise(function (resolve, reject, notify) {
         if (narratives.length === 0) {
         resolve([]);
         return;
         }
         var promises = narratives.map(function (narrative) {
         return Utils.promise(this.workspaceClient, 'get_permissions', {
         id: narrative.workspace.id
         })
         }.bind(this));
         var username = Session.getUsername();
         Q.all(promises)
         .then(function (permissions) {
         for (var i = 0; i < permissions.length; i++) {
         var narrative = narratives[i];
         narrative.permissions = Utils.object_to_array(permissions[i], 'username', 'permission')
         .filter(function (x) {
         if (x.username === username ||
         x.username === '*' ||
         x.username === narrative.workspace.owner) {
         return false;
         } else {
         return true;
         }
         })
         .sort(function (a, b) {
         if (a.username < b.username) {
         return -1;
         } else if (a.username > b.username) {
         return 1;
         } else {
         return 0
         }
         });
         }
         resolve(narratives);
         }.bind(this))
         .catch(function (err) {
         reject(err);
         })
         .done();
         }.bind(this));
         }
         },
         
         getApps: {
         value: function () {
         return Utils.promise(this.narrativeMethodStoreClient, 'list_apps', {});
         }
         },
         
         getMethods: {
         value: function () {
         return Utils.promise(this.narrativeMethodStoreClient, 'list_methods', {});
         }
         },
         
         getCollaborators: {
         value: function (options) {
         var users = (options && options.users)?options.users:[];
         users.push(Session.getUsername());
         return Q.promise(function (resolve, reject, notify) {
         this.getNarratives({
         params: {
         excludeGlobal: 1
         }
         })
         .then(function (narratives) {
         this.getPermissions(narratives)
         .then(function (narratives) {
         var collaborators = {};
         // var currentUser = Session.getUsername();
         
         for (var i = 0; i < narratives.length; i++) {
         // make sure logged in user is here
         // make sure subject user is here
         // I hate this crud, but there ain't no generic array search.
         var perms = narratives[i].permissions;
         
         
         // make sure all users are either owner or in the permissions list.
         var pass = true;
         if (_.some(users, function (user) {
         if (narratives[i].workspace.owner === user ||
         _.find(perms, function (x) {return x.username === user})) {
         return false;
         } else {
         return true;
         }
         })) {
         continue;
         }
         
         // Remove participants and the public user.
         var perms = perms.filter(function (x) {
         if (_.contains(users, x.username) ||
         x.username === '*') {
         return false;
         } else {
         return true;
         }
         });
         
         // And what is left are all the users who are collaborating on this same narrative.
         // okay, now we have a list of all OTHER people sharing in this narrative.
         // All of these folks are common collaborators.
         perms.forEach(function (x) {
         Utils.incrProp(collaborators, x.username)
         });
         }
         var collabs = Utils.object_to_array(collaborators, 'username', 'count');
         var usersToFetch = collabs.map(function (x) {
         return x.username
         });
         Utils.promise(this.userProfileClient, 'get_user_profile', usersToFetch)
         .then(function (data) {
         try {
         for (var i = 0; i < data.length; i++) {
         // it is possible that a newly registered user, not even having a stub profile,
         // are in this list?? If so, remove that user from the network.
         // TODO: we need a way to report these cases -- they should not occur or be very rare.
         if (!data[i] || !data[i].user) {
         console.log('WARNING: user ' + usersToFetch[i] + ' is a sharing partner but has no profile.');
         // this.logWarning('collaboratorNetwork', 'user ' + collaboratorUsers[i] + ' is a sharing partner but has no profile.');
         } else {
         collabs[i].realname = data[i].user.realname;
         }
         }
         collabs = collabs.filter(function (x) {
         return (x.realname ? true : false)
         });
         resolve(collabs);
         } catch (ex) {
         console.log('EX:');
         console.log(ex);
         reject(ex);
         }
         }.bind(this))
         .catch(function (err) {
         reject(err);
         })
         .done();
         }.bind(this))
         .catch(function (err) {
         reject(err);
         })
         .done();
         }.bind(this))
         .catch(function (err) {
         reject(err);
         });
         }.bind(this));
         }
         },
         });
         */


    });