define([
    'jquery',
    'kb_widgetBases_kbWidget'
], function ($) {
    'use strict';
    $.KBWidget({
        name: "kbaseAuthenticatedWidget",
        version: "1.0.0",
        _accessors: [
            {name: 'auth', setter: 'setAuth'},
            'sessionId',
            'authToken',
            'user_id',
            'loggedInCallback',
            'loggedOutCallback',
            'loggedInQueryCallback'
        ],
        options: {
            auth: undefined
        },
        init: function (options) {
            this._super(options);
            // An authenticated widget needs to get the initial auth state
            // from the KBaseSessionSync jquery extension.
            // var sessionObject = Session.getKBaseSession();
            this.setAuth(this.runtime.getService('session').getKbaseSession());

            // This is how to pull the value out of the auth attribute.
            // var auth = this.auth();
            if (this.loggedInQueryCallback && this.authToken()) {
                this.callAfterInit(function () {
                    // use the current auth attribute value, since this is run asynchronously, and who knows,
                    // it may have changed.
                    this.loggedInQueryCallback(this.auth());
                }.bind(this));
            }
            return this;
        },
        setAuth: function (newAuth) {
            if (newAuth === undefined || newAuth === null) {
                newAuth = {};
            }
            this.setValueForKey('auth', newAuth);
            this.sessionId(newAuth.kbase_sessionid);
            this.authToken(newAuth.token);
            this.user_id(newAuth.user_id);
        },
        loggedInQueryCallback: function (args) {
            if (this.loggedInCallback) {
                this.loggedInCallback(undefined, args);
            }
        }
    });
});
