/* global describe, it, expect */
define([
    'app/App'
], function (App) {
    'use strict';

    describe('Check out the App module exists', function () {
        it('module loads', function (done) {
            expect(App).toBeTruthy();
            done();
        });
    });

    describe('Instantiate with good and bad values', function () {
        it('Good values, but wouldnt run an app.', function (done) {
            var rootNode = document.createElement('div');
            rootNode.id = 'myrootnode';
            document.body.appendChild(rootNode);
            console.log('hmm, ', rootNode, document.querySelector('#myrootnode'));
            var app = App.make({
                appConfig: {
                    some: 'property'
                },
                nodes: {
                    root: {
                        selector: '#myrootnode'
                    }
                },
                plugins: []
            });
            expect(app).toBeTruthy();
            done();
        });
    });

});
