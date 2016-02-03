/*global define*/
/*jslint white:true,browser:true */
define([
], function () {
    'use strict';
    var googleAnalytics;
    /**
     * Google analytics injection - creates a "ga" global function
     *
     * Might consider making this a module dependency, maybe link it
     * to the router, so we know what routes folks use.
     *
     * Or not.
     */
    function init(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        };
        i[r].l = 1 * new Date();
        a = s.createElement(o);
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
        return i[r];
    }
    
    googleAnalytics = init(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    function create() {
        googleAnalytics('create', 'UA-48256002-1', 'kbase.us');
    }
    
    function send() {
        googleAnalytics('send', 'pageview');
    }
    
    return {
        create: create,
        send: send
    };
});