define([
    'bluebird',
    'jquery',
    'kb/common/dom',
    'kb/common/html',
    'kb/widget/widgetSet'
], function (Promise, $, DOM, html, WidgetSet) {
    'use strict';

    function CatalogUtil() {
        this.doStuff = function() {
            alert('stuff');
        }
        // edited from: http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
        this.getTimeStampStr = function (objInfoTimeStamp) {
            var date = new Date(objInfoTimeStamp);
            var seconds = Math.floor((new Date() - date) / 1000);

            // f-ing safari, need to add extra ':' delimiter to parse the timestamp
            if (isNaN(seconds)) {
                var tokens = objInfoTimeStamp.split('+');  // this is just the date without the GMT offset
                var newTimestamp = tokens[0] + '+' + tokens[0].substr(0, 2) + ":" + tokens[1].substr(2, 2);
                date = new Date(newTimestamp);
                seconds = Math.floor((new Date() - date) / 1000);
                if (isNaN(seconds)) {
                    // just in case that didn't work either, then parse without the timezone offset, but
                    // then just show the day and forget the fancy stuff...
                    date = new Date(tokens[0]);
                    return this.monthLookup[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                }
            }

            var interval = Math.floor(seconds / 31536000);
            if (interval > 1) {
                return this.monthLookup[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                if (interval < 4) {
                    return interval + " months ago";
                } else {
                    return this.monthLookup[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                }
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days ago";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours ago";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes ago";
            }
            return Math.floor(seconds) + " seconds ago";
        };

        this.getTimeStampStrAbsolute = function (objInfoTimeStamp) {
            var date = new Date(objInfoTimeStamp);
            var seconds = Math.floor((new Date() - date) / 1000);

            // f-ing safari, need to add extra ':' delimiter to parse the timestamp
            if (isNaN(seconds)) {
                var tokens = objInfoTimeStamp.split('+');  // this is just the date without the GMT offset
                var newTimestamp = tokens[0] + '+' + tokens[0].substr(0, 2) + ":" + tokens[1].substr(2, 2);
                date = new Date(newTimestamp);
                seconds = Math.floor((new Date() - date) / 1000);
                if (isNaN(seconds)) {
                    // just in case that didn't work either, then parse without the timezone offset, but
                    // then just show the day and forget the fancy stuff...
                    date = new Date(tokens[0]);
                    return this.monthLookup[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                }
            }
            return date.getHours()+ ":"+ 
                    date.getMinutes()+":"+
                    date.getSeconds()+" " +
                    this.monthLookup[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
             
        };



        /* rendering methods that are shared in multiple places */

        this.renderAppCard = function(app) {
            //console.log(app)

            // Main Container
            var $appDiv = $('<div>').addClass('kbcb-app-card kbcb-hover');

            // HEADER - contains logo, title, module link, authors
            var $topDiv = $('<div>').addClass('clearfix kbcb-app-card-header');
            var $logoSpan = $('<div>').addClass('col-xs-4 kbcb-app-card-logo');
            // add actual logos here
            $logoSpan.append('<div class="fa-stack fa-3x"><i class="fa fa-square fa-stack-2x method-icon"></i><i class="fa fa-inverse fa-stack-1x fa-cube"></i></div>')
            var $titleSpan = $('<div>').addClass('col-xs-8 kbcb-app-card-title-panel');
                
            $titleSpan.append($('<div>').addClass('kbcb-app-card-title').append(app.info.name));
            if(app.info['module_name']) {
                $titleSpan.append($('<div>').addClass('kbcb-app-card-module').append(
                                        $('<a href="#appcatalog/module/'+app.info.module_name+'">')
                                            .append(app.info.module_name)
                                            .on('click',function() {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            })));
            }

            if(app.type==='method') {
                if(app.info.authors.length>0) {
                    var $authorDiv = $('<div>').addClass('kbcb-app-card-authors').append('by ');
                    for(var k=0; k<app.info.authors.length; k++) {
                        if(k>=1) {
                            $authorDiv.append(', ');
                        }
                        if(k>=2) {
                            $authorDiv.append(' +'+(app.info.authors.length-2)+' more');
                            break;
                        }
                        $authorDiv.append($('<a href="#people/'+app.info.authors[k]+'">')
                                            .append(app.info.authors[k])
                                            .on('click',function() {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            }));
                    }
                    $titleSpan.append($authorDiv);
                }
            }


            $appDiv.append(
                $topDiv
                    .append($logoSpan)
                    .append($titleSpan));


            // SUBTITLE - on mouseover of info, show subtitle information
            var $subtitle = $('<div>').addClass('kbcb-app-card-subtitle').append(app.info.subtitle).hide()
            $appDiv.append($subtitle);


            // FOOTER - stars, number of runs, and info mouseover area
            var $footer = $('<div>').addClass('clearfix kbcb-app-card-footer');


            var $starDiv = $('<div>').addClass('col-xs-3').css('text-align','left');
            var $star = $('<span>').addClass('kbcb-star').append('<i class="fa fa-star"></i>');
            $star.on('click', function() {
                event.stopPropagation();
                alert('You have favorited this app - currently does nothing');
            });
            var favoriteCount = Math.floor(Math.random()*100);
            $footer.append($starDiv.append($star).append('&nbsp;'+favoriteCount));
            $starDiv.tooltip({title:'A favorite method of '+favoriteCount+' people.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});


            var nRuns = Math.floor(Math.random()*10000);
            var $nRuns = $('<div>').addClass('col-xs-4').css('text-align','left');
            $nRuns.append($('<span>').append('<i class="fa fa-share"></i>'));
            $nRuns.append('&nbsp;'+nRuns);
            $nRuns.tooltip({title:'Run in a narrative '+nRuns+' times.', placement:'bottom',
                                    delay:{show: 400, hide: 40}});

            $footer.append($nRuns);

            var $moreInfoDiv = $('<div>').addClass('col-xs-5').addClass('kbcb-info').css('text-align','right');
            $moreInfoDiv
                .on('mouseenter', function() {
                    $topDiv.hide();
                    $subtitle.fadeIn('fast');
                })
                .on('mouseleave', function() {
                    $subtitle.hide();
                    $topDiv.fadeIn('fast');
                });
            $moreInfoDiv.append($('<span>').append('<i class="fa fa-info"></i>'));
            $footer.append($moreInfoDiv);
            $appDiv.append($footer);


            // On click, go to the method page
            $appDiv.on('click', function() {
                if(app.type === 'method') {
                    window.location.href = "#narrativestore/method/"+app.info.id;
                } else {
                    window.location.href = "#narrativestore/app/"+app.info.id;
                }
            });

            // put it all in a container so we can control margins
            var $appCardContainer = $('<div>').addClass('kbcb-app-card-container');
            app.$div = $appCardContainer.append($appDiv);
        };

        this.skipApp = function(categories) {
            for(var i=0; i<categories.length; i++) {
                if(categories[i]=='inactive') {
                    return true;
                }
                if(categories[i]=='viewers') {
                    return true;
                }
                if(categories[i]=='importers') {
                    return true;
                }
            }
            return false;
        };



        this.monthLookup = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }

    return CatalogUtil;
});