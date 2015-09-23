define([], function () {

    var Cookie = Object.create({}, {
        init: {
            value: function () {
                return this;
            }
        },
        getItem: {
            value: function (sKey) {
                if (!sKey) {
                    return null;
                }
                return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
            }
        },
        setItem: {
            value: function (sKey, sValue, vEnd, sPath, sDomain, bSecure, bNoEncode) {
                if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                    return false;
                }
                var sExpires = "";
                if (vEnd) {
                    switch (vEnd.constructor) {
                        case Number:
                            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                            break;
                        case String:
                            sExpires = "; expires=" + vEnd;
                            break;
                        case Date:
                            sExpires = "; expires=" + vEnd.toUTCString();
                            break;
                    }
                }
                if (bNoEncode) {
                    // For compatability with services which do not decode cookies yet create cookies
                    // save for not encoding. Aka - Globus.
                    document.cookie = sKey + "=" + sValue + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
                } else {
                    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
                }

                return true;
            }
        },
        removeItem: {
            value: function (sKey, sPath, sDomain) {
                if (!this.hasItem(sKey)) {
                    return false;
                }
                document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
                return true;
            }
        },
        hasItem: {
            value: function (sKey) {
                if (!sKey) {
                    return false;
                }
                return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            }
        },
        keys: {
            value: function () {
                var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
                    aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
                }
                return aKeys;
            }
        }
    });
    Cookie.init();

    function decodeToken(token) {
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

    function importSessionFromAuthObject(kbaseSession) {
        // Auth object has fields un, user_id, kbase_sessionid, token. If any are missing, we void the session (if any)
        // cookies and pretend we have nothing.
        // NB: the object returned from the auth service does NOT have the un field.
        if (!(kbaseSession.kbase_sessionid && kbaseSession.user_id && kbaseSession.token)) {
            throw new Error('Invalid Kbase Session');
        }
        return {
            username: kbaseSession.user_id,
            realname: kbaseSession.name,
            token: kbaseSession.token,
            tokenObject: decodeToken(kbaseSession.token),
            sessionId: kbaseSession.kbase_sessionid
        };
    }

    function makeKBaseSession(sessionObject) {
        if (!sessionObject) {
            return null;
        }
        return {
            un: sessionObject.username,
            user_id: sessionObject.username,
            name: sessionObject.realname,
            token: sessionObject.token,
            kbase_sessionid: sessionObject.sessionId
        };
    }
    ;

    function makeKBaseSessionCookie(sessionObject) {
        var cookie = '';
        cookie += 'un=' + sessionObject.username;
        cookie += '|kbase_sessionid=' + sessionObject.sessionId;
        cookie += '|user_id=' + sessionObject.username;
        cookie += '|token=' + sessionObject.token.replace(/=/g, 'EQUALSSIGN').replace(/\|/g, 'PIPESIGN');
        return cookie;
    }
    ;

    function login(options) {
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
                url: 'https://kbase.us/services/authorization/Sessions/Login',
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
                        var session = importSessionFromAuthObject(data);
                        resolve(session.token);
                    } else {
                        reject(data.error_msg);
                    }
                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
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
                            errmsg = "Wrong password";
                        }
                    }
                    // if we get through here and still have a useless error message, update that, too.
                    if (errmsg === "error") {
                        errmsg = "Internal Error: Error connecting to the login server";
                    }
                    this.sessionObject = null;
                    this.error = {
                        message: errmsg
                    };
                    // options.error(errmsg);
                    reject(errmsg);
                }.bind(this)
            });
        }.bind(this));
    }
    
    function lpad(s,c,l) {
        var r = l - s.length;
        if (r <= 0) {
            return s;
        }
        var p = '';
        for (var i=0; i < r; i += 1) {
            p += c;
        }
        return p + s;
    }
    function rpad(s,c,l) {
        var r = l - s.length;
        if (r <= 0) {
            return s;
        }
        var p = '';
        for (var i=0; i < r; i += 1) {
            p += c;
        }
        return s + p;
    }
    
    function niceTime(date) {
        return lpad(String(date.getHours()), '0', 2) + ':' + 
               lpad(String(date.getMinutes()), '0', 2) + ':' + 
               lpad(String(date.getSeconds()), '0', 2) + '.' + 
               rpad(String(date.getMilliseconds()), '0', 3);
    }
    
   

    return {
        login: login,
        niceTime: niceTime
    };
});