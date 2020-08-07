(function (root) {
    'use strict';

    /*
    This function is attached to requirejs as the global error handler.
    It is called in the case of a require or define throwing an error,
    including module load errors, which are identified by the presence of the
    "requireType" property of the error object.
    Some of the libraries we use throw harmless errors under certain conditions.
    By catching them here we can ignore them.
    All other cases result in the fallback error ui being invoked.
    */
    require.onError = (err) => {
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
                    return (module === '//www.google-analytics.com/analytics.js');
                })) {
                    root.KBaseFallback.showError({
                        title: 'Analytics Blocked (timeout)',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.'
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'https://docs.kbase.us/incompatible-plugins'
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
                            url: 'https://docs.kbase.us/incompatible-plugins'
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
                url: 'https://www.kbase.us/support'
            }]
        });

        throw err;
    };

    function handleStartupError(err) {
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
                url: 'https://www.kbase.us/support'
            }]
        });
        throw err;
    }

    require(['app/main'], (main) => {
        if (root.KBaseFallback.getErrorState()) {
            return;
        }
        main.start()
            .catch((err) => {
                console.error('Startup Error', err);
                root.KBaseFallback.showError({
                    title: 'KBase UI Startup Error',
                    content: [
                        'An error has occurred while starting the KBase UI.',
                        err.message
                    ],
                    references: [{
                        title: 'Reporting Errors',
                        url: 'https://www.kbase.us/support'
                    }]
                });
            });
    }, handleStartupError);
}(window));
