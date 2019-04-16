/* eslint-disable strict */
/**
 * Google Analytics Code snippet and supporting logic.
 */

/**
  * fetch user info.
  * @param {string} token
  */
const fetchUserInfo = (token) => {
    const url = document.location.origin + '/services/auth/api/V2/me';
    return fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
    })
        .then(response => response.json())
        .then(response => response)
        .catch(error => console.error('error occered during fetch user id', error));
};
/**
 * find kbase session ID from cookies and get user name.
 * @param {string} cookies
 */
const getUserName = (cookies) => {
    const cookiesArr = cookies.split(';');
    for (let i=0; i<cookiesArr.length; i+=1){
        const cookie = cookiesArr[i];
        if (cookie.includes('kbase_session')) {
            const token = cookie.slice(cookie.indexOf('=') + 1);
            return fetchUserInfo(token).then(response => response['user']);
        }
    }
};

/**
 * Google Analytics code snippet
 */
window.onpopstate = function () {
    const str = document.URL.toLowerCase();
    const sliceAt = str.indexOf('kbase.us') + 'kbase.us'.length;
    const path = str.slice(sliceAt);
    const regex = /\/#\/|#\/|\/#/gi;
    const title = path.replace(regex, '');
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    // if cookies are set, get user name to add to config.
    if (document.cookie){
        getUserName(document.cookie).then((value) => {
            gtag('js', new Date());
            gtag('config', 'UA-137652528-1', {
                'username': value,
                'Page_location': document.URL,
                'page_path': path,
                'page_title': title
            });
            gtag('set', {'user_id': value});
        });
    } else {
        // take URL into page_path and page title that gtag config can use.
        gtag('js', new Date());
        gtag('config', 'UA-137652528-1', {
            'Page_location': document.URL,
            'page_path': path,
            'page_title': title
        });
    }
    gtag('config', 'AW-753507180');
};