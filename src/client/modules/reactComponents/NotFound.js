define([
    'preact',
    'htm',

    'bootstrap'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component, Fragment } = preact;
    const html = htm.bind(h);

    const REDIRECT_IF_FOUND = true;
    const DOCS_HOST = 'docs.kbase.us';
    const MARKETING_HOST = 'www.kbase.us';

    const TRY_UPSTREAM_SITES = true;

    class NotFound extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: 'none',
                messages: []
            };
        }

        async findOn(site, path) {
            const tryURI = `/__poke/${site}/${path}`;
            const response = await fetch(tryURI, {
                method: 'HEAD',
                mode: 'cors'
            });
            if (response.status >=200 && response.status <= 300) {
                return true;
            }
            return false;
        }

        redirect(url) {
            window.location.assign(url);
        }

        async setState2(newState) {
            return new Promise((resolve) => {
                this.setState(newState, () => {
                    resolve();
                });
            });
        }

        async checkSites() {
            const request = this.props.params.request;
            if (!TRY_UPSTREAM_SITES) {
                console.warn('not trying upstream sites', request);
                if (request.realPath.length === 1 &&
                    request.realPath[0] === '' &&
                    request.path.length === 0) {
                    // if we got here with no paths, go to the dashboard
                    window.location.hash = '#dashboard';
                    return;
                }

                if (request.path.length > 0) {
                    this.setState({
                        status: 'path-does-not-exist',
                        path: request.path.join('/')
                    });
                } else {
                    this.setState({
                        status: 'does-not-exist',
                        path: request.realPath.join('/')
                    });
                }
                return;
            }

            if (request.realPath.length === 1 &&
                request.realPath[0] === '' &&
                request.path.length === 0 &&
                !this.props.runtime.service('session').isAuthenticated()) {
                this.props.runtime.send('ui', 'setTitle', 'Redirecting to Homepage...');
                this.redirect(`https://${MARKETING_HOST}`);
                return;
            }

            const path = request.realPath.join('/');
            try {
                if (path.length === 0) {
                    this.setState({
                        status: 'path-does-not-exist',
                        path: request.path.join('/')
                    });
                    return;
                }

                // Try homepage/marketing
                await this.setState2({
                    messages: [...this.state.messages, 'Looking on Homepage...']
                });
                if (await this.findOn('marketing', path)) {
                    this.setState({
                        status: 'found-on-marketing',
                        path
                    });
                    return;
                }
                await this.setState2({
                    messages: [...this.state.messages.slice(0, -1), this.state.messages[this.state.messages.length -1] + 'nope']
                });

                // Try docs
                await this.setState2({
                    messages: [...this.state.messages, 'Looking on Docs...']
                });
                if (await this.findOn('docs', path)) {
                    this.setState({
                        status: 'found-on-docs',
                        path
                    });
                    return;
                }
                await this.setState2({
                    messages: [...this.state.messages.slice(0, -1), this.state.messages[this.state.messages.length -1] + 'nope']
                });

                this.setState({
                    status: 'does-not-exist',
                    path
                });
            } catch (ex) {
                this.setState({
                    status: 'error',
                    error: {
                        message: ex.message
                    },
                    path
                });
            }
        }

        onPageShow(event) {
            if (event.persisted) {
                window.location.reload();
            }
        }

        componentWillUnmout() {
            window.removeEventListener('pageshow', this.onPageShow.bind(this));
        }

        componentDidMount() {
            window.addEventListener('pageshow', this.onPageShow.bind(this));
            this.checkSites();
        }

        renderNotFound() {
            this.props.runtime.send('ui', 'setTitle', `Not Found - ${this.state.path}`);
            return html`
                <div className="well" >
                    <div style=${{display: 'flex', flexDirection: 'row'}}>
                        <div style=${{flex: '0 0 auto', marginRight: '30px'}}>
                            <img src="/images/flapjack.png" />
                        </div>
                        <div style=${{flex: '1 1 0px'}}>
                           
                            <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                                Sorry, "${this.state.path}" was not found.
                            </p>

                            ${this.renderKBaseLinks()}
                        </div>
                    </div>
                </div>
            `;
        }

        renderPathNotFound() {
            this.props.runtime.send('ui', 'setTitle', `Path Not Found - ${this.state.path}`);
            return html`
                <div className="well" >
                    <div style=${{display: 'flex', flexDirection: 'row'}}>
                        <div style=${{flex: '0 0 auto', marginRight: '30px'}}>
                            <img src="/images/flapjack.png" />
                        </div>
                        <div style=${{flex: '1 1 0px'}}>
                           
                            <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                                Sorry, "#${this.state.path}" was not found.
                            </p>

                            ${this.renderKBaseLinks()}
                        </div>
                    </div>
                </div>
            `;
        }

        renderExistsOnMarketingSite() {
            const marketingURL = new URL(`https://${MARKETING_HOST}/${this.state.path}`);
            const query = marketingURL.searchParams;
            Object.entries(this.props.params.request.query).forEach(([key, value]) => {
                query.set(key, value);
            });

            if (REDIRECT_IF_FOUND) {
                this.props.runtime.send('ui', 'setTitle', `Redirecting to ${marketingURL}`);
                this.redirect(marketingURL.toString());
                return;
            }

            this.props.runtime.send('ui', 'setTitle', 'Path Not Found');

            return html`
                <div className="well">
                    <div className="text-danger"  style=${{fontSize: '140%'}}>
                        <strong><span className="fa fa-meh-o"></span>${' '}Path Not Found</strong>
                    </div>
                    <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                        The path you requested, <em>"${this.state.path}"</em>, was not found on this site.
                    </p>
                    <p style=${{fontSize: '140%', marginTop: '10px'}}>
                        However, it does exist on <a href="${marketingURL.toString()}">the KBase Homepage Site</a>.
                    </p>
                </div>
            `;
        }

        renderExistsOnOutreachSite() {
            const marketingURL = new URL(`https://${MARKETING_HOST}/${this.state.path}`);
            const query = marketingURL.searchParams;
            Object.entries(this.props.params.request.query).forEach(([key, value]) => {
                query.set(key, value);
            });

            if (REDIRECT_IF_FOUND) {
                this.props.runtime.send('ui', 'setTitle', `Redirecting to ${marketingURL}`);
                this.redirect(marketingURL.toString());
                return;
            }

            this.props.runtime.send('ui', 'setTitle', 'Path Not Found');

            return html`
                <div className="well">
                    <div className="text-danger"  style=${{fontSize: '140%'}}>
                        <strong><span className="fa fa-meh-o"></span>${' '}Path Not Found</strong>
                    </div>
                    <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                        The path you requested, <em>"${this.state.path}"</em>, was not found on this site.
                    </p>
                    <p style=${{fontSize: '140%', marginTop: '10px'}}>
                        However, it does exist on <a href="${marketingURL.toString()}">the KBase Homepage Site</a>.
                    </p>
                </div>
            `;
        }

        renderExistsOnDocsSite() {
            const docsURL = new URL(`https://${DOCS_HOST}/${this.state.path}`);
            const query = docsURL.searchParams;
            Object.entries(this.props.params.request.query).forEach(([key, value]) => {
                query.set(key, value);
            });

            if (REDIRECT_IF_FOUND) {
                this.props.runtime.send('ui', 'setTitle', `Redirecting to ${docsURL}`);
                this.redirect(docsURL.toString());
                return;
            }

            this.props.runtime.send('ui', 'setTitle', 'Path Not Found');

            return html`
                <div className="well">
                    <div className="text-danger"  style=${{fontSize: '140%'}}>
                        <strong><span className="fa fa-meh-o"></span>${' '}Path Not Found</strong>
                    </div>
                    <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                        The path you requested, <em>"${this.state.path}"</em>, was not found on this site.
                    </p>
                    <p style=${{fontSize: '140%', marginTop: '10px'}}>
                        However, it does exist on <a href="${docsURL.toString()}">the KBase Documentation Site</a>.
                    </p>
                </div>
            `;
        }

        renderKBaseLinks() {
            return html`
                <${Fragment}>
                    <p>
                        You may find what you are looking for on one of the following KBase sites:
                    </p>

                    <ul>
                        <li><a href="https://${MARKETING_HOST}" target="_blank">Homepage</a></li>
                        <li><a href="https://${DOCS_HOST}" target="_blank">Documentation</a></li>
                        <li><a href="/#narrativemanager/start">Narrative</a></li>
                        <li><a href="/#dashboard">Dashboard</a></li>
                    </ul>

                    <p>
                        Or you may wish to <a href="https://${MARKETING_HOST}/support/" target="_blank">reach out the KBase</a> for further assistance.
                    </p>
                <//>
            `;
        }

        renderError() {
            this.props.runtime.send('ui', 'setTitle', `Not Found - ${this.state.path}`);
            return html`
                <div className="well">
                    <div style=${{display: 'flex', flexDirection: 'row'}}>
                        <div style=${{flex: '0 0 auto', marginRight: '20px'}}>
                            <img src="/images/flapjack.png" />
                        </div>
                        <div style=${{flex: '1 1 0px'}}>
                           
                            <p className="text-danger" style=${{fontSize: '140%', marginTop: '10px'}}>
                                Sorry, "${this.state.path}" was not found. *
                            </p>

                            ${this.renderKBaseLinks()}

                            <p className="text-danger" style=${{marginTop: '30px'}}>
                                * Actually, an error was encountered checking for this path: "${this.state.error.message}"
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

        renderLoading() {
            const path = this.props.params.request.realPath.join('/');
            this.props.runtime.send('ui', 'setTitle', `Not Found - ${path}`);
            const messages = this.state.messages.map((message) => {
                return html`
                <p>${message}</p>
                `;
            });
            return html`
                <div className="alert alert-warning">
                    <p>Analyzing request... <span className="fa fa-spinner fa-pulse fa-fw"></span></p>
                    ${messages}
                </div>
            `;
        }

        renderSwitch() {
            switch (this.state.status) {
            case 'none':
                return this.renderLoading();
            case 'does-not-exist':
                return this.renderNotFound();
            case 'path-does-not-exist':
                return this.renderPathNotFound();
            case 'found-on-marketing':
                return this.renderExistsOnMarketingSite();
            case 'found-on-outreach':
                return this.renderExistsOnOutreachSite();
            case 'found-on-docs':
                return this.renderExistsOnDocsSite();
            case 'error':
                return this.renderError();
            }
        }

        render() {
            return html`
            <div style=${{margin: '0 10px'}}>
                ${this.renderSwitch()}
            </div>
            `;
        }
    }

    return NotFound;
});