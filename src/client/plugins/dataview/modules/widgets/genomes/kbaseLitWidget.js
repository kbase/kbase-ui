/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define(['jquery', 'underscore', 'kb.jquery.widget', 'd3', 'datatables_bootstrap'], function ($, _, _W, d3) {
    'use strict';
    $.KBWidget({
        name: "KBaseLitWidget",
        parent: "kbaseWidget",
        version: "1.0.0",
        options: {
            genomeID: null,
            workspaceID: null,
            kbCache: null,
            loadingImage: "assets/img/ajax-loader.gif",
            isInCard: false,
            width: 600,
            height: 700,
            maxPubCount: 50
        },
        init: function (options) {
            this._super(options);

            if (this.options.row === null) {
                //throw an error
                return;
            }
            return this.render();
        },
        addInfoRow: function (a, b) {
            return "<tr><td>" + a + "</td><td>" + b + "</td></tr>";
        },
        xmlToJson: function (xml) {
            var self = this;
            // Create the return object
            var obj = {};

            if (xml.nodeType === 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    obj["@attributes"] = {};
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj["@attributes"][attribute.nodeName] = attribute.value;
                    }
                }
            } else if (xml.nodeType === 3) { // text
                obj = xml.nodeValue;
            }

            // do children
            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;
                    if (typeof (obj[nodeName]) === "undefined") {
                        obj[nodeName] = self.xmlToJson(item);
                    } else {
                        if (typeof (obj[nodeName].push) === "undefined") {
                            var old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(self.xmlToJson(item));
                    }
                }
            }
            return obj;
        },
        render: function (options) {
            var self = this;

            self.tooltip = d3.select("body")
                .append("div")
                .classed("kbcb-tooltip", true);

            var lit = self.options.literature;
            var loader = $("<div style='display:none'><img src='" + self.options.loadingImage + "'/></div>").css({"width": "100%", "margin": "0 auto"});
            //var loader = $("<div style='display:none'>LOADING...</div>").css({"width":"100%","margin":"0 auto"})

            var resultsDiv = $("<div>").append('<table cellpadding="0" cellspacing="0" border="0" id="literature-table" \
                            class="table table-bordered table-striped" style="width: 100%; margin-left: 0px; margin-right: 0px;"/>');
            var searchBarDiv = $("<div>").append("<input type='text' id='lit-query-box'>");
            var searchBarButton = $("<input type='button' id='lit-search-button' value='Update Search'>")
                .on("click", function () {
                    lit = self.$elem.find('#lit-query-box').val();
                    tableInput = [];
                    litDataTable.fnDestroy();
                    populateSearch(lit);
                });

            var tableInput = [];
            var litDataTable;

            self.$elem.append(searchBarDiv.append(searchBarButton)).append(loader).append(resultsDiv);

            self.$elem.find('#lit-query-box').val(lit);
            self.$elem.find('#lit-query-box').css({"width": "300px"});
            populateSearch(lit);

            function populateSearch(lit) {
                loader.show();
                $.ajax({
                    async: true,
                    url: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmax=' + self.options.maxPubCount + '&sort=pub+date&term=' + lit.replace(/\s+/g, "+"),
                    type: 'GET',
                    success:
                        function (data) {
                            var htmlJson = self.xmlToJson(data);
                            var query = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=';
                            var abstr = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&id=';
                            if (htmlJson.eSearchResult[1].Count["#text"] === "0") {
                                var tableSettings = {
                                    // "sPaginationType": "full_numbers",
                                    "iDisplayLength": 4,
                                    "sDom": 't<flip>',
                                    "aaSorting": [[3, 'desc']],
                                    "aoColumns": [
                                        {sTitle: "Journal", mData: "source"},
                                        {sTitle: "Authors", mData: "author"},
                                        {sTitle: "Title", mData: "title"},
                                        {sTitle: "Date", mData: "date"}
                                    ],
                                    "aaData": []
                                };
                                loader.hide();
                                litDataTable = self.$elem.find('#literature-table').dataTable(tableSettings);
                                return;
                            }
                            if (_.isArray(htmlJson.eSearchResult[1].IdList.Id)) {
                                var x;
                                for (x = 0; x < htmlJson.eSearchResult[1].IdList.Id.length; x++) {
                                    query += htmlJson.eSearchResult[1].IdList.Id[x]['#text'];
                                    abstr += htmlJson.eSearchResult[1].IdList.Id[x]['#text'];
                                    if (x !== htmlJson.eSearchResult[1].IdList.Id.length - 1) {
                                        query += ',';
                                        abstr += ',';
                                    }
                                    // tableInput.push(parseLitSearchDataTable(query))
                                }
                            } else {
                                // I think this means no results? So here I just show an empty table--mike				
                                // this line below was throwing an error:
                                query += htmlJson.eSearchResult[1].IdList.Id['#text'];
                                abstr += htmlJson.eSearchResult[1].IdList.Id['#text'];
                            }
                            var tableInput = [];
                            var abstractsDict = {};

                            $.when($.ajax({
                                async: true,
                                url: abstr,
                                type: 'GET'
                            }))
                                .then(
                                    function (data) {
                                        htmlJson = self.xmlToJson(data);

                                        var abstracts = htmlJson.PubmedArticleSet[1].PubmedArticle;
                                        if (_.isArray(abstracts)) {
                                            var abstract_idx;
                                            for (abstract_idx in abstracts) {
                                                var article = abstracts[abstract_idx].MedlineCitation;
                                                var articleID = article.PMID["#text"];
                                                if (typeof article.Article.Abstract !== 'undefined') {
                                                    var articleAbstract = article.Article.Abstract.AbstractText["#text"];
                                                } else {
                                                    var articleAbstract = "No abstract found for this article.";
                                                }
                                                abstractsDict[articleID] = articleAbstract;
                                            }
                                        } else {
                                            var article = abstracts.MedlineCitation;
                                            var articleID = article.PMID["#text"];
                                            if (typeof article.Article.Abstract !== 'undefined') {
                                                var articleAbstract = article.Article.Abstract.AbstractText["#text"];
                                            } else {
                                                var articleAbstract = "No abstract found for this article.";
                                            }
                                            abstractsDict[articleID] = articleAbstract;
                                        }

                                        $.when($.ajax({
                                            async: true,
                                            url: query,
                                            type: 'GET'
                                        }))
                                            .then(function (data) {
                                                htmlJson = self.xmlToJson(data);

                                                var summaries = htmlJson.eSummaryResult[1].DocSum; // Add pub date field into table as well.
                                                var summaryList;
                                                if (_.isArray(summaries)) {
                                                    summaryList = [];
                                                    for (summary in summaries) {
                                                        summaryList.push(summaries[summary]);
                                                    }
                                                } else {
                                                    summaryList = [summaries];
                                                }

                                                var articleIDs = [],
                                                    summary_idx,
                                                    summary, item_idx, infoRow;

                                                for (summary_idx in summaryList) {
                                                    summary = summaryList[summary_idx].Item;
                                                    var tableInputRow = {};
                                                    var isJournal = false;
                                                    for (item_idx in summary) {
                                                        infoRow = summary[item_idx];
                                                        if (infoRow["@attributes"].Name === "PubDate") {
                                                            tableInputRow["date"] = infoRow["#text"].substring(0, 4);
                                                        }
                                                        if (infoRow["@attributes"].Name === "Source") {
                                                            tableInputRow["source"] = infoRow["#text"];
                                                        }
                                                        if (infoRow["@attributes"].Name === "Title") {
                                                            tableInputRow["title"] = "<a href=" + "https://www.ncbi.nlm.nih.gov/pubmed/" + summaryList[summary_idx].Id["#text"] + " target=_blank>" + infoRow["#text"] + "</a>";
                                                            tableInputRow["abstract"] = summaryList[summary_idx].Id["#text"];
                                                            articleIDs.push(summaryList[summary_idx].Id["#text"]);
                                                        }
                                                        if (infoRow["@attributes"].Name === "AuthorList") {
                                                            var authors = "";
                                                            if ("#text" in infoRow) {
                                                                if (_.isArray(infoRow.Item)) {
                                                                    var commaDelay = 1, author_idx, author;
                                                                    for (author_idx in infoRow.Item) {
                                                                        author = infoRow.Item[author_idx];
                                                                        if (commaDelay === 0) {
                                                                            authors += ", ";
                                                                        } else {
                                                                            commaDelay--;
                                                                        }
                                                                        authors += author["#text"];
                                                                    }
                                                                } else {
                                                                    authors = infoRow.Item["#text"];
                                                                }
                                                            } else {
                                                                authors = "No authors found for this article.";
                                                            }
                                                            tableInputRow["author"] = authors;
                                                        }
                                                        if (infoRow["@attributes"].Name === "PubTypeList") {
                                                            if ("#text" in infoRow) {
                                                                if (_.isArray(infoRow.Item)) {
                                                                    var pub_idx;
                                                                    for (pub_idx in infoRow.Item) {
                                                                        if (infoRow.Item[pub_idx]["#text"] === "Journal Article") {
                                                                            isJournal = true;
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (infoRow.Item["#text"] === "Journal Article") {
                                                                        isJournal = true;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (isJournal) {
                                                        tableInput.push(tableInputRow);
                                                    }
                                                }

                                                var sDom = 't<flip>';
                                                if (tableInput.length <= 10) {
                                                    sDom = 'tfi';
                                                }
                                                var tableSettings = {
                                                    "iDisplayLength": 4,
                                                    "sDom": sDom,
                                                    "aaSorting": [],
                                                    "aoColumns": [
                                                        {sTitle: "Journal", mData: "source"},
                                                        {sTitle: "Authors", mData: "author"},
                                                        {sTitle: "Title", mData: "title"},
                                                        {sTitle: "Date", mData: "date"}
                                                    ],
                                                    "aaData": tableInput,
                                                    "fnRowCallback": function (nRow, aaData, iDisplayIndex) {
                                                        nRow.setAttribute('id', aaData["abstract"]);
                                                    }
                                                };
                                                loader.hide();
                                                litDataTable = self.$elem.find('#literature-table').dataTable(tableSettings);
                                                self.$elem.find('#literature-table tbody')
                                                    .on("mouseover", 'tr',
                                                        function () {
                                                            self.tooltip = self.tooltip.text(abstractsDict[$(this).attr('id')]);
                                                            return self.tooltip.style("visibility", "visible");
                                                        }
                                                    )
                                                    .on("mouseout",
                                                        function () {
                                                            return self.tooltip.style("visibility", "hidden");
                                                        }
                                                    )
                                                    .on("mousemove",
                                                        function (e) {
                                                            return self.tooltip.style("top", (e.pageY + 15) + "px").style("left", (e.pageX - 10) + "px");
                                                        }
                                                    );
                                            },
                                                function () {
                                                    loader.hide();
                                                    self.$elem.append("<br><b>Failed to retrieve literature search results. Try again later.</b>");
                                                }
                                            );
                                    }
                                );
                        }
                });
            }

            return this;
        },
        getData: function () {
            return {
                type: "LitWidget",
                id: this.options.genomeID,
                workspace: this.options.workspaceID,
                title: "Literature"
            };
        }
    });
});
