define([
    'bluebird',
    'jquery',
    'kb/common/dom',
    'kb/common/html',
    'kb/widget/widgetSet'
], function (Promise, $, DOM, html, WidgetSet) {
    'use strict';

    // favorites callback should accept:
    //  
    //  favoritesCallback(this.info)
    //    info = 
    //      id:
    //      module_name:
    //      ...
    //     
    //function FunctionCard(type, info, tag, nms_base_url, favoritesCallback, favoritesCallbackParams, isLoggedIn) {
    

    function FunctionCard(info, isLoggedIn) {

        this.$divs = [];
        this.info = info;
        this.isLoggedIn = isLoggedIn;

        this.cardsAdded = 0;


        //this.favoritesCallback = favoritesCallback;
        //this.favoritesCallbackParams = favoritesCallbackParams;

        this.show = function() {
            for(var k=0; k<this.$divs.length; k++) {
                this.$divs[k].show();
            }
        };

        this.hide = function() {
            for(var k=0; k<this.$divs.length; k++) {
                this.$divs[k].hide();
            }
        };

        /* get a new card that can be added to a DOM element */
        this.getNewCardDiv = function() {
            this.cardsAdded += 1;
            if(this.$divs.length<this.cardsAdded) {
                var $newCard = this._renderFunctionCard();
                this.$divs.push($newCard);
                return $newCard;
            } else {
                return this.$divs[this.cardsAdded-1];
            }

        };

        /* assumes the cards have been detached from DOM*/
        this.clearCardsAddedCount = function() {
            this.cardsAdded = 0;
        };

        this.clearCardsFromMemory = function() {
            this.cardsAdded = 0;
            this.$divs=0;
        };


////////// COMMENT OUT FAVORITE SUPPORT, NOT AVAILABLE YET FOR LOCAL FUNCTIONS
        // this.starCount = null;
        // this.onStar = false;
        // this.deactivatedStar = false;
        // this.onStarTime = 0;

        // /* timestamp => the time at which this was favorited, optional */
        // this.turnOnStar = function(timestamp) {
        //     this.onStar = true;
        //     for(var k=0; k<this.$divs.length; k++) {
        //         this.$divs[k].find('.kbcb-star')
        //             .removeClass('kbcb-star-nonfavorite').addClass('kbcb-star-favorite');
        //     }
        //     if(timestamp) {
        //         this.onStarTime = timestamp;
        //     }
        // };
        // this.turnOffStar = function() {
        //     this.onStar = false;
        //     for(var k=0; k<this.$divs.length; k++) {
        //         this.$divs[k].find('.kbcb-star')
        //             .removeClass('kbcb-star-favorite').addClass('kbcb-star-nonfavorite');
        //     }
        // };

        // this.isStarOn = function() {
        //     return this.onStar;
        // }
        // this.getStarTime = function() {
        //     return this.onStarTime;
        // }

        // this.deactivateStar = function() {
        //     this.deactivatedStar = true;
        //     for(var k=0; k<this.$divs.length; k++) {
        //         this.$divs[k].find('.kbcb-star')
        //             .removeClass('kbcb-star-favorite').removeClass('kbcb-star-nonfavorite');
        //     }
        // };

        // this.getStarCount = function(count) {
        //     if(this.starCount) return this.starCount;
        //     return 0;
        // };

        // this.setStarCount = function(count) {
        //     this.starCount = count;
        //     if(this.starCount<=0) { this.starCount = null; }
        //     if(this.starCount) {
        //         for(var k=0; k<this.$divs.length; k++) {
        //             this.$divs[k].find('.kbcb-star-count').html(count);
        //         }
        //     } else {
        //         for(var k=0; k<this.$divs.length; k++) {
        //             this.$divs[k].find('.kbcb-star-count').empty();
        //         }
        //     }
        // };
//////////

        this.runCount = null;

        this.setRunCount = function(runs) {
            this.runCount = runs;
            if(this.runCount) {
                for(var k=0; k<this.$divs.length; k++) {
                    this.$divs[k].find('.kbcb-runs').empty()
                        .append('<i class="fa fa-share"></i>')
                        .append($('<span>').addClass('kbcb-run-count').append(this.runCount))
                        .tooltip({title:'Ran '+this.runCount+' times.', placement:'bottom',container:'body',
                                        delay:{show: 400, hide: 40}});;
                }
            }
        };
        this.getRunCount = function() {
            if(this.runCount) return this.runCount;
            return 0;
        }


        this._renderFunctionCard = function() {

            var info = this.info;

            // Main Container
            var $appDiv = $('<div>').addClass('kbcb-app-card kbcb-hover container');

            // HEADER - contains logo, title, module link, authors
            var $topDiv = $('<div>').addClass('row kbcb-app-card-header').css({'padding-left':'10px'});
            
            var $titleSpan = $('<div>').addClass('col-xs-12 kbcb-app-card-title-panel');
                
            $titleSpan.append($('<div>').addClass('kbcb-app-card-title').append(info.name));

            $titleSpan.append($('<div>').addClass('kbcb-function-prototype-title').css({'margin':'4px'})
                .append('funcdef <span style="font-weight:bold">'+info.function_id+'</span>(...)'));

            $titleSpan.append($('<div>').addClass('kbcb-app-card-module').css({'padding-top':'4px'}).append(
                                    $('<a href="#appcatalog/module/'+info.module_name+'">')
                                        .append(info.module_name)
                                        .on('click',function(event) {
                                            // have to stop propagation so we don't go to the app page first
                                            event.stopPropagation();
                                        }))
                                    .append(' v'+info.version)
                            );

            
            if(info.authors.length>0) {
                var $authorDiv = $('<div>').addClass('kbcb-app-card-authors').append('by ');
                for(var k=0; k<info.authors.length; k++) {
                    if(k>=1) {
                        $authorDiv.append(', ');
                    }
                    if(k>=2) {
                        $authorDiv.append(' +'+(info.authors.length-2)+' more');
                        break;
                    }
                    $authorDiv.append($('<a href="#people/'+info.authors[k]+'">')
                                            .append(info.authors[k])
                                            .on('click',function(event) {
                                                // have to stop propagation so we don't go to the app page first
                                                event.stopPropagation();
                                            }));
                }
                $titleSpan.append($authorDiv);
            }


            $appDiv.append($topDiv.append($titleSpan));


            // SUBTITLE - on mouseover of info, show subtitle information
            var $subtitle = $('<div>').addClass('kbcb-app-card-subtitle').append(info.short_description).hide()
            $appDiv.append($subtitle);

            // FOOTER - stars, number of runs, and info mouseover area
            var $footer = $('<div>').addClass('clearfix kbcb-app-card-footer');



            /* FAVORITES - not yet implemented for functions */
            $footer.append($('<div>').addClass('col-xs-3').css('text-align','left'));


            /* RUN COUNT - not yet implemented for functions
            var nRuns = Math.floor(Math.random()*10000);
            var $nRuns = $('<div>').addClass('col-xs-3').css('text-align','left');
            $nRuns.append($('<span>').addClass('kbcb-runs'));
            if(this.nRuns) {
                $nRuns
                    .append('<i class="fa fa-share"></i>')
                    .append($('<span>').addClass('kbcb-run-count').append(this.nRuns))
                    .tooltip({title:'Ran '+nRuns+' times.', container: 'body', placement:'bottom',
                                    delay:{show: 400, hide: 40}});
                }
                $footer.append($nRuns);
            } else {
                $footer.append($('<div>').addClass('col-xs-3'))
            }*/
            $footer.append($('<div>').addClass('col-xs-3').css('text-align','left'));

            // buffer spacing before the info icon
            $footer.append($('<div>').addClass('col-xs-4').css('text-align','left'));

            var $moreInfoDiv = $('<div>').addClass('col-xs-1').addClass('kbcb-info').css('text-align','right');
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


            $appDiv.on('click', function() {
                if(info.git_commit_hash) {
                    window.location.href = '#catalog/functions/'+info.module_name + '/' + info.function_id + '/' +info.git_commit_hash;
                } else {
                    window.location.href = '#catalog/functions/'+info.module_name + '/' + info.function_id;
                }
            });

            // put it all in a container so we can control margins
            var $appCardContainer = $('<div>').addClass('kbcb-app-card-container');
            return $appCardContainer.append($appDiv);
        };



    }

    return FunctionCard;
});