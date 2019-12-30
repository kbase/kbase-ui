define([
    'bluebird',
    'kb_lib/html',
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-ui',
    'domReady'
], (Promise, html) => {
    'use strict';

    const t = html.tag,
        div = t('div'),
        p = t('p'),
        ul = t('ul'),
        li = t('li'),
        a = t('a');

    function setContent(element, content) {
        if (!content) {
            return;
        }
        const node = document.querySelector('[data-element="' + element + '"]');
        if (!node) {
            return;
        }
        node.innerHTML = content;
    }

    function showElement(element) {
        const node = document.querySelector('[data-element="' + element + '"]');
        if (!node) {
            return;
        }
        node.classList.remove('hidden');
    }

    function hideElement(element) {
        const node = document.querySelector('[data-element="' + element + '"]');
        if (!node) {
            return;
        }
        node.classList.add('hidden');
    }

    function showError(arg) {
        if (arg.suggestions) {
            arg.suggestions = ul(
                { style: { paddingLeft: '1.2em' } },
                arg.suggestions
                    .map((suggestion) => {
                        if (suggestion.url) {
                            return li(a({ href: suggestion.url }, suggestion.label));
                        }
                        return li(suggestion.label);
                    })
                    .join('\n')
            );
        }
        if (arg.description) {
            if (typeof arg.description === 'string') {
                arg.description = [arg.description];
            }
            arg.description = arg.description.map(p).join('\n');
        }

        setContent('code', arg.code);
        setContent('message', arg.message);
        setContent('description', arg.description);
        setContent('suggestions', arg.suggestions);

        hideElement('loader-animated');
        showElement('loader-static');
        hideElement('waiting');
        showElement('error');
    }

    function getParams() {
        const href = window.location.href,
            queryPosition = href.indexOf('?'),
            params = {};
        if (queryPosition < 0) {
            return params;
        }
        const query = href.substring(queryPosition + 1).split('&');
        query.forEach((paramString) => {
            const param = paramString.split('=');
            if (param.length === 2) {
                params[param[0]] = decodeURIComponent(param[1]);
            }
        });
        return params;
    }

    function updateProgress(currentItem, totalItems) {
        const width = Math.round((100 * currentItem) / totalItems),
            content = div({ class: 'progress' }, [
                div(
                    {
                        class: 'progress-bar',
                        role: 'progressbar',
                        ariaValuenow: '60',
                        ariaValuemin: '0',
                        ariaValuemax: '100',
                        style: { width: String(width) + '%' }
                    },
                    ['Loading ... ']
                )
            ]);

        setContent('progress', content);
    }

    function LoadingError(message, type) {
        this.message = message;
        this.type = type;
    }
    LoadingError.prototype = Object.create(Error.prototype);
    LoadingError.prototype.constructor = LoadingError;
    LoadingError.prototype.name = 'LoadingError';

    function LoadingHttpError(status, message, type) {
        this.message = message;
        this.status = status;
        this.type = type;
    }
    LoadingHttpError.prototype = Object.create(Error.prototype);
    LoadingHttpError.prototype.constructor = LoadingHttpError;
    LoadingHttpError.prototype.name = 'LoadingHttpError';

    function UnauthenticatedError(message) {
        this.message = message;
    }
    UnauthenticatedError.prototype = Object.create(Error.prototype);
    UnauthenticatedError.prototype.constructor = UnauthenticatedError;
    UnauthenticatedError.prototype.name = 'UnauthenticatedError';

    // UI Errors are the rich, display able errors thrown to and caught by the
    // top layer.
    function UIError(arg) {
        Object.keys(arg).forEach((key) => {
            this[key] = arg[key];
        });
    }
    UIError.prototype = Object.create(Error.prototype);
    UIError.prototype.constructor = UIError;
    UIError.prototype.name = 'UIError';

    function TimeoutError(elapsed, timeout) {
        this.elapsed = elapsed;
        this.timeout = timeout;
    }
    TimeoutError.prototype = Object.create(Error.prototype);
    TimeoutError.prototype.constructor = TimeoutError;
    TimeoutError.prototype.name = 'TimeoutError';

    function checkNarrative(options) {
        const startTime = new Date().getTime();
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                switch (xhr.status) {
                case 200:
                    // For /narrative/ checks, there is no 201 or 401, so we
                    // have to grok the state of a "successful" response from
                    // the content.
                    // If there is no auth cookie, set_proxy will redirect
                    // to #login, but that will merely provide the stub index
                    // page. This is our '401' signal.
                    // If the response was the creation of a new session,
                    // a different redirect is issued -- the one which normally
                    // brings a user here! This response should either be
                    // successful or a 502. If successful, the response will
                    // be the config file, and we know that it is both a json
                    // file (and parsable) and will have some "well known"
                    // properties.

                    try {
                        var config = JSON.parse(xhr.responseText);
                        if (config && config.version) {
                            resolve();
                        } else {
                            reject(new LoadingError('Error in Narrative check response', 'check'));
                        }
                    } catch (ex) {
                        // This is our fake '401'
                        return reject(new UnauthenticatedError());
                    }
                    break;
                case 201:
                    // For check_narrative, this is the response which means
                    // that a session has been created.
                    resolve(true);
                    break;
                case 502:
                    // On the next request, though, we pass through to
                    // the Jupyter server, which will not be ready for some
                    // period of time, and this will trigger a 502 in the
                    // nginx proxy layer.
                    resolve(true);
                    break;
                default:
                    reject(new LoadingHttpError(xhr.status, xhr.statusText, xhr.responseText));
                }
            };

            xhr.ontimeout = () => {
                const elapsed = new Date().getTime() - startTime;
                reject(new TimeoutError(elapsed, options.timeout));
            };
            xhr.onerror = () => {
                reject(new LoadingError('General request error', 'error'));
            };
            xhr.onabort = () => {
                reject(new LoadingError('Request was aborted', 'aborted'));
            };

            xhr.timeout = options.timeout;
            try {
                xhr.open('GET', options.url, true);
            } catch (ex) {
                reject(new LoadingError('Error opening request', 'opening'));
            }

            try {
                xhr.withCredentials = false;
                xhr.send();
            } catch (ex) {
                reject(new LoadingError('Error sending data in request', 'sending'));
            }
        });
    }

    function currentPath() {
        return document.location.pathname + document.location.search + document.location.hash;
    }

    function tryLoading(narrativeId, options) {
        let tries = 0;
        const narrativeUrl = document.location.origin + '/narrative/' + narrativeId;
        const checkUrl = document.location.origin + '/narrative/static/kbase/config/config.json?check=true';

        return new Promise((resolve, reject) => {
            function loop() {
                tries += 1;
                updateProgress(tries, options.maxTries);
                return checkNarrative({ url: checkUrl, timeout: options.timeout })
                    .then((retry) => {
                        if (!retry) {
                            updateProgress(options.maxTries, options.maxTries);
                            return resolve(narrativeUrl);
                        }
                        if (tries >= options.maxTries) {
                            hideElement('waiting');
                            return reject(
                                new UIError({
                                    code: 'max-tries-exceeded',
                                    message: 'Internal server error',
                                    description: [
                                        'An unexpected internal server error was encountered accessing this Narrative.',
                                        'I could not successfully start it after ' + String(tries) + ' attempts'
                                    ],
                                    suggestions: [
                                        {
                                            label: 'Try again later',
                                            url: '/load-narrative.html?n=' + narrativeId + '&check=true'
                                        },
                                        {
                                            label: 'Report this to KBase',
                                            url: '//kbase.us/user-support/report-issue/'
                                        }
                                    ]
                                })
                            );
                        }
                        return Promise.delay(options.retryPause).then(() => {
                            return loop(checkUrl);
                        });
                    })
                    .catch(UIError, (err) => {
                        reject(err);
                    })
                    .catch(TimeoutError, (err) => {
                        // timeouts should be tried again. Might be due to the container still
                        // spinning up...
                        if (tries > options.maxTries) {
                            hideElement('waiting');
                            return reject(
                                new UIError({
                                    code: 'request-timed-out',
                                    message: 'Request timed out',
                                    description: [
                                        'A request to the Narrative session timed out too many times.',
                                        'The last request timed out after ' + err.elapsed + ' milliseconds (ms).',
                                        'The timeout limit is ' + err.timeout + ' ms.',
                                        'This may indicate that the Narrative service or a related KBase service is very busy, or the network is saturated.'
                                    ],
                                    suggestions: [
                                        {
                                            label: 'Try again later',
                                            url: '/load-narrative.html?n=' + narrativeId + '&check=true',
                                            description: [
                                                'This type of error is not permanent, so you should just try again later'
                                            ]
                                        },
                                        {
                                            label: 'Monitor KBase service status',
                                            url: '',
                                            description: [
                                                'Since this indicates a problem with KBase services, ',
                                                'you may wish to open our service monitoring page, ',
                                                'which shoudl show any ongoing issues'
                                            ]
                                        }
                                    ]
                                })
                            );
                        }
                        return Promise.delay(options.retryPause).then(() => {
                            return loop(checkUrl);
                        });
                    })
                    .catch(LoadingError, (err) => {
                        reject(
                            new UIError({
                                code: 'loading-' + err.type,
                                message: 'Timeout accessing Narrative session',
                                description: err.message
                            })
                        );
                    })
                    .catch(LoadingHttpError, (err) => {
                        var nextRequest;
                        switch (err.status) {
                        case 500:
                            // TODO: Fix this, very dicey.
                            var permErr = 'It looks like you don\'t have permission to view this Narrative.';
                            var customErr = 'An error occurred while loading your narrative.';
                            var grokkedError = 'An error occurred while setting up your narrative.';

                            if (err.responseText) {
                                // scrub the error html.
                                const temp = document.createElement('div');
                                temp.innerHTML = err.responseText;
                                const msg = temp.querySelector('#error-message > h3');
                                if (!msg) {
                                    grokkedError = customErr;
                                } else {
                                    const errorHeader = msg.innerText;
                                    if (errorHeader.indexOf('may not read workspace') !== -1) {
                                        grokkedError = permErr;
                                    } else {
                                        grokkedError = customErr(msg);
                                    }
                                }

                                // var $errorHTML = $($.parseHTML(err.responseText));
                                // var msg = $errorHTML.find('#error-message > h3').text();
                                // if (msg.indexOf('may not read workspace') !== -1) {
                                //     grokkedError = permErr;
                                // } else {
                                //     grokkedError = customErr(msg);
                                // }
                            }
                            reject(
                                new UIError({
                                    code: 'internal-error',
                                    title: 'Internal server error',
                                    message: [
                                        'An unexpected internal server error was encountered accessing this Narrative.',
                                        grokkedError
                                    ],
                                    suggestions: [
                                        {
                                            label: 'Try again later',
                                            url: ''
                                        },
                                        {
                                            label: 'Report issue to KBase',
                                            url: '//kbase.us/user-support/report-issue/'
                                        }
                                    ]
                                })
                            );
                            break;
                        case 401:
                            // Do not have permission to open narrative.
                            nextRequest = {
                                path: currentPath(),
                                external: true
                            };
                            reject(
                                new UIError({
                                    code: 'not-logged-in',
                                    message: 'You are not logged in',
                                    description: ['Narrative access requires that you be logged in to KBase'],
                                    suggestions: [
                                        {
                                            label: 'Log in',
                                            url:
                                                    document.location.origin +
                                                    '#login?nextrequest=' +
                                                    encodeURIComponent(JSON.stringify(nextRequest))
                                        },
                                        {
                                            label: 'Sign up for KBase',
                                            url: '//kbase.us/sign-up'
                                        }
                                    ]
                                })
                            );
                            break;
                        case 403:
                            // Do not have permission to open narrative.
                            nextRequest = {
                                path: currentPath(),
                                external: true
                            };
                            reject(
                                new UIError({
                                    code: 'permission-denied',
                                    message: 'You do not have access to this Narrative',
                                    description: ['You do not have read or write permission for this Narrative.'],
                                    suggestions: [
                                        {
                                            label:
                                                    'Contact the owner of this Narrative and request they share it with you'
                                        },
                                        {
                                            label: 'Contact KBase, referencing narrative ' + narrativeId,
                                            url: '//kbase.us/user-support/report-issue/'
                                        }
                                    ]
                                })
                            );
                            break;
                        case 404:
                            // Do not have permission to open narrative.
                            reject(
                                new UIError({
                                    code: 'does-not-exist',
                                    message: 'Narrative could not be found',
                                    description: [
                                        'A Narrative could not be found matching the id provided',
                                        narrativeId
                                    ],
                                    suggestions: [
                                        {
                                            label: 'Contact KBase referencing this Narrative',
                                            url: '//kbase.us/user-support/report-issue/'
                                        }
                                    ]
                                })
                            );
                            break;
                        case 0:
                            // network error
                            reject(
                                new UIError({
                                    code: 'network-problem',
                                    message: 'Problem accessing Narrative',
                                    description: [
                                        'There is a problem accessing the Narrative.',
                                        'It is probably a network connection problem between your browser and the KBase services'
                                    ],
                                    suggestions: [
                                        {
                                            label: 'KBase Service Status',
                                            url: ''
                                        },
                                        {
                                            label: 'Try again later',
                                            url: ''
                                        }
                                    ]
                                })
                            );
                            break;
                        default:
                            reject(
                                new UIError({
                                    code: 'unknown-error',
                                    message: 'Unknown error',
                                    description: [
                                        'There was an unknown error accessing the narrative: ' + err.status
                                    ]
                                })
                            );
                            break;
                        }
                    })
                    .catch(UnauthenticatedError, () => {
                        // Not logged in.
                        const nextRequest = {
                            path: currentPath(),
                            external: true
                        };
                        reject(
                            new UIError({
                                code: 'no-authorization',
                                message: 'You are not logged in',
                                description:
                                    'You are not currently logged in, but Narrative access requires that you be logged in with a KBase account.',
                                suggestions: [
                                    {
                                        label: 'Log in',
                                        url:
                                            document.location.origin +
                                            '#login?nextrequest=' +
                                            encodeURIComponent(JSON.stringify(nextRequest))
                                    }
                                ]
                            })
                        );
                    });
            }
            loop();
        });
    }

    function load(options) {
        const params = getParams(),
            narrativeId = params.n;

        document.body.classList.remove('remove-me-to-show-me');

        if (!narrativeId) {
            showError({
                code: 'no-narrative-parameter',
                message: 'Invalid request',
                description: [
                    'Narrative id not provided in the "n" parameter.',
                    'This error is caused by an invalid url.',
                    'Since this url is typically generated by the Narrative service itself, it indicates either a problem with the Narrative service, or with your browser.'
                ],
                suggestions: [
                    {
                        label: 'Try clicking the original link to this Narrative again'
                    }
                ]
            });
            return;
        }

        if (!(options.maxTries && options.timeout && options.retryPause)) {
            showError({
                code: 'invalid-options',
                message: 'Invalid request',
                description: [
                    'One or more options not provided',
                    'This error is caused by an invalid call to the narrative loader.',
                    'The required options are timeout, maxTries, and retryPause'
                ],
                suggestions: [
                    {
                        label: 'Contact KBase referencing this Narrative',
                        url: '//kbase.us/user-support/report-issue/'
                    }
                ]
            });
            return;
        }

        // This is the standard "waiting" message.
        showElement('loader-animated');
        setContent('status', ['Starting a new Narrative session for you.', 'Please wait...'].map(p).join('\n'));

        return tryLoading(narrativeId, options)
            .then((narrativeUrl) => {
                window.location.replace(narrativeUrl);
            })
            .catch(UIError, (err) => {
                hideElement('waiting');
                showError(err);
            })
            .catch((err) => {
                showError({
                    code: 'unexpected-error',
                    message: 'Unexpected error',
                    description: [err.message]
                });
            });
    }

    return Object.freeze({
        loadNarrative: load
    });
});
