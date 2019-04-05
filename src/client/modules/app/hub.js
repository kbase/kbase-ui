/*
hub - the kbase ui web app
This module wraps the simple kbase ui app, adding plugins and services from the config, some default behavior, and launching the initial widget.
It incorporates much of what used to be encoded into app.js, but in order to have app be itself testable, much needed to be stripped out and placed into an app-specific module like this.
*/
define(['./App'], function (App) {
    'use strict';

    function factory(config) {
        var app = App.make(config);

        function start() {
            return app.start().then((runtime) => {
                // kick off handling of the current route.
                runtime.send('app', 'do-route');

                // TODO: detect if already on signedout page.
                // TODO: this behavior should be defined in the main app
                // TODO: there this behavior should look at the current plugin route,
                // if it does not require authorization, just send let it be -- it should
                // listen for the auth event itself and handle things appropriately.
                // We'll have to update those or add a new plugin flag indicating that the
                // plugin handles auth change events itself.

                runtime.receive('session', 'loggedin', function () {});

                runtime.receive('session', 'loggedout', function () {
                    const authRequired = runtime.service('route').isAuthRequired();
                    // If the current route specifies that authorization is required,
                    // we just unceremoniously bounce to the signedout page.
                    // Otherwise we do nothing -- the route handler widget should be
                    // listening for session loggedin and loggedout and making
                    // appropriate adjustments.
                    if (authRequired) {
                        runtime.send('app', 'navigate', {
                            path: 'auth2/signedout'
                        });
                    }
                });
            });
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
