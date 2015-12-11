define(["jquery","d3","kb_vis_visWidget"],function(a,b){"use strict";a.KBWidget({name:"kbaseTreechart",parent:"kbaseVisWidget",version:"1.0.0",options:{debug:!1,xGutter:0,xPadding:0,yGutter:0,yPadding:0,bgColor:"none",red:void 0,blue:void 0,distance:100,redBlue:!1,strokeWidth:1.5,transitionTime:500,lineStyle:"curve",fixed:0,displayStyle:"NTnt",nodeHeight:15,labelSpace:10,circleRadius:4.5,circleStroke:"steelblue",openCircleFill:"lightsteelblue",closedCircleFill:"#FFF",lineStroke:"#ccc",staticWidth:!1,staticHeight:!1,canShrinkWidth:!0,bias:"root"},_accessors:["comparison"],calculateNodeDepths:function(a){a.forEach(function(a){if(!a.children){a.nodeDepth=0;for(var b=a.parent,c=1;void 0!==b;)(void 0===b.nodeDepth||b.nodeDepth<c)&&(b.nodeDepth=c),c++,b=b.parent}})},afterInArray:function(a,b){var c=b.indexOf(a)+1;return c>=b.length&&(c=0),b[c]},countVisibleLeaves:function(a){var b=0;if(void 0===a.children||a.open!==!0&&void 0!==a.open)b=1;else for(var c=0;c<a.children.length;c++)b+=this.countVisibleLeaves(a.children[c]);return b},findInChildren:function(a,b){if(a===b)return!0;if(void 0!==b&&void 0!==b.children)for(var c=0;c<b.children.length;c++)if(this.findInChildren(a,b.children[c]))return!0;return!1},redBlue:function(a,c){var d=this;d.options.red===c&&(d.options.red=void 0,d.options.redNode=void 0),d.options.blue===c&&(d.options.blue=void 0,d.options.blueNode=void 0);var e=["red","black"];void 0!==d.options.red&&void 0!==d.options.blue?(d.options.red.fill="black",b.select(d.options.redNode).attr("fill",d.options.red.fill),d.options.red=void 0,e=["red","black"]):void 0!==d.options.red?e=["blue","black"]:void 0===d.options.red&&void 0!==d.options.blue&&(e=["red","black"]),c.fill=d.afterInArray(c.fill,e),"black"===c.fill||void 0===c.children||d.findInChildren(d.options.red,c)||d.findInChildren(d.options.blue,c)||(d.toggle(c),d.updateTree(c)),"black"!==c.fill&&(d.options[c.fill]=c,d.options[c.fill+"Node"]=a),b.select(a).attr("fill",c.fill),void 0!==d.options.red&&void 0!==d.options.blue?d.comparison("Comparing "+d.options.red.name+" vs "+d.options.blue.name):d.comparison("")},defaultNodeClick:function(a){this.findInChildren(this.options.red,a)||this.findInChildren(this.options.blue,a)||(this.toggle(a),this.updateTree(a))},defaultTextClick:function(a,b){this.options.redBlue&&this.redBlue(b,a)},nodeState:function(a){return a.children?"open":a._children?"closed":"leaf"},depth:function(a,b,c){return this.options.depth?this.options.depth.call(this,a,b,c):this.defaultDepth(a,b,c)},defaultDepth:function(a,b,c){var d=this.options.distance;return void 0!==a.distance&&(d*=a.distance),void 0!==a.parent?d+=this.depth(a.parent,b,c):d=b+c,d},uniqueness:function(a){if(void 0===a.id){var b=a.name;void 0===b&&void 0!==this.options.nameFunction&&(b=this.options.nameFunction.call(this,a)),void 0!==a.parent&&(b=this.uniqueness(a.parent)+"/"+b),a.id=b}return a.id},updateTree:function(b){function c(a,b){var c=a[0][0].getBBox(),d=b.children||b._children?b.y+e.options.labelSpace:b.y+c.width+e.options.labelSpace,f=b.children||b._children?b.y+e.options.labelSpace-c.width:b.y+e.options.labelSpace;return[f,d,d-f]}for(var d=this.data("D3svg").select(this.region("chart")),e=this,f=this.initialized?this.options.transitionTime:0,g=0,h=this.chartBounds(),i=(document.createElement("div"),b);void 0!==i.parent;)i=i.parent;var j=d.append("text").attr("style","visibility : hidden; font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;").attr("class","fake").text(i.name);g=j[0][0].getBBox().width+e.options.labelSpace+h.origin.x;var k=this.options.nodeHeight*this.countVisibleLeaves(this.dataset());this.height(this.$elem.height()),h.size.height=k,this.treeLayout=this.layoutType().size([h.size.height,h.size.width]),this.nodes=this.treeLayout.nodes(this.dataset()).reverse(),this.calculateNodeDepths(this.nodes);var l=0,m=0,n=5e9;e.options.fixedDepth=0,this.nodes.forEach(function(a){a.y=e.depth(a,g,l),a.y>e.options.fixedDepth&&(e.options.fixedDepth=a.y)}),this.nodes.forEach(function(a){a.y=e.depth(a,g,l),a.y=!e.options.fixed||a.children&&0!==a.children.length?a.y:e.options.fixedDepth,void 0===a.name&&e.options.nameFunction&&(a.name=e.options.nameFunction.call(e,a));var b=d.append("text").attr("style","visibility : hidden;font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;").attr("class","fake").text(a.name),f=c(b,a),h=f[0],i=f[1];if(a.width=f[2],e.options.labelWidth&&a.width>e.options.labelWidth){var j=a.name.split(/\s+/),k=[j.shift()];b.text(k.join(" "));for(var o=0;c(b,a)[2]<e.options.labelWidth&&o++<40;)k.push(j.shift()),b.text(k.join(" "));j.push(k.pop()),a.name_truncated=k.join(" ")}i>m&&(m=i),n>h&&(n=h)});var o=0;n<h.origin.x&&(o+=h.origin.x-n,l=o),m>h.origin.x+h.size.width&&(o+=m-h.size.width),d.selectAll(".fake").remove();var p=this.options.xGutter+this.options.yGutter+o+h.size.width;p<e.options.originalWidth&&!e.options.canShrinkWidth&&(p=e.options.originalWidth),p=this.options.staticWidth?e.options.originalWidth:p,k=this.options.staticHeight?e.options.originalHeight:k+this.options.yGutter+this.options.yPadding,this.$elem.animate({width:p,height:k},f);var q=d.selectAll("g.tree-node").data(this.nodes,function(a){return e.uniqueness(a)}),r=q.enter().append("g").attr("class","tree-node").attr("data-node-id",function(a){return e.uniqueness(a)}).attr("opacity",0).attr("transform",function(a){return"translate("+b.y0+","+b.x0+")"});r.append("circle").attr("class","circle").attr("r",1e-6).attr("style","cursor : pointer;").attr("stroke",function(a){return a.stroke||e.options.circleStroke}).style("fill",function(a){return a._children?e.options.openCircleFill:e.options.closedCircleFill}).on("click",function(b){e.oneClick?e.options.nodeDblClick&&(e.oneClick=!1,e.options.nodeDblClick.call(e,b,this)):(e.oneClick=!0,setTimeout(a.proxy(function(){if(e.oneClick){if(e.oneClick=!1,e.options.nodeClick)return e.options.nodeClick.call(e,b,this);e.defaultNodeClick(b,this)}},this),250))}).on("mouseover",function(a){e.options.nodeOver?e.options.nodeOver.call(e,a,this):a.tooltip&&e.showToolTip({label:a.tooltip})}).on("mouseout",function(a){e.options.nodeOut?e.options.nodeOut.call(e,a,this):a.tooltip&&e.hideToolTip()}),r.append("text").attr("class","tree-nodeText").attr("data-text-id",function(a){return e.uniqueness(a)}).attr("style","font-size : 11px;cursor : pointer;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;").attr("dy",".35em").text(function(a){var b=a.name;return a.width>e.options.labelWidth&&e.options.truncationFunction&&(b=e.options.truncationFunction(a,this,e)),b}).style("fill-opacity",1e-6).attr("fill",function(a){return a.fill||"black"}).on("click",function(b){e.oneClick?e.options.textDblClick&&(e.oneClick=!1,e.options.textDblClick.call(e,b,this)):(e.oneClick=!0,setTimeout(a.proxy(function(){return e.oneClick?(e.oneClick=!1,e.options.textClick?e.options.textClick.call(e,b,this):e.defaultTextClick(b,this)):void 0},this),250))}).on("mouseover",function(a){e.options.textOver&&e.options.textOver.call(e,a,this)}).on("mouseout",function(a){e.options.textOut&&e.options.textOut.call(e,a,this)}),r.each(function(a,b){e.options.nodeEnterCallback&&e.options.nodeEnterCallback.call(e,a,b,this,f)});var s=q.transition().duration(f).attr("opacity",1).attr("transform",function(a){var b=!e.options.fixed||a.children&&0!==a.length?a.y:e.options.fixedDepth;return"leaf"===e.options.bias&&void 0!==a.parent&&(b=e.options.fixedDepth-a.nodeDepth*e.options.distance),"translate("+b+","+a.x+")"});s.select("circle").attr("r",function(a){return a.radius||e.options.circleRadius}).attr("stroke",function(a){return a.stroke||e.options.circleStroke}).style("fill",function(a){return a._children?e.options.openCircleFill:e.options.closedCircleFill}).attr("visibility",function(a){var b=!0;return a.children&&a.children.length&&(b=!1),b&&e.options.displayStyle.match(/n/)?"visible":!b&&e.options.displayStyle.match(/N/)?"visible":b&&e.options.displayStyle.match(/c/)&&void 0!==a.name&&a.name.length>0?"visible":!b&&e.options.displayStyle.match(/C/)&&void 0!==a.name&&a.name.length>0?"visible":"hidden"}),s.select("text").style("fill-opacity",1).attr("x",function(a){return a.children?0-e.options.labelSpace:e.options.labelSpace}).attr("text-anchor",function(a){return a.children?"end":"start"}).attr("visibility",function(a){var b=!0;return a.children&&a.children.length&&(b=!1),b&&e.options.displayStyle.match(/t/)?"visible":!b&&e.options.displayStyle.match(/T/)?"visible":"hidden"}),s.each(function(a,b){e.options.nodeUpdateCallback&&e.options.nodeUpdateCallback.call(e,a,b,this,f)});var t=q.exit().transition().duration(f).attr("opacity",0).attr("transform",function(a){return"translate("+b.y+","+b.x+")"}).remove();t.select("circle").attr("r",1e-6),t.select("text").style("fill-opacity",1e-6),t.each(function(a,b){e.options.nodeExitCallback&&e.options.nodeExitCallback.call(e,a,b,this,f)});var u=d.selectAll("path.tree-link").data(e.treeLayout.links(e.nodes),function(a){return e.uniqueness(a.target)});u.enter().insert("path","g").attr("class","tree-link").attr("data-link-id",function(a){return e.uniqueness(a.target)}).attr("fill","none").attr("stroke",function(a){return a.target.lineStroke||e.options.lineStroke}).attr("d",function(a){var c={x:b.x0,y:b.y0};return e.diagonal({source:c,target:c})}).on("mouseover",function(a){e.options.lineOver&&e.options.lineOver.call(e,a,this)}).on("mouseout",function(a){e.options.lineOut&&e.options.lineOut.call(e,a,this)}).transition().duration(f).attr("d",e.diagonal),u.transition().duration(f).attr("stroke-width",function(a){var b=a.target.weight||e.options.strokeWidth;return"function"==typeof b&&(b=b.call(e,a)),b+"px"}).attr("d",e.diagonal),u.exit().transition().duration(f).attr("opacity",0).attr("d",function(a){var c={x:b.x,y:b.y};return e.diagonal({source:c,target:c})}).remove(),e.nodes.forEach(function(a){a.x0=a.x,a.y0=a.y})},layoutType:function(){return"cluster"===this.options.layout?b.layout.cluster():void 0===this.options.layout?b.layout.tree():this.options.layout},renderChart:function(){function a(b){b.children&&(b.children.forEach(a),b.open===!1&&d.toggle(b))}if(void 0!==this.dataset()){this.options.originalWidth=this.$elem.width(),this.options.originalHeight=this.$elem.height();var c=this.chartBounds();void 0===this.treeLayout&&(this.treeLayout=this.layoutType().size([c.size.height,c.size.width]));var d=this,e=function(a){var b=a.source.y,c=!d.options.fixed||a.target.children&&0!==a.target.children.length?a.target.y:d.options.fixedDepth;return"leaf"===d.options.bias&&void 0!==a.source.nodeDepth&&void 0!==a.target.nodeDepth&&(c=d.options.fixedDepth-a.target.nodeDepth*d.options.distance,b=d.options.fixedDepth-a.source.nodeDepth*d.options.distance,void 0===a.source.parent&&(b=a.source.y)),{source:b,target:c}};"curve"===this.options.lineStyle?this.diagonal=b.svg.diagonal().projection(function(a){var b=!d.options.fixed||a.children&&0!==a.length?a.y:d.options.fixedDepth;return[b,a.x]}):"straight"===this.options.lineStyle?this.diagonal=function(a){var b=e(a);return"M"+b.source+","+a.source.x+"L"+b.target+","+a.target.x}:"square"===this.options.lineStyle?this.diagonal=function(a){var b=e(a);return"M"+b.source+","+a.source.x+"L"+b.source+","+a.target.x+"L"+b.target+","+a.target.x}:"step"===this.options.lineStyle&&(this.diagonal=function(a){var b=e(a),c=(b.target-b.source)/2+b.source;return"M"+b.source+","+a.source.x+"L"+c+","+a.source.x+"L"+c+","+a.target.x+"L"+b.target+","+a.target.x}),this.nodes=this.treeLayout.nodes(this.dataset()).reverse(),this.calculateNodeDepths(this.nodes),this.dataset().x0=c.size.height/2,this.dataset().y0=0;var f=this.dataset();f.children&&f.children.forEach(a),this.updateTree(this.dataset()),this.initialized=!0}},toggle:function(a){void 0!==a.children?(a._children=a.children,a.children=null,a.open=!1):(a.children=a._children,a._children=null,a.open=!0)}})});