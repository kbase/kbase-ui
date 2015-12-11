!function(a,b){a.KBWidget({name:"KBaseGeneOperon",parent:"kbaseWidget",version:"1.0.0",options:{featureID:null,auth:null,loadingImage:null,svgWidth:500,svgHeight:100,trackMargin:5,trackThickness:15,leftMargin:5,topMargin:20,arrowSize:10,start:0,length:0,width:550},cdmiURL:"https://kbase.us/services/cdmi_api",proteinInfoURL:"https://kbase.us/services/protein_info_service",init:function(b){return this._super(b),null===this.options.featureID?this:(this.$messagePane=a("<div/>").addClass("kbwidget-message-pane").addClass("kbwidget-hide-message"),this.$elem.append(this.$messagePane),this.cdmiClient=new CDMI_API(this.cdmiURL),this.entityClient=new CDMI_EntityAPI(this.cdmiURL),this.proteinInfoClient=new ProteinInfo(this.proteinInfoURL),this.render())},render:function(){this.options.loadingImage&&this.showMessage("<img src='"+this.options.loadingImage+"'/>");var a=this;return this.proteinInfoClient.fids_to_operons([this.options.featureID],function(b){b=b[a.options.featureID];var c="Feature is not part of an operon.";b&&b.length>1?(a.tooltip=d3.select("body").append("div").classed("kbcb-tooltip",!0),a.svg=d3.select(a.$elem[0]).append("svg").attr("width",a.options.svgWidth).attr("height",a.options.svgHeight).classed("kbcb-widget",!0),a.trackContainer=a.svg.append("g"),a.xScale=d3.scale.linear().domain([a.options.start,a.options.start+a.options.length]).range([0,a.options.svgWidth]),a.xAxis=d3.svg.axis().scale(a.xScale).orient("top").tickFormat(d3.format(",.0f")),a.axisSvg=a.svg.append("g").attr("class","kbcb-axis").attr("transform","translate(0, "+a.options.topMargin+")").call(a.xAxis),a.cdmiClient.fids_to_feature_data(b,function(b){a.renderFromRange(b)},a.clientError)):a.$elem.append(c),a.hideMessage()},function(b){a.hideMessage(),a.$elem.append("Gene cannot be mapped to an operon.  Operons may not be fully computed for this Genome."),console.log("Caught error in protein info service, which can happen if the fid cannot be mapped to a mo id:"+JSON.stringify(b))}),this},track:function(){var a={};return a.regions=[],a.min=1/0,a.max=-(1/0),a.numRegions=0,a.addRegion=function(a){for(var b=0;b<a.length;b++){var c=Number(a[b][1]),d=Number(a[b][3]),e="+"===a[b][2]?c+d-1:c-d+1;if(c>e){var f=e;e=c,c=f}this.regions.push([c,e]),c<this.min&&(this.min=c),e>this.max&&(this.max=e),this.numRegions++}},a.hasOverlap=function(a){for(var b=0;b<a.length;b++){var c=Number(a[b][1]),d=Number(a[b][3]),e="+"===a[b][2]?c+d-1:c-d+1;if(c>e){var f=e;e=c,c=f}for(var g=0;g<this.regions.length;g++){var h=this.regions[g];if(!(c<=h[0]&&e<=h[0]||c>=h[1]&&e>=h[1]))return!0}}return!1},a},setContig:function(a){a&&this.options.contig!==a&&(this.options.centerFeature=null,this.operonFeatures=[],this.options.contig=a);var b=this;this.cdmiClient.contigs_to_lengths([this.options.contig],function(a){b.contigLength=parseInt(a[b.options.contig]),b.options.start=0,b.options.length>b.contigLength&&(b.options.length=b.contigLength)}),this.options.centerFeature?this.setCenterFeature():this.update()},setCenterFeature:function(a){a&&(this.options.centerFeature=a);var b=this;this.proteinInfoClient.fids_to_operons([this.options.centerFeature],function(a){b.operonFeatures=a[b.options.centerFeature],b.update()},function(a){b.throwError(a)})},setGenome:function(a){this.options.genomeId=a;cdmiAPI.genomes_to_contigs([a],function(b){setContig(this.genomeList[a][0])})},setRange:function(a,b){this.options.start=a,this.options.length=b,this.update()},processFeatures:function(a){var c=[];c[0]=this.track();var d=[];for(fid in a)d.push(a[fid]);a=d,a.sort(function(a,b){return a.feature_location[0][1]-b.feature_location[0][1]});for(var e=0;e<a.length;e++){for(var f=a[e],g=0;g<c.length;g++)if(!c[g].hasOverlap(f.feature_location)){c[g].addRegion(f.feature_location),f.track=g;break}if(f.track===b){var h=c.length;c[h]=this.track(),c[h].addRegion(f.feature_location),f.track=h}}return this.numTracks=c.length,a},adjustHeight:function(){var a=this.numTracks*(this.options.trackThickness+this.options.trackMargin)+this.options.topMargin+this.options.trackMargin;a>this.svg.attr("height")&&this.svg.attr("height",a)},renderFromRange:function(a){a=this.processFeatures(a);var b=1/0,c=-(1/0);for(var d in a)for(var e=a[d],f=0;f<e.feature_location.length;f++){var g=e.feature_location[f],h=Number(g[1]);"-"===g[2]&&(h-=Number(g[3])+1);var i=Number(g[1]);"+"===g[2]&&(i+=Number(g[3])-1),b>h&&(b=h),i>c&&(c=i)}this.options.start=b,this.options.length=c-b+1;var j=this;this.options.allowResize&&this.adjustHeight();var k=this.trackContainer.selectAll("path").data(a,function(a){return a.feature_id});k.enter().append("path").classed("kbcb-feature",!0).classed("kbcb-operon",function(a){return j.isOperonFeature(a)}).classed("kbcb-center",function(a){return j.isCenterFeature(a)}).attr("id",function(a){return a.feature_id}).on("mouseover",function(a){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).darker()),j.tooltip=j.tooltip.text(a.feature_id+": "+a.feature_function),j.tooltip.style("visibility","visible")}).on("mouseout",function(){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).brighter()),j.tooltip.style("visibility","hidden")}).on("mousemove",function(){return j.tooltip.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX-10+"px")}).on("click",function(a){j.trigger("featureClick",{feature:a,featureElement:this})}),k.exit().remove(),k.attr("d",function(a){return j.featurePath(a)}),j.xScale=j.xScale.domain([j.options.start,j.options.start+j.options.length]),j.xAxis=j.xAxis.scale(j.xScale),j.axisSvg.call(j.xAxis)},featurePath:function(a){for(var b="",c=[],d=0;d<a.feature_location.length;d++){var e=a.feature_location[d],f=this.calcXCoord(e),g=this.calcYCoord(e,a.track),h=this.calcHeight(e),i=this.calcWidth(e);c.push([f,f+i]),b+="+"===e[2]?this.featurePathRight(f,g,h,i)+" ":this.featurePathLeft(f,g,h,i)+" "}if(a.feature_location.length>1){c.sort(function(a,b){return a[0]-b[0]});for(var j=this.calcYCoord(a.feature_location[0],a.track)+this.calcHeight(a.feature_location[0])/2,d=0;d<c.length-1;d++)b+="M"+c[d][1]+" "+j+" L"+c[d+1][0]+" "+j+" Z "}return b},featurePathRight:function(a,b,c,d){var e="M"+a+" "+b;return e+=d>this.options.arrowSize?" L"+(a+(d-this.options.arrowSize))+" "+b+" L"+(a+d)+" "+(b+c/2)+" L"+(a+(d-this.options.arrowSize))+" "+(b+c)+" L"+a+" "+(b+c)+" Z":" L"+(a+d)+" "+(b+c/2)+" L"+a+" "+(b+c)+" Z"},featurePathLeft:function(a,b,c,d){var e="M"+(a+d)+" "+b;return e+=d>this.options.arrowSize?" L"+(a+this.options.arrowSize)+" "+b+" L"+a+" "+(b+c/2)+" L"+(a+this.options.arrowSize)+" "+(b+c)+" L"+(a+d)+" "+(b+c)+" Z":" L"+a+" "+(b+c/2)+" L"+(a+d)+" "+(b+c)+" Z"},calcXCoord:function(a){var b=a[1];return"-"===a[2]&&(b=a[1]-a[3]+1),(b-this.options.start)/this.options.length*this.options.svgWidth},calcYCoord:function(a,b){return this.options.topMargin+this.options.trackMargin+this.options.trackMargin*b+this.options.trackThickness*b},calcWidth:function(a){return Math.floor((a[3]-1)/this.options.length*this.options.svgWidth)},calcHeight:function(a){return this.options.trackThickness},isCenterFeature:function(a){return a.feature_id===this.options.featureID},isOperonFeature:function(a){return!0},getData:function(){return{type:"Operon",id:this.options.featureID,workspace:this.options.workspaceID,title:"Operon"}},showMessage:function(b){var c=a("<span/>").append(b);this.$messagePane.append(c),this.$messagePane.removeClass("kbwidget-hide-message")},hideMessage:function(){this.$messagePane.addClass("kbwidget-hide-message"),this.$messagePane.empty()},clientError:function(a){console.debug(a)}})}(jQuery);