/*global define*/
/*jslint white: true, browser: true*/
define([
    
], function () {
    'use strict';
    
    function UIError(arg) {
        this.type = arg.type;
        this.reason = arg.reason;
        this.message = arg.message;
        this.blame = arg.blame;
        this.code = arg.code;
        this.suggestion = arg.suggestion;
    }
    UIError.prototype = new Error();
    
    return {
        UIError: UIError
    };
    
})

