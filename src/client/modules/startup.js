/*global require, KBaseFallback*/
/*jslint white:true*/
(function (root) {
    // First display a loading message in case we have some latency issues...

    function showInitialLoadingView() {
        var status = root.document.getElementById('root');
        status.innerHTML =
            '<div style="padding: 0; border-bottom: 5px solid #E0E0E0;">' +
            '	<div style="position: relative; height: 65px" >' +
            '		<div style="display: inline-block;width: 52px;">&nbsp;' +
            '		</div>' +
            '		<div style="padding: 4px; display: inline-block; height: 100%; vertical-align: top" id="kb_html_4">' +
            '                   <a href="http://kbase.us"><img id="logo" src="/modules/plugins/mainwindow/resources/images/kbase_logo.png" width="46"></a>' +
            '		</div>' +
            '		<div style="padding: 4px; display: inline-block; height: 100%; vertical-align: top" id="kb_html_5">' +
            '                   <div style="font-weight: bold; font-size: 150%; margin: 18px 0 0 15px; ">' +
            '                       ' +
            '		   </div>' +
            '		</div>' +
            '	</div>' +
            '</div>';
    }
    
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
            case 'timeout':
                if (err.requireModules) {
                    if (err.requireModules.some(function (module) {
                        if (module === '//www.google-analytics.com/analytics.js') {
                            return true;
                        }
                        return false;
                    })) {
                        KBaseFallback.showError({
                            title: 'Analytics Blocked (timeout)',
                            content: [
                                'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.'
                            ],
                            references: [
                                {
                                    title: 'Incompatible Plugins',
                                    url: 'http://kbase.us/incompatible-plugins'
                                }
                            ]
                        })
                    }
                }
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
                        KBaseFallback.showError({
                            title: 'Analytics Blocked (scripterror)',
                            content: [
                                'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.'
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
                console.error('Startup Error', err);
                KBaseFallback.showError({
                    title: 'KBase Application Startup Error',
                    content: [
                        'An error has occurred while starting the the KBase Application.',
                        err.message
                    ],
                    references: [
                        {
                            title: 'Reporting Application Errors',
                            url: 'http://kbase.us/contact-us'
                        }
                    ]
                });
                // document.getElementById('root').innerHTML = 'Error starting KBase UI. Please consult the browser error log.';
            });
    }, function (err) {
        handleStartupError(err);
    });
}(window));