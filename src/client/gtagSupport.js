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
        .then((response) => { response.json(); })
        .then((response) => {
            if (response.status === 200) {
                return response['user'];
            } else {
                return null;
            }
        })
        .catch((error) => {
            console.error('error occered during fetch user id', error);
            return null;
        });
};

/**
 * find kbase session ID from cookies and get user name.
 * @param {string} cookies
 */
const getToken = () => {
    if (!document.cookie){
        return null;
    }
    const cookiesArr = document.cookie.split(';');
    for (let i = 0; i < cookiesArr.length; i +=1){
        const cookie = cookiesArr[i];
        if (cookie.includes('kbase_session')) {
            return cookie.slice(cookie.indexOf('=') + 1);
        }
    }
    return null;
};

/**
 * Google Analytics code snippet
 */
window.onpopstate = function () {
    const location = document.URL;
    const str = location.toLowerCase();
    const sliceAt = str.indexOf('kbase.us') + 'kbase.us'.length;
    const path = str.slice(sliceAt);
    const regex = /\/#\/|#\/|\/#/gi;
    const title = path.replace(regex, '');
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    // if cookies are set, get user name to add to config.
    const token = getToken();
    if (token){
        fetchUserInfo(token).then((response)=>{
            const userID = response;
            gtag('js', new Date());
            gtag('config', 'UA-137652528-1', {
                'user': userID,
                'Page_location': location,
                'page_path': path,
                'page_title': title
            });
            gtag('set', userID);
            gtag('config', 'AW-753507180');
        });
        return;
    }
    gtag('js', new Date());
    gtag('config', 'UA-137652528-1', {
        'Page_location': location,
        'page_path': path,
        'page_title': title
    });
    gtag('config', 'AW-753507180');
};