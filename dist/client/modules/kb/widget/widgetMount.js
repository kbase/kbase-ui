define(["bluebird","kb/common/dom","kb/common/html"],function(a,b,c){"use strict";function d(d){function e(){return a["try"](function(){if(j){var b=j.widget;return a["try"](function(){return b.stop&&b.stop()}).then(function(){return b.detach&&b.detach()}).then(function(){return b.destroy&&b.destroy()})}return null})}function f(d,e){return a["try"](function(){return k.getService("widget").makeWidget(d,{})}).then(function(a){if(void 0===a)throw new Error("Widget could not be created: "+d);return j={id:c.genId(),widget:a,container:null,state:"created"},[a,a.init&&a.init()]}).spread(function(a){var c=b.createElement("div");return c.id=j.id,i.innerHTML="",b.append(i,c),j.container=c,[a,a.attach&&a.attach(c)]}).spread(function(a){return[a,a.start&&a.start(e)]}).spread(function(a){return a.run&&a.run(e)})}function g(d,e){return a["try"](function(){if(j){var b=j.widget;return a["try"](function(){return b.stop&&b.stop()}).then(function(){return b.detach&&b.detach()}).then(function(){return b.destroy&&b.destroy()})}}).then(function(){return k.getService("widget").makeWidget(d,{})}).then(function(a){if(void 0===a)throw new Error("Widget could not be created: "+d);return j={id:c.genId(),widget:a,container:null,state:"created"},[a,a.init&&a.init()]}).spread(function(a){var c=b.createElement("div");return c.id=j.id,i.innerHTML="",b.append(i,c),j.container=c,[a,a.attach&&a.attach(c)]}).spread(function(a){return[a,a.start&&a.start(e)]}).spread(function(a){return a.run&&a.run(e)})}var h,i,j,k;if(h=d.node,!h)throw new Error('Cannot create widget mount without a parent node. Pass it as "node"');if(k=d.runtime,!k)throw new Error("The widget mounter needs a runtime object in order to find and mount widgets.");return i=b.createElement("div"),i=h.appendChild(i),i.id=c.genId(),{mountWidget:g,mount:f,unmount:e}}return{make:function(a){return d(a)}}});