/* global describe, it, expect */
define([
    'lib/requirejs-csv'
], function (requireCsv) {
    'use strict';

    describe('Check out the require csv plugin module exists', function () {
        it('module loads', function (done) {
            expect(requireCsv).toBeTruthy();
            done();
        });
    });
});
