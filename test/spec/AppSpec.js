define([
    'app/App'
], function (App) {
    'use strict';

    describe('Check out the App', function () {
        it('is a good version', function (done) {
            var version = App.version();
            expect(version).toEqual('0.0.1');
            done();
        });
    });

});