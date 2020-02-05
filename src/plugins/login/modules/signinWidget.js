define([
    'kb_plugin_login',
    'preact',
    'htm',
    '../components/Signin'
], (
    Plugin,
    preact,
    htm,
    Signin
) => {
    'use strict';

    const { h, render } = preact;
    const html = htm.bind(h);

    class SigninWidget {
        constructor({ runtime }) {
            if (!runtime) {
                throw {
                    name: 'RuntimeMissing',
                    message: 'The runtime argument is required but is missing',
                    suggestion: 'This is an application error, and no fault of yours.'
                };
            }
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
            this.isLoginView = null;
            this.profile = null;
            this.imagePath = Plugin.plugin.fullPath + '/images';
        }

        doSignout() {
            this.runtime
                .service('session')
                .logout()
                .then(() => {
                    this.runtime.send('app', 'navigate', {
                        path: 'auth2/signedout'
                    });
                })
                .catch((err) => {
                    console.error('ERROR');
                    console.error(err);
                    alert('Error signing out (check console for details)');
                });
        }

        getProfile() {
            if (this.runtime.service('session').isLoggedIn()) {
                return this.runtime
                    .service('userprofile')
                    .getProfile()
                    .then((profile) => {
                        this.profile = profile;
                        this.render();
                    })
                    .catch((err) => {
                        // TODO: render error
                        console.error('ERROR', err);
                    });
            } else {
                this.profile = null;
                this.render();
            }
        }

        render() {
            const props = {
                profile: this.profile,
                signout: this.doSignout.bind(this),
                isLoginView: this.isLoginView
            };
            const component = html`<${Signin} ...${props}/>`;
            render(component, this.container);
        }

        // LIFECYCLE API

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('kb_plugin_login_signin');
            this.container.setAttribute('data-k-b-testhook-plugin', 'login');
        }

        start() {
            // Refetch the profile (and re-render) if the user profile in the ui has
            // been changed.
            this.runtime.service('userprofile').onChange(() => {
                this.getProfile();
            });

            // Detect whether we should disable the login button.
            this.runtime.receive('route', 'routed', (message) => {
                const path = message.data.request.path.join('/');
                if (path === 'login') {
                    this.isLoginView = true;
                } else {
                    this.isLoginView = false;
                }
                this.render();
            });

            // Get the initial user profile (or not)
            this.getProfile();
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }

        stop() {
            return null;
        }
    }

    return SigninWidget;
});
