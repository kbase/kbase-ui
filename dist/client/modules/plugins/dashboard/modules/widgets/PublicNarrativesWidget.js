define(["jquery","kb_dashboard_widget_base","kb/service/serviceApi","kb/widget/widgets/buttonBar","bluebird","bootstrap"],function(a,b,c,d,e){"use strict";var f=Object.create(b,{init:{value:function(a){return a.name="PublicNarrativesWidget",a.title="Public Narratives",this.DashboardWidget_init(a),this.params.limit=10,this.view="slider",this.templates.env.addFilter("appName",function(a){return this.getState(["appsMap",a,"name"],a)}.bind(this)),this.templates.env.addFilter("methodName",function(a){return this.getState(["methodsMap",a,"name"],a)}.bind(this)),this}},getAppName:{value:function(a){return this.getState(["appsMap",a,"name"],a)}},getMethodName:{value:function(a){return this.getState(["methodsMap",a,"name"],a)}},setup:{value:function(){this.kbservice=c.make({runtime:this.runtime})}},renderLayout:{value:function(){this.container.html(this.renderTemplate("layout")),this.places={title:this.container.find('[data-placeholder="title"]'),alert:this.container.find('[data-placeholder="alert"]'),content:this.container.find('[data-placeholder="content"]')}}},setupUI:{value:function(){this.hasState("narratives")&&this.getState("narratives").length>0&&(this.buttonbar=Object.create(d).init({container:this.container.find('[data-placeholder="buttonbar"]')}),this.buttonbar.clear().addInput({placeholder:"Search",place:"end",onkeyup:function(b){var c,d=this.places.title;d.hasClass("collapsed")&&(c=d.attr("data-target"),a(c).collapse("show")),this.filterState({search:a(b.target).val()})}.bind(this)}))}},render:{value:function(){this.error?this.renderError():this.runtime.getService("session").isLoggedIn()?(this.places.title.html(this.widgetTitle),this.places.content.html(this.renderTemplate(this.view))):(this.places.title.html(this.widgetTitle),this.places.content.html(this.renderTemplate("unauthorized")));var a=this;return a.container.find('[data-toggle="popover"]').popover(),a.container.find('[data-toggle="tooltip"]').tooltip(),this}},filterState:{value:function(a){if(!a.search||0===a.search.length)return void this.setState("narrativesFiltered",this.getState("narratives"));var b=new RegExp(a.search,"i"),c=this.getState("narratives").filter(function(a){return a.workspace.metadata.narrative_nice_name.match(b)||a.object.metadata.cellInfo&&function(a){for(var c in a){var d=a[c];if(d.match(b)||this.getAppName(d).match(b))return!0}}.bind(this)(Object.keys(a.object.metadata.cellInfo.app))||a.object.metadata.cellInfo&&function(a){for(var c in a){var d=a[c];if(d.match(b)||this.getMethodName(d).match(b))return!0}}.bind(this)(Object.keys(a.object.metadata.cellInfo.method))?!0:!1}.bind(this));this.setState("narrativesFiltered",c)}},onStateChange:{value:function(){var a=this.doState("narratives",function(a){return a.length},null),b=this.doState("narrativesFiltered",function(a){return a.length},null);this.viewState.setItem("publicNarratives",{count:a,filtered:b})}},setInitialState:{value:function(a){return e["try"](function(){return this.runtime.getService("session").isLoggedIn()?e.all([this.kbservice.getNarratives({params:{showDeleted:0,excludeGlobal:0}}),this.kbservice.getApps(),this.kbservice.getMethods()]).then(function(a){var b=a[0],c=a[1],d=a[2];this.setState("apps",c);var e={};c.forEach(function(a){e[a.id]=a}),this.setState("appsMap",e),this.setState("methods",d);var f={};return d.forEach(function(a){f[a.id]=a}),this.setState("methodsMap",f),0===b.length?void this.setState("narratives",[]):(b=b.filter(function(a){return a.workspace.owner===this.runtime.getService("session").getUsername()||"n"!==a.workspace.user_permission?!1:!0}.bind(this)),this.kbservice.getPermissions(b).then(function(a){a=a.sort(function(a,b){return b.object.saveDate.getTime()-a.object.saveDate.getTime()}),this.setState("narratives",a),this.setState("narrativesFiltered",a)}.bind(this)))}.bind(this)):void 0}.bind(this))}}});return f});