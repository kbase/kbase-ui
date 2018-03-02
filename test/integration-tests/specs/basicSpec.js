/* global describe, it, expect, browser */
'use strict';
describe('Root Spec', function () {
    it('Should navigate to the home page', function () {
        browser.url('/');
        // First wait until the basic layout is available.
        // This matches on the plugin, then the main login component
        browser.waitForExist('[data-kbase-plugin="auth2-client"] [data-kbase-component="login-view"]', 30000);

        // Now look for major components to have rendered:
        // sign in button
        // new user button
        var text = browser.getText('[data-kbase-plugin="auth2-client"] [data-kbase-component="login-view"] [data-kbase-button="signin"] [data-kbase-label="signin"]');

        expect(text).toEqual('Sign In');
    });
});
