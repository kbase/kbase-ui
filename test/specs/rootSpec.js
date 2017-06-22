/* global describe, it, expect, browser */
'use strict';
describe('NewbieSpec', function () {
    it('Should navigate to the home page', function () {
        browser.url('/');
        browser.waitForExist('.kb-widget-title', 30000);
        var text = browser.getText('.kb-widget-title');

        expect(text).toEqual('KBase Sign In');
    });
});
