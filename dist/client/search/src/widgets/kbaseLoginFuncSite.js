!function(a){"use strict";a.KBWidget({name:"kbaseLogin",version:"1.1.0",options:{style:"text",loginURL:"https://kbase.us/services/authorization/Sessions/Login",possibleFields:["verified","name","opt_in","kbase_sessionid","token","groups","user_id","email","system_admin"],fields:["name","kbase_sessionid","user_id","token"]},cookieName:"kbase_session",narrCookieName:"kbase_narr_session",sessionObject:null,userProfile:null,init:function(b){return this._super(b),this.sessionObject=a.KBaseSessionSync.getKBaseSession(),this.$elem.empty(),this.renderWidget(),this.afterInit(),this},afterInit:function(){require(["postal","kb.widget.login"],function(a,b){a.channel("session").subscribe("profile.loaded",function(a){var b=a.profile;this.profile=a.profile,this.userProfile=b.getProfile()}.bind(this)),a.channel("session").subscribe("profile.saved",function(){this.fetchUserProfile()}.bind(this)),a.channel("session").subscribe("profile.get",function(a,b){b.reply(null,this.profile)}.bind(this)),a.channel("session").subscribe("login.success",function(a){var b=a.session.getKBaseSession();this.sessionObject=b,this.$elem.find('[data-element="user-label"]').html(this.get_user_label()),this.fetchUserProfile()}.bind(this)),a.channel("session").subscribe("logout.success",function(){this.sessionObject=null;var a=this.$elem;try{var c=b.init({container:a,name:"LoginWidget",title:"Login Widget"});c.render()}catch(d){console.log("Error"),console.log(d)}}.bind(this)),this.sessionObject&&this.fetchUserProfile()}.bind(this))},get_kbase_cookie:function(a){return this.sessionObject?this.get_session_prop(a):void 0},is_authenticated:function(){return this.get_session()?!0:(a.KBaseSessionSync.removeAuth(),!1)},get_session:function(){return this.sessionObject},get_prop:function(a,b,c){var d,e=b.split(".");for(d=0;d<e.length;d++){var f=e[d];if(void 0===a[f])return c;a=a[f]}return a},get_session_prop:function(a,b){return this.sessionObject?this.get_prop(this.sessionObject,a,b):b},session:function(a){return void 0===a?this.sessionObject:this.get_session_prop(a)},get_profile_prop:function(a,b){return this.userProfile?this.get_prop(this.userProfile,a,b):b},sessionId:function(){return this.get_session_prop("kbase_sessionid")},token:function(){return this.get_session_prop("token")},tickleSession:function(){require(["kb.session"],function(a){a.setAuthCookie()})},populateLoginInfo:function(a){this.sessionObject?this._error=null:this._error=a.message},error:function(a){return a&&(this._error=a),this._error},get_user_label:function(){return this.userProfile?this.get_profile_prop("user.realname")+'<br><i style="font-size=90%;">'+this.get_profile_prop("user.username")+"</i>":this.sessionObject?this.get_session_prop("user_id"):""},renderWidget:function(a){var b=this.$elem;require(["kb.widget.login"],function(a){try{var c=a.init({container:b,name:"LoginWidget",title:"Login Widget"});c.render()}catch(d){console.log("Error"),console.log(d)}})},fetchUserProfile:function(){require(["kb.user_profile","kb.session","kb.appstate","postal"],function(a,b,c,d){var e=Object.create(a).init({username:b.getUsername()});e.loadProfile().then(function(a){switch(a.getProfileStatus()){case"stub":case"profile":c.setItem("userprofile",a),d.channel("session").publish("profile.loaded",{profile:a});break;case"none":a.createStubProfile({createdBy:"session"}).then(function(a){c.setItem("userprofile",a),d.channel("session").publish("profile.loaded",{profile:a})})["catch"](function(a){d.channel("session").publish("profile.loadfailure",{error:a})}).done()}})["catch"](function(a){var b="Error getting user profile";d.channel("session").publish("profile.loadfailure",{error:a,message:b})}).done()})}})}(jQuery);