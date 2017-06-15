/* global describe, it, expect, browser, beforeAll */
/*
This set of tests does not require authorization...
*/

// TODO: use a clean-up page (an empty page, should put one in the web app), to "clear"
// the browser between tests. Otherwise a slow loading may result in getting value from
// the previous one.

'use strict';
// Note this is in an intermediary development state -- requiring token to be inserted
// below before runnint tests. The token will be moved to a non-checked-in 
// config file later.
var token = 'copy your token here';

var testingTable = [{
    title: 'Dataview for Sorghum bicolor genome',
    objectId: '22676/8/6',
    selector: '[data-widget="dataview-overview"] h3',
    value: 'Transcriptome_Sbi_shoots_PEG_upregulated'
}, {
    title: 'Dataview for Rhodobacter sphaeroides genome',
    objectId: '22676/5/1',
    selector: '[data-widget="dataview-overview"] h3',
    value: 'Rhodobacter_sphaeroides_2.4.1_KBase'
}, {
    title: 'Dataview for Expression Matrix (need better data!)',
    objectId: '22676/7/1',
    selector: '[data-widget="dataview-overview"] h3',
    value: 'SomeFakeData'
}, {
    title: 'Dataview for Media',
    objectId: '22676/6/8',
    selector: '[data-widget="dataview-overview"] h3',
    value: 'Rsp-minimal'
}];


describe('Dataview Specs', function () {
    beforeAll(function () {
        browser.url('/');
        browser.setCookie({
            name: 'kbase_session',
            value: token,
            domain: 'ci.kbase.us'
        });
        browser.waitForExist('[data-element="user-label"]', 5000);
    });
    testingTable.forEach(function (test) {
        it(test.title, function () {
            browser.url('/#dataview/' + test.objectId);
            browser.waitForExist(test.selector, 5000);
            var text = browser.getText(test.selector);

            expect(text).toEqual(test.value);
        });
    });

});
