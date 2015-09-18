/*global define: true */
/*jslint browser:true  vars: true */
/* NB: kb.config is used here rather than runtime because the session is loaded
 * as a singleton.
 * TODO: just create as a normal object, and the runtime will take care of creating
 * a singleton...
 */
define([
    'jquery', 
    'bluebird', 
    'kb.cookie', 
    'kb.config', 
    'kb.logger'
],
    function ($, Promise, Cookie, Config, Logger) {
        'use strict';
        var Session = Object.create({}, {
            // Property Constants

            version: {
                value: '0.1.0',
                writable: false
            },

            /**
             * The standard name of the KBase session cookie.
             * 
             * @const {string}
             * @private
             */
            cookieName: {
                value: 'kbase_session',
                writable: false
            },
            /**
             * The standard name of the KBase session cookie used in the Narrative.
             * 
             * @const {string}
             * @private
             */
            narrCookieName: {
                value: 'kbase_narr_session',
                writable: false
            },
            // Property Variables

            /**
             * The span, from the instant a session cookie is created, after which the cookie will 
             * be deleted from the browser. Corresponds to the max-age attribute of a cookie. 
             * nb: this is set in @init from the configuration object.
             * 
             * @member {integer}
             * @private
             * 
             */
            cookieMaxAge: {
                value: null,
                writable: true
            },

            // Initializer

            /**
             * Initialize the object to a well defined starting state.
             * This includes creating instance properties, initializing data, setting 
             * default values.
             * 
             * @function init
             * 
             * @returns {Session} A reference to this object.                  
             *                   
             */
            init: {
                value: function () {
                    // The sessionObject is created in this method.
                    this.setSession(this.importSessionFromCookie());
                    // 1 hour is the default cookie max age.
                    this.cookieMaxAge = Config.getItem('ui.constants.session_max_age', 60 * 60);

                    return this;
                }
            },
            // API Methods


            // Implementation Methods

            /**
             * The canonical kbase session object, based on the kbase session
             * cookie, but removing a duplicated field and adding the parsed
             * token.
             * 
             * @typedef {Object} SessionObject
             * @property {string} user_id
             * @property {string} realname
             * @property {string} token
             * @property {string} sessionId
             * @property {TokenObject} tokenObject
             */

            /**
             * The token object as supplied by the Globus auth service. 
             * @todo: document the remainder of the fields
             * 
             * @typedef {Object} TokenObject
             * @property {string} un
             * @property {string} expiry
             * 
             */

            /**
             * Attempt to set the internal session object from the given 
             * session object.
             * 
             * @function setSession
             * @private
             * 
             * @param {SessionObject} obj - a session object
             * @returns {undefined}
             */
            setSession: {
                value: function (obj) {
                    if (this.validateSession(obj)) {
                        this.sessionObject = obj;
                    } else {
                        this.sessionObject = null;
                    }
                }
            },
            /**
             * Extract the cookie from the browser environment, parse it, and 
             * validate it. This is the canonical interface betweek KBase ui
             * code and browser authentication.
             * 
             * @function importSessionFromCookie
             * @private
             * 
             * @returns {SessionObject|null} a kbase session object or null
             * if there is no valid session cookie.
             */
            importSessionFromCookie: {
                value: function () {
                    var sessionCookie = Cookie.getItem(this.cookieName);

                    if (!sessionCookie) {
                        return null;
                    }
                    // first pass just break out the string into fields.
                    var session = this.decodeToken(sessionCookie);

                    if (!(session.kbase_sessionid && session.un && session.user_id && session.token)) {
                        this.removeSession();
                        return null;
                    }
                    session.token = session.token.replace(/PIPESIGN/g, '|').replace(/EQUALSSIGN/g, '=');

                    // Ensure that we have localStorage.
                    var storageSessionString = localStorage.getItem(this.cookieName);
                    if (!storageSessionString) {
                        Logger.logWarning('Local Storage Cookie missing -- resetting session');
                        this.removeSession();
                        return null;
                    }

                    var storageSession = JSON.parse(storageSessionString);
                    if (session.token !== storageSession.token) {
                        Logger.logWarning('Local Storage Cookie token different than cookie token -- resetting session');
                        this.removeSession();
                        return null;
                    }

                    // now we have a session object equivalent to the one returned by the auth service.
                    var newSession = {
                        username: session.user_id,
                        token: session.token,
                        tokenObject: this.decodeToken(session.token),
                        sessionId: session.kbase_sessionid
                    };

                    if (this.validateSession(newSession)) {
                        return newSession;
                    } else {
                        return null;
                    }
                }
            },
            /**
             * Creates a valid standard Session Object from a raw session object
             * provided by Globus.
             * 
             * @function importSessionFromAuthObject
             * @private
             * 
             * @param {KBaseSessionObject} kbaseSession - the session object
             * returned from the KBase auth server
             * @returns {SessionObject|null} a validated Session Object, or null
             * if no session or an invalid session was provided.
             */
            importSessionFromAuthObject: {
                value: function (kbaseSession) {
                    // Auth object has fields un, user_id, kbase_sessionid, token. If any are missing, we void the session (if any)
                    // cookies and pretend we have nothing.
                    // NB: the object returned from the auth service does NOT have the un field.
                    if (!(kbaseSession.kbase_sessionid && kbaseSession.user_id && kbaseSession.token)) {
                        // throw new Error('Invalid Kbase Session Cookie');
                        this.removeSession();
                        return null;
                    }
                    var newSession = {
                        username: kbaseSession.user_id,
                        realname: kbaseSession.name,
                        token: kbaseSession.token,
                        tokenObject: this.decodeToken(kbaseSession.token),
                        sessionId: kbaseSession.kbase_sessionid
                    };

                    if (this.validateSession(newSession)) {
                        return newSession;
                    }
                    return null;
                }
            },
            /**
             * Forces the session object to be re-imported from the browser
             * cookie. Designed to be used by clients which want to ensure that
             * they have the very latest session. 
             * 
             * @function refreshSession
             * @public
             * 
             * @returns {SessionObject} the current session object.
             */
            refreshSession: {
                value: function () {
                    this.setSession(this.importSessionFromCookie());
                    return this.sessionObject;
                }
            },

            /**
             * 
             * The traditional KBase session layout, reflecting the fields set
             * in the browser cookie.
             * 
             * 
             * @typedef {Object} KBaseSessionObject
             * @property {string} token - The Globus auth token
             * @property {string} un - username as extracted from the Globus auth token
             * @property {string} user_id - same as un
             * @property {string} name - The user "full name" (globus) or
             * "user name" (kbase). Deprecated - user name should be taken from
             * the user profile. (See xxx)
             * @property {string} kbase_sessionid - Issued by the auth server,
             * used to uniquely identify this session amongst all other extant
             * sessions. ???
             * @todo Where is kbase_sessionid used??? Not in ui-common ...
             * 
             */

            /**
             * Returns the "KBase Session", for legacy usage. The legacy method
             * of accessing the session is to work directly with a session object,
             * rather than the api.
             * 
             * @function getKBaseSesssion
             * @public
             * 
             * @returns {KBaseSessionObject}
             */
            getKBaseSession: {
                value: function () {
                    this.refreshSession();
                    if (!this.sessionObject) {
                        return null;
                    }
                    return this.makeKBaseSession();
                }
            },
            makeKBaseSession: {
                value: function () {
                    if (!this.sessionObject) {
                        return null;
                    }
                    return {
                        un: this.sessionObject.username,
                        user_id: this.sessionObject.username,
                        name: this.sessionObject.realname,
                        token: this.sessionObject.token,
                        kbase_sessionid: this.sessionObject.sessionId
                    };
                }
            },
            /**
             * An object representation of the Globus authentication token.
             * 
             * @typedef {Object} GlobusAuthToken
             * 
             */

            /**
             * Decodes a Globus authentication token, transforming the token
             * plain string into a map of field names to values.
             * 
             * @function decodeToken
             * @private
             * 
             * @param {string} - A globus auth token
             * 
             * @returns {GlobusAuthToken} an object representing the decoded
             * token.
             */
            decodeToken: {
                value: function (token) {
                    var parts = token.split('|');
                    var map = {};
                    var i;
                    for (i = 0; i < parts.length; i++) {
                        var fieldParts = parts[i].split('=');
                        var key = fieldParts[0];
                        var value = fieldParts[1];
                        map[key] = value;
                    }
                    return map;
                }
            },
            /**
             * Given a session object, ensure that it is valid, to best of our
             * ability. It serves as the gateway between the externally stored
             * session cookie, and the internally stored session object.
             * 
             * It probably should not be the responsibility of the front end
             * to front end to evaluate the session -- that should be conducted
             * by a back-end service -- but this is the way it works now.
             * 
             * Validation consists of ensuring that the session object is complete,
             * and that it has not expired. The expiration date derives from the
             * Globus auth token. The evaluation of this is one of my bigger 
             * problems.
             * 
             * @function validateSession
             * @private
             * 
             * @param {Object} - the prospective session object
             * @returns {boolean} - if the session is valid.
             */
            validateSession: {
                value: function (sessionObject) {
                    if (sessionObject === undefined) {
                        sessionObject = this.sessionObject;
                    }
                    if (!sessionObject) {
                        return false;
                    }

                    if (!(sessionObject.sessionId && sessionObject.username && sessionObject.token && sessionObject.tokenObject)) {
                        return false;
                    }

                    if (this.hasExpired(sessionObject)) {
                        return false;
                    }
                    return true;
                }
            },
            /**
             * Determines if the session has expired by inspection of the expiry.
             * 
             * @function hasExpired
             * @private
             * 
             * @param {SessionObject} - a session object
             * @returns {boolean} true if the session has expired, false otherwise.
             */
            hasExpired: {
                value: function (sessionObject) {
                    var expirySec = sessionObject.tokenObject.expiry;
                    if (!expirySec) {
                        return false;
                    }
                    expirySec = parseInt(expirySec);
                    if (isNaN(expirySec)) {
                        return false;
                    }
                    var expiryDate = new Date(expirySec * 1000);
                    var diff = expiryDate - new Date();
                    if (diff <= 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            /**
             * Creates an session cookie string from the current session cookie.
             * 
             * @todo this is not a very good encoding method; needs to be fixed
             * @todo e.g. a field value which also contains delimiters.
             * 
             * @function makeSessionCookie
             * @private 
             * 
             * @returns {string|null} a session object formatted into a string
             * suitable for transport in a cookie.
             */
            makeSessionCookie: {
                value: function () {
                    var cookie = '';
                    cookie += 'un=' + this.sessionObject.username;
                    cookie += '|kbase_sessionid=' + this.sessionObject.sessionId;
                    cookie += '|user_id=' + this.sessionObject.username;
                    cookie += '|token=' + this.sessionObject.token.replace(/=/g, 'EQUALSSIGN').replace(/\|/g, 'PIPESIGN');
                    return cookie;
                }
            },
            /**
             * Create and set a session cookie in the browser.
             * 
             * Adds kbase_session cookie to browser
             * Adds kbase_narr_session to browser
             * Adds kbase_session object to local storage
             * 
             * @function setSessionCookie
             * @private
             * 
             * @returns {undefined} nothing
             */
            setSessionCookie: {
                value: function () {
                    if (this.sessionObject) {
                        var cookieString = this.makeSessionCookie();
                        Cookie.setItem(this.cookieName, cookieString, this.cookieMaxAge, '/');
                        Cookie.setItem(this.narrCookieName, cookieString, this.cookieMaxAge, '/');
                        var kbaseSession = this.makeKBaseSession();
                        // This is for compatability with the current state of the narrative ui, which uses this
                        // as a flag for being authenticated.
                        kbaseSession.success = 1;
                        localStorage.setItem(this.cookieName, JSON.stringify(kbaseSession));
                    }
                }
            },
            /**
             * Removes all traces of of the session from the users browser
             * 
             * @function removeSession
             * @private
             * 
             * @returns {undefined} nothing
             */
            removeSession: {
                value: function () {
                    Cookie.removeItem(this.cookieName, '/');
                    Cookie.removeItem(this.cookieName, '/', 'kbase.us');
                    Cookie.removeItem(this.narrCookieName, '/', 'kbase.us');
                    // Remove the localStorage session for compatability.
                    localStorage.removeItem(this.cookieName);

                    this.sessionObject = null;
                }
            },
            /**
             * typedef {Object} LoginCredentials
             * @property {string} username - the username
             * @property {string} password - the password
             * 
             */

            /**
             * Authenticate a user give a username and password with the kbase
             * auth service.
             * Named "login" for legacy purposes.
             * 
             * @function login
             * @public
             * 
             * @param {LoginCredentials} options - a authentication credentials, as would
             * be passed in from a login dialog.
             * 
             */
            login: {
                value: function (options) {
                    return new Promise(function (resolve, reject) {
                        // Uses the options args style, with success and error callbacks.
                        // The top layer of kbase widgets do not have Q available.

                        // Validate params.
                        if (!options.username || options.username.length === 0) {
                            reject('Username is empty: It is required for login');
                            //  options.error('Username is empty: It is required for login');
                            return;
                        }
                        if (!options.password || options.password.length === 0) {
                            reject('Password is empty: It is required for login');
                            //options.error('Password is empty: It is required for login');
                            return;
                        }

                        // NB: the cookie param determines whether the auth service will
                        // set a cookie or not. The cookie set only includes un and kbase_sessionid.
                        // It does not include the auth token, amazingly, which is required for all 
                        // service calls.
                        var loginParams = {
                            user_id: options.username,
                            password: options.password,
                            fields: 'un,token,user_id,kbase_sessionid,name',
                            status: 1
                        };

                        $.support.cors = true;
                        $.ajax({
                            type: 'POST',
                            url: Config.getItem('services.login.url'),
                            data: loginParams,
                            dataType: 'json',
                            crossDomain: true,
                            xhrFields: {
                                withCredentials: true
                            },
                            beforeSend: function (xhr) {
                                // make cross-site requests
                                xhr.withCredentials = true;
                            },
                            success: function (data, res, jqXHR) {
                                if (data.kbase_sessionid) {
                                    this.setSession(this.importSessionFromAuthObject(data));
                                    if (!options.disableCookie) {
                                        this.setSessionCookie();
                                    }
                                    // options.success(this.makeKBaseSession());
                                    resolve(this.makeKBaseSession());
                                } else {
                                    reject(data.error_msg);
                                    //options.error({
                                    //    status: 0,
                                    //    message: data.error_msg
                                    //});
                                }
                            }.bind(this),
                            error: function (jqXHR, textStatus, errorThrown) {
                                /* Some error cases
                                 * status == 401 - show "uid/pw = wrong!" message
                                 * status is not 401,
                                 *     and we have a responseJSON - if that's the "LoginFailure: Auth fail" error, show the same uid/pw wrong msg.
                                 *     and we do not have a responseJSON (or it's something else): show a generic message
                                 */
                                var errmsg = textStatus;
                                var wrongPwMsg = "The login attempt failed: Username &amp; Password combination are incorrect";
                                if (jqXHR.status && jqXHR.status === 401) {
                                    errmsg = wrongPwMsg;
                                } else if (jqXHR.responseJSON) {
                                    // if it has an error_msg field, use it
                                    if (jqXHR.responseJSON.error_msg) {
                                        errmsg = jqXHR.responseJSON.error_msg;
                                    }
                                    // if that's the unclear auth fail message, update it
                                    if (errmsg === "LoginFailure: Authentication failed.") {
                                        errmsg = wrongPwMg;
                                    }
                                }
                                // if we get through here and still have a useless error message, update that, too.
                                if (errmsg == "error") {
                                    errmsg = "Internal Error: Error connecting to the login server";
                                }
                                this.sessionObject = null;
                                this.error = {
                                    message: errmsg
                                }
                                // options.error(errmsg);
                                reject(errmsg);
                            }.bind(this)
                        });
                    }.bind(this));
                }
            },
            
            logout: {
                value: function () {
                    return new Promise(function (resolve) {
                        this.removeSession();
                        resolve();
                    }.bind(this));
                }
            },

            isLoggedIn: {
                value: function () {
                    if (this.sessionObject && this.sessionObject.token) {
                        return true;
                    }
                    return false;
                }
            },
            getProp: {
                value: function (propName, defaultValue) {
                    return Util.getProp(this.sessionObject, propName, defaultValue);
                }
            },
            getUsername: {
                value: function () {
                    if (this.sessionObject) {
                        return this.sessionObject.username;
                    }
                }
            },
            getRealname: {
                value: function () {
                    if (this.sessionObject) {
                        return this.sessionObject.realname;
                    }
                }
            },
            getSessionId: {
                value: function () {
                    if (this.sessionObject) {
                        return this.sessionObject.sessionId;
                    }
                }
            },
            getAuthToken: {
                value: function () {
                    if (this.sessionObject) {
                        return this.sessionObject.token;
                    }
                }
            }
        });
        
        var SingletonSession = Object.create(Session).init();
        return SingletonSession;
    });
