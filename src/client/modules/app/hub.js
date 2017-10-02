/*
hub - the kbase ui web app
This module wraps the simple kbase ui app, adding plugins and services from the config, some default behavior, and launching the initial widget.
It incorporates much of what used to be encoded into app.js, but in order to have app be itself testable, much needed to be stripped out and placed into an app-specific module like this.
*/
define([
    './app'
], function (
    App
) {
    'use strict';

    function factory(config) {

        // lets make this declarative!



        // config.services = services;

        var app = App.make(config);
        // app.addServices(services);

        function start() {
            return app.start();
        }

        function stop() {
            return app.stop();
        }

        return {
            start: start,
            stop: stop
        };
    }

    return {
        make: factory
    };
});
