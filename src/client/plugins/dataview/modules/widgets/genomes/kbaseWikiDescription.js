/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * @module widgets/genomes/kbaseWikiDescripton
 * KBase Wiki Description
 * ----------------------
 * This widget shows a description of a genome, via a given genome ID and 
 * location, either Workspace or Central Store.
 *
 * From the Genome, a taxonomy is extracted and used to look up the Genome's
 * description. If the most detailed part of the taxonomy (e.g. the strain) is
 * not available, this climbs up the chain to the most detailed part that is.
 * For example, "Vibrio brasiliensis LMG 20546" isn't available, but "Vibrio"
 * is, so that is used for the description.
 * 
 * The description and a relevant picture are scraped from Wikipedia, using
 * the Wikipedia API, and rendered in the widget.
 *
 * @author Bill Riehl [wjriehl@lbl.gov]
 * @author Mike Sneddon [mwsneddon@lbl.gov]
 * @author Dylan Chivian [dcchivian@lbl.gov]
 */
define([
    'jquery',
    'kb.runtime',
    'kb.html',
    'kb.service.cdmi',
    'kb.service.cdmi-entity',
    'kb.jquery.widget'
],
    function ($, R, html, CDMI, CDMI_Entity) {
        'use strict';
        $.KBWidget({
            name: "KBaseWikiDescription",
            parent: "kbaseWidget",
            version: "1.0.0",
            /**
             * @typedef options - default set of options, settable during invocation
             * @type {object}
             * @property {string} genomeID - (required) the genome ID (or genome object ID from the workspace)
             * @property {string} workspaceID - (optional) the id of the workspace the genome is in
             * @property {object} kbCache - (optional) the cache client used to pull from the workspace
             * @property {string} title - the title of this widget
             * @property {number} maxNumChars - (deprecated) the maximum number of characters of the description to show
             * @property {number} maxTextHeight - the max size of the description text area in pixels
             */
            options: {
                genomeID: null,
                workspaceID: null,
                kbCache: null,
                title: "Description",
                maxNumChars: 900,
                width: 400,
                maxTextHeight: 300,
                genomeInfo: null
            },
            /**
             * @type {string} cdmiURL - the default endpoint for the CDMI service
             */
            cdmiURL: R.getConfig('services.cdmi.url'),
            /**
             * @function init
             * Initialize the widget. This initializes the CDMI client code.
             * @return {object} the initialized widget
             */
            init: function (options) {
                this._super(options);

                if (this.options.featureID === null) {
                    //throw an error.
                    return this;
                }
                this.$messagePane = $("<div>");
                this.$elem.append(this.$messagePane);

                this.cdmiClient = new CDMI(this.cdmiURL);
                this.entityClient = new CDMI_Entity(this.cdmiURL);

                if (this.options.workspaceID) {
                    this.renderWorkspace();
                } else {
                    this.renderCdmi();
                }
                return this;
            },
            /**
             * @function renderCdmi
             * This renders the description based on the KBase Central Store version
             * of the genome.
             * @public
             */
            renderCdmi: function () {
                var self = this;
                this.showMessage(html.loading('loading...'));

                /*
                 * A couple nested callbacks here.
                 * 1. Run genomes_to_taxonomies
                 * 2. Deal with the taxonomy structure and send it to render
                 */
                if (this.options.genomeID === null) {
                    // make an error.
                    this.renderError("Error: no genome identifier given!");
                    return;
                }

                // Step 1: use the cdmiClient to get the taxonomy.
                this.cdmiClient.genomes_to_taxonomies([this.options.genomeID],
                    $.proxy(function (taxonomy) {
                        taxonomy = taxonomy[this.options.genomeID];
                        if (taxonomy) {
                            // Step 2: render from that taxonomy, if we have one.
                            this.renderFromTaxonomy(taxonomy.reverse());
                        } else {
                            // If no taxonomy, it's a safe bet that the genome isn't found 
                            // (it would return a valid empty array otherwise)
                            this.renderError("Genome '" + this.options.genomeID + "' not found in the KBase Central Store.");
                        }
                    }, this),
                    this.renderError
                    );

                return this;
            },
            /**
             * @function renderFromTaxonomy
             * This does the work of rendering the widget given a taxonomy array 
             * (in order from most detail to least, e.g. from strain --> kingdom).
             * 
             * This will try to fetch wiki content for the first valid name in that list.
             * If content is found, it is rendered onto the page. If no content is found,
             * a message and optional Wikipedia link is given. If an error occurs, it
             * gets rendered in a reddish error box.
             *
             * Regarding the rest of this widget, this is the rendering endpoint for
             * both renderCdmi and renderWorkspace - those both generate a taxonomy
             * list that gets passed here.
             * @public
             */
            renderFromTaxonomy: function (taxonomy) {
                var searchTerms = taxonomy;
                var strainName = taxonomy[0];
                this.wikipediaLookup(searchTerms, $.proxy(
                    function (desc) {
                        var $taxonDescription = $('<div>');
                        var $taxonImage = $('<div>');

                        // If we've found something, desc.description will exist and be non-null
                        if (desc.hasOwnProperty('description') && desc.description !== null) {
                            /* the viz is set up like this:
                             * 1. Description Tab
                             *
                             * ['not found' header, if applicable]
                             * Showing description for <search term>
                             * ['redirect header', if applicable]
                             *
                             * Description (a fragment of the abstract from Wikipedia)
                             *
                             * <Wikipedia link>
                             *
                             * 2. Image Tab
                             * ['not found' header, if applicable, with link to Wikipedia]
                             * Image
                             */
                            if (desc.searchTerm) {
                                var $descDiv = $('<div style="text-align:justify; max-height: ' + this.options.maxTextHeight + 'px; overflow-y:auto; padding-right:5px">')
                                    .append(desc.description);

                                var $descHeader = $('<div>');
                                var descHtml;
                                if (strainName === desc.redirectFrom) {
                                    $descHeader = $(this.redirectHeader(strainName, desc.redirectFrom, desc.searchTerm));
                                } else if (strainName !== desc.searchTerm) {
                                    $descHeader = $(this.notFoundHeader(strainName, desc.searchTerm, desc.redirectFrom));
                                }

                                var $descFooter = $('<p>[<a href="' + desc.wikiUri + '" target="_new">more at Wikipedia</a>]</p>');

                                var imageHtml = 'Unable to find an image. If you have one, you might consider <a href="' + desc.wikiUri + '" target="_new">adding it to Wikipedia</a>.';
                                if (desc.imageUri != null) {
                                    imageHtml = '<img src="' + desc.imageUri + '"';
                                    if (this.options.width)
                                        imageHtml += 'style="width:' + this.options.width + 'px;"';
                                    imageHtml += "/>";
                                }
                                $taxonDescription.append($descHeader).append($descDiv).append($descFooter);
                                $taxonImage.append(imageHtml);
                            } else {
                                $descHeader = $(this.notFoundHeader(strainName, desc.searchTerm, desc.redirectFrom));
                                $taxonDescription.append($descHeader);
                                $taxonImage.append('Unable to find an image.');
                            }
                        } else {
                            descHtml = this.notFoundHeader(strainName);
                        }

                        // var descId = this.uid();
                        // var imageId = this.uid();

                        /* This is the tabbed view
                         var $contentDiv = $("<div />")
                         .addClass("tab-content")
                         .append($("<div />")
                         .attr("id", descId)
                         .addClass("tab-pane fade active in")
                         .append(descHtml)
                         )
                         .append($("<div />")
                         .attr("id", imageId)
                         .addClass("tab-pane fade")
                         .append(imageHtml)
                         );
                         
                         var $descTab = $("<a />")
                         .attr("href", "#" + descId)
                         .attr("data-toggle", "tab")
                         .append("Description");
                         
                         var $imageTab = $("<a />")
                         .attr("href", "#" + imageId)
                         .attr("data-toggle", "tab")
                         .append("Image");
                         
                         var $tabSet = $("<ul />")
                         .addClass("nav nav-tabs")
                         .append($("<li />")
                         .addClass("active")
                         .append($descTab)
                         )
                         .append($("<li />")
                         .append($imageTab)
                         ); */

                        //this.$elem.append($tabSet).append($contentDiv);

                        this.hideMessage();

                        this.$elem.append($('<div id="mainview">')
                            .css('overflow', 'auto')
                            .append($('<table cellpadding=4, cellspacing=2, border=0 style="width:100%">')
                                .append($('<tr>')
                                    .append($('<td style="vertical-align:top">')
                                        .append($taxonDescription))
                                    .append($('<td style="vertical-align:top">')
                                        .append($taxonImage))))
                            .append($('<br>')));
                    }, this),
                    $.proxy(this.renderError, this)
                    );
            },
            /**
             * @function renderWorkspace
             * Fetches the Genome taxonomy and scientific name from the workspace, and
             * passes it along to renderTaxonomy
             * @public
             */
            renderWorkspace: function () {
                var self = this;
                this.searchedOnce = false;
                this.showMessage(html.loading('loading...'));
                var obj = this.buildObjectIdentity(this.options.workspaceID, this.options.genomeID);

                obj['included'] = ["/taxonomy", "/scientific_name"];

                function onDataLoad(genome) {
                    if (genome['taxonomy']) {
                        var tax = genome['taxonomy'];
                        var taxList = [];
                        var nameTokens = genome['scientific_name'].split(/\s+/);
                        for (var i = nameTokens.length; i > 0; i--) {
                            taxList.push(nameTokens.slice(0, i).join(' '));
                        }
                        if (taxList && taxList !== "Unknown") {
                            // parse the taxonomy, however it's munged together. semicolons, i think?
                            taxList = taxList.concat(tax.split(/\;\s*/).reverse());
                        }
                        self.renderFromTaxonomy(taxList);
                    } else if (genome['scientific_name']) {
                        var taxList = [];
                        var nameTokens = genome['scientific_name'].split(/\s+/);
                        for (var i = nameTokens.length; i > 0; i--) {
                            taxList.push(nameTokens.slice(0, i).join(' '));
                        }
                        self.renderFromTaxonomy(taxList);
                    }

                }

                if (self.options.genomeInfo) {
                    onDataLoad(self.options.genomeInfo.data);
                } else {
                    self.options.kbCache.ws.get_object_subset([obj],
                        function (data) {
                            if (data[0]) {
                                onDataLoad(data[0]['data']);
                            }
                        },
                        function (error) {
                            var obj = self.buildObjectIdentity(self.options.workspaceID, self.options.genomeID);
                            obj['included'] = ["/scientific_name"];
                            self.options.kbCache.ws.get_object_subset([obj], function (data) {
                                if (data[0]) {
                                    onDataLoad(data[0]['data']);
                                }
                            },
                                function (error) {
                                    self.renderError(error);
                                });
                        });
                }
            },
            /**
             * @method buildObjectIdentity
             * Helper function that builds an ObjectIdentity 
             * (used by the workspace to look up and return an object).
             * @param {string|number} workspaceID - ID or name of the workspace we're looking up from
             * @param {string|number} objectID - ID or name of the object we're looking up
             * @returns {object} objId
             * @property {number} objId.wsid - the numerical workspace id (if a number given)
             * @property {string} objId.workspace - the string id (if a string given)
             * @property {number} objId.objid - the numerical object id (if a number given)
             * @property {string} objId.name - the name of the object (if a string given)
             * @private
             */
            buildObjectIdentity: function (workspaceID, objectID) {
                var obj = {};
                if (/^\d+$/.exec(workspaceID))
                    obj['wsid'] = workspaceID;
                else
                    obj['workspace'] = workspaceID;

                // same for the id
                if (/^\d+$/.exec(objectID))
                    obj['objid'] = objectID;
                else
                    obj['name'] = objectID;
                return obj;
            },
            /**
             * @function uid
             * Generates a random 16-character string in all caps
             * @returns {string} a randomized id string
             * @public
             */
            uid: function () {
                var id = '';
                for (var i = 0; i < 32; i++)
                    id += Math.floor(Math.random() * 16).toString(16).toUpperCase();
                return id;
            },
            /**
             * @function notFoundHeader
             * Generates some HTML to show if a given strain is not found.
             * This renders the name of the strain that wasn't found, by default. If a different term
             * was found and rendered, it (and its possible redirect) are also layed out.
             * @param {string} strainName - (required) the name of the original strain that wasn't found.
             * @param {string} term - (optional) the term that was found and rendered
             * @param {string} redirectFrom - (optional) if a redirect was used to get to that term,
             *                                show that, too.
             * @return {string} an HTML string with the parameters rendered nicely.
             * @private
             */
            notFoundHeader: function (strainName, term, redirectFrom) {
                var underscoredName = strainName.replace(/\s+/g, "_");
                var str = "<p><b>\"<i>" +
                    strainName +
                    "</i>\" not found in Wikipedia. Add a description on <a href='http://en.wikipedia.org/wiki/" +
                    underscoredName +
                    "' target='_new'>Wikipedia</a>.</b></p>";
                if (term) {
                    str += "<p><b>Showing description for <i>" +
                        term +
                        "</i></b>";
                    if (redirectFrom) {
                        str += "<br>redirected from <i>" + redirectFrom + "</i>";
                    }
                    str += "</p>";
                }
                return str;
            },
            /**
             * @function redirectHeader
             * Generates HTML that shows that the currently displayed information was found through
             * a redirect on Wikipedia.
             * @param {string} strainName - (required) the name of the original strain that wasn't found.
             * @param {string} term - (required) the term that was found and rendered
             * @param {string} redirectFrom - (required) if a redirect was used to get to that term,
             *                                show that, too.
             * @return {string} an HTML string with the parameters rendered nicely.
             * @private
             */
            redirectHeader: function (strainName, redirectFrom, term) {
                var underscoredName = redirectFrom.replace(/\s+/g, "_");
                var str = "<p><b>" +
                    "Showing description for <i>" + term + "</i></b>" +
                    "<br>redirected from <i>" + underscoredName + "</i>" +
                    "</p>";

                return str;
            },
            /**
             * @function showMessage
             * Shows a status message in the widget.
             * @param {string} message - the message to show (can be HTML)
             * @private
             */
            showMessage: function (message) {
                var span = $("<span>").append(message);

                this.$messagePane.append(span);
                this.$messagePane.removeClass("kbwidget-hide-message");
            },
            /**
             * @function hideMessage
             * Hides a previously shown message in the widget
             * @private
             */
            hideMessage: function () {
                this.$messagePane.addClass("kbwidget-hide-message");
                this.$messagePane.empty();
            },
            /**
             * @function getData
             * @deprecated
             * Returns a data object with information that was previously used for
             * the "card" style of landing pages.
             * This is mostly deprecated now.
             * @public
             */
            getData: function () {
                return {
                    type: "Description",
                    id: this.options.genomeID,
                    workspace: this.options.workspaceID,
                    title: "Organism Description"
                };
            },
            /**
             * @function renderError
             * Renders the given error that occurs while looking up Wikipedia info, or making a KBase service call.
             * This overlaps everything on the widget and should be considered a fatal crash.
             * @param {string|object} error - if a string, this is the error string.
             * @param error.error.message - if this exists, then this is the error string.
             * @private
             */
            renderError: function (error) {
                errString = "Sorry, an unknown error occured. Wikipedia.org may be down or your browser may be blocking an http request to Wikipedia.org.";
                if (typeof error === "string")
                    errString = error;
                else if (error && error.error && error.error.message)
                    errString = error.error.message;

                var $errorDiv = $("<div>")
                    .addClass("alert alert-danger")
                    .append("<b>Error:</b>")
                    .append("<br>" + errString);
                this.$elem.empty();
                this.$elem.append($errorDiv);
            },
            searchedOnce: false,
            /**
             * @function wikipediaLookup
             * Uses Wikipedia to look up information about the genome, then passes 
             * the results to successCallback (or the error to errorCallback).
             *
             * This works with two calls to Wikipedia.
             * The first uses a series of terms in termList. It queries against each
             * string in the array, looking for a page match (with redirects). These
             * can be any strings, but are expected to be details of the genome's 
             * taxonomy in order from detailed strain on up.
             * 
             * For example, for genome kb|g.0, this list contains:
             * ["Escherichia coli K12", "Escherichia coli", "Escherichia", 
             *  "Enterobacteriaceae", "Enterobacteriales", "Gammaproteobacteria", ...]
             * and so on.
             *
             * Once a Wikipedia hit is found (if any), it does a second search to 
             * find the image used on that page. This uses the pageImages query in the
             * Wikipedia API, limiting the image size to this.width. (the API does the
             * resizing for us) If an image is found, its URI is added to the result.
             *
             * Since this runs asynchronously, in the end, the results are passed to 
             * successCallback, or it triggers errorCallback.
             *
             * @param {Array} termList - list of acceptable terms to return. If the first one is unavailable, then it looks for the second one, and so on
             * @param {function} successCallback - callback to invoke when completed successfully
             * @param {function} errorCallback - callback to invoke when an error occurs during execution.
             * @private
             */
            wikipediaLookup: function (termList, successCallback, errorCallback) {
                if (!termList || Object.prototype.toString.call(termList) !== '[object Array]' || termList.length === 0) {
                    if (errorCallback && !this.searchedOnce) {
                        errorCallback("No search term given");
                    }
                }
                this.searchedOnce = true;
                // take the first term off the list, so we can pass the rest of it if we need to re-call this functionk
                var searchTerm = termList.shift();

                var requestUrl = '//en.wikipedia.org/w/api.php?action=parse&format=json&prop=text|pageimages&section=0&redirects=&callback=?&page=' + searchTerm;
                var imageLookupUrl = '//en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=' + this.options.width + '&callback=?&titles=';

                $.ajax({
                    type: 'GET',
                    url: requestUrl,
                    contentType: 'application/json; charset=utf-8',
                    async: true,
                    dataType: 'json'
                })
                    .then($.proxy(function (data, status) {
                        if (data.error) {
                            // do the next one in the list.
                            this.wikipediaLookup(termList, successCallback, errorCallback);
                        } else if (data.parse) {
                            // If we have valid text in the output, parse it how we want it.
                            if (data.parse.text) {
                                var hit = {'searchTerm': searchTerm};

                                // Our abstract is the whole text part.
                                var $abstract = $('<div>').html(data.parse.text["*"]);

                                // Remove active links to avoid confusion
                                $abstract.find('a').each(function () {
                                    $(this).replaceWith($(this).html());
                                });
                                // Remove Wiki page references
                                $abstract.find('sup.reference').remove();
                                $abstract.find('.mw-ext-cite-error').remove();

                                // The 'description' property of our hit is the parsed abstract field
                                hit['description'] = '';

                                // This is a trick to just get all of the 'p' fields, and concatenate the
                                // jQuery nodes together as a single HTML text blob.
                                $abstract.children('p').each(function (idx, val) {
                                    hit['description'] += '<p>' + $(val).html() + '</p>';
                                });

                                // The title is the actual Wikipedia page link, so put that here.
                                hit['wikiUri'] = '//www.wikipedia.org/wiki/' + data.parse.title;

                                // If we have a redirect, record it.
                                if (data.parse.redirects && data.parse.redirects.length > 0) {
                                    hit['redirectFrom'] = data.parse.redirects[0].from;
                                }

                                // Do image lookup based on the title
                                $.ajax({
                                    type: 'GET',
                                    url: imageLookupUrl + data.parse.title,
                                    contentType: 'application/json; charset=utf-8',
                                    async: true,
                                    dataType: 'json'
                                })
                                    .then(function (imageData, imageStatus) {
                                        // If this is truthy, then we have a successful API call.
                                        if (imageStatus) {
                                            hit['imageUri'] = null;
                                            // Really, all we want is in imageData.query.pages.<pageNum>.thumbnail.source
                                            // Since we're only looking up a single title here, there's a single pageNum
                                            // property, but we don't know what it is! So we look in the Object.keys()[0]
                                            if (imageData.query && imageData.query.pages &&
                                                Object.keys(imageData.query.pages).length > 0) {
                                                // joys of Javascript!
                                                var page = Object.keys(imageData.query.pages)[0];
                                                if (imageData.query.pages[page].thumbnail)
                                                    hit['imageUri'] = imageData.query.pages[page].thumbnail.source;
                                            }
                                        }
                                        // Finally, pass the finished result to successCallback
                                        if (successCallback) {
                                            successCallback(hit);
                                        }
                                    },
                                        function (error) {
                                            if (errorCallback) {
                                                errorCallback(error);
                                            }
                                        });
                            }
                        }
                    }, this),
                        function (error) {
                            if (errorCallback) {
                                errorCallback(error);
                            }
                        });
            },
            /**
             * @function dbpediaLookup
             * @deprecated This calls dbpedia (which requires going over HTTP), while the new wikipediaLookup function gives the same results over HTTP or HTTPS. Also, dbpedia tends to be really flaky whenever we're about to do a demo.
             *
             * Uses dbpedia to look up information about the genome, then passes 
             * the results to successCallback (or the error to errorCallback).
             *
             * This parses dbpedia's JSON format for a few fields of interest. 
             * If the image is missing, it's considered to be fine and returns
             * anyway.
             * 
             * If the request fails, an error is triggered.
             *
             * Since this runs asynchronously, in the end, the results are passed to 
             * successCallback, or it triggers errorCallback.
             * @public
             */
            dbpediaLookup: function (termList, successCallback, errorCallback, redirectFrom) {
                if (!termList || Object.prototype.toString.call(termList) !== '[object Array]' || termList.length === 0) {
                    if (errorCallback) {
                        errorCallback("No search term given");
                    }
                }

                var searchTerm = termList.shift();
                var usTerm = searchTerm.replace(/\s+/g, '_');

                var resourceKey = 'http://dbpedia.org/resource/' + usTerm;
                var abstractKey = 'http://dbpedia.org/ontology/abstract';
                var languageKey = 'en';
                var imageKey = 'http://xmlns.com/foaf/0.1/depiction';
                var wikiLinkKey = 'http://xmlns.com/foaf/0.1/isPrimaryTopicOf';
                var wikipediaUri = 'http://en.wikipedia.org/wiki';
                var redirectKey = 'http://dbpedia.org/ontology/wikiPageRedirects';

                var requestUrl = 'http://dbpedia.org/data/' + usTerm + '.json';
                $.get(requestUrl).then($.proxy(function (data, status) {
                    var processedHit = {
                        'searchTerm': searchTerm
                    };

                    if (data[resourceKey]) {
                        var resource = data[resourceKey];
                        if (!resource[wikiLinkKey] || !resource[abstractKey]) {
                            if (resource[redirectKey]) {
                                var tokens = resource[redirectKey][0]['value'].split('/');
                                this.dbpediaLookup([tokens[tokens.length - 1]], successCallback, errorCallback, searchTerm);
                            } else {
                                if (termList.length > 0)
                                    this.dbpediaLookup(termList, successCallback, errorCallback);
                                else
                                    successCallback(processedHit);
                            }
                        } else {
                            if (resource[wikiLinkKey]) {
                                processedHit['wikiUri'] = resource[wikiLinkKey][0]['value'];
                            }
                            if (resource[abstractKey]) {
                                var abstracts = resource[abstractKey];
                                for (var i = 0; i < abstracts.length; i++) {
                                    if (abstracts[i]['lang'] === languageKey)
                                        processedHit['description'] = abstracts[i]['value'];
                                }
                            }
                            if (resource[imageKey]) {
                                processedHit['imageUri'] = resource[imageKey][0]['value'];
                            }
                            if (redirectFrom) {
                                processedHit['redirectFrom'] = redirectFrom;
                            }
                            successCallback(processedHit);
                        }
                    } else {
                        if (termList.length > 0) {
                            this.dbpediaLookup(termList, successCallback, errorCallback);
                        } else {
                            successCallback(processedHit);
                        }
                    }
                    return processedHit;
                }, this),
                    function (error) {
                        if (errorCallback)
                            errorCallback(error);
                    });
            }
        });
    });