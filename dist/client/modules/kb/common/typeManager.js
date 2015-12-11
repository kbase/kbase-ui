define(["underscore","./props"],function(a,b){"use strict";function c(c){function d(a){var b=o.getItem(["types",a.type.module,a.type.name,"icon"])||p,c=b.classes.map(function(a){return a});switch(b.type){case"kbase":if(c.push("icon"),a.size)switch(a.size){case"small":c.push("icon-sm");break;case"medium":c.push("icon-md");break;case"large":c.push("icon-lg")}break;case"fontAwesome":c.push("fa")}return c?{classes:c,type:b.type,color:e(a.type),html:'<span class="'+c.join(" ")+'"></span>'}:void 0}function e(a){var b,c,d=0,e=["#F44336","#E91E63","#9C27B0","#3F51B5","#2196F3","#673AB7","#FFC107","#0277BD","#00BCD4","#009688","#4CAF50","#33691E","#2E7D32","#AEEA00","#03A9F4","#FF9800","#FF5722","#795548","#006064","#607D8B"];for(b=0;b<a.name.length;b+=1)d+=a.name.charCodeAt(b);return c=e[d%e.length]}function f(a){return o.hasItem(["types",a.module,a.name])?!0:!1}function g(b){var c=o.getItem(["types",b.type.module,b.type.name,"viewers"]);if(c){if(1===c.length)return c[0];var d=c.filter(function(a){return a["default"]?!0:!1});if(1===d.length){var e=a.extend({},d[0]);return delete e["default"],e}if(0!==d.length)throw new Error("Multiple default viewers defined for this widget")}}function h(a,b){var c=o.getItem(["types",a.module,a.name]);void 0===c&&o.setItem(["types",a.module,a.name],{viewers:[]});var d=o.getItem(["types",a.module,a.name,"viewers"]);d||(d=[],o.setItem(["types",a.module,a.name,"viewers"],d)),b["default"]&&d.forEach(function(a){a["default"]=!1}),d.push(b)}function i(a,b){var c=o.getItem(["types",a.module,a.name]);void 0===c||null===c?o.setItem(["types",a.module,a.name],{icon:b}):o.setItem(["types",a.module,a.name,"icon"],b)}function j(a){return o.getItem(["defaults",a])}function k(a){return a.module+"."+a.name+"-"+a.version.major+"."+a.version.minor}function l(a){var b=a.match(/^(.+?)\.(.+?)-(.+?)\.(.+)$/);if(!b)throw new Error("Invalid data type "+a);if(5!==b.length)throw new Error("Invalid data type "+a);return{module:b[1],name:b[2],version:{major:b[3],minor:b[4]}}}function m(){if(1===arguments.length){var a=arguments[0];if(a.version){var b=a.version.split(".");return{module:a.module,name:a.name,version:{major:b[0],minor:b[1]}}}}}function n(a){return a.version.major+"."+a.version.minor}var o=b.make({data:c.typeDefs}),p={type:"fontAwesome",classes:["fa-file-o"]};return{getIcon:d,setIcon:i,getViewer:g,getDefault:j,makeTypeId:k,parseTypeId:l,makeType:m,makeVersion:n,addViewer:h,hasType:f}}return{make:function(a){return c(a)}}});