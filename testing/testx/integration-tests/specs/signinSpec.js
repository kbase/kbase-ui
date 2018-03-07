/* global describe, it, browser, expect */

/* see http://webdriver.io/api */

'use strict';

var runner = require('./runner');

var signin = {
    description: 'Click the signin button',
    baseSelector:  [
        {
            type: 'plugin',
            value: 'auth2-client',
        }, {
            type: 'component',
            value: 'login-view'
        }
    ],
    tasks: [
        {
            selector: [{
                type: 'button',
                value: 'signin'
            }],
            wait: 30000,
            action: 'click'
        }, {
            selector: [
                [{
                    type: 'component',
                    value: 'signin-button'
                }, {
                    type: 'name',
                    value: 'google'
                }]],
            wait: 3000
        }, {
            selector: [
                [{
                    type: 'component',
                    value: 'signin-button'
                }, {
                    type: 'name',
                    value: 'globus'
                }]],
            exists: true
        }]
};

var signup = {
    description: 'Click the new user button and get the signup view',
    baseSelector:  [{
        type: 'plugin',
        value: 'auth2-client',
    }],
    tasks: [
        {
            selector: [{
                type: 'component',
                value: 'login-view'
            }, {
                type: 'button',
                value: 'signup'
            }],
            wait: 30000,
            action: 'click'
        }, {
            selector: [
                {
                    type: 'widget',
                    value: 'signup'
                }, {
                    type: 'component',
                    value: 'signup-view'
                }, [{
                    type: 'component',
                    value: 'signin-button'
                }, {
                    type: 'name',
                    value: 'google'
                }]],
            wait: 3000
        },  {
            selector: [
                {
                    type: 'widget',
                    value: 'signup'
                }, {
                    type: 'component',
                    value: 'signup-view'
                }, [{
                    type: 'component',
                    value: 'signin-button'
                }, {
                    type: 'name',
                    value: 'globus'
                }]],
            exists: true
        }]
};

var allTests = [
    {
        description: 'Signin spec',
        specs: [signin]
    },
    {
        description: 'Signup spec',
        specs: [signup]
    }
];

runner.runTests(allTests);
