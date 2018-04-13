(function () {
    'use strict';
    function supportsStrictMode() {
        if (typeof this === 'undefined') {
            return true;
        }
        return false;
    }

    function redirect(failed) {
        var url = '/pages/unsupported.html?failed=' + failed;
        window.location.href = url;
    }
    var failed = '';
    if (typeof document['querySelector'] === 'undefined') {
        failed += 'q';
    }
    if (typeof window['addEventListener'] === 'undefined') {
        failed += 'a';
    }
    // IE9 < 
    if (!(supportsStrictMode())) {
        failed += 's';
    }
    // IE11 <
    if (typeof window['location']['origin'] === 'undefined') {
        failed += 'o';
    }
    // IE11
    if (!!window.MSInputMethodContext && !!document.documentMode) {
        // true on IE11
        // false on Edge and other IEs/browsers.
        failed += 'm';
    }

    // ES6!
    try {
        eval('(function() {"use strict"; const x;}())');
    } catch (ex) {
        failed += '6';
    }

    if (failed.length > 0) {
        redirect(failed);
    }
}());
