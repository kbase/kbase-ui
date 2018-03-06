/* global describe, it, expect, browser */

/* see http://webdriver.io/api */

'use strict';

function buildAttribute(element) {
    if (element instanceof Array) {
        return element.map(function (element) {
            return buildAttribute(element);
        }).join('');
    } else {
        return '[data-kbase-' + element.type + '="' + element.value + '"]';
    }
}
function buildSelector(path) {
    return path.map(function (element) {
        return buildAttribute(element);
    }).join(' ');
}
function extend(path, element) {
    var newPath = path.map(function (el) {
        return el;
    });
    newPath.push(element);
    return newPath;
}
describe('Signin Spec', function () {
    it('Click the signin button', function () {
        browser.url('/');
        // First wait until the basic layout is available.
        // This matches on the plugin, then the main login component
        var basePath = [{
            type: 'plugin',
            value: 'auth2-client',
        }, {
            type: 'component',
            value: 'login-view'
        }];

        var signinButtonPath = extend(basePath, {
            type: 'button',
            value: 'signin'
        });
        browser.waitForExist(buildSelector(signinButtonPath), 30000);

        browser.click(buildSelector(signinButtonPath));

        // Now see if the login buttons appeared.
        var googleButtonPath = extend(basePath, [{
            type: 'component',
            value: 'signin-button'
        }, {
            type: 'name',
            value: 'google'
        }]);

        browser.waitForExist(buildSelector(googleButtonPath), 3000);

        var globusButtonPath = extend(basePath, [{
            type: 'component',
            value: 'signin-button'
        }, {
            type: 'name',
            value: 'globus'
        }]);

        browser.isExisting(buildSelector(globusButtonPath));

        // var googleButton = path.map(function (x) {return x;}).unshift({})

        // var text = browser.getAttribute(kbSelector(path), 'data-kbase-name');

        expect(true).toBe(true);
    });
});

describe('Signup Spec', function () {
    it('Click the new user button and get the signup view', function () {
        browser.url('/');
        // First wait until the basic layout is available.
        // This matches on the plugin, then the main login component
        var basePath = [{
            type: 'plugin',
            value: 'auth2-client',
        }, {
            type: 'component',
            value: 'login-view'
        }];

        var signinButtonPath = extend(basePath, {
            type: 'button',
            value: 'signup'
        });
        browser.waitForExist(buildSelector(signinButtonPath), 30000);

        browser.click(buildSelector(signinButtonPath));

        // Now we should be on a new view.
        // TODO: i can't find a webdriver way to wait for a url.

        
        basePath = [{
            type: 'plugin',
            value: 'auth2-client',
        }, {
            type: 'widget',
            value: 'signup'
        }, {
            type: 'component',
            value: 'signup-view'
        }];

        // Now see if the login buttons appeared.
        var googleButtonPath = extend(basePath, [{
            type: 'component',
            value: 'signin-button'
        }, {
            type: 'name',
            value: 'google'
        }]);

        browser.waitForExist(buildSelector(googleButtonPath), 3000);

        var globusButtonPath = extend(basePath, [{
            type: 'component',
            value: 'signin-button'
        }, {
            type: 'name',
            value: 'globus'
        }]);

        browser.isExisting(buildSelector(globusButtonPath));

        // var googleButton = path.map(function (x) {return x;}).unshift({})

        // var text = browser.getAttribute(kbSelector(path), 'data-kbase-name');

        expect(true).toBe(true);
    });
});