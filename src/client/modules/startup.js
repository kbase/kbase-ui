(function (root) {
    'use strict';
    function handleGlobalError(err) {
        switch (err.requireType) {
        case 'notloaded':
            if (/esprima/.test(err.message)) {
                // ignore esprima for now. The loading is attempted within the 
                // yaml library ...
                console.warn('esprima require test detected');
                return;
            } else if (/buffer/.test(err.message)) {
                // blame js-yaml
                console.warn('buffer require test detected');
                return;
            }
            break;
        case 'timeout':
            if (err.requireModules) {
                if (err.requireModules.some(function (module) {
                    if (module === '//www.google-analytics.com/analytics.js') {
                        return true;
                    }
                    return false;
                })) {
                    root.KBaseFallback.showError({
                        title: 'Analytics Blocked (timeout)',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.'
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'http://kbase.us/incompatible-plugins'
                        }]
                    });
                }
            }
            break;
        case 'require':
            console.error('Error in require-loaded code');
            console.error(err);
            return;
        case 'scripterror':
            if (err.requireModules) {
                if (err.requireModules.some(function (moduleName) {
                    return (moduleName === 'app/googleAnalytics');
                })) {
                    // KBaseFallback.redirect('/pages/gablocked.html');
                    root.KBaseFallback.showError({
                        title: 'Analytics Blocked (scripterror)',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.'
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'http://kbase.us/incompatible-plugins'
                        }]
                    });
                    return;
                }
            }
            break;
        case 'define':
        case 'fromtexteval':
        case 'mismatch':
        case 'requireargs':
        case 'nodefine':
        case 'importscripts':
            break;
        }

        //        console.error('AMD Error');
        //        console.error('Type', err.requireType);
        //        console.error('Modules', err.requireModules);
        //        console.error('Message', err.message);
        //        console.error(err);

        root.KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message,
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null
            ],
            references: [{
                title: 'Reporting Application Errors',
                url: 'http://kbase.us/contact-us'
            }]
        });

        throw err;
    }

    function handleStartupError(err) {
        switch (err.requireType) {
        case 'notloaded':
            if (/xesprima/.test(err.message)) {
                // ignore esprima for now. The loading is attempted within the 
                // yaml library ...
                console.warn('esprima require test detected');
                return;
            }
            break;
        case 'scripterror':
            if (err.requireModules) {
                if (err.requireModules.some(function (moduleName) {
                    return (moduleName === 'app/googleAnalytics');
                })) {
                    // KBaseFallback.redirect('/pages/gablocked.html');
                    root.KBaseFallback.showError({
                        title: 'Analytics Blocked',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface (NI). The Narrative Interface will not operate with this constraint in place.'
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'http://kbase.us/incompatible-plugins'
                        }]
                    });
                    return;
                }
            }
            break;
        }

        root.KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message,
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null
            ],
            references: [{
                title: 'Reporting Application Errors',
                url: 'http://kbase.us/contact-us'
            }]
        });

        throw err;
    }

    require.onError = handleGlobalError;

    require(['app/main'], function (main) {
        if (root.KBaseFallback.getErrorState()) {
            return;
        }
        main.start()
            .catch(function (err) {
                console.error('Startup Error', err);
                root.KBaseFallback.showError({
                    title: 'KBase UI Startup Error',
                    content: [
                        'An error has occurred while starting the KBase UI.',
                        err.message
                    ],
                    references: [{
                        title: 'Reporting Errors',
                        url: 'http://kbase.us/contact-us'
                    }]
                });
            });
    }, function (err) {
        handleStartupError(err);
    });
}(window));
