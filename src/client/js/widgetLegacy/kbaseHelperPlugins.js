/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define(['jquery'], function ($) {
    'use strict';
    // jQuery plugins that you can use to add and remove a 
    // loading giff to a dom element.
    $.fn.rmLoading = function() {
        $(this).find('.loader').remove();
    };
    $.fn.loading = function(text, big) {
        $(this).rmLoading();

        if (big) {
            if (text !== undefined) {
                $(this).append('<p class="text-center text-muted loader"><br>'+
                     '<img src="assets/img/ajax-loader-big.gif"> '+text+'</p>');
            } else {
                $(this).append('<p class="text-center text-muted loader"><br>'+
                     '<img src="assets/img/ajax-loader-big.gif"> loading...</p>');      
            }
        } else {
            if (text !== 'undefined') {
                $(this).append('<p class="text-muted loader">'+
                     '<img src="assets/img/ajax-loader.gif"> '+text+'</p>');
            } else {
                $(this).append('<p class="text-muted loader">'+
                     '<img src="assets/img/ajax-loader.gif"> loading...</p>');      
            }

        }
        return this;
    };
    
});