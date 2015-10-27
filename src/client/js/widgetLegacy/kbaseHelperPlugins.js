/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb_common_html'
], function ($, html) {
    'use strict';
    // jQuery plugins that you can use to add and remove a 
    // loading giff to a dom element.
    $.fn.rmLoading = function () {
        $(this).find('.loader').remove();
    };
    $.fn.loading = function (text, big) {
        var div = html.tag('div');
        $(this).rmLoading();
        // TODO: handle "big"
        $(this).append(div({class: 'loader'}, html.loading(text)));
//        if (big) {
//            if (text !== undefined) {
//                $(this).append('<p class="text-center text-muted loader"><br>'+
//                     '<img src="assets/img/ajax-loader-big.gif"> '+text+'</p>');
//            } else {
//                $(this).append('<p class="text-center text-muted loader"><br>'+
//                     '<img src="assets/img/ajax-loader-big.gif"> loading...</p>');      
//            }
//        } else {
//            if (text !== 'undefined') {
//                $(this).append('<p class="text-muted loader">'+
//                     '<img src="assets/img/ajax-loader.gif"> '+text+'</p>');
//            } else {
//                $(this).append('<p class="text-muted loader">'+
//                     '<img src="assets/img/ajax-loader.gif"> loading...</p>');      
//            }
//
//        }
        return this;
    };
});