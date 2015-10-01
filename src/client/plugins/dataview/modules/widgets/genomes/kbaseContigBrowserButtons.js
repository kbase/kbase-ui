
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * Requires bootstrap 3 for buttons
 */
define(['jquery', 'kb.jquery.widget', 'bootstrap'],
    function ($) {
        'use strict';
        $.KBWidget({
            name: "KBaseContigBrowserButtons",
            parent: "kbaseWidget",
            version: "1.0.0",
            options: {
                direction: "horizontal", // also "vertical" eventually.
                browser: null
            },
            init: function (options) {
                this._super(options);

                if (this.options.browser === null) {
                    return;
                }

                var self = this;
                var $buttonSet = $("<div/>")
                    .addClass("btn-group")
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("|<<")
                        .append("|<<")
                        .click(function () {
                            self.options.browser.moveLeftEnd();
                        })
                        )
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("Previous")
                        .append("<")
                        .click(function () {
                            self.options.browser.moveLeftStep();
                        })
                        )
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("Zoom In")
                        .append("+")
                        .click(function () {
                            self.options.browser.zoomIn();
                        })
                        )
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("Zoom Out")
                        .append("-")
                        .click(function () {
                            self.options.browser.zoomOut();
                        })
                        )
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("Next")
                        .append(">")
                        .click(function () {
                            self.options.browser.moveRightStep();
                        })
                        )
                    .append($("<button/>")
                        .attr("type", "button")
                        .addClass("btn btn-default")
                        .css("font-size", "125%")
                        .css("font-weight", "bold")
                        //.append("Last")
                        .append(">>|")
                        .click(function () {
                            self.options.browser.moveRightEnd();
                        })
                        );


                this.$elem.append($("<div align='center'/>").append($buttonSet));

                return this;

            },
            render: function () {
                return this;
            }
        });

    });