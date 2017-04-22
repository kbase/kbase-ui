(function ($) {
    'use strict';
    var SessionSync = Object.create({}, {
        init: {
            value: function (cfg) {
                this.refreshSession();
                return this;
            }
        },

        session: {
            value: null,
            writable: true
        },
        sessionObject: {
            value: null,
            writable: true
        },
        cookieName: {
            value: 'kbase_session'
        },

        getKBaseSession: {
            value: function () {
                return this.refreshSession();
            }
        },

        refreshSession: {
            value: function () {
                try {
                    this.sessionObject = this.importSessionFromCookie();
                } catch (ex) {
                    console.error('ERROR: kbaseSessionSync.refreshSession');
                    console.error('Error reading session cookie, resetting session.');
                    this.sessionObject = null;
                }
                if (this.sessionObject && this.sessionObject.token === null) {
                    this.sessionObject = null;
                }
                return this.sessionObject;
            }
        },

        sessionChanged: {
            value: function () {
                var sessionCookie = $.cookie(this.cookieName);
                if (this.sessionCookie === sessionCookie) {
                    return false;
                } else {
                    return true;
                }
            }
        },

        importSessionFromCookie: {
            value: function () {
                var sessionCookie = $.cookie(this.cookieName);

                if (!sessionCookie) {
                    return null;
                }

                var session = {
                    token: sessionCookie,
                    un: 'no-user',
                    user_id: 'no-user',
                    kbase_session_id: 'no-session-id'
                };
                return session;
            }
        },
        validateKBaseSessionObject: {
            value: function (sessionObject) {
                if (!sessionObject) {
                    return false;
                }
                // Validate the structure.
                if (!(sessionObject.kbase_sessionid && sessionObject.un && sessionObject.user_id && sessionObject.token)) {
                    return false;
                }
                return true;
            }
        },

        isLoggedIn: {
            value: function () {
                if (this.getKBaseSession()) {
                    return true;
                } else {
                    return false;
                }
            }
        }

    });
    $.KBaseSessionSync = SessionSync.init();
}(jQuery));