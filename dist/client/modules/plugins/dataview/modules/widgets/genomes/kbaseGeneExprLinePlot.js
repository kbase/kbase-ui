!function(a,b){a.KBWidget({name:"KBaseGeneExprLinePlot",parent:"kbaseWidget",version:"1.0.0",options:{title:"Gene expression line plot",featureID:null,workspaceID:null,row:null,isInCard:!0,width:2e3,height:500,loadingImage:"assets/img/ajax-loader.gif",kbCache:null},expressionServiceUrl:"http://kbase.us/services/expression",init:function(a){this._super(a);var b=this;return this.index=[],this.values=[],this.conditions=[],this.gene_label=[],null==this.options.row||1==this.options.row.length?(this.expressionClient=new KBaseExpression(this.expressionServiceUrl,{token:this.options.auth,user_id:this.options.userId}),this.expressionClient.get_expression_data_by_samples_and_features([],[this.options.featureID],"Log2 level intensities",function(c){if(null!=c){var d=1;for(var e in c)if(c.hasOwnProperty(e)){var f=c[e];for(var g in f)f.hasOwnProperty(g)&&(null!=f[g]&&null!=e?(b.values[b.values.length]=f[g],b.conditions[b.conditions.length]=e,b.index[b.index.length]=d,d++):console.log("undefined "+d+"	"+f[g]+"	"+e))}b.gene_label=a.featureID,b.render()}})):(this.index=this.options.row[3],this.values=this.options.row[0],this.conditions=this.options.row[1],this.gene_label=this.options.featureID),this},render:function(b){var c=this;if(null!=c.values&&c.values.length>0){var d=a("<b><i>Hover over line ticks for condition info. Click on line tick to go to workspace object.</i></b>"),e=a("<center><img src='"+c.options.loadingImage+"'> loading ...</center>");c.$elem.append(d),c.$elem.append(e),$mainDiv=a('<div id="exprlineplotview" style="overflow:auto;height:450px;resize:vertical">'),$lineChartDiv=a("<div id='linechart'>"),$mainDiv.append($lineChartDiv),c.$elem.append($mainDiv.get(0));var f=c.values,g=c.conditions;c.values.sort(function(a,b){return a-b});var h=[];for(i=0;i<f.length;i++){var j=c.values.indexOf(f[i]);h[h.length]=j}for(i=0;i<g.length;i++)c.conditions[h[i]]=g[i];c.gene_label=c.gene_label.replace(/\|/g,"_"),c.gene_label=c.gene_label.replace(/\./g,"_"),c.tooltip=d3.select("body").append("div").classed("kbcb-tooltip",!0);var k=[40,40,300,80],l=c.options.width-k[1]-k[3],m=c.options.height-k[0]-k[2],n=d3.select($lineChartDiv.get(0)).append("svg").attr("width",l+k[1]+k[3]).attr("height",m+k[0]+k[2]).append("svg:g").attr("transform","translate("+k[3]+","+k[0]+")"),o=function(a,b){return null!=c.conditions[b]?c.conditions[b]:void 0},p=d3.scale.linear().domain([0,c.values.length-1]).range([0,l]);if(c.conditions.length<300){var q=d3.svg.axis().scale(p).ticks(c.conditions.length).tickFormat(o);n.append("svg:g").attr("class","x axis").attr("transform","translate(0,"+m+")").call(q).selectAll("g.x.axis > g.tick > text").style("text-anchor","end").attr("dx","-.9em").attr("dy",".17em").attr("transform",function(a){return"rotate(-80)"}).on("mouseover",function(a){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).darker()),c.tooltip=c.tooltip.text(c.conditions[a]),c.tooltip.style("visibility","visible")}).on("mouseout",function(){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).brighter()),c.tooltip.style("visibility","hidden")}).on("mousemove",function(){return c.tooltip.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX-10+"px")}).on("click",function(a){var b=document.URL.indexOf("/functional-site"),d=document.URL.substring(0,b);temp1=c.conditions[a].indexOf("|"),temp2=c.conditions[a].indexOf("_");var e=c.conditions[a].substring(temp1+1,temp2);window.open(d+"/functional-site/#/ws/json/KBasePublicExpression/kb%7C"+e,"_blank")})}c.$elem.find("g.axis > path").css({display:"none"}),c.$elem.find("g.axis > line").css({stroke:"lightgrey"}),c.$elem.find("g.x.axis > .minor").css({"stroke-opacity":1}),c.$elem.find(".axis").css({"shape-rendering":"crispEdges"}),c.$elem.find(".y.axis > .tick.major > line, .y.axis > path").css({fill:"none",stroke:"#000"});var r=d3.scale.linear().domain([Math.min.apply(Math,c.values),d3.max(c.values)]).range([m,0]),s=d3.svg.axis().scale(r).orient("left");n.append("svg:g").attr("class","y axis").attr("transform","translate(-25,0)").call(s).append("text").attr("font-size","large").attr("class","y label").attr("text-anchor","end").attr("y",-45).attr("dy",".75em").attr("transform","rotate(-90)").text("Log2 level");var t=[];for(i=0;i<c.values.length;i++)t.push({value:c.values[i],condition:c.conditions[i],gene_label:c.gene_label});var u=d3.svg.line().defined(function(a){return null!=a.value}).x(function(a,b){return p(b)}).y(function(a){return r(a.value)});n.selectAll("#_"+c.gene_label).data(t).enter().append("path").attr("d",u(t)).attr("id","_"+c.gene_label).style({"stroke-width":1,stroke:"steelblue",fill:"none"}).on("mouseover",function(a){return d3.select(this).style("stroke",d3.rgb(d3.select(this).style("stroke")).darker()),c.tooltip=c.tooltip.text(a.condition),c.tooltip.style("visibility","visible")}).on("mouseout",function(){return d3.select(this).style("stroke",d3.rgb(d3.select(this).style("stroke")).brighter()),c.tooltip.style("visibility","hidden")}).on("mousemove",function(){return c.tooltip.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX-10+"px")});if(e.hide(),n.append("svg:g").attr("class","y axis").attr("transform","translate(-25,0)").call(s),drawTicks=!0,drawTicks){n.selectAll(".selectionTicks").data(t).enter().append("rect").attr("x",function(a,b){return p(b)}).attr("y",function(a){return r(a.value)-10}).attr("height",20).attr("width",2).attr("fill",function(a){return null!=a.value?"steelblue":"white"}).attr("id",function(a){return"_"+a.gene_label}).on("mouseover",function(a){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).darker()),c.tooltip=c.tooltip.text(a.condition),c.tooltip.style("visibility","visible")}).on("mouseout",function(){return d3.select(this).style("fill",d3.rgb(d3.select(this).style("fill")).brighter()),c.tooltip.style("visibility","hidden")}).on("mousemove",function(){return c.tooltip.style("top",d3.event.pageY+15+"px").style("left",d3.event.pageX-10+"px")}).on("click",function(a){var b=document.URL.indexOf("/functional-site"),c=document.URL.substring(0,b);temp1=a.condition.indexOf("|"),temp2=a.condition.indexOf("_");var d=a.condition.substring(temp1+1,temp2);window.open(c+"/functional-site/#/ws/json/KBasePublicExpression/kb%7C"+d,"_blank")})}n.append("text").attr("class","graph title").attr("text-anchor","end").attr("x",(l+k[1]+2*k[3])/2).attr("y",-20).text(c.conditions.length+" gene expression samples")}else c.$elem.append("<b>No gene expression data mapped to this gene or genome.</b>");return this},getData:function(){return{type:"LineChartCard",row:this.options.row,featureID:this.options.featureID,workspaceID:this.options.workspaceId,auth:this.options.auth,userId:this.options.userId,title:"Gene expression line plot"}}})}(jQuery);