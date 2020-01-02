/* eslint-disable strict */
/**
 * Google Analytics Code snippet and supporting logic.
 */
(function () {
    /**
     * fetch user info.
     * @param {string} token
     */
    const fetchUserInfo = (token) => {
        let origin = document.location.origin;
        if (origin === 'https://narrative.kbase.us') {
            origin = 'https://kbase.us';
        }
        const url = origin + '/services/auth/api/V2/me';
        return fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            }
        })
            .then((response) => {
                if (response.status !== 200) {
                    console.warn('[gtagSupport] bad auth response, user not available', response);
                    return null;
                }
                return response.json().then(({user}) => {
                    return user;
                });
            })
            .catch((error) => {
                console.error('error occurred during fetch user id', error);
                return null;
            });
    };

    /**
     * find kbase session ID from cookies and get user name.
     */
    const getToken = () => {
        if (!document.cookie) {
            return null;
        }
        const cookiesArr = document.cookie.split(';');
        for (let i = 0; i < cookiesArr.length; i += 1) {
            const cookie = cookiesArr[i];
            if (cookie.includes('kbase_session')) {
                return cookie.slice(cookie.indexOf('=') + 1);
            }
        }
        return null;
    };

    const sendGTag = () => {
        // The "path" for a view in the ui is determined by
        // the url hash. This will change one day.
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
        path = '/' + path;

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }

        // See google docs for the api and field definitions.
        // E.g. https://developers.google.com/analytics/devguides/collection/gtagjs/pages

        // if cookies are set, get user name to add to config.
        const token = getToken();
        if (token) {
            fetchUserInfo(token).then((username) => {
                gtag('js', new Date());
                gtag('config', 'UA-137652528-1', {
                    user_id: username,
                    page_location: document.location.href,
                    page_path: path,
                    page_title: document.title
                });
                gtag('set', {
                    user_id: username
                });
                gtag('config', 'AW-753507180');
            });
        } else {
            gtag('js', new Date());
            gtag('config', 'UA-137652528-1', {
                Page_location: document.location.href,
                page_path: path,
                page_title: document.title
            });
            gtag('config', 'AW-753507180');

        }
    };

    /**
     * Google Analytics code snippet
     */
    window.onpopstate = () => {
        sendGTag();
    };

    sendGTag();
})();
