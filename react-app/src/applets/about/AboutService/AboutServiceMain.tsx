import { isJSONObject, traverse } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';
import ErrorAlert from '../../../components/ErrorAlert';
import Loading from '../../../components/Loading';
import {
    AsyncProcess,
    AsyncProcessError,
    AsyncProcessStatus,
} from '../../../lib/AsyncProcess';
import GenericClient11 from '../../../lib/kb_lib/comm/JSONRPC11/GenericClient';
import GenericClient20 from '../../../lib/kb_lib/comm/JSONRPC20/GenericClient';
import { Config } from '../../../types/config';
import {
    ServiceDescription,
    ServiceDescriptionJSONRPC11,
    ServiceDescriptionJSONRPC20,
    ServiceDescriptionRest,
} from '../ServiceDescription';
import AboutService from './AboutService';

export interface AboutServiceMainProps {
    config: Config;
    service: ServiceDescription;
    // auth: AuthenticationState
    // token: string;
}

interface AboutServiceMainState {
    load: AsyncProcess<VersionInfo>;
}

export interface VersionInfo {
    version: string;
    average: number;
    measures: Array<number>;
}

export interface PerformanceMetrics {
    measures: Array<number>;
    total: number;
    average: number;
}

export default class AboutServiceMain extends Component<
    AboutServiceMainProps,
    AboutServiceMainState
> {
    // method : string;
    constructor(props: AboutServiceMainProps) {
        super(props);
        // const method = props.service.statusMethod  || props.service.versionMethod;
        // if (typeof method === 'undefined') {
        //     throw new Error('Neither status nor version method provided')
        // }
        // this.method = method;
        this.state = {
            load: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    sum(measures: Array<number>, fun?: (item: number) => number) {
        let total = 0;
        measures.forEach((measure) => {
            if (fun) {
                total += fun(measure);
            } else {
                total += measure;
            }
        });
        return total;
    }

    perf(call: () => Promise<string>): Promise<PerformanceMetrics> {
        const measures: Array<number> = [];
        const iters = 5;
        return new Promise((resolve) => {
            const next = (itersLeft: number) => {
                if (itersLeft === 0) {
                    resolve({
                        measures,
                        total: this.sum(measures),
                        average: this.sum(measures) / measures.length,
                    });
                } else {
                    const start = new Date().getTime();
                    call()
                        .then(() => {
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

    jsonrpc11Client(service: ServiceDescriptionJSONRPC11) {
        const serviceModule = this.props.service.module;
        // how silly.
        const serviceConfigs = this.props.config.services as {
            [k: string]: {
                url: string;
            };
        };
        const client = new GenericClient11({
            module: serviceModule,
            url: serviceConfigs[serviceModule].url,
            timeout: this.props.config.ui.constants.clientTimeout,
        });
        return async () => {
            const [result] = await client.callFunc(service.method, []);

            if (service.versionKey) {
                if (isJSONObject(result)) {
                    const result2 = traverse(result, service.versionKey);

                    if (typeof result2 !== 'string') {
                        throw new Error('Expected string');
                    }
                    return result2;
                } else {
                    throw new Error('Expected JSON Object');
                }
            }
            if (typeof result !== 'string') {
                throw new Error('Expected string');
            }
            return result;
        };
    }

    jsonrpc20Client(service: ServiceDescriptionJSONRPC20) {
        const serviceModule = this.props.service.module;
        // how silly.
        const serviceConfigs = this.props.config.services as {
            [k: string]: {
                url: string;
            };
        };
        const serviceConfig = serviceConfigs[serviceModule];
        const client = new GenericClient20({
            module: serviceModule,
            url: serviceConfig.url,
            timeout: this.props.config.ui.constants.clientTimeout,
            prefix: false,
        });
        return async () => {
            const result = await client.callFunc(service.method);
            if (service.versionKey) {
                if (isJSONObject(result)) {
                    const result2 = traverse(result, service.versionKey);
                    if (typeof result2 !== 'string') {
                        throw new Error('Expected string');
                    }
                    return result2;
                } else {
                    throw new Error('Expected JSON Object');
                }
            }
            if (typeof result !== 'string') {
                throw new Error('Expected string');
            }
            return result;
        };
    }

    restClient(service: ServiceDescriptionRest): () => Promise<string> {
        const serviceModule = this.props.service.module;
        const serviceConfigs = this.props.config.services as {
            [k: string]: {
                url: string;
            };
        };
        return async (): Promise<string> => {
            const baseUrl = serviceConfigs[serviceModule].url;
            const url = baseUrl + service.path;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            });
            if (response.status >= 300) {
                throw new Error(`Error in response: ${response.status}`);
            }
            const result = JSON.parse(await response.text());
            if (service.versionKey) {
                const possibleKey = traverse(result, service.versionKey);
                if (typeof possibleKey !== 'string') {
                    throw new Error('Expected string');
                }
                return possibleKey;
            } else {
                return result;
            }
        };
    }

    getAPICall(): () => Promise<string> {
        switch (this.props.service.type) {
            case 'jsonrpc11':
                return this.jsonrpc11Client(this.props.service);
            case 'jsonrpc20':
                return this.jsonrpc20Client(this.props.service);

            case 'rest':
                return this.restClient(this.props.service);
        }
    }

    async componentDidMount() {
        try {
            const ver = this.getAPICall();
            const [version, perf] = await Promise.all([ver(), this.perf(ver)]);
            this.setState({
                load: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        version,
                        average: perf.average,
                        measures: perf.measures,
                    },
                },
            });
        } catch (ex) {
            this.setState({
                load: {
                    status: AsyncProcessStatus.ERROR,
                    message: ex instanceof Error ? ex.message : 'Unknown error',
                },
            });
        }
    }

    renderLoading() {
        return (
            <td colSpan={3}>
                <Loading
                    message="Measuring service..."
                    type="inline"
                    size="small"
                />
            </td>
        );
    }

    renderError(state: AsyncProcessError) {
        return <ErrorAlert message={state.message} />;
    }

    render() {
        switch (this.state.load.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.load);
            case AsyncProcessStatus.SUCCESS:
                return <AboutService {...this.state.load.value} />;
        }
    }
}
