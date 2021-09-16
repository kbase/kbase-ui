define([
    'lib/appServiceManager'
], (App) => {

    describe('Check out the AppServiceManager module exists', () => {
        it('module loads', () => {
            expect(App).toBeTruthy();
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
