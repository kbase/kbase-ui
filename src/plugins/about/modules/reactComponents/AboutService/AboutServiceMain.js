define([
    'preact',
    'htm',
    './AboutService',
    'kb_lib/jsonRpc/genericClient',
    'kb_common_ts/HttpClient',
    'reactComponents/Loading',

    'bootstrap'
], (
    preact,
    htm,
    AboutService,
    GenericClient,
    HttpClient,
    Loading
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class AboutServiceMain extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: 'none',
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
                            measures: measures,
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
                    .then(()=> {
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

        restClient() {
            return () => {
                const header = new HttpClient.HttpHeader();
                header.setHeader('accept', 'application/json');
                const http = new HttpClient.HttpClient();
                const baseUrl = this.props.runtime.config(`services.${this.props.service.module}.url`);
                const url = baseUrl + this.props.service.path;
                return http
                    .request({
                        method: 'GET',
                        url,
                        header
                    })
                    .then((result) => {
                        if (result.status >= 300) {
                            throw new Error(`Error in response: ${result.status}`)
                        }
                        try {
                            return JSON.parse(result.response);
                        } catch (ex) {
                            console.error('[renderAuth]', ex);
                            throw new Error(ex);
                        }
                    });
            };
        }

        getAPICall() {
            switch (this.props.service.type) {
            case 'jsonrpc11':
                return this.jsonrpc11Client();
            case 'rest':
                return this.restClient();
            }
        }

        componentDidMount() {
            const ver = this.getAPICall();
            this.setState({
                status: 'loading'
            });
            return Promise.all([
                ver(),
                this.perf(ver)
            ])
                .then(([result, perf]) => {
                    // console.log('RESULT', result);
                    let version;
                    if (this.props.service.versionKey) {
                        version = result[this.props.service.versionKey];
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
                    })
                });
        }

        renderLoading() {
            return html`
                <${Loading} message="Measuring service..." />
            `;
        }

        renderError() {
            return html`
                <div className="alert alert-danger">
                    <em>Error!</em><p>${this.state.error.message}</p>
                </div>
            `;
        }

        render() {
            switch (this.state.status) {
            case 'none':
                return this.renderLoading();
            case 'loading':
                return this.renderLoading();
            case 'loaded': 
                return html`
                    <${AboutService} ...${this.state.data} />
                `;
            case 'error':
                return this.renderError()
            }
        }
    }

    return AboutServiceMain;
});
