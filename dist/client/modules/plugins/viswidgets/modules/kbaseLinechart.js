define(["jquery","d3","kb_vis_visWidget"],function(a,b){"use strict";a.KBWidget({name:"kbaseLinechart",parent:"kbaseVisWidget",version:"1.0.0",options:{overColor:"yellow",useOverLine:!0,useLineLabelToolTip:!0,lineWidth:3,lineCap:"round",strokeColor:"black",fillColor:"none",strokeOpacity:1,fillOpacity:.3,xIncrementor:function(a){return void 0!==a?a+1:0},useHighlightLine:!0,highlightLineColor:"red",highlightLineWidth:1,shapeArea:64,xInset:.1,yInset:.1},_accessors:[],extractLegend:function(a){var b=[];a.forEach(function(a,c){b.push({color:a.strokeColor,label:a.label,shape:a.shape})}),this.setLegend(b)},setDataset:function(b){var c=this;b.forEach(function(b,d){if(b.values){for(var e=[],f=b.values.length,g=c.options.xIncrementor,h=g(),i=0;f>i;i++){var j=b.values[i];a.isPlainObject(j)?(j.x?h=g(j.x):j.x=h,j.y2&&(e.push({x:j.x,y:j.y2}),delete j.y2)):(b.values[i]={x:h,y:j},h=g(h))}if(e.length){for(var i=e.length-1;i>=0;i--)b.values.push(e[i]);b.values.push(b.values[0])}}}),this._super(b)},defaultXDomain:function(){if(void 0===this.dataset())return[0,0];var a=[b.min(this.dataset(),function(a){return b.min(a.values.map(function(a){return a.x}))}),b.max(this.dataset(),function(a){return b.max(a.values.map(function(a){return a.x}))})],c=Math.max(this.options.xInset*a[0],this.options.xInset*a[1]);return a[0]-=c,a[1]+=c,a},defaultYDomain:function(){if(void 0===this.dataset())return[0,0];var a=[b.min(this.dataset(),function(a){return b.min(a.values.map(function(a){return a.y}))}),b.max(this.dataset(),function(a){return b.max(a.values.map(function(a){return a.y}))})],c=Math.max(this.options.yInset*a[0],this.options.yInset*a[1]);return a[0]-=c,a[1]+=c,a},renderChart:function(){if(void 0!==this.dataset()){var a=this.chartBounds(),c=this,d=b.svg.line().x(function(a){return c.xScale()(a.x)}).y(function(a){return c.yScale()(a.y)}),e=function(){return this.attr("d",function(a){return d(a.values)}).attr("stroke",function(a){return a.strokeColor||c.options.strokeColor}).attr("fill",function(a){return a.fillColor||c.options.fillColor}).attr("fill-opacity",function(a){return a.fillOpacity||c.options.fillOpacity}).attr("stroke-opacity",function(a){return a.strokeOpacity||c.options.strokeOpacity}).attr("stroke-width",function(a){return void 0!==a.width?a.width:c.options.lineWidth}).attr("stroke-linecap",function(a){return a.linecap||c.options.lineCap}).attr("stroke-dasharray",function(a){return a.dasharray}),this},f=function(){return c.options.useOverLine?(this.on("mouseover",function(a){c.options.overColor&&b.select(this).attr("stroke",c.options.overColor).attr("stroke-width",(a.width||c.options.lineWidth)+5),a.label&&c.options.useLineLabelToolTip&&c.showToolTip({label:a.label})}).on("mouseout",function(a){c.options.overColor&&(b.select(this).attr("stroke",function(a){return a.strokeColor||c.options.strokeColor}).attr("stroke-width",function(a){return void 0!==a.width?a.width:c.options.lineWidth}),c.options.useLineLabelToolTip&&c.hideToolTip())}),this):void 0};if(this.options.hGrid&&this.yScale){var g=b.svg.axis().scale(this.yScale()).orient("left").tickSize(0-a.size.width).outerTickSize(0).tickFormat(""),h=this.D3svg().select(this.region("chart")).select(".yAxis");void 0===h[0][0]&&(h=this.D3svg().select(this.region("chart")).append("g").attr("class","yAxis axis").attr("transform","translate(0,0)")),h.transition().call(g),h.selectAll("line").style("stroke","lightgray")}var i=this.data("D3svg").select(this.region("chart")).selectAll(".line").data(this.dataset(),function(a){return a.label});i.enter().append("path").attr("class","line").call(e).call(f),i.call(f).transition().duration(this.options.transitionTime).call(e),i.exit().remove();var j=c.linesDrawn?c.options.transitionTime:0,k=[];this.dataset().forEach(function(a,b){a.values.forEach(function(b,d){if(a.shape||b.shape){var e={};for(var f in b)e[f]=b[f];e.color=b.color||a.fillColor||a.strokeColor||c.options.fillColor,e.shape=b.shape||a.shape,e.shapeArea=b.shapeArea||a.shapeArea||c.options.shapeArea,e.pointOver=b.pointOver||a.pointOver||c.options.pointOver,e.pointOut=b.pointOut||a.pointOut||c.options.pointOut,e.id=[b.x,b.y,a.label].join("/"),k.push(e)}})});var l=c.data("D3svg").select(c.region("chart")).selectAll(".point").data(k,function(a){return a.id});if(l.enter().append("path").attr("class","point").attr("opacity",0).attr("transform",function(a){return"translate("+c.xScale()(a.x)+","+c.yScale()(a.y)+")"}).on("mouseover",function(a){c.options.overColor&&b.select(this).attr("fill",c.options.overColor),a.label?c.showToolTip({label:a.label}):a.pointOver&&a.pointOver.call(c,a)}).on("mouseout",function(a){c.options.overColor&&b.select(this).attr("fill",function(a){return a.color}),a.label?c.hideToolTip():a.pointOut&&a.pointOut.call(c,a)}),l.transition().duration(j).attr("transform",function(a){return"translate("+c.xScale()(a.x)+","+c.yScale()(a.y)+")"}).attr("d",function(a){return b.svg.symbol().type(a.shape).size(a.shapeArea)()}).attr("fill",function(a){return a.color}).attr("opacity",1),l.exit().transition().duration(j).attr("opacity",0).remove(),this.options.useHighlightLine){var m=this.data("D3svg").select(this.region("chart")).selectAll(".highlight").data([0]);m.enter().append("line").attr("x1",a.size.width/2).attr("x2",a.size.width/2).attr("y1",0).attr("y2",a.size.height).attr("opacity",0).attr("stroke",this.options.highlightLineColor).attr("stroke-width",this.options.highlightLineWidth).attr("pointer-events","none"),this.data("D3svg").select(this.region("chart")).on("mouseover",function(a){m.attr("opacity",1)}).on("mousemove",function(a){var c=b.mouse(this);m.attr("x1",c[0]).attr("x2",c[0]).attr("opacity",1)}).on("mouseout",function(a){m.attr("opacity",0)})}this.linesDrawn=!0}},setYScaleRange:function(a,b){return this._super(a.reverse(),b)}})});