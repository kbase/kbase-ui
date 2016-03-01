/*global define*/
/*jslint white:true,browser:true */
define([
    './googleAnalytics'
], function (GoogleAnalytics) {
    'use strict';

    function create() {
        GoogleAnalytics.create();
    }

    function send() {
        GoogleAnalytics.send();
    }

    return {
        create: create,
        send: send
    };
});