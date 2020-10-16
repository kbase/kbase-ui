define([
    'preact',
    'htm',
    './Signin'
], (
    preact,
    htm,
    Signin
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Login extends Component {
        constructor(props) {
            super(props);
            this.state = {
                data: {
                    isLoginView: false,
                    profile: null
                }
            };
        }

        componentDidMount() {
            // Refetch the profile (and re-render) if the user profile in the ui has
            // been changed.
            this.props.runtime.service('userprofile').onChange(() => {
                this.getProfile();
            });

            // Detect whether we should disable the login button.
            this.props.runtime.receive('route', 'routed', (message) => {
                const path = message.data.request.path.join('/');
                if (path === 'login') {
                    this.setState({
                        data: {
                            profile: this.state.data.profile,
                            isLoginView: true
                        }
                    });
                } else {
                    this.setState({
                        data: {
                            profile: this.state.data.profile,
                            isLoginView: false
                        }
                    });
                }
            });

            // Get the initial user profile (or not)
            this.getProfile();

            this.props.runtime.receive('profile', 'reload', () => {
                this.getProfile();
            });
        }

        doSignout() {
            this.props.runtime
                .service('session')
                .logout()
                .then(() => {
                    this.props.runtime.send('app', 'navigate', {
                        type: 'internal',
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
            if (this.props.runtime.service('session').isLoggedIn()) {
                return this.props.runtime
                    .service('userprofile')
                    .getProfile()
                    .then((profile) => {
                        this.setState({
                            data: {
                                profile,
                                isLoginView: this.state.data.isLoginView
                            }
                        });
                    })
                    .catch((err) => {
                        // TODO: render error
                        console.error('ERROR', err);
                    });
            } else {
                this.setState({
                    data: {
                        profile: null,
                        isLoginView: this.state.data.isLoginView
                    }
                });
            }
        }

        render() {
            const props = {
                profile: this.state.data.profile,
                plugin: this.props.plugin,
                signout: this.doSignout.bind(this),
                isLoginView: this.state.data.isLoginView
            };
            return  html`<${Signin} ...${props}/>`;
        }
    }

    return Login;
});