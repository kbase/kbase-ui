define(["jquery","kb/common/html","kb/service/client/workspace","kb/widget/legacy/authenticatedWidget","kb/widget/legacy/tabs","datatables_bootstrap"],function(a,b,c){"use strict";a.KBWidget({name:"kbasePanGenome",parent:"kbaseAuthenticatedWidget",version:"1.0.0",options:{ws:null,name:null,withExport:!1,width:1e3},pref:null,geneIndex:{},genomeNames:{},genomeRefs:{},loaded:!1,init:function(a){this._super(a),this.workspace=new c(this.runtime.config("services.workspace.url",{token:this.runtime.service("session").getAuthToken()})),this.pref=this.genUUID(),this.geneIndex={},this.genomeNames={},this.genomeRefs={};var d=this.$elem;return d.empty(),d.html(b.loading("loading pan-genome data...")),this.render(),this},render:function(){function b(b){function d(){a(".show-orthologs_"+c.pref).unbind("click"),a(".show-orthologs_"+c.pref).click(function(){var b=a(this).data("id");if(h.tabContent(b)[0])return void h.showTab(b);var d=f(b),e=c.buildOrthoTable(b,d);h.addTab({name:b,content:e,active:!0,removable:!0}),h.showTab(b)})}function f(a){for(var c in b.orthologs)if(b.orthologs[c].id===a){var d=b.orthologs[c];return d}}c.loaded=!0,e.empty();var g=a('<div id="'+c.pref+'tab-content">');e.append(g);var h=g.kbTabs({tabs:[]}),i=!0;c.options.withExport&&(i=!1);var j=a("<div/>");h.addTab({name:"Overview",content:j,active:i,removable:!1});var k=a('<table class="table table-striped table-bordered" style="margin-left: auto; margin-right: auto;" id="'+c.pref+'overview-table"/>');j.append(k),k.append("<tr><td>Pan-genome object ID</td><td>"+c.options.name+"</td></tr>");var l={},m={},n={},o=0,p=0,q=0,r=0;for(var s in b.orthologs){var t=b.orthologs[s];p++;var u=t.id,v=t.orthologs.length;v>=2&&q++,m[u]||(m[u]=[v,{}]);for(var w in t.orthologs){var x=t.orthologs[w],y=x[2];l[y]||(l[y]=[0,{},0,0]),l[y][1][u]||(l[y][1][u]=0,v>1?l[y][0]++:l[y][3]++),l[y][1][u]++,m[u][1][y]||(m[u][1][y]=0),m[u][1][y]++;var z=y+"/"+x[0];n[z]||(v>1?(n[z]=1,o++,l[y][2]++):(n[z]=0,r++))}}var A=0,B=[];for(var y in c.geneIndex)A++,B.push([y,c.genomeNames[y],0]);B.sort(function(a,b){return a[1]<b[1]?-1:a[1]>b[1]?1:0});for(var s in B)B[s][2]=parseInt(""+s)+1;k.append("<tr><td>Total # of genomes</td><td><b>"+A+"</b></td></tr>"),k.append("<tr><td>Total # of proteins</td><td><b>"+(o+r)+"</b> proteins, <b>"+o+"</b> are in homolog families, <b>"+r+"</b> are in singleton families</td></tr>"),k.append("<tr><td>Total # of families</td><td><b>"+p+"</b> families, <b>"+q+"</b> homolog families, <b>"+(p-q)+"</b> singleton families</td></tr>");for(var C in B){var y=B[C][0],D=c.genomeNames[y],E=0,F=0,G=0;if(l[y]){var H=l[y];E=H[0],F=H[2],G=H[3]}var I=0;for(var s in c.geneIndex[y])I++;k.append("<tr><td>"+D+"</td><td><b>"+(F+G)+"</b> proteins, <b>"+F+"</b> proteins are in <b>"+E+"</b> homolog families, <b>"+G+"</b> proteins are in singleton families</td></tr>")}var J=a("<div/>");h.addTab({name:"Shared homolog families",content:J,active:!1,removable:!1});var K=a('<table class="table table-striped table-bordered" style="margin-left: auto; margin-right: auto;" id="'+c.pref+'shared-table"/>');J.append(K);var L="";for(var C in B){var M=B[C][2];L+='<td width="40"><center><b>G'+M+"</b></center></td>"}K.append("<tr>"+L+"<td/></tr>");for(var C in B){var y=B[C][0],N="";for(var O in B){var P=B[O][0],Q=0;for(var u in m)m[u][0]<=1||m[u][1][y]&&m[u][1][P]&&Q++;var R=y===P?"#d2691e":"black";N+='<td width="40"><font color="'+R+'">'+Q+"</font></td>"}var M=B[C][2];K.append("<tr>"+N+"<td><b>G"+M+"</b> - "+B[C][1]+"</td></tr>")}var S=a('<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;">'),T=a("<div/>");c.options.withExport&&T.append("<p><b>Please choose homolog family and push 'Export' button on opened ortholog tab.</b></p><br>"),T.append(S),h.addTab({name:"Protein families",content:T,active:!i,removable:!1});var U=[];for(var s in b.orthologs){var t=b.orthologs[s],V='<a class="show-orthologs_'+c.pref+'" data-id="'+t.id+'">'+t.id+"</a>",W=0;for(var y in m[t.id][1])W++;U.push({func:t["function"],id:V,len:t.orthologs.length,genomes:W})}var X={sPaginationType:"full_numbers",iDisplayLength:10,aaData:U,aaSorting:[[2,"desc"],[0,"asc"]],aoColumns:[{sTitle:"Function",mData:"func"},{sTitle:"ID",mData:"id"},{sTitle:"Protein Count",mData:"len"},{sTitle:"Genome Count",mData:"genomes"}],oLanguage:{sEmptyTable:"No objects found",sSearch:"Search: "},fnDrawCallback:d};S.dataTable(X)}var c=this,d=this.options.name,e=this.$elem;return this.runtime.service("session").isLoggedIn()?(this.workspace.get_objects([{workspace:this.options.ws,name:d}]).then(function(a){if(!c.loaded){var d=a[0].data;c.cacheGeneFunctions(d.genome_refs,function(){b(d)})}})["catch"](function(a){e.empty(),e.append('<div class="alert alert-danger">'+a.error.message+"</div>")}),this):(e.empty(),void e.append("<div>[Error] You're not logged in</div>"))},cacheGeneFunctions:function(a,b){var c=this,d=a.map(function(a){return{ref:a,included:["scientific_name","features/[*]/id"]}});this.workspace.get_object_subset(d).then(function(d){for(var e in a){var f=a[e];c.genomeNames[f]=d[e].data.scientific_name,c.genomeRefs[f]=d[e].info[7]+"/"+d[e].info[1];var g={};for(var h in d[e].data.features){var i=d[e].data.features[h];g[i.id]=h}c.geneIndex[f]=g}b()})["catch"](function(a){console.log("ERROR cacheGeneFunctions"),console.log(a),this.$elem.empty(),this.$elem.append('<div class="alert alert-danger">'+a.error.message+"</div>")})},buildOrthoTable:function(c,d){var e=this,f=a(b.loading("loading gene data...")),g=[];for(var h in d.orthologs){var i=d.orthologs[h][2],j=d.orthologs[h][0],k=e.geneIndex[i][j];g.push({ref:i,included:["features/"+k]})}return this.workspace.get_object_subset(g).then(function(a){var b=[];for(var d in a){var h=a[d].data.features[0],i=g[d].ref;h.genome_ref=i;var j=e.genomeRefs[i],k=e.genomeNames[i],l=h.id,m=h["function"];m||(m="-");var n=h.protein_translation,o=n?n.length:"no translation";b.push({ref:j,genome:k,id:l,func:m,len:o,original:h})}e.buildOrthoTableLoaded(c,b,f)})["catch"](function(a){console.log("Error caching genes: "+a.error.message)}),f},buildOrthoTableLoaded:function(b,c,d){function e(){a(".show-genomes_"+f).unbind("click"),a(".show-genomes_"+f).click(function(){var b=a(this).data("id"),c="/functional-site/#/genomes/"+b;window.open(c,"_blank")}),a(".show-genes_"+f).unbind("click"),a(".show-genes_"+f).click(function(){var b=a(this).data("id"),c="/functional-site/#/genes/"+b;window.open(c,"_blank")})}var f=this.genUUID(),g=this;d.empty();var h=a('<table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;">');g.options.withExport&&d.append('<p><b>Name of feature set object:</b>&nbsp;<input type="text" id="input_'+f+'" value="'+g.options.name+"."+b+'.featureset" style="width: 350px;"/>&nbsp;<button id="btn_'+f+'">Export</button><br><font size="-1">(only features with protein translations will be exported)</font></p><br>'),d.append(h);var i={sPaginationType:"full_numbers",iDisplayLength:10,aaData:c,aaSorting:[[0,"asc"],[1,"asc"]],aoColumns:[{sTitle:"Genome name",mData:function(a){return'<a class="show-genomes_'+f+'" data-id="'+a.ref+'"><span style="white-space: nowrap;">'+a.genome+"</span></a>"}},{sTitle:"Feature ID",mData:function(a){return'<a class="show-genes_'+f+'" data-id="'+a.ref+"/"+a.id+'">'+a.id+"</a>"}},{sTitle:"Function",mData:"func"},{sTitle:"Protein sequence length",mData:"len"}],oLanguage:{sEmptyTable:"No objects in workspace",sSearch:"Search: "},fnDrawCallback:e};h.dataTable(i),g.options.withExport&&a("#btn_"+f).click(function(d){var e=a("#input_"+f).val();return 0===e.length?void alert("Error: feature set object name shouldn't be empty"):void g.exportFeatureSet(b,e,c)})},exportFeatureSet:function(a,b,c){var d={},e=0;for(var f in c){var g=c[f];g.original.protein_translation&&(d[""+f]={data:g.original},e++)}var h={description:'Feature set exported from pan-genome "'+this.options.name+'", otholog "'+a+'"',elements:d};this.workspace.save_objects({workspace:this.options.ws,objects:[{type:"KBaseSearch.FeatureSet",name:b,data:h}]}).then(function(a){alert("Feature set object containing "+e+" genes was successfuly exported")})["catch"](function(a){alert("Error: "+a.error.message)})},getData:function(){return{title:"Pangenome",id:this.options.name,workspace:this.options.ws}},loggedInCallback:function(a,b){return this.token=b.token,this.render(),this},loggedOutCallback:function(a,b){return this.token=null,this.render(),this},genUUID:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"===a?b:3&b|8;return c.toString(16)})}})});