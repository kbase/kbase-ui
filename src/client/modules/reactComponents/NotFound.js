define([
    'preact',
    'htm',

    'bootstrap'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    const REDIRECT_IF_FOUND = true;
    const OUTREACH_HOST = 'www.kbase.us';
    const DOCS_HOST = 'docs.kbase.us';
    const MARKETING_HOST = 'kbs.comradeserver.com';

    class NotFound extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: 'none',
                messages: []
            };
        }

        async findOn(site, path) {
            const tryURI = `https://ci.kbase.us/__poke/${site}/${path}`;
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

        async componentDidMount() {
            if (this.props.params.request.realPath.length === 1 &&
                this.props.params.request.realPath[0] === '' &&
                !this.props.runtime.service('session').isAuthenticated()) {
                this.props.runtime.send('ui', 'setTitle', 'Redirecting to Homepage...');
                this.redirect(`https://${MARKETING_HOST}`);
                return;
            }
            const path = this.props.params.request.realPath.join('/');

            try {
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
                
                await this.setState2({
                    messages: [...this.state.messages, 'Looking on Outreach...']
                });
                if (await this.findOn('outreach', path)) {
                    this.setState({
                        status: 'found-on-outreach',
                        path
                    });
                    return;
                } 
                await this.setState2({
                    messages: [...this.state.messages.slice(0, -1), this.state.messages[this.state.messages.length -1] + 'nope']
                });
                
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

                            <p>
                                You may find what you are looking for on one of the following KBase sites:
                            </p>

                            <ul>
                                <li><a href="https://www.kbase.us">Homepage</a></li>
                                <li><a href="https://docs.kbase.us">Documentation</a></li>
                                <li><a href="/#narrativemanager/start">Narrative</a></li>
                                <li><a href="/#dashboard">Dashboard</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        renderExistsOnMarketingSite() {
            const marketingURL = new URL(`https://kbs.comradeserver.com/${this.state.path}`);
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
            
            // const marketingPath = `https://www.kbase.us/${this.state.path}`;
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
            const marketingURL = new URL(`https://www.kbase.us/${this.state.path}`);
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
            
            // const marketingPath = `https://www.kbase.us/${this.state.path}`;
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
            const marketingURL = new URL(`https://docs.kbase.us/${this.state.path}`);
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
                        However, it does exist on <a href="${marketingURL.toString()}">the KBase Documentation Site</a>.
                    </p>
                </div>
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

                            <p>
                                You may find what you are looking for on one of the following KBase sites:
                            </p>

                            <ul>
                                <li><a href="https://www.kbase.us">Homepage</a></li>
                                <li><a href="https://docs.kbase.us">Documentation</a></li>
                                <li><a href="/#narrativemanager/start">Narrative</a></li>
                                <li><a href="/#dashboard">Dashboard</a></li>
                            </ul>

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
            })
            return html`
                <div className="alert alert-warning">
                    <p>Analyzing request... <span className="fa fa-spinner fa-pulse fa-fw"></span></p>
                    ${messages}
                </div>
            `;
            return;
        }

        renderSwitch() {
            switch (this.state.status) {
                case 'none':
                    return this.renderLoading();
                case 'does-not-exist':
                    return this.renderNotFound();
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