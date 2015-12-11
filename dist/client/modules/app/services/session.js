define(["kb/common/session","kb/common/observed"],function(a,b){"use strict";function c(c){function d(){return n.getAuthToken()}function e(){return n.getUsername()}function f(){return n.isLoggedIn()}function g(){return n.getKbaseSession()}function h(a){return n.login(a).then(function(){o.setItem("loggedin",!0),m.send("session","loggedin")})}function i(){return n.logout().then(function(){o.setItem("loggedin",!1),m.send("session","loggedout")})}function j(){n.setSession(n.importFromCookie()),f()?(o.setItem("loggedin",!0),m.send("session","loggedin")):(o.setItem("loggedin",!1),m.send("session","loogedout"))}function k(){n=null}function l(a){o.listen("loggedin",{onSet:function(b){a(b)}})}var m=c.runtime,n=a.make({cookieName:c.cookieName,extraCookieNames:c.extraCookieNames,loginUrl:c.loginUrl,cookieMaxAge:c.cookieMaxAge||1e5}),o=b.make();return{start:j,stop:k,onChange:l,getAuthToken:d,getUsername:e,isLoggedIn:f,getKbaseSession:g,login:h,logout:i}}return{make:function(a){return c(a)}}});