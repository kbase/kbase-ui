define([
    'preact',
    'htm',
    './AboutService',
    'kb_lib/jsonRpc/genericClient',
    'kb_common_ts/HttpClient',

    'bootstrap'
], (
    preact,
    htm,
    AboutService,
    GenericClient,
    HttpClient
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class AboutServiceMain extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loaded: false,
                data: null
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
                        loaded: true,
                        data: {
                            version,
                            average: perf.average,
                            measures: perf.measures
                        }
                    });
                });
        }

        renderLoading() {
            return html`
                <div>
                    Loading...
                </div>
            `;
        }

        render() {
            if (this.state.loaded) {
                return html`
                    <${AboutService} ...${this.state.data} />
                `;
            }
            return this.renderLoading();
        }
    }

    return AboutServiceMain;
});
