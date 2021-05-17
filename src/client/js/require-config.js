(function (global) {
    // For dev this should be set at app load time or manually set
    // if the cache seems to be sticky (it may not be necessary to ALWAYS
    // bust the cache.)
    // For production we should use the commit hash or
    // semver

    // The time in seconds after which a module load is to be considered timed
    // out beyond repair. Will trigger an error of type 'timeout' if loading
    // a module from the network takes longer than this number of seconds.
    const REQUIRE_WAIT_SECONDS = 60;

    function cacheBusterKey(buildInfo, developMode) {
        // NB developMode not implemented yet, so always defaults
        // to the gitCommitHash
        if (developMode) {
            return String(new Date().getTime());
        } else {
            return buildInfo.gitCommitHash;
        }
    }

    global.require = {
        baseUrl: '/modules',
        urlArgs: 'cb=' + cacheBusterKey(global.__kbase__build__, false),
        catchError: true,
        waitSeconds: REQUIRE_WAIT_SECONDS,
        paths: {
            bluebird: 'node_modules/bluebird/bluebird',
            bootstrap_css: 'node_modules/bootstrap/css/bootstrap',
            bootstrap: 'node_modules/bootstrap/js/bootstrap',
            css: 'node_modules/require-css/css',
            domReady: 'node_modules/requirejs-domready/domReady',
            font_awesome: 'node_modules/font-awesome/css/font-awesome',
            'js-yaml': 'node_modules/js-yaml/js-yaml',
            jquery: 'node_modules/jquery/jquery',
            json: 'node_modules/requirejs-json/json',
            kb_bootstrap: 'css/kb-bootstrap',
            kb_lib: 'node_modules/@kbase/common-es6',
            kb_ui: 'css/kb-ui',
            'ui-lib': 'node_modules/@kbase/ui-lib',
            md5: 'node_modules/spark-md5/spark-md5',
            preact: 'node_modules/preact/preact.umd',
            htm: 'node_modules/htm/htm.umd',
            text: 'node_modules/requirejs-text/text',
            uuid: 'node_modules/uuid/uuid.min',
            yaml: 'ports/requirejs-yaml/yaml',
            semver: 'node_modules/semver-umd/semver-umd',
        },
        shim: {
            bootstrap: {
                deps: ['jquery', 'css!bootstrap_css'],
            },
        },
        map: {
            '*': {
                promise: 'bluebird',
            },
        },
    };
    /*
    This function is attached to requirejs as the global error handler.
    It is called in the case of a require or define throwing an error,
    including module load errors, which are identified by the presence of the
    "requireType" property of the error object.
    Some of the libraries we use throw harmless errors under certain conditions.
    By catching them here we can ignore them.
    All other cases result in the fallback error ui being invoked.
    */
    global.require.onError = (err) => {
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
                    global.KBaseFallback.showError({
                        title: 'Analytics Blocked (timeout)',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.',
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'https://docs.kbase.us/incompatible-plugins',
                        }],
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
                    global.KBaseFallback.showError({
                        title: 'Analytics Blocked (scripterror)',
                        content: [
                            'A browser setting, plugin, or other constraint has prevented the Analytics module from loading. KBase uses this module to measure usage of the Narrative Interface. The Narrative Interface will not operate with this constraint in place.',
                        ],
                        references: [{
                            title: 'Incompatible Plugins',
                            url: 'https://docs.kbase.us/incompatible-plugins',
                        }],
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

        global.KBaseFallback.showError({
            title: 'AMD Error',
            content: [
                'An error has occurred while loading one of the modules required to run the KBase Application.',
                err.message.replace('\n', '<br>'),
                'Type: ' + err.requireType,
                err.requireModules ? 'Modules: ' + err.requireModules.join(', ') : null,
            ],
            references: [{
                title: 'Reporting Application Errors',
                url: 'https://www.kbase.us/support',
            }, {
                title: `RequireJS Help for error type "${err.requireType}"`,
                url: `https://requirejs.org/docs/errors.html#${err.requireType}`
            }],
        });

        throw err;
    };
})(window);
