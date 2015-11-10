/*global define*/
/*jslint white:true,browser:true*/
define([
    'jquery',
    'bluebird'
], function ($, Promise) {
    'use strict';
    function getJSON(arg) {
        if (arg.sync) {
            var returnData;
            $.get({
                url: '/data/' + arg.path + '/' + arg.file + '.json', // should not be hardcoded!! but figure that out later
                async: false,
                dataType: 'json',
                success: function (data) {
                    returnData = data;
                },
                error: function (err) {
                    throw new Error('Error getting data: ' + arg.file);
                }
            });
            return returnData;
        } else {
            return new Promise.resolve($.get('/data/' + arg.path + '/' + arg.file + '.json'));
        }
    }

    return {
        getJSON: getJSON
    };
});