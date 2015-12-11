define(["underscore"],function(a){"use strict";return function(){function b(a){var c,d=typeof a;return"string"===d?a:"boolean"===d?a?"true":"false":"number"===d?String(a):"object"===d&&a.push?(c="",a.forEach(function(a){c+=b(a)}),c):"object"===d?(c="",c+="<"+d.tag,a.attributes&&a.attributes.keys().forEach(function(b){c+=b+'="'+a.attributes[b]+'"'}),c+=">",a.children&&(c+=b(a.children)),c+="</"+a.tag+">"):void 0}function c(a){return a.replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()})}function d(a){if(a){var b=Object.keys(a).map(function(b){var d=a[b],b=c(b);return"string"==typeof d?b+": "+d:""});return b.filter(function(a){return a?!0:!1}).join("; ")}return""}function e(a){if(a){var b=Object.keys(a).map(function(b){var c=a[b];return"string"==typeof c?b+":"+c:"object"==typeof c?b+": {"+e(c)+"}":""});return b.filter(function(a){return a?!0:!1}).join(",")}return""}function f(a){var b='"';if(a){var f=Object.keys(a).map(function(f){var g=a[f],h=c(f);if("object"==typeof g)switch(h){case"style":g=d(g);break;case"data-bind":b="'",g=e(g)}if("string"==typeof g){var i=g.replace(new RegExp("\\"+b,"g"),"\\"+b);return h+"="+b+i+b}if("boolean"==typeof g){if(g)return h}else if("number"==typeof g)return h+"="+b+String(g)+b;return!1});return f.filter(function(a){return a?!0:!1}).join(" ")}return""}function g(b){return b?a.isString(b)?b:a.isNumber(b)?String(b):a.isArray(b)?b.map(function(a){return g(a)}).join(""):void 0:""}function h(b,c){return c=c||{},t[b]||(t[b]=function(d,e){var h="<"+b;if(a.isArray(d))e=d;else if(a.isString(d))e=d;else if(a.isNull(d)||a.isUndefined(d))e="";else if(a.isObject(d)){var i=f(d);i&&i.length>0&&(h+=" "+i)}else if(d)if(a.isNumber(d))e=""+d;else{if(!a.isBoolean(d))throw"Cannot make tag "+b+" from a "+typeof d;e=d?"true":"false"}else;return h+=">",c.close!==!1&&(h+=g(e),h+="</"+b+">"),h}),t[b]}function i(){return u+=1,"kb_html_"+u}function j(a){var b,c=h("table"),d=h("thead"),e=h("tbody"),f=h("tr"),g=h("th"),j=h("td");a=a||{},a.id?b=a.id:(b=i(),a.generated={id:b});var k={id:b};return a["class"]?k["class"]=a["class"]:a.classes&&(k["class"]=a.classes.join(" ")),c(k,[d(f(a.columns.map(function(a){return g(a)}))),e(a.rows.map(function(a){return f(a.map(function(a){return j(a)}))}))])}function k(a,b){var c=h("div"),d=h("span");return c({"class":"panel panel-default"},[c({"class":"panel-heading"},[d({"class":"panel-title"},a)]),c({"class":"panel-body"},[b])])}function l(a){var b=h("div"),c=h("span"),d=a["class"]||"default";return b({"class":"panel panel-"+d},[b({"class":"panel-heading"},[c({"class":"panel-title"},a.title)]),b({"class":"panel-body"},[a.content])])}function m(a){var b,c=h("span"),d=(h("img"),h("i"));return a&&(b=a+"... &nbsp &nbsp"),c([b,d({"class":"fa fa-spinner fa-pulse fa-2x fa-fw margin-bottom"})])}function n(a){function b(a){var b;if("string"==typeof a)b=a;else{if(a.label)return a.label;b=a.key}return b.replace(/(id|Id)/g,"ID").split(/_/g).map(function(a){return a.charAt(0).toUpperCase()+a.slice(1)}).join(" ")}function c(a,b){if("string"==typeof b)return a;if(b.format)return b.format(a);if(b.type)switch(b.type){case"bool":return a?"True":"False";default:return a}return a}var d=h("table"),e=h("tr"),f=h("th"),g=h("td"),j=i(),k={id:j};a["class"]?k["class"]=a["class"]:a.classes&&(k["class"]=a.classes.join(" "));var l=d(k,a.columns.map(function(d,h){return e([f(b(d)),a.rows.map(function(a){return g(c(a[h],d))})])}));return l}function o(a,b){function c(a){var b;return a.label?a.label:(b="string"==typeof a?a:a.key,b.replace(/(id|Id)/g,"ID").split(/_/g).map(function(a){return a.charAt(0).toUpperCase()+a.slice(1)}).join(" "))}function d(a,b){var c=a[b.key];if(b.format)return b.format(c);if(b.type)switch(b.type){case"bool":return c?"True":"False";default:return c}return c}var e=h("table"),f=h("tr"),g=h("th"),i=h("td"),j=e({"class":"table table-stiped table-bordered"},b.map(function(b){return f([g(c(b)),a.map(function(a){return i(d(a,b))})])}));return j}function p(a,b){function c(a){var b;return a.label?a.label:(b="string"==typeof a?a:a.key,b.replace(/(id|Id)/g,"ID").split(/_/g).map(function(a){return a.charAt(0).toUpperCase()+a.slice(1)}).join(" "))}function d(a,b){var c=a[b.key];if(b.format)return b.format(c);if(b.type)switch(b.type){case"bool":return c?"True":"False";default:return c}return c}b=b?b.map(function(a){return"string"==typeof a?{key:a}:void 0}):Object.keys(a).map(function(a){return{key:a}});var e=h("table"),f=h("tr"),g=h("th"),i=h("td"),j=e({"class":"table table-stiped table-bordered"},b.map(function(b){return f([g(c(b)),i(d(a,b))])}));return j}function q(b){if(a.isString(b))return b;if(a.isArray(b))return b.map(function(a){return q(a)}).join("");throw new Error("Not a valid html representation -- must be string or list")}function r(b){if(a.isArray(b.items)){var c=h("ul"),d=h("li");return c(b.items.map(function(a){return d(a)}))}return"Sorry, cannot make a list from that"}function s(a){var b=h("ul"),c=h("li"),d=h("a"),e=h("div"),f=a.id,g={};return f&&(g.id=f),a.tabs.forEach(function(a){a.id=i()}),e(g,[b({"class":"nav nav-tabs",role:"tablist"},a.tabs.map(function(a,b){var e={role:"presentation"};return 0===b&&(e["class"]="active"),c(e,d({href:"#"+a.id,"aria-controls":"home",role:"tab","data-toggle":"tab"},a.label))})),e({"class":"tab-content"},a.tabs.map(function(a,b){var c={role:"tabpanel","class":"tab-pane",id:a.id};return a.name&&(c["data-name"]=a.name),0===b&&(c["class"]+=" active"),e(c,a.content)}))])}var t={},u=0;return{html:b,tag:h,makeTable:j,makeTableRotated:n,makeRotatedTable:o,makeObjectTable:p,genId:i,bsPanel:k,panel:k,makePanel:l,loading:m,flatten:q,makeList:r,makeTabs:s}}()});