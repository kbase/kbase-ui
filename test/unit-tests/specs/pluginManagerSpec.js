/* global describe, it, expect */
define([
    'lib/pluginManager'
], function (pluginManager) {

    describe('Check out the KBaseServiceManager module exists', function () {
        it('module loads', function (done) {
            expect(pluginManager).toBeTruthy();
            done();
        });
    });

    // describe('Instantiate with good and bad values', function () {
    //     it('Good values, but wouldnt run an app.', function (done) {
    //         var rootNode = document.createElement('div');
    //         rootNode.id = 'myrootnode';
    //         document.body.appendChild(rootNode);
    //         var app = App.make({
    //             appConfig: {
    //                 some: 'property'
    //             },
    //             nodes: {
    //                 root: {
    //                     selector: '#myrootnode'
    //                 }
    //             },
    //             plugins: [],
    //             services: {}
    //         });
    //         expect(app).toBeTruthy();
    //         done();
    //     });
    // });

});
