/**
 * Google Analytics (GA) app implementation
 *
 * The GA mechanism for sending data to the GA collection service
 * consists of a very simple, small web app.
 *
 * Upon loading the primary kbase-ui SPA index.html page, an embedded
 * script call to Google loads a GA app which loads necessary support
 * files and begins to monitor a global variable "window.dataLayer".
 *
 * (Why Goggle didn't pick something namespaced to their app like
 *  GoogleDataLayer, or GoogleAnalyticsDataQueue, I don't know.)
 *
 * Then, when data is to be sent to GA for a page load (all that we use it for),
 * this script below pushes (in the sense of "array push") the appropriate
 * data in the appropriate format into the global data queue "dataLayer".
 *
 * On the next polling call, the GA app pulls the data off the queue and sends it
 * to the GA collection service.
 *
 * Quite straightforward.
 *
 * Now for our implementation.
 *
 * First, there is no good reason for the code to be in a standalone file, afaik,
 * and it is a bit complicated by the fact that it has to replicate functionality
 * in kbase-ui, but here it is.
 *
 * The script has the general task of sending, for the initial page load and every
 * subsequent navigation, the:
 * - current url
 * - current page path
 * - current page title
 * - username if there is a valid kbase auth token
 *
 * There a few complications in this otherwise relatively straightforward task.
 *
 * Since this script is independent of kbase-ui, it must be configured manually,
 * including the auth token name, urls, Google GA ids, and other.
 *
 * Fetching the username requires a call to the auth service. Since this
 * script is independent of kbase-ui, it must perform this logic separately.
 * To prevent calling the auth service with every navigation, the token is
 * cached for 10 minutes.
 *
 * The page title is not available until the view code associated with the page load
 * or navigation has run and determined and set the title. In other words, it is
 * asynchronous, and may take even up to a few seconds. To accommodate this fact,
 * the script will monitor the page title and only set the GA data when the title
 * has been stable for some period of time (TITLE_STABILIZATION_PERIOD). If navigation
 * occurs before the title has stabilized, the GA data is sent anyway
 *
 * References:
 * https://developers.google.com/tag-platform/gtagjs/reference
 * https://developers.google.com/analytics/devguides/collection/gtagjs/single-page-applications#measure_virtual_pageviews
 */

