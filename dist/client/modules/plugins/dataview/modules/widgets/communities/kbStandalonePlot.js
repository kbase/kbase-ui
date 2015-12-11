define(["jquery","uuid","kb_dataview_communities_jquerySvg"],function(a,b){"use strict";var c={about:{name:"plot",title:"Plot",author:"Tobias Paczian",version:"1.0"},defaults:{title:"",title_color:"black",default_line_color:"black",default_line_width:1,show_legend:!0,legend_position:"right",series:[],connected:!0,show_dots:!0,width:800,height:400,x_min:void 0,x_max:void 0,y_min:void 0,y_max:void 0,x_scale:"linear",y_scale:"linear",x_title:"",y_title:"",x_titleOffset:35,y_titleOffset:45,titleOffset:0,drag_select:null,data:void 0},options:[{general:[{name:"default_line_color",type:"color",description:"default color of the data lines of the plot",title:"default line color"},{name:"default_line_width",type:"int",description:"default width of the data lines of the plot in pixel",title:"default line width"},{name:"connected",type:"bool",description:"sets whether the data points are connected or not",title:"connected",defaultTrue:!0},{name:"show_dots",type:"bool",description:"sets whether the data points are displayed or not",title:"show dots",defaultTrue:!0}]},{text:[{name:"title",type:"text",description:"title string of the plot",title:"title"},{name:"title_color",type:"color",description:"color of the title string of the plot",title:"title color"},{name:"x_title",type:"text",description:"title of the x-axis of the plot",title:"x title"},{name:"y_title",type:"text",description:"title of the y-axis of the plot",title:"y title"},{name:"x_titleOffset",type:"int",description:"title offset from the x-axis",title:"x title offset"},{name:"y_titleOffset",type:"int",description:"title offset from the y-axis",title:"y title offset"},{name:"titleOffset",type:"int",description:"title offset from the top",title:"title offset"}]},{layout:[{name:"show_legend",type:"bool",description:"sets whether the legend is displayed or not",title:"show legend",defaultTrue:!0},{name:"width",type:"int",description:"width of the plot in pixel",title:"width"},{name:"height",type:"int",description:"height of the plot in pixel",title:"height"},{name:"legend_position",type:"select",description:"position of the legend",title:"legend position",options:[{value:"left",selected:!0},{value:"right"},{value:"top"},{value:"bottom"}]}]},{axes:[{name:"x_min",type:"int",description:"minimum value of the x-axis",title:"x min"},{name:"x_max",type:"int",description:"maximum value of the x-axis",title:"x max"},{name:"y_min",type:"int",description:"minimum value of the y-axis",title:"y min"},{name:"y_max",type:"int",description:"maximum value of the y-axis",title:"y max"},{name:"y_scale",type:"select",description:"type of the scale of the y-axis",title:"y scale",options:[{value:"linear",selected:!0},{value:"log"}]},{name:"x_scale",type:"select",description:"type of the scale of the x-axis",title:"x scale",options:[{value:"linear",selected:!0},{value:"log"}]}]}],exampleData:function(){return{series:[{name:"cool",color:"blue",shape:"circle"},{name:"uncool",color:"red",shape:"square"},{name:"semi-cool",color:"orange",shape:"triangle"}],points:[[{x:.5,y:7},{x:.15,y:5},{x:.5,y:15}],[{x:0,y:0},{x:.25,y:35},{x:.35,y:90}],[{x:.8,y:80},{x:.49,y:50},{x:.15,y:10}]]}},create:function(c){var d={settings:{},index:c.index};return a.extend(!0,d,this),a.extend(!0,d.settings,this.defaults,c),d.settings.id=b.v4(),d},render:function(){var b=this.settings.target;return b.innerHTML="<div class='plot_div'></div>",b.firstChild.setAttribute("style","width: "+this.settings.width+"px; height: "+this.settings.height+"px;"),a(b).find(".plot_div").svg(),this.drawImage(a(b).find(".plot_div").svg("get")),this},niceNum:function(a,b){var c,d=Math.floor(Math.log10(a)),e=a/Math.pow(10,d);return c=b?1.5>e?1:3>e?2:7>e?5:10:1>=e?1:2>=e?2:5>=e?5:10,c*Math.pow(10,d)},niceScale:function(a){var b=a.min,c=a.max,d=a.ticks||10,e=this.niceNum(c-b,!1),f=this.niceNum(e/(d-1),!0),g=Math.floor(b/f)*f,h=Math.ceil(c/f)*f;return{min:g,max:h,space:f}},drawImage:function(a){var b=[[.1,.1,.95,.9],[.2,.1,.95,.9],[.1,.1,.8,.9],[.1,.25,.9,.9],[.1,.1,.9,.8]],c=[[0,0,0,0],[.005,.1,.125,.5],[.85,.1,.97,.5],[.2,.1,.8,.2],[.2,.9,.8,.995]];if(void 0===this.settings.x_min){var d,e,f=void 0,g=void 0,h=void 0,i=void 0;for(d=0;d<this.settings.data.points.length;d++)for(e=0;e<this.settings.data.points[d].length;e++)(void 0===f||this.settings.data.points[d][e].x<f)&&(f=this.settings.data.points[d][e].x),(void 0===g||this.settings.data.points[d][e].x>g)&&(g=this.settings.data.points[d][e].x),(void 0===h||this.settings.data.points[d][e].y<h)&&(h=this.settings.data.points[d][e].y),(void 0===i||this.settings.data.points[d][e].y>i)&&(i=this.settings.data.points[d][e].y);var j=this.niceScale({min:f,max:g});this.settings.x_min=j.min,this.settings.x_max=j.max;var k=this.niceScale({min:h,max:i});this.settings.y_min=k.min,this.settings.y_max=k.max}for(a.plot.noDraw().title(this.settings.title,this.settings.titleOffset,this.settings.title_color,this.settings.title_settings),d=0;d<this.settings.data.length;d++){this.settings.data[d]}a.plot.plotPoints=this.settings.data.points,a.plot.connected=this.settings.connected,a.plot.showDots=this.settings.show_dots,a.plot.series=this.settings.data.series,a.plot.noDraw().format("white","gray").gridlines({stroke:"gray",strokeDashArray:"2,2"},"gray"),a.plot.xAxis.scale(this.settings.x_min,this.settings.x_max,this.settings.x_scale).ticks(parseFloat((this.settings.x_max-this.settings.x_min)/10),parseFloat((this.settings.x_max-this.settings.x_min)/5),8,"sw",this.settings.x_scale).title(this.settings.x_title,this.settings.x_titleOffset),a.plot.yAxis.scale(this.settings.y_min,this.settings.y_max,this.settings.y_scale).ticks(parseFloat((this.settings.y_max-this.settings.y_min)/10),parseFloat((this.settings.y_max-this.settings.y_min)/5),8,"sw",this.settings.y_scale).title(this.settings.y_title,this.settings.y_titleOffset),a.plot.legend.settings({fill:"white",stroke:"gray"});var l=0;if(this.settings.show_legend)switch(this.settings.legend_position){case"left":l=1;break;case"right":l=2;break;case"top":l=3;break;case"bottom":l=4;break;default:l=1}a.plot.noDraw().legend.show(l).area(this.settings.legendArea?this.settings.legendArea:c[l]).end().area(this.settings.chartArea?this.settings.chartArea:b[l]).redraw()}};return c});