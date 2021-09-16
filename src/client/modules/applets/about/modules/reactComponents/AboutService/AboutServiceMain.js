define([
    'preact',
    'htm',
    './AboutService',
    'kb_lib/jsonRpc/genericClient',
    'ui-lib/comm/JSONRPC20/GenericClient',
    'ui-lib/json',
    'reactComponents/Loading',

    'bootstrap'
], (
    { h, Component },
    htm,
    AboutService,
    GenericClient,
    { default: GenericClient20 },
    { traverse },
    Loading
) => {
    const html = htm.bind(h);

    class AboutServiceMain extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: 'loading',
                data: null,
                error: null
            };
        }

        sum(array, fun) {
            let total = 0;
            array.forEach((item) => {
                if (fun) {
                    total += fun(item);
                } else {
                    total += item;
                }
            });
            return total;
        }

        perf(call) {
            const measures = [];
            const iters = 5;
            return new Promise((resolve) => {
                const next = (itersLeft) => {
                    if (itersLeft === 0) {
                        resolve({
                            measures,
                            total: this.sum(measures),
                            average: this.sum(measures) / measures.length
                        });
                    } else {
                        const start = new Date().getTime();
                        call().then(() => {
                            const elapsed = new Date().getTime() - start;
                            measures.push(elapsed);
                            next(itersLeft - 1);
                            return null;
                        })
                            .catch((err) => {
                                console.error('ERROR', err);
                            });
                    }
                };
                next(iters);
            });
        }

        jsonrpc11Client() {
            const serviceModule = this.props.service.module;
            const client = new GenericClient({
                module: serviceModule,
                url: this.props.runtime.config(`services.${serviceModule}.url`),
                token: this.props.runtime.service('session').getAuthToken()
            });
            return () => {
                return Promise.resolve()
                    .then(() => {
                        if (this.props.service.versionMethod) {
                            return client.callFunc(this.props.service.versionMethod, []);
                        } else if (this.props.service.statusMethod) {
                            return client.callFunc(this.props.service.statusMethod, []);
                        }
                    })
                    .then(([result]) => {
                        return result;
                    });
            };
        }

        jsonrpc20Client() {
            const serviceModule = this.props.service.module;
            const client = new GenericClient20({
                module: serviceModule,
                url: this.props.runtime.config(`services.${serviceModule}.url`),
                token: this.props.runtime.service('session').getAuthToken(),
                prefix: false
            });
            return () => {
                return Promise.resolve()
                    .then(() => {
                        if (this.props.service.versionMethod) {
                            return client.callFunc(this.props.service.versionMethod);
                        } else if (this.props.service.statusMethod) {
                            return client.callFunc(this.props.service.statusMethod);
                        }
                    })
                    .then((result) => {
                        return result;
                    });
            };
        }

        restClient() {
            return async () => {
                const baseUrl = this.props.runtime.config(`services.${this.props.service.module}.url`);
                const url = baseUrl + this.props.service.path;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        accept: 'application/json'
                    }
                });
                if (response.status >= 300) {
                    throw new Error(`Error in response: ${response.status}`);
                }
                try {
                    return JSON.parse(await response.text());
                } catch (ex) {
                    console.error('[renderAuth]', ex);
                    throw new Error(ex);
                }
            };
        }

        getAPICall() {
            switch (this.props.service.type) {
                case 'jsonrpc11':
                    return this.jsonrpc11Client();
                case 'jsonrpc20':
                    return this.jsonrpc20Client();

                case 'rest':
                    return this.restClient();
            }
        }

        componentDidMount() {
            const ver = this.getAPICall();
            return Promise.all([
                ver(),
                this.perf(ver)
            ])
                .then(([result, perf]) => {
                    let version;
                    if (this.props.service.versionKey) {
                        version = traverse(result, this.props.service.versionKey);
                    } else {
                        version = result;
                    }

                    this.setState({
                        status: 'loaded',
                        data: {
                            version,
                            average: perf.average,
                            measures: perf.measures
                        }
                    });
                })
                .catch((err) => {
                    this.setState({
                        status: 'error',
                        error: {
                            message: err.message
                        }
                    });
                });
        }

        renderLoading() {
            return html`
                <${Loading} message="Measuring service..." type="inline" size="normal"/>
            `;
        }

        renderError() {
            return html`
                <div className="alert alert-danger">
                    <em>Error!</em>
                    <p>${this.state.error.message}</p>
                </div>
            `;
        }

        render() {
            switch (this.state.status) {
                case 'loading':
                    return this.renderLoading();
                case 'loaded':
                    return html`
                    <${AboutService} ...${this.state.data}/>
                `;
                case 'error':
                    return this.renderError();
            }
        }
    }

    return AboutServiceMain;
});