function main() {
    // Configuration
    // These should be in a separate configuration, but, to be honest, some of these values have never changed, and others,
    // like the Google tags, only every few years.
    const SESSION_COOKIE_NAME = 'kbase_session';
    const PROD_UI_ORIGIN = 'https://narrative.kbase.us';
    const PROD_SERVICE_ORIGIN = 'https://kbase.us';
    const GOOGLE_GTAG = 'G-KXZCE6YQFZ';
    const GOOGLE_AD_TAG = 'AW-753507180';

    // The sending of the page hit is delayed until the page title stops change for the duration
    // set here.
    const TITLE_STABILIZATION_PERIOD = 3000;

    // Keep the auth token cached for up to 10 minutes.
    const KBASE_AUTH_TOKEN_TTL = 600000;
    let KBASE_AUTH_INFO_EXPIRES_AT = null;
    let KBASE_AUTH_INFO = null;
    let KBASE_AUTH_TOKEN = null;

    /**
     * GTag processing states.
     *
     * Due to the asynchronous nature of loading page titles, and generally the fact that this code
     * runs independently of the kbase-ui, which is of course asynchronous in nature, we use a
     * little state model to manage this.
     *
     */
    const WAITING = 'WAITING';
    const PENDING = 'PENDING';
    const SEND_NOW = 'SEND_NOW';
    const SENDING = 'SENDING';

    /**
     * Sets a new status value, which should be one of WAITING, PENDING, SEND_NOW, or SENDING.
     *
     * @param {string} newState The new value for the gtag support status
     */
    function setState(newState) {
        GTAG_STATE = newState;
    }

    /**
     * Simply compares the provided value to the current status value, returning whether they are the same.
     *
     * @param {string} state
     * @returns {boolean} Whether the provided value is the same as the current status
     */
    function isState(state) {
        return GTAG_STATE === state;
    }

    /**
     * Returns a promise that does not resolve until the given status is active.
     *
     *
     * @param {*} status A status value, as defined above: WAITING, PENDING, SEND_NOW, SENDING
     * @returns {Promise<void>} A Promise with no important value
     */
    // TODO there should be a timeout
    async function waitUntilStatus(status, timeout) {
        const started = Date.now();
        const timeoutAfter = started + timeout;
        return new Promise((resolve) => {
            const loop = () => {
                if (Date.now() >= timeoutAfter) {
                    throw new Error(`Timed out after ${Date.now() - started}`);
                }
                window.setTimeout(() => {
                    if (isState(status)) {
                        loop;
                    }
                    resolve();
                }, 100);
            };
            loop();
        });
    }

    /**
     * Returns the KBase service origin.
     *
     * In all but production, the service origin is the same as the document origin
     * for the ui. In production, the ui origin is https://narrative.kbase.us but the
     * service origin is https://kbase.us - this adjustment is made.
     *
     * @returns {string} The KBase service "origin" (protocol and hostname, e.g. https://ci.kbase.us)
     */
    function getServiceOrigin() {
        if (document.location.origin === PROD_UI_ORIGIN) {
            return PROD_SERVICE_ORIGIN;
        }
        return document.location.origin;
    }

    /**
     * The canonical function name for queuing messages for the Google gtag app.
     *
     * Note that the function relies up on the usage of the magic "arguments" variable
     * provided to all functions.
     *
     * @returns {void} - Nothing
     */
    function pushGTag() {
        //developers.google.com/tag-platform/tag-manager/datalayer
        https: window.dataLayer.push(arguments);
    }

    /**
     * Get and return the current hash path as a path with a leading
     * forward slash (/).
     *
     * Note that this code is could be a one-liner but for the fact that
     * some usages of kbase-ui hash-paths place the search query string
     * on the hash itself.
     *
     * @returns {string} - The current navigation path in kbase-ui
     */
    function getHashPath() {
        const hash = document.location.hash;
        let path;
        if (hash) {
            const m = hash.match(/#[/]?([^?]*)/);
            if (m) {
                path = m[1];
            } else {
                path = '';
            }
        } else {
            path = '';
        }
        return `/${path}`;
    }

    /**
     * Find KBase auth token from document cookie.
     *
     * If a token is not found in the cookie, null is returned.
     *
     * @returns {string|null}  A KBase auth token, if any, stored in the browser.
     */
    function getToken() {
        if (!document.cookie) {
            return null;
        }
        const cookies = document.cookie.split(';').map((item) => {
            return item.trim();
        });

        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === SESSION_COOKIE_NAME) {
                return value;
            }
        }
        return null;
    }

    /**
     * Returns the username associated with the given KBase auth token.
     *
     * If there is no token, or an error is encountered interacting with
     * the auth service, null is returned.
     *
     * @param {string} token - KBase auth token
     * @returns {string|null} - A kbase username
     */
    async function fetchAuth(token) {
        if (
            KBASE_AUTH_INFO !== null &&
            KBASE_AUTH_INFO_EXPIRES_AT > Date.now() &&
            token === KBASE_AUTH_TOKEN
        ) {
            return KBASE_AUTH_INFO.user;
        }
        KBASE_AUTH_TOKEN = token;
        const url = `${getServiceOrigin()}/services/auth/api/V2/me`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            });
            if (response.status !== 200) {
                console.warn(
                    '[gtagSupport] bad auth response, user not available',
                    response
                );
                return null;
            }
            KBASE_AUTH_INFO = await response.json();
            KBASE_AUTH_INFO_EXPIRES_AT = Date.now() + KBASE_AUTH_TOKEN_TTL;
            return KBASE_AUTH_INFO;
        } catch (error) {
            console.error(
                '[gtagSupport] error occurred in call to auth service',
                error
            );
            return null;
        }
    }

    /**
     * Get the username associated with the current KBase auth token.
     *
     * If there is no valid KBase auth token available, or an error is
     * encountered with the auth service call, null is returned instead.
     *
     *
     * @returns {string|null} username
     */
    async function getAuth() {
        const token = getToken();
        if (token) {
            try {
                const auth = fetchAuth(token);
                if (auth) {
                    return auth;
                }
            } catch (ex) {
                console.error('[gtagSupport] Error fetching username', ex);
            }
        }
        KBASE_AUTH_INFO = null;
        KBASE_AUTH_TOKEN = null;
        return null;
    }

    /**
     *
     *
     * @returns {void} - Nothing
     */
    async function sendGTag() {
        setState(SENDING);

        // The "path" for a view in the ui is determined by
        // the url hash. This will change one day.
        const path = getHashPath();

        // Simply ensures that the data layer exists. The data layer
        // is just an array placed into a "dataLayer" property on the global
        // window. Nothing special about the name "dataLayer", other than that
        // is where the google scripts expect to see
        window.dataLayer = window.dataLayer || [];

        // See google docs for the api and field definitions.
        // E.g. https://developers.google.com/analytics/devguides/collection/gtagjs/pages
        // Queue up date for GA
        const pageView = {
            page_location: document.location.href,
            page_path: path,
            page_title: LAST_PAGE_TITLE,
        };

        const auth = await getAuth();
        if (auth) {
            pageView.user_id = auth.user;
        }

        pushGTag('event', 'page_view', pageView);

        setState(WAITING);
    }

    /**
     * The ever-popular "sleep" function, which returns a promise that resolves with the given period of time elapsed.
     *
     * @param {number} until The amount of time, in milliseconds, after which the promise should resolve.
     * @returns {Promise<void>}
     */
    async function sleep(until) {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve();
            }, until);
        });
    }

    /**
     * Ensures that if the next page hit is being sent, if the current one has not yet
     * been sent, that it send immediately.
     *
     * Remember, that upon initiating a gtag request, we first wait for the page title
     * to stabilize, and then the gtag event is registered. So if a new navigation event
     * occurs during the waiting period, this function will be called in order to just
     * send the gtag event even if the page title is not yet stabilized.
     *
     * @returns {Promise<void>}
     */
    async function sendPendingGTag() {
        if (isState(PENDING)) {
            // Here we set the status to SEND_NOW, which causes the loop monitoring the
            // page title to terminate, which returns a promise, and causes the gtag
            // event to be pushed.
            setState(SEND_NOW);

            // And here we wait until the message is sent and we  are back in the WAITING state.
            // This should be sent very quickly, so a 1 second timeout should be plenty.
            return await waitUntilStatus(WAITING, 1000);
        }
    }

    // Stores the current page title, which is really the last one recorded
    // in the async loop below.
    let LAST_PAGE_TITLE = null;

    /**
     * When called, will return a Promise that will only resolve when the page title
     * has not changed for some amount of time.
     *
     * This amount of time is set at top of the file as TITLE_STABILIZATION_PERIOD), but
     * should be on the order of 2-3 seconds.
     *
     * @returns {Promise<void>}
     */

    async function sendGTagAfterTitleSettles() {
        setState(PENDING);

        let lastChanged = Date.now();
        LAST_PAGE_TITLE = document.title;

        // This is where we "wait" for the page title to stabilize,
        // i.e. stop changing.
        const loop = async () => {
            if (isState(SEND_NOW)) {
                return;
            }
            const now = Date.now();
            if (now >= lastChanged + TITLE_STABILIZATION_PERIOD) {
                return;
            }
            if (document.title !== LAST_PAGE_TITLE) {
                lastChanged = Date.now();
                LAST_PAGE_TITLE = document.title;
            }
            await sleep(100);
            await loop();
        };
        await loop();

        // And ... finally we trigger the pushing up data for gtag.
        sendGTag();

        // This signals that the status of this little gtag engine
        // is waiting for a navigation event.
        setState(WAITING);
    }

    /**
     *  Send a ping to GA whenever the history state changes, i.e., url navigation
     */
    window.onpopstate = async () => {
        // window.dataLayer.push(function () {
        //     this.reset();
        // });
        await sendPendingGTag();

        sendGTagAfterTitleSettles();
    };

    /**
     * Sets up gtag support to a known state, and sets up some gtag data that
     * will not change over this session.
     */
    function initialize() {
        setState(WAITING);
        pushGTag('js', new Date());
        pushGTag('config', GOOGLE_GTAG, {
            send_page_view: false,
        });
        pushGTag('config', GOOGLE_AD_TAG, {
            send_page_view: false,
        });
    }

    /**
     * Initializes the state, and schedules the first page hit to be sent to GA.
     *
     * After this, navigation triggers the page hit.
     */
    window.addEventListener('load', () => {
        initialize();
        sendGTagAfterTitleSettles();
    });
}

main();
