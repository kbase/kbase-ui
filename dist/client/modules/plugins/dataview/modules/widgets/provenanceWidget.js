define(["bluebird","jquery","d3","kb/common/html","kb/common/dom","kb/service/client/workspace","d3_sankey"],function(a,b,c,d,e,f){"use strict";function g(g){function h(){return R([R(["This is a visualization of the relationships between this piece of data and other data in KBase.  Mouse over objects to show additional information (shown below the graph). Double click on an object to select and recenter the graph on that object in a new window.",S(),S()]),R({id:"objgraphview",style:{overflow:"auto",height:"450px",resize:"vertical"}}),R({id:"nodeColorKey"})])}function i(){if(L){L=!1;var a=T({cellpadding:"0",cellspacing:"0",border:"0",width:"100%",style:{border:"1px silver solid; padding: 4px;"}},[U([V({valign:"top"},[T({cellpadding:"2",cellspacing:"0",border:"0",id:"graphkey",style:""},Object.keys(N).map(function(a){return"selected"!==a&&""!==N[a].name?U([V([W({width:"40",height:"20"},[X({x:"0",y:"0",width:"40",height:"20",fill:N[a].color})])]),V({valign:"middle"},[N[a].name])]):void 0}).filter(function(a){return void 0===a?!1:!0}))]),V([R({id:"objdetailsdiv"})])])]);b("#nodeColorKey").html(a)}}function j(a){if(a.isFake){var b=a.info,c=(new Date(b[3]),'<center><table cellpadding="2" cellspacing="0" class="table table-bordered"><tr><td>');c+='<h4>Object Details</h4><table cellpadding="2" cellspacing="0" border="0" class="table table-bordered table-striped">',c+="<tr><td><b>Name</b></td><td>"+b[1]+"</td></tr>",c+="</td></tr></table></td><td>",c+='<h4>Provenance</h4><table cellpadding="2" cellspacing="0" class="table table-bordered table-striped">',c+="<tr><td><b>N/A</b></td></tr>",c+="</table>",c+="</td></tr></table>",G.find("#objdetailsdiv").html(c)}else M.get_object_provenance([{ref:a.objId}]).then(function(b){var c=a.info,d=!1,e='<center><table cellpadding="2" cellspacing="0" class="table table-bordered"><tr><td>';e+='<h4>Data Object Details</h4><table cellpadding="2" cellspacing="0" border="0" class="table table-bordered table-striped">',e+="<tr><td><b>Name</b></td><td>"+c[1]+' (<a href="#/dataview/'+c[6]+"/"+c[1]+"/"+c[4]+'" target="_blank">'+c[6]+"/"+c[0]+"/"+c[4]+"</a>)</td></tr>",e+='<tr><td><b>Type</b></td><td><a href="#/spec/type/'+c[2]+'">'+c[2]+"</a></td></tr>",e+="<tr><td><b>Saved on</b></td><td>"+z(c[3])+"</td></tr>",e+='<tr><td><b>Saved by</b></td><td><a href="#/people/'+c[5]+'" target="_blank">'+c[5]+"</td></tr>";var f='<tr><td><b>Meta data</b></td><td><div style="width:250px;word-wrap: break-word;">';for(var g in c[10])d=!0,f+="<b>"+g+"</b> : "+c[10][g]+"<br>";if(d&&(e+=f+"</div></td></tr>"),e+="</div></td></tr></table></td><td>",e+='<h4>Provenance</h4><table cellpadding="2" cellspacing="0" class="table table-bordered table-striped">',b.length>0)if(b[0].copied&&(e+=o("Copied from",'<a href="#/dataview/'+b[0].copied+'" target="_blank">'+b[0].copied+"</a>")),b[0].provenance.length>0)for(var h="",i=0;i<b[0].provenance.length;i++)b[0].provenance.length>1&&(h="Action "+i+": "),e+=l(b[0].provenance[i],h);else e+='<tr><td></td><td><b><span style="color:red">No provenance data set.</span></b></td></tr>';else e+='<tr><td></td><td><b><span style="color:red">No provenance data set.</span></b></td></tr>';e+="</table>",e+="</td></tr></table>",G.find("#objdetailsdiv").html(e)})["catch"](function(b){var c=a.info,d='<center><table cellpadding="2" cellspacing="0" class="table table-bordered"><tr><td>';d+='<h4>Data Object Details</h4><table cellpadding="2" cellspacing="0" border="0" class="table table-bordered table-striped">',d+="<tr><td><b>Name</b></td><td>"+c[1]+'(<a href="#/dataview/'+c[6]+"/"+c[1]+"/"+c[4]+'" target="_blank">'+c[6]+"/"+c[0]+"/"+c[4]+"</a>)</td></tr>",d+='<tr><td><b>Type</b></td><td><a href="#/spec/type/'+c[2]+'">'+c[2]+"</a></td></tr>",d+="<tr><td><b>Saved on</b></td><td>"+z(c[3])+"</td></tr>",d+='<tr><td><b>Saved by</b></td><td><a href="#/people/'+c[5]+'" target="_blank">'+c[5]+"</td></tr>";var e=!1,f='<tr><td><b>Meta data</b></td><td><div style="width:250px;word-wrap: break-word;">';for(var g in c[10])e=!0,f+="<b>"+g+"</b> : "+c[10][g]+"<br>";e&&(d+=f+"</div></td></tr>"),d+="</div></td></tr></table></td><td>",d+='<h4>Provenance</h4><table cellpadding="2" cellspacing="0" class="table table-bordered table-striped">',d+="error in fetching provenance",d+="</table>",d+="</td></tr></table>",console.log("Error fetching provenance"),console.log(b),G.find("#objdetailsdiv").html(d)})}function k(){var a,d,e,f,h,i={top:10,right:10,bottom:10,left:10},k=g.width-50-i.left-i.right,l=38*Q.nodes.length-i.top-i.bottom;c.scale.category20();return 0===Q.links.length&&(Q.nodes.push({node:1,name:"No references found",info:[-1,"No references found","No Type",0,0,"N/A",0,"N/A",0,0,{}],nodeType:"none",objId:"-1",isFake:!0}),J[-1]=1,Q.links.push({target:0,source:1,value:1})),450>l&&G.find("#objgraphview").height(l+40),c.select(G.find("#objgraphview")[0]).html(""),G.find("#objgraphview").show(),a=c.select(G.find("#objgraphview")[0]).append("svg"),a.attr("width",k+i.left+i.right).attr("height",l+i.top+i.bottom).append("g").attr("transform","translate("+i.left+","+i.top+")"),d=c.sankey().nodeWidth(25).nodePadding(40).size([k,l]),e=d.link(),d.nodes(Q.nodes).links(Q.links).layout(40),f=a.append("g").selectAll(".link").data(Q.links).enter().append("path").attr("class","sankeylink").attr("d",e).style("stroke-width",function(a){return 10}).sort(function(a,b){return b.dy-a.dy}),f.append("title").text(function(a){return"copied"===a.source.nodeType?a.text=a.target.name+" copied from "+a.source.name:"core"===a.source.nodeType?a.text=a.target.name+" is a newer version of "+a.source.name:"ref"===a.source.nodeType?a.text=a.source.name+" references "+a.target.name:"included"===a.source.nodeType&&(a.text=a.target.name+" references "+a.source.name),a.text}),b(f).tooltip({delay:{show:0,hide:100}}),h=a.append("g").selectAll(".node").data(Q.nodes).enter().append("g").attr("class","sankeynode").attr("transform",function(a){return"translate("+a.x+","+a.y+")"}).call(c.behavior.drag().origin(function(a){return a}).on("dragstart",function(){this.parentNode.appendChild(this)}).on("drag",function(a){a.x=Math.max(0,Math.min(k-a.dx,c.event.x)),a.y=Math.max(0,Math.min(l-a.dy,c.event.y)),c.select(this).attr("transform","translate("+a.x+","+a.y+")"),d.relayout(),f.attr("d",e)})).on("dblclick",function(a){c.event.defaultPrevented||(a.isFake?alert("Cannot expand this node."):a.info[1].indexOf(" ")>=0?window.location.href="#/objgraphview/"+encodeURI(a.info[7]+"/"+a.info[0]):window.location.href="#/objgraphview/"+encodeURI(a.info[7]+"/"+a.info[1]))}).on("mouseover",j),h.append("rect").attr("y",function(a){return-5}).attr("height",function(a){return Math.abs(a.dy)+10}).attr("width",d.nodeWidth()).style("fill",function(a){return a.color=N[a.nodeType].color}).style("stroke",function(a){return 0*c.rgb(a.color).darker(2)}).append("title").html(function(a){var b=a.info,c=b[1]+" ("+b[6]+"/"+b[0]+"/"+b[4]+")\n--------------\n  type:  "+b[2]+"\n  saved on:  "+z(b[3])+"\n  saved by:  "+b[5]+"\n",d=!1,e="  metadata:\n";for(var f in b[10])c+="     "+f+" : "+b[10][f]+"\n",d=!0;return d&&(c+=e),c}),h.append("text").attr("y",function(a){return a.dy/2}).attr("dy",".35em").attr("text-anchor","end").attr("transform",null).text(function(a){return a.name}).filter(function(a){return a.x<k/2}).attr("x",6+d.nodeWidth()).attr("text-anchor","start"),this}function l(a,b){var c=[];return"description"in a&&c.push(o(b+"Description",a.description)),"service"in a&&c.push(o(b+"Service Name",a.service)),"service_ver"in a&&c.push(o(b+"Service Version",a.service_ver)),"method"in a&&c.push(o(b+"Method",a.method)),"method_params"in a&&c.push(o(b+"Method Parameters",JSON.stringify(n(a.method_params),null,"  "))),"script"in a&&c.push(o(b+"Command Name",a.script)),"script_ver"in a&&c.push(o(b+"Script Version",a.script_ver)),"script_command_line"in a&&c.push(o(b+"Command Line Input",a.script_command_line)),"intermediate_incoming"in a&&a.intermediate_incoming.length>0&&c.push(o(b+"Action Input",JSON.stringify(a.intermediate_incoming,null,"  "))),"intermediate_outgoing"in a&&a.intermediate_outgoing.length>0&&c.push(o(b+"Action Output",JSON.stringify(a.intermediate_outgoing,null,"  "))),"external_data"in a&&a.external_data.length>0&&c.push(o(b+"External Data",m(a.external_data),null,"  ")),"time"in a&&c.push(o(b+"Timestamp",z(a.time))),c.join("")}function m(a){for(var b="",c=0;c<a.length;c++){var d=a[c];"resource_name"in d&&(b+="<b>Resource Name</b><br/>","resource_url"in d&&(b+='<a target="_blank" href='+d.resource_url,b+=">"),b+=d.resource_name,"resource_url"in d&&(b+="</a>"),b+="<br/>"),"resource_version"in d&&(b+="<b>Resource Version</b><br/>",b+=d.resource_version+"<br/>"),"resource_release_date"in d&&(b+="<b>Resource Release Date</b><br/>",b+=z(d.resource_release_date)+"<br/>"),"data_id"in d&&(b+="<b>Data ID</b><br/>","data_url"in d&&(b+='<a target="_blank" href='+d.data_url,b+=">"),b+=d.data_id,"data_url"in d&&(b+="</a>"),b+="<br/>"),"description"in d&&(b+="<b>Description</b><br/>",b+=d.description+"<br/>")}return b}function n(a){if(a&&a.constructor===Array)for(var b=0;b<a.length;b++)a[b]&&"object"==typeof a[b]&&a[b].hasOwnProperty("auth")&&delete a[b].auth;return a}function o(a,b){return U([V({style:{maxWidth:"250px"}},[Y(a)]),V({style:{maxWidth:"300px"}},[R({style:{maxWidth:"300px",maxHeight:"250px",overflowY:"auto",whiteSpace:"pre",wordWrap:"break-word"}},[b])])])}function p(a){return a[1]+" (v"+a[4]+")"}function q(a){var b=[],c=0,d="";J={},Q={nodes:[],links:[]};for(var e=0;e<a.length;e++){var f=(a[e][2].split("-")[0],a[e][6]+"/"+a[e][0]+"/"+a[e][4]),g=Q.nodes.length;Q.nodes.push({node:g,name:p(a[e]),info:a[e],nodeType:"core",objId:f}),a[e][4]>c&&(c=a[e][4],d=f),J[f]=g,b.push({ref:f})}return d.length>0&&(Q.nodes[J[d]].nodeType="selected"),b}function r(a){G.find("#loading-mssg").hide(),G.append("<br><b>Error in building object graph!</b><br>"),G.append("<i>Error was:</i></b> &nbsp ");var b;b=a.message?a.message:a.error&&a.error.message?a.error.message:"unknown error (check console)",G.append(b+"<br>"),console.error("Error in building object graph!"),console.error(a)}function s(a){return M.list_referencing_objects(a).then(function(b){for(var c=0;c<b.length;c++)for(var d=50,e=0;e<b[c].length;e++){if(e>=d){var f=Q.nodes.length,g=b[c].length-d+" more ...";Q.nodes.push({node:f,name:g,info:[-1,g,"Multiple Types",0,0,"N/A",0,"N/A",0,0,{}],nodeType:"ref",objId:"-1",isFake:!0}),J[i]=f,null!==J[a[c].ref]&&Q.links.push({source:J[a[c].ref],target:f,value:1});break}var h=b[c][e],i=(h[2].split("-")[0],h[6]+"/"+h[0]+"/"+h[4]),f=Q.nodes.length;Q.nodes.push({node:f,name:p(h),info:h,nodeType:"ref",objId:i}),J[i]=f,null!=J[a[c].ref]&&Q.links.push({source:J[a[c].ref],target:f,value:1})}})}function t(a){M.get_object_provenance(a).then(function(b){for(var c={},d=[],e=[],f=0;f<b.length;f++){for(var g=0;g<b[f].refs.length;g++)b[f].refs[g]in c||(c[b[f].refs[g]]="included",d.push({ref:b[f].refs[g]})),e.push({source:b[f].refs[g],target:a[f].ref,value:1});for(var h=0;h<b[f].provenance.length;h++)if(b[f].provenance[h].hasOwnProperty("resolved_ws_objects"))for(var i=0;i<b[f].provenance[h].resolved_ws_objects.length;i++)b[f].provenance[h].resolved_ws_objects[i]in c||(c[b[f].provenance[h].resolved_ws_objects[i]]="included",d.push({ref:b[f].provenance[h].resolved_ws_objects[i]})),e.push({source:b[f].provenance[h].resolved_ws_objects[i],target:a[f].ref,value:1});if(b[f].hasOwnProperty("copied")){var j=b[f].copied.split("/")[0]+"/"+b[f].copied.split("/")[1],k=a[f].ref.split("/")[0]+"/"+a[f].ref.split("/")[1];j!==k&&(b[f].copied in c||(c[b[f].copied]="copied",d.push({ref:b[f].copied})),e.push({source:b[f].copied,target:a[f].ref,value:1}))}}O={uniqueRefs:c,uniqueRefObjectIdentities:d,links:e}})}function u(a){return M.get_object_info_new({objects:a.uniqueRefObjectIdentities,includeMetadata:1,ignoreErrors:1}).then(function(b){for(var c={},d=0;d<b.length;d++)b[d]&&(c[b[d][6]+"/"+b[d][0]+"/"+b[d][4]]=b[d]);var e=a.uniqueRefs;for(var f in e){var g=c[f];if(g){var h=(g[2].split("-")[0],g[6]+"/"+g[0]+"/"+g[4]),i=Q.nodes.length;Q.nodes.push({node:i,name:p(g),info:g,nodeType:e[f],objId:h}),J[h]=i}}for(var j=a.links,d=0;d<j.length;d++)null!==J[j[d].source]&&null!==J[j[d].target]&&Q.links.push({source:J[j[d].source],target:J[j[d].target],value:j[d].value})})["catch"](function(b){console.log("OK: error"),console.log(b);var c=a.uniqueRefs;for(var d in c){var e=Q.nodes.length,f=d.split("/");Q.nodes.push({node:e,name:d,info:[f[1],"Data not found, object may be deleted","Unknown","",f[2],"Unknown",f[0],f[0],"Unknown","Unknown",{}],nodeType:c[d],objId:d}),J[d]=e}for(var g=a.links,h=0;h<g.length;h++)Q.links.push({source:J[g[h].source],target:J[g[h].target],value:g[h].value})})}function v(b){G.find("#loading-mssg").show(),G.find("#objgraphview").hide(),Q={nodes:[],links:[]},M.get_object_history(b).then(function(a){return q(a)}).then(function(b){return a.all([s(b),t(b)])}).spread(function(a,b){return b&&"uniqueRefObjectIdentities"in b&&b.uniqueRefObjectIdentities.length>0?u(b):void 0})["finally"](function(){w()})["catch"](function(a){r(a)})}function w(){x(),k(),i(),G.find("#loading-mssg").hide()}function x(){var a,b;Q.nodes.forEach(function(c){"copied"!==c.nodeType&&(a=c.info[4]+1,b=c.info[6]+"/"+c.info[0]+"/"+a,J[b]&&Q.links.push({source:J[c.objId],target:J[b],value:1}))})}function y(a,b,c){return c?{ref:a+"/"+b+"/"+c}:{ref:a+"/"+b}}function z(a){if(!a)return"";var b=new Date(a),c=Math.floor((new Date-b)/1e3);if(isNaN(c)){var d=a.split("+"),e=d[0]+"+"+d[0].substr(0,2)+":"+d[1].substr(2,2);if(b=new Date(e),c=Math.floor((new Date-b)/1e3),isNaN(c))return b=new Date(d[0]),P[b.getMonth()]+" "+b.getDate()+", "+b.getFullYear()}return P[b.getMonth()]+" "+b.getDate()+", "+b.getFullYear()}function A(a){E=a,F=e.createElement("div"),G=b(F),F.innerHTML=h(),E.appendChild(F)}function B(a){L=!0,H=a.workspaceId,I=a.objectId,v(y(a.workspaceId,a.objectId))}function C(){}function D(){E.removeChild(F)}var E,F,G,H,I,J,K=g.runtime,L=!0,M=new f(K.getConfig("services.workspace.url"),{token:K.service("session").getAuthToken()}),N={selected:{color:"#FF9800",name:"Current version"},core:{color:"#FF9800",name:"All Versions of this Data"},ref:{color:"#C62828",name:"Data Referencing this Data"},included:{color:"#2196F3",name:"Data Referenced by this Data"},none:{color:"#FFFFFF",name:""},copied:{color:"#4BB856",name:"Copied From"}},O=null,P=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Q={nodes:[],links:[]},R=d.tag("div"),S=d.tag("br"),T=d.tag("table"),U=d.tag("tr"),V=d.tag("td"),W=d.tag("svg"),X=d.tag("rect"),Y=d.tag("b");return g.width=1200,g.height=700,{attach:A,start:B,stop:C,detach:D}}return{make:function(a){return g(a)}}});