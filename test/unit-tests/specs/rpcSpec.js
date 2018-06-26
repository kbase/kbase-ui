/* global describe, it, expect */
define([
    'lib/rpc'
], function (rpc) {
    'use strict';

    describe('Check out the rpc module exists', function () {
        it('module loads', function (done) {
            expect(rpc).toBeTruthy();
            done();
        });
    });
});
