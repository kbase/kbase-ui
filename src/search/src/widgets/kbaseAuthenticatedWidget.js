/*

*/

(function( $, undefined ) {

  'use strict';
    $.KBWidget({

        name: "kbaseAuthenticatedWidget",

        version: "1.0.0",
        _accessors : [
            {name : 'auth', setter: 'setAuth'},
            'sessionId',
            'authToken',
            'user_id',
            'loggedInCallback',
            'loggedOutCallback',
            'loggedInQueryCallback'
        ],
        options: {
            auth : undefined
        },

        init: function(options) {

            this._super(options); 
            
            // An authenticated widget needs to get the initial auth state
            // from the KBaseSessionSync jquery extension.
            var sessionObject = $.KBaseSessionSync.getKBaseSession();
            this.setAuth(sessionObject);
            
            // This is how to pull the value out of the auth attribute.
            var auth = this.auth();
            if (this.loggedInQueryCallback && auth && auth.token) {
              this.callAfterInit(function () {
                // use the current auth attribute value, since this is run asynchronously, and who knows,
                // it may have changed.
                 this.loggedInQueryCallback(this.auth());
              }.bind(this));
            }
           
           /*
           just disable login and logout listening for now. It is not enough 
            to just change the cached auth info (which is a mistake as well)
            the widget needs to re-render as well, and there are no apparent hooks
            for this. it is unknown now any widget might implement this, since
            the practice has been to wipe the page and refresh 
           this.subscriptions = [];
          
            
            this.subscriptions.push(postal.channel('session').subscribe('login.success', function (session) {
                this.setAuth(session);
                if (this.loggedInCallback) {
                    this.loggedInCallback(undefined, this.auth());
                }
            }.bind(this)));

            this.subscriptions.push(postal.channel('session').subscribe('logout.success', function () {
                if (!this.destroying) {
                    try {
                        this.setAuth(null);
                    } catch (ex) {
                        console.error('Error calling setAuth in widget ' + this.name);
                        console.error(ex);
                    }
                    if (this.loggedOutCallback) {
                        this.loggedOutCallback();
                    }
                }
            }.bind(this))); 
            */
            

            /*
            TODO:used anywhere?
            NB: used to initialize the session in this widget, but 
            it relies on the SYNCHRONOUS nature of jquery events.
            IMHO this is not good, because it obscures the nature
            of what is going on here -- a simple method call of a 
            global object which knows about session state.
            $(document).trigger(
                'loggedInQuery',
                $.proxy(function (auth) {
                //console.log("CALLS LIQ");
                    this.setAuth(auth);

                    if (auth.kbase_sessionid) {
                        this.callAfterInit(
                            $.proxy(function() {
                                if (this.loggedInQueryCallback) {
                                    this.loggedInQueryCallback(auth)
                                }
                            }, this)
                        );
                    }
                }, this)
            );
            */

            return this;

        },
        
        /*
         
         destroy: function () {
            this.destroying = true;
            this.subscriptions.forEach(function (sub) {
                sub.unsubscribe();
            });
            this.subscriptions = [];
        },
        */

        setAuth : function (newAuth) {
            if (newAuth === undefined || newAuth === null) {
              newAuth = {};
            }
            this.setValueForKey('auth', newAuth);
           
            this.sessionId(newAuth.kbase_sessionid);
            this.authToken(newAuth.token);
            this.user_id(newAuth.user_id);
        },

        loggedInQueryCallback : function(args) {
            if (this.loggedInCallback) {
                this.loggedInCallback(undefined,args);
            }
        },

    });

}( jQuery ) );
