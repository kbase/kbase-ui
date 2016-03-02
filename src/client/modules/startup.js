/*global require, KBaseFallback*/
/*jslint white:true*/
(function (root) {
    function handleGlobalError(err) {
        'use strict';

        switch (err.requireType) {
            case 'notloaded':
                if (/esprima/.test(err.message)) {
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
                        KBaseFallback.showError({
                            title: 'Analytics Blocked',
                            content: [
                                'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface (NI). The Narrative Interface will not operate with this constraint in place.'
                            ],
                            references: [
                                {
                                    title: 'Incompatible Plugins',
                                    url: 'http://kbase.us/incompatible-plugins'
                                }
                            ]
                        });
                        return;
                    }
                }
                break;            
        }

//        console.error('AMD Error');
//        console.error('Type', err.requireType);
//        console.error('Modules', err.requireModules);
//        console.error('Message', err.message);
//        console.error(err);

        KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message,
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null
            ],
            references: [
                {
                    title: 'Reporting Application Errors',
                    url: 'http://kbase.us/contact-us'
                }
            ]
        });

        throw err;
    }
    
    function handleStartupError(err) {
        'use strict';

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
                        KBaseFallback.showError({
                            title: 'Analytics Blocked',
                            content: [
                                'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface (NI). The Narrative Interface will not operate with this constraint in place.'
                            ],
                            references: [
                                {
                                    title: 'Incompatible Plugins',
                                    url: 'http://kbase.us/incompatible-plugins'
                                }
                            ]
                        });
                        return;
                    }
                }
                break;
        }

        KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message,
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null
            ],
            references: [
                {
                    title: 'Reporting Application Errors',
                    url: 'http://kbase.us/contact-us'
                }
            ]
        });

        throw err;
    }
    
    require.onError = handleGlobalError;

    require(['app/main'], function (main) {
        'use strict';
        if (root.KBaseFallback.getErrorState()) {
            return;
        }
        main.start()
            .catch(function (err) {
                document.getElementById('root').innerHTML = 'Error starting KBase UI. Please consult the browser error log.';
                console.error('Startup Error', err);
            });
    }, function (err) {
        handleStartupError(err);
    });
}(window));