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
    };

    return CatalogUtil;
});