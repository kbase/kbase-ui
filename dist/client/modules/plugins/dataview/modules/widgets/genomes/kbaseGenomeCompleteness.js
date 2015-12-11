!function(a,b){a.KBWidget({name:"KBaseGenomeCompleteness",parent:"kbaseAuthenticatedWidget",version:"1.0.0",genome_id:null,ws_name:null,kbCache:null,width:800,table_height:656,options:{genome_id:null,ws_name:null,kbCache:null,loadingImage:"assets/img/ajax-loader.gif"},wsUrl:"https://kbase.us/services/ws/",markerRoles:[],markerRolesOrder:[],init:function(a){return this._super(a),this.ws_name=this.options.ws_name,this.genome_id=this.options.genome_id,this.kbCache=this.options.kbCache,this.markerRoles=[],this.markerRolesOrder=[],this.loadMarkerRoles(this.wait_for_marker_roles),this},wait_for_marker_roles:function(){this.render()},loadMarkerRoles:function(a){var b=this.markerRoles,c=this.markerRolesOrder,d=this,e=0,f=1;return d3.text("assets/data/universal_markers_SEED_Roles.txt",function(a){for(var g=d3.tsv.parseRows(a),h="",i="",j=0;j<g.length;j++)""!==g[j][e]&&""!==g[j][f]&&(h=g[j][e],i=g[j][f],c.push(i),b[i]=h);d.wait_for_marker_roles()}),!0},render:function(){var c=this,d=this.uuid(),e=this.$elem;e.append('<div><img src="'+c.options.loadingImage+'">&nbsp;&nbsp;loading genes data...</div>');var f=""+this.options.ws_name+"/"+this.options.genome_id,g={ref:f};this.options.kbCache?prom=this.options.kbCache.req("ws","get_objects",[g]):prom=kb.ws.get_objects([g]);var c=this;return a.when(prom).done(a.proxy(function(g){function h(){a("."+d+"gene-click").unbind("click"),a("."+d+"gene-click").click(function(){var b=[a(this).data("geneid")];window.open("#/genes/"+f+"/"+b,"_blank")})}e.empty();var i=g[0].data,j=i.domain;if("Eukaryota"===j)return e.prepend("<b>Genome Completeness not yet available for "+j+"</b>"),this;var k=[],l={},m={},n={},o={},p={};if(i.contig_ids&&i.contig_lengths&&i.contig_ids.length==i.contig_lengths.length)for(var q in i.contig_ids){var r=i.contig_ids[q],s=i.contig_lengths[q];l[r]={name:r,length:s,genes:[]}}for(var t in i.features){var u=i.features[t],v=u.id;if(u["function"]!==b){var w=u["function"],x=w.replace(/\s+\/.+/,"").replace(/\s+\#.*/,""),y=x;c.markerRoles[y]!==b&&(m[y]===b&&(m[y]=[]),m[y].push(v))}}for(var z=!1,A=0;A<c.markerRolesOrder.length;A++){var y=c.markerRolesOrder[A],B=c.markerRoles[y];n[B]===b&&(n[B]=0),o[B]===b&&(o[B]=0),p[B]===b&&(p[B]=""),o[B]+=1,m[y]&&(n[B]+=1,z=!0,1!==m[y].length&&(p[B]=" (Warning: multiple counts)"))}for(var A=0;A<c.markerRolesOrder.length;A++){var y=c.markerRolesOrder[A],B=c.markerRoles[y];if(z!==!1){if(0!==n[B])if(m[y]!==b)for(var C=0;C<m[y].length;C++){var v=m[y][C],D=m[y].length;k[k.length]={num:D,id:'<a class="'+d+'gene-click" data-geneid="'+v+'">'+v+"</a>",group:B,func:y}}else k[k.length]={num:0,id:"-",group:B,func:y}}else"Universal"===B&&(k[k.length]={num:0,id:"-",group:B,func:y})}var E={iDisplayLength:100,aaSorting:[[3,"asc"]],sDom:"t<fip>",aoColumns:[{sTitle:"Count",mData:"num",sWidth:"10%"},{sTitle:"Gene ID",mData:"id"},{sTitle:"Group",mData:"group"},{sTitle:"Function",mData:"func",sWidth:"50%"}],aaData:[],oLanguage:{sSearch:"&nbsp&nbsp&nbsp&nbspSearch gene:",sEmptyTable:"No genes found."},fnDrawCallback:h};for(var B in o)0!==n[B]&&e.append("<div />"+B+" Single-copy Markers Seen: "+n[B]+" / "+o[B]+p[B]);z===!1&&(B="Universal",e.append("<div />"+B+" Single-copy Markers Seen: "+n[B]+" / "+o[B]+p[B])),e.append(a("<div />").css("height",this.table_height+"px").css("overflow","scroll").append('<table cellpadding="0" cellspacing="0" border="0" id="'+d+'genome-completeness-table"             		class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;"/>'));var F=a("#"+d+"genome-completeness-table").dataTable(E);F.fnAddData(k)},this)),a.when(prom).fail(a.proxy(function(a){e.empty(),e.append("<p>[Error] "+a.error.message+"</p>")},this)),this},getData:function(){return{type:"KBaseGenomeCompleteness",id:this.options.ws_name+"."+this.options.genome_id,workspace:this.options.ws_name,title:"Genome Completeness"}},uuid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:3&b|8;return c.toString(16)})}})}(jQuery);