(function () {
    function supportsStrictMode() {
        'use strict';
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
    if (failed.length > 0) {
        redirect(failed);
    }
}());
