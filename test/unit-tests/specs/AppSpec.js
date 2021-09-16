define([
    'app/App'
], (App) => {

    describe('The App module', () => {
        it('should load loads', () => {
            expect(App).toBeTruthy();
        });

        it('Good values, but wouldn\'t run an app', () => {
            const rootNode = document.createElement('div');
            rootNode.id = 'myrootnode';
            document.body.appendChild(rootNode);
            const app = new App({
                appConfig: {
                    some: 'property'
                },
                nodes: {
                    root: {
                        selector: '#myrootnode'
                    }
                },
                applets: [],
                plugins: [],
                services: {}
            });
            expect(app).toBeTruthy();
        });

        // it('Create and start the app', async () => {
        //     const rootNode = document.createElement('div');
        //     rootNode.id = 'myrootnode';
        //     document.body.appendChild(rootNode);
        //     const app = new App({
        //         appConfig: {
        //             some: 'property',
        //         },
        //         nodes: {
        //             root: {
        //                 selector: '#myrootnode'
        //             }
        //         },
        //         applets: [],
        //         plugins: [],
        //         services: {

        //         }
        //     });
        //     await app.start();
        //     expect(app).toBeTruthy();
        // });

        it('Should throw if given an invalid root node', () => {
            const rootNode = document.createElement('div');
            rootNode.id = 'myrootnode';
            document.body.appendChild(rootNode);
            const createApp = () => {
                return new App({
                    appConfig: {
                        some: 'property'
                    },
                    nodes: {
                        root: {
                            selector: '#myrootnodex'
                        }
                    },
                    plugins: [],
                    services: {}
                });
            }
            expect(createApp).toThrow();

        });
    });

});
