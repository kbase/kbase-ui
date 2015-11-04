/*
 *  Directives
 *
 *  These can be thought of as the 'widgets' on a page.
 *  Scope comes from the controllers.
 *
 */

// TODO: Handle failures and ensure that widget.destroy is called if need be.

angular.module('dashboard-directives', []);
angular.module('dashboard-directives')
        .directive('dashboardnarratives', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.narratives'], function (W) {
                        var widget = Object.create(W).init({
                            container: $(ele),
                            viewState: scope.viewState
                        }).start();
                        scope.$on('$destroy', function () {
                            if (widget) {
                                try {
                                    widget.stop();
                                } finally {
                                    // What do do here?
                                }
                            }
                        });
                    });
                }
            };
        })
        .directive('dashboardsharednarratives', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.sharedNarratives'], function (W) {
                        var widget = Object.create(W).init({
                            container: $(ele),
                            viewState: scope.viewState
                        }).start();
                        scope.$on('$destroy', function () {
                            if (widget) {
                                try {
                                    widget.stop();
                                } finally {
                                    // What do do here?
                                }
                            }
                        });
                    });
                }
            };
        })
        .directive('dashboardpublicnarratives', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.publicNarratives'], function (W) {
                        var widget = Object.create(W).init({
                            container: $(ele),
                            viewState: scope.viewState
                        }).start();
                        scope.$on('$destroy', function () {
                            if (widget) {
                                try {
                                    widget.stop();
                                } finally {
                                    // What do do here?
                                }
                            }
                        });
                    });
                }
            };
        })
        .directive('dashboardprofile', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.profile', 'jquery'], function (W, $) {
                        var widget = Object.create(W).init({
                            container: $(ele),
                            viewState: scope.viewState
                        }).start();
                        scope.$on('$destroy', function () {
                            if (widget) {
                                try {
                                    widget.stop();
                                } finally {
                                    // What do do here?
                                }
                            }
                        });
                    });
                }
            };
        })

        .directive('dashboardapps', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.apps'], function (Widget) {
                        var widget = Object.create(Widget).init({
                            container: $(ele),
                            viewState: scope.viewState
                        }).start();
                        scope.$on('$destroy', function () {
                            if (widget) {
                                try {
                                    widget.stop();
                                } finally {
                                    // What do do here?
                                }
                            }
                        });
                    });
                }
            };
        })

        /*.directive('dashboarddata', function ($rootScope) {
         return {
         link: function (scope, ele, attrs) {
         require(['kb.widget.dashboard.data'], function (Widget) {
         Object.create(Widget).init({
         container: $(ele),
         viewState: scope.viewState
         }).go();
         });
         }
         };
         })
         */
        .directive('dashboardmetrics', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    try {
                        require(['kb.widget.dashboard.metrics'], function (Widget) {
                            var widget = Object.create(Widget).init({
                                container: $(ele),
                                viewState: scope.viewState
                            }).start();
                            scope.$on('$destroy', function () {
                                if (widget) {
                                    try {
                                        widget.stop();
                                    } finally {
                                        // What do do here?
                                    }
                                }
                            });
                        },
                                function (err) {
                                    $(ele).html('Exception rendering widget: ' + err);
                                    console.log('EX in require in dashboardmetrics');
                                    console.log(err);
                                });
                    } catch (ex) {
                        $(ele).html('Exception rendering widget: ' + ex);
                        console.log('EX in dashboardmetrics');
                        console.log(ex);
                    }
                }
            };
        })
        .directive('dashboardcollaboratornetwork', function ($rootScope) {
            "use strict";
            return {
                link: function (scope, ele, attrs) {
                    require(['kb.widget.dashboard.collaborators'], function (Widget) {
                        try {
                            var widget = Object.create(Widget).init({
                                container: $(ele),
                                userId: scope.params.userid,
                                viewState: scope.viewState
                            }).start();
                            scope.$on('$destroy', function () {
                                if (widget) {
                                    try {
                                        widget.stop();
                                    } finally {
                                        // What do do here?
                                    }
                                }
                            });
                        } catch (ex) {
                            $(ele).html('Error: ' + ex);
                        }
                    });
                }
            };
        });