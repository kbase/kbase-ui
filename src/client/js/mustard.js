(function () {
    // ES6!
    // Prior to ES6, const is not a keyword, and in strict mode,
    // using it throws an exception. (works for Safari < 10)
    // In FF class is a reserved word but not implemented (FF < 45)

    function isES6() {
        try {
            eval('(function() {"use strict"; const x=true; class X{};}())');
            return true;
        } catch (ex) {
            console.error('IE6 TEST', ex.message);
            return false;
        }
    }
    function redirect(failed) {
        var url = '/unsupported.html?failed=' + failed;
        window.location.href = url;
    }

    var failed = '';
    if (typeof document['querySelector'] === 'undefined') {
        failed = 'q';
    } else if (typeof window['addEventListener'] === 'undefined') {
        failed = 'a';

    } else if (typeof window['location']['origin'] === 'undefined') {
        // IE11 <
        failed = 'o';
    } else if (!!window.MSInputMethodContext && !!document.documentMode) {
        // IE11
        // true on IE11
        // false on Edge and other IEs/browsers.
        failed = 'm';
    } else if (!isES6()) {
        failed = '6';
    }

    if (failed.length > 0) {
        redirect(failed);
    }
}());
